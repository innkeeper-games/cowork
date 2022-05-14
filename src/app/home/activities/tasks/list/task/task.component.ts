import { Component, OnInit, Input, AfterViewInit, ComponentFactoryResolver, ViewChild, ComponentRef } from '@angular/core';
import { Location } from '@angular/common';
import { CdkDragStart } from '@angular/cdk/drag-drop';
import { SocketService } from 'src/app/socket/socket.service';
import { ListsService } from '../../lists.service';
import { TasksService } from '../../../tasks.service';
import { TagDirective } from '../filter-popup/tag.directive';
import { TagComponent } from '../filter-popup/tag/tag.component';


@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  @Input() data: any;
  @Input() onClick: Function;
  @Input() isListing: boolean;

  @ViewChild(TagDirective, { static: true }) public tagHost: TagDirective;


  socketService: SocketService;
  listsService: ListsService;
  tasksService: TasksService;

  componentFactoryResolver: ComponentFactoryResolver;

  location: Location;

  mobile: boolean;

  constructor(socketService: SocketService, listsService: ListsService, tasksService: TasksService, componentFactoryResolver: ComponentFactoryResolver, location: Location) {
    this.socketService = socketService;
    this.listsService = listsService;
    this.tasksService = tasksService;
    this.componentFactoryResolver = componentFactoryResolver;
    this.location = location;
  }

  ngOnInit(): void {
    this.socketService.reply.subscribe(msg => this.onResponseReceived(msg));
    if (this.isListing && this.data.tags) for (let tag of this.data.tags) this.loadTag(tag);
    if (this.isListing && this.data.active) this.tasksService.setActiveTask(this.data);

    this.mobile = window.matchMedia('only screen and (max-width: 760px)').matches;
  }

  onResponseReceived(msg: any): void {
    if (msg["channel"] == "tasks") {
      if (msg["type"] == "request_task") {
        this.onRequestTask(msg);
      }
      if (msg["type"] == "set_listing_active") {
        if (msg["listing_id"] == this.data.listing_id) {
          this.data.active = msg["active"];
          this.tasksService.setActiveTask(this.data);
        }
        else this.data.active = false;
      }
      if (msg["type"] == "set_task_public") {
        if (msg["task_id"] == this.data.task_id) this.data.public = msg["public"];
      }
      if (msg["type"] == "add_tagging") {
        if (this.isListing && msg["listing_id"] == this.data.listing_id) this.loadTag(msg);
      }
    }
  }

  loadTag(data: any): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TagComponent);

    const viewContainerRef = this.tagHost.viewContainerRef;

    let componentRef: ComponentRef<TagComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory, data.index);

    let instance: TagComponent = <TagComponent>componentRef.instance;
    instance.data = data;
    instance.onSelect = function name(data: any) {
      this.location.replaceState('/home/tasks/' + this.data.task_id)
    }.bind(this);
  }

  startDragging(event: CdkDragStart<string[]>): void {
    event.source.data = this.data;
  }

  openTask(event: Event): void {
    event.preventDefault();
    if (this.data.task_id != undefined && this.onClick == undefined) this.location.replaceState('/home/tasks/' + this.data.task_id);
    else if (this.onClick != undefined) this.onClick(this.data);
  }

  removeTask() {
    this.socketService.sendMessage({ channel: "tasks", type: "delete_task", "task_id": this.data.task_id });
  }

  onRequestTask(msg: any) {
    if (msg["task_id"] == this.data.task_id) {
      this.data = msg;
    }
  }
}