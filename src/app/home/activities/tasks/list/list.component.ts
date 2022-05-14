import { Component, OnInit, Input, ComponentFactoryResolver, ViewChild, ViewChildren, QueryList, ViewContainerRef, ViewRef, ComponentRef } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { TaskDirective } from './task.directive';
import { TaskComponent } from './task/task.component';
import { CdkDragDrop, CdkDragStart } from '@angular/cdk/drag-drop';
import { ListsService } from '../lists.service';
import { FilterPopupComponent } from './filter-popup/filter-popup.component';
import { FilterPopupDirective } from './filter-popup.directive';
import { TasksService } from '../../tasks.service';
import { AnalyticsService } from 'src/app/analytics.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  @ViewChild(TaskDirective, {static: true}) public taskHost: TaskDirective;
  @ViewChild(FilterPopupDirective, { static: true }) public filterPopupHost: FilterPopupDirective;


  @Input() data: any;

  @Input() lists: string[];

  @Input() onTaskClick: Function;

  public disabled: boolean = false;

  filterPopupOpen: boolean = false;

  // string problems. passing by reference. should be passing by value. might need two arrays.
  public tasks: Map<string, TaskComponent> = new Map<string, TaskComponent>();

  taskViewRefs: Map<string, ViewRef> = new Map<string, ViewRef>();

  socketService: SocketService;
  listsService: ListsService;
  tasksService: TasksService;
  componentFactoryResolver: ComponentFactoryResolver;
  analyticsService: AnalyticsService;

  constructor(socketService: SocketService, listsService: ListsService, tasksService: TasksService, analyticsService: AnalyticsService, componentFactoryResolver: ComponentFactoryResolver) {
    this.socketService = socketService;
    this.listsService = listsService;
    this.tasksService = tasksService;
    this.tasksService.register();
    this.analyticsService = analyticsService;
    this.componentFactoryResolver = componentFactoryResolver;
  }

  ngOnInit(): void {
    this.socketService.reply.subscribe(msg => this.onResponseReceived(msg));
    this.socketService.sendMessage({channel: "tasks", type: "request_tasks_for_list", "list_id": this.data.list_id, "index": 0});
    this.listsService.lists[this.data.list_id] = this;
  }

  dropTask(event: CdkDragDrop<string[]>): void {
    if (event.previousContainer === event.container) {
      if (!(event.currentIndex == event.previousIndex)) {
        this.taskHost.viewContainerRef.move(this.taskHost.viewContainerRef.get(event.previousIndex), event.currentIndex);
        let taskId: string = event.item.data.task_id;
        let data: any = this.listsService.lists.get(event.previousContainer.id).tasks.get(taskId).data;
        this.socketService.sendMessage({channel: "tasks", type: "edit_listing", listing_id: data.listing_id, list_id: event.container.id, index: event.currentIndex});
        return
      }
    } else {
      event.previousContainer.removeItem(event.item);
      let taskId: string = event.item.data.task_id;
      let data: any = this.listsService.lists.get(event.previousContainer.id).tasks.get(taskId).data;
      this.tasks.set(taskId, this.listsService.lists.get(event.previousContainer.id).tasks.get(taskId));
      this.listsService.lists.get(event.previousContainer.id).tasks.delete(taskId);
      data.index = event.currentIndex;
      let previousViewContainerRef: ViewContainerRef = this.listsService.lists.get(event.previousContainer.id).taskHost.viewContainerRef;
      previousViewContainerRef.remove(event.previousIndex);
      this.loadTask(data);
      this.socketService.sendMessage({channel: "tasks", type: "edit_listing", listing_id: data.listing_id, list_id: event.container.id, index: event.currentIndex});
    }
  }

  onResponseReceived(msg: any): void {
    if (msg["channel"] == "tasks") {
      if (msg["type"] == "request_tasks_for_list") {
        this.onRequestTasksForList(msg);
      }
      else if (msg["type"] == "add_task") {
        this.onAddTask(msg);
      }
      else if (msg["type"] == "request_task") {
        this.checkDisable();
      }
      else if (msg["type"] == "delete_task") {
        this.onDeleteTask(msg["task_id"]);
      }
    }
  }

  toggleTags(): void {
    // request tags? or should have already requested them (probably)
    // make them display: flex or display: none depending on whether
    // they are already visible
    if (!this.filterPopupOpen) this.openFilterPopup();
    else this.closeFilterPopup();
  }

  toggleArchive(): void {
    if (this.data.archive) {
      let dropArea: HTMLElement = document.getElementById(this.data.list_id) as HTMLElement;
      if (dropArea.style.display == 'none') {
        dropArea.style.display = 'inherit';
        document.getElementById("archive-up-arrow").style.display = "inherit";
        document.getElementById("archive-down-arrow").style.display = "none";
      }
      else {
        dropArea.style.display = 'none';
        document.getElementById("archive-down-arrow").style.display = "inherit";
        document.getElementById("archive-up-arrow").style.display = "none";
      }
    }
  }

  focusNewTaskTitleField(): void {
    document.getElementById(this.data.list_id + "-new-task-title-field").focus();
  }

  openFilterPopup(): void {
    const viewContainerRef = this.filterPopupHost.viewContainerRef;
    viewContainerRef.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(FilterPopupComponent);

    let componentRef: ComponentRef<FilterPopupComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory);

    let instance: FilterPopupComponent = <FilterPopupComponent>componentRef.instance;
    this.filterPopupOpen = true;
  }

  closeFilterPopup(): void {
    const viewContainerRef = this.filterPopupHost.viewContainerRef;
    viewContainerRef.clear();
    this.filterPopupOpen = false;
  }

  checkDisable(): void {
    this.disabled = this.listsService.disabledLists.has(this.data.list_id);
  }

  onRequestTasksForList(msg: any): void {
    if (msg.list_id == this.data.list_id) {
      let initialTasksSize = this.tasks.size;
      msg.tasks.sort(function(a: any, b: any): number {
        return a.index - b.index;
      });
      msg.tasks.forEach(data => {
         if (!this.tasks.has(data.task_id)) this.loadTask(data);
      });
      if (this.tasks.size > initialTasksSize) {
        this.socketService.sendMessage({channel: "tasks", type: "request_tasks_for_list", "list_id": this.data.list_id, "index": this.tasks.size});
      }
      else {
        // report done
        this.tasksService.listDoneLoading();
      }
    }
    
  }
  
  onAddTask(msg: any): void {
    if (msg["list_id"] == this.data.list_id) {
      this.loadTask(msg);
    }
  }

  onDeleteTask(taskId: string) {
    if (this.tasks.has(taskId)) {
      let index: number = this.taskHost.viewContainerRef.indexOf(this.taskViewRefs.get(taskId));
      this.taskHost.viewContainerRef.remove(index);
      this.tasksService.removeListing(this.tasks.get(taskId).data.listing_id);
      this.tasks.delete(taskId);
    }
  }

  async loadTask(data: any): Promise<void> {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TaskComponent);

    const viewContainerRef = this.taskHost.viewContainerRef;

    let componentRef: ComponentRef<TaskComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory, data.index);

    let instance: TaskComponent = <TaskComponent>componentRef.instance;
    instance.data = data;
    if (this.onTaskClick != undefined) instance.onClick = this.onTaskClick;
    instance.isListing = true;
    this.tasks.set(data.task_id, instance);
    this.taskViewRefs.set(data.task_id, componentRef.hostView);
    this.tasksService.addListing(data);
  }

  addTask(): void {
    let newTaskTitleField: HTMLInputElement = <HTMLInputElement> document.getElementById(this.data.list_id  + "-new-task-title-field");
    let title: string = newTaskTitleField.value;
    let active: boolean = false;
    if (this.tasks.size == 0) active = true;
    this.analyticsService.trackEvent("Add new task");
    this.socketService.sendMessage({channel: "tasks", type: "add_task", public: true, active: active, title: title, contents: "", list_id: this.data.list_id, index: 0});
    newTaskTitleField.value = "";
  }

  deleteList(): void {
    this.socketService.sendMessage({channel: "tasks", type: "delete_list", list_id: this.data.list_id});
    this.listsService.lists.delete(this.data.list_id);
  }

  editTitle(): void {
    let titleField: HTMLInputElement = <HTMLInputElement> document.getElementById(this.data.list_id  + "-title-field");
    let title: string = titleField.value;
    titleField.blur();
    this.socketService.sendMessage({channel: "tasks", type: "edit_list_title", list_id: this.data.list_id, title: title});
  }

  startDragging(event: CdkDragStart<string[]>): void {
    event.source.data = this.data;
  }

}
