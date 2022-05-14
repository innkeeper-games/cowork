import { Component, OnInit, ViewChild, ComponentFactoryResolver, ViewRef, HostListener } from '@angular/core';
import { Activity } from '../activity';
import { ChatMessageDirective } from './chat-message.directive';
import { RoomChangeService } from '../../room-change.service';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { SocketService } from 'src/app/socket/socket.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { MembersService } from '../../members.service';
import { ChatService } from '../../chat-service.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, Activity {

  @ViewChild(ChatMessageDirective, {static: true}) chatMessageHost: ChatMessageDirective;

  header: string = "Chat";

  roomChangeService: RoomChangeService;
  componentFactoryResolver: ComponentFactoryResolver;
  socketService: SocketService;
  notificationsService: NotificationsService;
  membersService: MembersService;
  chatService: ChatService;

  chats: Map<string, ChatMessageComponent> = new Map<string, ChatMessageComponent>();

  chatViewRefs: Map<string, ViewRef> = new Map<string, ViewRef>();

  earliestChatId: string;
  roomId: string;
  allChatsLoaded: boolean;

  isRequesting: boolean;

  constructor(socketService: SocketService, roomChangeService: RoomChangeService, notificationsService: NotificationsService, membersService: MembersService, chatService: ChatService, componentFactoryResolver: ComponentFactoryResolver) {
    this.socketService = socketService;
    this.roomChangeService = roomChangeService;
    this.notificationsService = notificationsService;
    this.membersService = membersService;
    this.chatService = chatService;
    this.componentFactoryResolver = componentFactoryResolver;
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    let chatField: HTMLTextAreaElement = document.getElementById("chat-field") as HTMLTextAreaElement;
    if (!(document.activeElement.tagName == "TEXTAREA") && (document.getElementById("chat").classList.contains("visible")) && event.key != "Enter") {
      chatField.value += event.key;
      chatField.focus();
    }
  }

  ngOnInit(): void {
    this.socketService.reply.subscribe(msg => this.onResponseReceived(msg));
    this.roomChangeService.roomId.subscribe(msg => this.onRoomChange(msg));
  }

  onRoomChange(roomId: string): void {
    this.roomId = roomId;
    document.getElementById("retrieving").classList.remove("hidden");
    this.allChatsLoaded = false;
    const viewContainerRef = this.chatMessageHost.viewContainerRef;
    viewContainerRef.clear();
    if (roomId != null) {
      this.socketService.sendMessage({channel: "chat", type: "request_initial_messages", room_id: roomId});
      this.isRequesting = true;
    }
  }

  onResponseReceived(msg: any): void {
    if (msg["type"] == "request_messages") {
      document.getElementById("retrieving-now").classList.add("hidden");
      document.getElementById("load-more").classList.remove("hidden");
      msg["messages"].forEach(data => {
        data["sent_date"] = data["sent_date"] + "Z";
        if (!this.allChatsLoaded && this.isRequesting) this.loadChat(data, false);
      });
      this.isRequesting = false;
      if (msg["messages"].length < 10) {
        document.getElementById("retrieving").classList.add("hidden");
        this.allChatsLoaded = true;
      }
    }
    else if (msg["type"] == "send_message") {
      msg["sent_date"] = msg["sent_date"] + "Z";
      if (msg["account_id"] != sessionStorage.getItem("account_id")) this.notificationsService.pushNotification("chat");
      this.loadChat(msg, true);
    }
    else if (msg["type"] == "delete_message") {
      console.log("deleting");
      this.deleteChat(msg);
    }
    else if (msg["type"] == "edit_message") {
      this.editChat(msg);
    }
  }

  onSendChat(event: any): void {
    let chatField: HTMLTextAreaElement = document.getElementById("chat-field") as HTMLTextAreaElement;
    let contents: string = chatField.value;
    this.socketService.sendMessage({channel: "chat", type: "send_message", room_id: sessionStorage.getItem("room_id"), contents: contents});
    chatField.value = "";
    event.preventDefault();
  }

  onListScroll(): void {
    let list: Element = document.getElementById("list");
    document.getElementById("retrieving-now").classList.remove("hidden");
    document.getElementById("load-more").classList.add("hidden");
    if (document.getElementById("retrieving-now").getBoundingClientRect().bottom > 0 && !this.allChatsLoaded && !this.isRequesting) {
      this.socketService.sendMessage({channel: "chat", type: "request_messages", room_id: this.roomId, before_chat_id: this.earliestChatId});
      this.isRequesting = true;
    }
  }

  loadMore(): void {
    let list: Element = document.getElementById("list");
    document.getElementById("retrieving-now").classList.remove("hidden");
    document.getElementById("load-more").classList.add("hidden");
    this.isRequesting = true;
    this.socketService.sendMessage({channel: "chat", type: "request_messages", room_id: this.roomId, before_chat_id: this.earliestChatId});
  }

  loadChat(data: any, recent: boolean): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChatMessageComponent);

    const viewContainerRef = this.chatMessageHost.viewContainerRef;

    let componentRef;
    if (recent) {
      componentRef = viewContainerRef.createComponent(componentFactory, 0);
      this.chatService.pushChatMessage(data);
    }
    else {
      componentRef = viewContainerRef.createComponent(componentFactory);
      this.earliestChatId = data["chat_id"];
    }

    let instance: ChatMessageComponent = <ChatMessageComponent>componentRef.instance;
    instance.data = data;
    this.chats.set(data["chat_id"], instance);
    this.chatViewRefs.set(data["chat_id"], componentRef.hostView);
  }

  deleteChat(msg: any) {
    if (this.chats.has(msg.chat_id)) {
      let index: number = this.chatMessageHost.viewContainerRef.indexOf(this.chatViewRefs.get(msg["chat_id"]));
      this.chatMessageHost.viewContainerRef.remove(index);
    }
  }

  editChat(msg: any) {
    if (this.chats.has(msg["chat_id"])) {
      this.chats.get(msg["chat_id"]).data["edited"] = true;
      this.chats.get(msg["chat_id"]).data["contents"] = msg["new_contents"];
    }
  }
}
