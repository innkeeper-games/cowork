import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SocketService } from 'src/app/socket/socket.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  header: string = "Reset your password";

  socketService: SocketService;
  route: ActivatedRoute;

  location: Location;

  token: string;

  constructor(socketService: SocketService, route: ActivatedRoute, location: Location) {
    this.socketService = socketService;
    this.route = route;
    this.location = location;
  }

  ngOnInit(): void {
    if (this.location.path().includes("/reset-password/")) {
      this.token = this.route.snapshot.paramMap.get('token');
    }
  }

  onSubmit(f: NgForm) {
    let submission = {channel: "auth", type: "update_password", password: f.value["password"], token: this.token};
    this.socketService.sendMessage(submission);
  }

}
