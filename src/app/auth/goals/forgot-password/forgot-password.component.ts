import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { NgForm } from '@angular/forms';
import { SocketService } from 'src/app/socket/socket.service';
import { Goal } from '../goal';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements Goal, OnInit {

  header: string = "Reset your password";
  location: Location;
  ngForm: NgForm;
  socketService: SocketService;

  constructor(location: Location, socketService: SocketService) {
    this.location = location;
    this.socketService = socketService;
  }

  ngOnInit(): void {
    this.socketService.reply.subscribe(msg => this.onResponseReceived(msg));
  }

  onSubmit(f: NgForm) {
    let submission = {channel: "auth", type: "request_reset_password", username: f.value["username"]};
    this.socketService.sendMessage(submission);
  }

  navigate(s: string) {
    this.location.replaceState(s);
  }

  onResponseReceived(msg: any): void {
    if (msg["type"] == "request_reset_password") {
      if (msg["success"]) {
        document.getElementsByClassName("message")[0].classList.add("visible");
      }
    }
  }
}
