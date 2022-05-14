import { Component, OnInit, ViewChild, ComponentFactoryResolver, ViewRef, ComponentRef } from '@angular/core';
import { Location } from '@angular/common'
import { Activity } from '../activity';
import { ListDirective } from './list.directive';
import { ListComponent } from './list/list.component';
import { SocketService } from 'src/app/socket/socket.service';
import { ListsService } from './lists.service';
import { Handler } from 'src/app/handler';
import { ActivatedRoute } from '@angular/router';
import { TaskEditorPopupDirective } from './task-editor-popup.directive';
import { TaskEditorPopupComponent } from './task-editor-popup/task-editor-popup.component';
import { MenuComponent } from '../../menu/menu.component';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent extends Handler implements OnInit, Activity {

  @ViewChild(ListDirective, {static: true}) listHost: ListDirective;
  @ViewChild(TaskEditorPopupDirective, { static: true }) public taskEditorPopupHost: TaskEditorPopupDirective;

  header: string = "Tasks";

  lists: string[] = [];
  listViewRefs: Map<string, ViewRef> = new Map<string, ViewRef>();

  scrollPosition: any;

  socketService: SocketService;
  listsService: ListsService;
  componentFactoryResolver: ComponentFactoryResolver;

  taskId: string;

  route: ActivatedRoute;

  location: Location;

  constructor(socketService: SocketService, listsService: ListsService, componentFactoryResolver: ComponentFactoryResolver, route: ActivatedRoute, location: Location) {
    super();
    this.socketService = socketService;
    this.listsService = listsService;
    this.componentFactoryResolver = componentFactoryResolver;
    this.location = location;
    this.route = route;
  }

  ngOnInit(): void {
    if (!this.socketService.channelIsRegistered("tasks")) this.socketService.register("tasks");
    this.socketService.reply.subscribe(msg => this.onResponseReceived(msg));
    this.socketService.sendMessage({channel: "tasks", type: "request_lists"});

    this.location.onUrlChange(this.handleTask.bind(this));
    this.handleTask();
  }

  handleMouseDown(event: MouseEvent) {
    let element: Element = document.getElementById("lists");
    this.scrollPosition = {
        left: element.scrollLeft,
        x: event.clientX,
    };
  }

  handleMouseMovement(event: MouseEvent) {
    if (this.scrollPosition != undefined) {
      const dx = event.clientX - this.scrollPosition.x;
      

      let element: Element = document.getElementById("lists");
      this.scrollPosition = {
        left: element.scrollLeft,
        x: event.clientX,
      };
      element.scrollBy(-dx, 0);
      if (window.getSelection) {
        if (window.getSelection().empty) {
          window.getSelection().empty();
        }
        else if (window.getSelection().removeAllRanges) {
          window.getSelection().removeAllRanges();
        }
      }
    }
  }

  handleMouseUp(event: MouseEvent) {
    this.scrollPosition = undefined;
  }

  onResponseReceived(msg: any): void {
    if (msg["channel"] == "tasks") {
      if (msg["type"] == "request_lists") {
        this.onRequestLists(msg);
      }
      else if (msg["type"] == "request_task") {
        this.onRequestTask(msg);
      }

      // TODO
      else if (msg["type"] == "save_task") {
        console.log("SAVE TASK!!!!!!!");
        const viewContainerRef = this.taskEditorPopupHost.viewContainerRef;
        viewContainerRef.clear();
        this.location.replaceState('/home/tasks');
      }
    }
  }

  onRequestLists(msg: any): void {
    msg["lists"].sort(function(a: any, b: any) {
      return a.index - b.index;
    });
    msg["lists"].forEach(data => {
      this.loadList(data);
    });
  }

  loadList(data: any): void {
    this.lists.push(data.list_id);
    
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ListComponent);

    const viewContainerRef = this.listHost.viewContainerRef;

    let componentRef = viewContainerRef.createComponent(componentFactory, data.index);
    let instance: ListComponent = <ListComponent>componentRef.instance
    instance.data = data;
    instance.lists = this.lists;
    this.listsService.lists.set(data.list_id, instance);
    this.listViewRefs.set(data.list_id, componentRef.hostView);
  }

  handleTask() {
    if (MenuComponent.getActivity(this.location.path()) == "tasks" && this.location.path().split('/').length > 3) {
      this.taskId = this.location.path().split('/')[3];
      this.socketService.sendMessage({channel: "tasks", type: "request_task", "task_id": this.taskId});
    }
  }

  onRequestTask(taskData: any) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TaskEditorPopupComponent);

    const viewContainerRef = this.taskEditorPopupHost.viewContainerRef;

    let componentRef: ComponentRef<TaskEditorPopupComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory);

    let instance: TaskEditorPopupComponent = <TaskEditorPopupComponent>componentRef.instance;
    instance.data = taskData;
    instance.onClose = this.closeTask.bind(this);
  }

  closeTask(event: Event) {
    if ((event.target as HTMLElement).classList.contains("modal") ||
      (event.target as HTMLElement).classList.contains("close-task") ||
      (event.target as HTMLElement).classList.contains("remove-task") || 
      (event.target as HTMLElement).classList.contains("close-button")) {
      const viewContainerRef = this.taskEditorPopupHost.viewContainerRef;
      viewContainerRef.clear();
      this.location.replaceState('/home/tasks');
    }
  }
}
