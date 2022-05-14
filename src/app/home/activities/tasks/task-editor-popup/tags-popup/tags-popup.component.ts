import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild, ViewRef } from '@angular/core';
import { tag } from 'ngx-bootstrap-icons';
import { SocketService } from 'src/app/socket/socket.service';
import { TagDirective } from '../../list/filter-popup/tag.directive';
import { TagComponent } from '../../list/filter-popup/tag/tag.component';

@Component({
  selector: 'app-tags-popup',
  templateUrl: './tags-popup.component.html',
  styleUrls: ['./tags-popup.component.css']
})
export class TagsPopupComponent implements OnInit {

  socketService: SocketService;
  @ViewChild(TagDirective, { static: true }) public tagHost: TagDirective;

  tags: Map<string, TagComponent> = new Map<string, TagComponent>();

  tagViewRefs: Map<string, ViewRef> = new Map<string, ViewRef>();

  data: any;
  onClose: Function;
  
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
      else if (msg["type"] == "delete_tag") {
        this.onDeleteTag(msg);
      }
    }
  }

  onRequestTags(msg: any): void {
    for (let tag of msg["tags"]) this.loadTag(tag);
  }

  onDeleteTag(msg: any) {
    if (this.tags.has(msg.tag_id)) {
      let index: number = this.tagHost.viewContainerRef.indexOf(this.tagViewRefs.get(msg.tag_id));
      this.tagHost.viewContainerRef.remove(index);
    }
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
    instance.onSelect = this.addTagToListing.bind(this);
    instance.onDelete = this.deleteTag.bind(this);
    this.tags.set(data.tag_id, instance);
    this.tagViewRefs.set(data.tag_id, componentRef.hostView);
  }

  addTagToListing(data: any): void {
    this.socketService.sendMessage({channel: "tasks", type: "add_tagging", listing_id: this.data.listing_id, tag_id: data.tag_id});
  }

  deleteTag(data: any, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.socketService.sendMessage({channel: "tasks", type: "delete_tag", tag_id: data.tag_id});
  }

  addTag(): void {
    let titleField: HTMLInputElement = document.getElementById("new-tag-title-field") as HTMLInputElement;
    let title: string = titleField.value;
    let min = Math.ceil(0);
    let max = Math.floor(4);
    let color: number = Math.floor(Math.random() * (max - min) + min);
    this.socketService.sendMessage({channel: "tasks", type: "add_tag", color: color, title: title});
    titleField.value = "";
  }

}
