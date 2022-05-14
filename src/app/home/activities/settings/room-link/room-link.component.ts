import { Component, OnInit, Input } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { NgForm } from '@angular/forms'

@Component({
  selector: 'app-room-link',
  templateUrl: './room-link.component.html',
  styleUrls: ['./room-link.component.css']
})
export class RoomLinkComponent implements OnInit {

  @Input() data: any;
  @Input() join: boolean
  descriptionDisplay: string = "none";

  socketService: SocketService

  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  ngOnInit(): void {
    if (this.data.room_description != null && this.data.room_description.length > 0) this.descriptionDisplay = "inherit";
  }

  enterRoom(roomId: string, title: string): void {
    if (!this.join) this.socketService.sendMessage({channel: "settings", type: "enter_room", room_id: roomId});
    else this.socketService.sendMessage({channel: "settings", type: "join_room", room_id: roomId})
    sessionStorage.setItem("room_id", roomId);
    sessionStorage.setItem("room_title", title);
  }

}
