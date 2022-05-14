import { Component, OnInit, Input } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Goal } from '../goal';
import { SocketService } from '../../../socket/socket.service';
import { AnalyticsService } from 'src/app/analytics.service';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit, Goal {

  header: string = "Sign up for an account"
  location: Location;
  ngForm: NgForm;
  socketService: SocketService;
  analyticsService: AnalyticsService;

  constructor(location: Location, socketService: SocketService, analyticsService: AnalyticsService) {
    this.location = location;
    this.socketService = socketService;
    this.analyticsService = analyticsService;
  }

  ngOnInit(): void {
    this.socketService.reply.subscribe(msg => this.onResponseReceived(msg));
  }

  onSubmit(f: NgForm) {
    let submission = {channel: "auth", type: "sign_up", username: <string> f.value["username"], password: <string> f.value["password"]};
    this.socketService.sendMessage(submission);
  }

  navigate(s: string) {
    this.location.replaceState(s);
  }

  onResponseReceived(msg: any): void {
    if (msg["type"] == "sign_up") {
      if (msg["password_correct"] || msg["account_creation_success"]) {
        if (msg["password_correct"] == true || msg["account_creation_success"] == true) {
          this.analyticsService.trackEvent("Signup");
          document.location.href = "/home";
        }
      }
      else if (msg["error"]) {
        let error: HTMLElement = document.getElementById("error");
        error.innerHTML = msg["error"];
        error.id = "visible-error";
      }
    }
    else if (msg["type"] == "request_room") {
      if (msg["title"] != null) {
        this.header = "Sign up to continue to " + msg["title"];
      }
    }
  }
}
