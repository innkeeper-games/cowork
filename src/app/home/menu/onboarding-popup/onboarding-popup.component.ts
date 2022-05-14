import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SocketService } from 'src/app/socket/socket.service';

@Component({
  selector: 'app-onboarding-popup',
  templateUrl: './onboarding-popup.component.html',
  styleUrls: ['./onboarding-popup.component.css']
})
export class OnboardingPopupComponent implements OnInit {

  onClose: Function;

  socketService: SocketService;

  listedRooms: any[];

  constructor(socketService: SocketService) {
    this.socketService = socketService;
  }

  ngOnInit(): void {
    if (!this.socketService.channelIsRegistered("settings")) this.socketService.register("settings");
    this.socketService.channelReply.get("settings").subscribe(msg => {
      if (msg["type"] == "request_listed_rooms") {
        this.listedRooms = [];
        for (let room_id in msg["listed_rooms"]) {
          this.listedRooms.push(msg["listed_rooms"][room_id]);
        }
      }
      else if (msg["type"] == "join_room") this.socketService.sendMessage({"channel": "settings", "type": "enter_room", "room_id": msg["room_id"]});
      else if (msg["type"] == "enter_room") this.onClose();
    });

    this.socketService.sendMessage({"channel": "settings", "type": "request_listed_rooms"});
  }

  onSubmitJoin(f: NgForm): void {
    let submission = {channel: "settings", type: "join_room", room_id: <string> f.value["joinCode"]};
    f.resetForm();
    this.socketService.sendMessage(submission);
  }

  onSubmitLeave(): void {
    let submission = {channel: "settings", type: "leave_room", room_id: sessionStorage.getItem("room_id")};
    this.socketService.sendMessage(submission);
  }

  onSubmitCreate(f: NgForm): void {
    let submission = {channel: "settings", type: "create_room", title: <string> f.value["title"]};
    f.resetForm();
    this.socketService.sendMessage(submission);
  }

}
