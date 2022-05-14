import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';

@Component({
  selector: 'app-room-invitation',
  templateUrl: './room-invitation.component.html',
  styleUrls: ['./room-invitation.component.css']
})
export class RoomInvitationComponent implements OnInit {
  data: any;
  socketService: SocketService;

  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  ngOnInit(): void {
  }

  joinRoom(roomId: string): void {
    let submission = {channel: "settings", type: "join_room", room_id: roomId};
    this.socketService.sendMessage(submission);
  }

  declineInvitation(invitationId: string): void {
    let submission = {channel: "settings", type: "decline_invitation", invitation_id: invitationId};
    this.socketService.sendMessage(submission);
  }

}
