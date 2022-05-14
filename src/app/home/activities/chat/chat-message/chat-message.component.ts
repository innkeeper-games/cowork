import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MembersService } from 'src/app/home/members.service';
import { SocketService } from 'src/app/socket/socket.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {

  @Input() data: any;

  socketService: SocketService;
  membersService: MembersService;

  canEdit: boolean;
  newContents: string;
  editing: boolean;

  constructor(socketService: SocketService, membersService: MembersService) {
    this.socketService = socketService;
    this.membersService = membersService;
  }

  ngOnInit(): void {
    this.canEdit = this.data.account_id == sessionStorage.getItem("account_id");
  }

  openTooltip(): void {
    this.membersService.openTooltip(this.data.display_name, this.data.account_id);
  }

  edit(): void {
    this.editing = true;
    this.newContents = this.data.contents;
    let editField: HTMLTextAreaElement = document.getElementById("edit-field-" + this.data.chat_id) as HTMLTextAreaElement;
    window.setTimeout(function() {
      editField.focus();
    }, 100);
  }

  sendEdits(): void {
    this.editing = false;
    this.socketService.sendMessage({"channel": "chat", "type": "edit_message", "chat_id": this.data.chat_id, "new_contents": this.newContents});
  }

  delete(): void {
    this.socketService.sendMessage({"channel": "chat", "type": "delete_message", "chat_id": this.data.chat_id});
  }

}
