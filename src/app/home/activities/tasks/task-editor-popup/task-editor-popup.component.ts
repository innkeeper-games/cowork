import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild, ViewRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalyticsService } from 'src/app/analytics.service';
import { SocketService } from 'src/app/socket/socket.service';
import { StatsService } from '../../stats.service';
import { TagDirective } from '../list/filter-popup/tag.directive';
import { TagComponent } from '../list/filter-popup/tag/tag.component';
import { TagsPopupDirective } from './tags-popup.directive';
import { TagsPopupComponent } from './tags-popup/tags-popup.component';

@Component({
  selector: 'app-task-editor-popup',
  templateUrl: './task-editor-popup.component.html',
  styleUrls: ['./task-editor-popup.component.css']
})
export class TaskEditorPopupComponent implements OnInit {
  

  data: any;
  onClose: Function;

  @ViewChild(TagsPopupDirective, { static: true }) public tagsPopupHost: TagsPopupDirective;
  @ViewChild(TagDirective, { static: true }) public tagHost: TagDirective;

  tags: Map<string, TagComponent> = new Map<string, TagComponent>();
  taggings: Map<string, string> = new Map<string, string>();


  tagViewRefs: Map<string, ViewRef> = new Map<string, ViewRef>();

  enteredTitle: string;
  enteredDescription: string;

  isEditingTitle: boolean = true;

  tagsPopupOpen: boolean = false;

  socketService: SocketService;
  statsService: StatsService;
  componentFactoryResolver: ComponentFactoryResolver;

  socketSubscription: Subscription;

  minutes: number;
  analyticsService: AnalyticsService;

  constructor(socketService: SocketService, statsService: StatsService, componentFactoryResolver: ComponentFactoryResolver, analyticsService: AnalyticsService) {
    this.socketService = socketService;
    this.statsService = statsService;
    this.analyticsService = analyticsService;
    this.componentFactoryResolver = componentFactoryResolver;
  }

  ngOnInit(): void {
    this.enteredTitle = this.data.title || "Untitled task";
    this.enteredDescription = this.data.contents;
    let modalContent: HTMLElement = document.getElementsByClassName("modal-content")[0] as HTMLElement;
    if (this.data.tags) for (let tag of this.data.tags) {
      this.loadTagging(tag);
    }
    modalContent.focus();
    this.socketSubscription = this.socketService.channelReply.get("tasks").subscribe(msg => this.onResponseReceived(msg));

    this.analyticsService.trackEvent("Open task editor popup");

    if (this.statsService.hasListing(this.data.listing_id)) {
      let seconds: number = this.statsService.getMillisecondsForListing(this.data.listing_id) / 1000;
      let minutes: number = Math.floor(seconds / 60);
      seconds -= minutes * 60;
      this.minutes = minutes;
    }
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) this.socketSubscription.unsubscribe();
  }

  onResponseReceived(msg: any): void {
    if (msg["channel"] == "tasks") {
      if (msg["type"] == "add_tagging") {
        this.loadTagging(msg);
      }
      else if (msg["type"] == "delete_tagging" || msg["type"] == "delete_tag") {
        this.deleteTagging(msg);
      }
    }
  }

  saveTask(): void {
    this.socketService.sendMessage({"channel": "tasks", "type": "save_task", "task_id": this.data.task_id});
  }

  onRequestTags(msg: any): void {
    for (let tag of msg["tags"]) this.loadTagging(tag);
  }

  deleteTagging(msg: any) {
    if (this.tags.has(msg.tag_id)) {
      let index: number = this.tagHost.viewContainerRef.indexOf(this.tagViewRefs.get(msg.tag_id));
      this.tagHost.viewContainerRef.remove(index);
    }
    else if (this.tags.has(this.taggings.get(msg.tagging_id))) {
      let index: number = this.tagHost.viewContainerRef.indexOf(this.tagViewRefs.get(this.taggings.get(msg.tagging_id)));
      this.tagHost.viewContainerRef.remove(index);
    }
  }

  loadTagging(data: any): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TagComponent);

    const viewContainerRef = this.tagHost.viewContainerRef;

    let componentRef: ComponentRef<TagComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory, data.index);

    let instance: TagComponent = <TagComponent>componentRef.instance;
    instance.data = data;
    instance.onSelect = this.removeTag.bind(this);
    this.tags.set(data.tag_id, instance);
    this.taggings.set(data.tagging_id, data.tag_id);
    this.tagViewRefs.set(data.tag_id, componentRef.hostView);
  }

  removeTag(data: any) {
    this.socketService.sendMessage({channel: "tasks", type: "delete_tagging", tagging_id: data.tagging_id});
  }

  toggleTags() {
    // request tags? or should have already requested them (probably)
    // make them display: flex or display: none depending on whether
    // they are already visible
    if (!this.tagsPopupOpen) this.openTagsPopup();
    else this.closeTagsPopup();
  }

  openTagsPopup() {
    const viewContainerRef = this.tagsPopupHost.viewContainerRef;
    viewContainerRef.clear();

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(TagsPopupComponent);

    let componentRef: ComponentRef<TagsPopupComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory);

    let instance: TagsPopupComponent = <TagsPopupComponent>componentRef.instance;
    instance.data = this.data;
    instance.onClose = this.closeTagsPopup.bind(this);
    this.tagsPopupOpen = true;
  }

  closeTagsPopup() {
    const viewContainerRef = this.tagsPopupHost.viewContainerRef;
    viewContainerRef.clear();
    this.tagsPopupOpen = false;
  }

  editTitle(): void {
    let titleField: HTMLInputElement = document.getElementById("task-title-field") as HTMLInputElement;
    this.enteredTitle = this.data.title;
    this.isEditingTitle = true;
  }

  saveTitle(): void {
    let titleField: HTMLInputElement = document.getElementById("task-title-field") as HTMLInputElement;
    if (this.enteredTitle != undefined) {
      if (titleField == document.activeElement) titleField.blur();
  
      this.data.title = this.enteredTitle;
  
      this.isEditingTitle = false;
      this.socketService.sendMessage({ channel: "tasks", type: "edit_task_title", task_id: this.data.task_id, title: this.enteredTitle });
    }
  }

  saveDescription(): void {
    if (this.enteredDescription != undefined) {  
      this.data.contents = this.enteredDescription;
  
      this.socketService.sendMessage({channel: "tasks", type: "edit_task_contents", task_id: this.data.task_id, contents: this.enteredDescription});
    }
  }

  changePublic(): void {
    this.socketService.sendMessage({channel: "tasks", type: "set_task_public", task_id: this.data.task_id, public: !this.data.public});
  }

  changeComplete(): void {
    this.socketService.sendMessage({channel: "tasks", type: "set_task_complete", task_id: this.data.task_id, complete: !this.data.complete});
    document.getElementById("editor").classList.toggle("complete");
  }

  removeTask(event: Event): void {
    this.onClose(event);
    this.socketService.sendMessage({channel: "tasks", type: "delete_task", task_id: this.data.task_id, title: this.enteredTitle});
  }

}
