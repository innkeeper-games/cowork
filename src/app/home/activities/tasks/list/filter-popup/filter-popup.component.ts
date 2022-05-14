import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { TagDirective } from './tag.directive';
import { TagComponent } from './tag/tag.component';

@Component({
  selector: 'app-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrls: ['./filter-popup.component.css']
})
export class FilterPopupComponent implements OnInit {

  socketService: SocketService;
  @ViewChild(TagDirective, { static: true }) public tagHost: TagDirective;
  
  componentFactoryResolver: ComponentFactoryResolver;

  constructor(socketService: SocketService, componentFactoryResolver: ComponentFactoryResolver) {
    this.componentFactoryResolver = componentFactoryResolver;
    this.socketService = socketService;
  }

  ngOnInit(): void {
    this.socketService.channelReply.get("tasks").subscribe(msg => this.onResponseReceived(msg));
    this.socketService.sendMessage({channel: "tasks", type: "request_tags"});
  }

  onResponseReceived(msg: any): void {
    if (msg["channel"] == "tasks") {
      if (msg["type"] == "request_tags") {
        this.onRequestTags(msg);
      }
      else if (msg["type"] == "add_tag") {
        this.onAddTag(msg);
      }
    }
  }

  onRequestTags(msg: any): void {
    for (let tag of msg["tags"]) this.loadTag(tag);
  }

  onAddTag(msg: any): void {
    this.loadTag(msg);
  }

  async loadTag(data: any): Promise<void> {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TagComponent);

    const viewContainerRef = this.tagHost.viewContainerRef;

    let componentRef: ComponentRef<TagComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory, data.index);

    let instance: TagComponent = <TagComponent>componentRef.instance;
    instance.data = data;
    instance.onSelect = this.filterByTag.bind(this);
  }

  filterByTag(tagId: string) {

  }

  addTag(): void {
    let titleField: HTMLInputElement = document.getElementById("new-tag-title-field") as HTMLInputElement;
    let title: string = titleField.value;
    let min = Math.ceil(0);
    let max = Math.floor(4);
    let color: number = Math.floor(Math.random() * (max - min) + min);
    this.socketService.sendMessage({channel: "tasks", type: "add_tag", color: color, title: title});
  }

}
