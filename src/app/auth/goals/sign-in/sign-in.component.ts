import { Component, OnInit, Input } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms'
import { Location } from '@angular/common';
import { SocketService } from '../../../socket/socket.service';
import { Goal } from '../goal';
import { AnalyticsService } from 'src/app/analytics.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit, Goal {

  header: string = "Sign in to continue";
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
    let submission = {channel: "auth", type: "sign_in", username: f.value["username"], password: f.value["password"]};
    this.socketService.sendMessage(submission);
  }

  navigate(s: string) {
    this.location.replaceState(s);
  }

  onResponseReceived(msg: any): void {
    if (msg["type"] == "sign_in") {
      if (msg["password_correct"]) {
        if (msg["password_correct"] == true && !this.location.path().includes('/j/')) {
          this.analyticsService.trackEvent("4PAAIGLG");
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
        this.header = "Sign in to continue to " + msg["title"];
      }
    }
  }
}
