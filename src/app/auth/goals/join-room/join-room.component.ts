import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common'
import { SocketService } from '../../../socket/socket.service';
import { ActivatedRoute } from '@angular/router';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { Goal } from '../goal';
import { AnalyticsService } from 'src/app/analytics.service';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.css']
})
export class JoinRoomComponent implements OnInit, Goal {

  header: string = "Join the room!";
  roomId: string;
  roomTitle: string;
  roomDescription: string;
  faUsers = faUsers;
  memberCount = 0;

  responseReceived: boolean;
  roomValid: boolean = true;

  socketService: SocketService;
  
  analyticsService: AnalyticsService;

  route: ActivatedRoute;

  location: Location;

  signedIn: boolean;

  // account for lost messages
  requestInterval: number;

  constructor(socketService: SocketService, analyticsService: AnalyticsService, route: ActivatedRoute, location: Location) {
    this.socketService = socketService;
    this.analyticsService = analyticsService;
    this.route = route;
    this.location = location;
  }

  ngOnInit(): void {
    if (this.location.path().includes("/j/")) {
      this.roomId = this.route.snapshot.paramMap.get('roomId');

      this.socketService.reply.subscribe(msg => this.onResponseReceived(msg));

      this.requestInterval = window.setInterval(function() {
        this.socketService.sendMessage({channel: "public", type: "request_room", room_id: this.roomId});
      }.bind(this), 500);
    }
  }

  navigate(s: string) {
    this.location.replaceState(s);
  }

  onResponseReceived(msg: any): void {
    if (msg["type"] == "request_room") {
      this.responseReceived = true;
      window.clearInterval(this.requestInterval);
      if (msg["title"] != null) {
        this.roomValid = true;
        this.header = "Join " + msg["title"];
        this.roomTitle = msg["title"];
        this.roomDescription = msg["description"];
        this.memberCount = msg["member_count"];
      }
      else {
        this.roomValid = false;
        this.header = "Invalid Room Link";
      }
    }
    else if (msg["type"] == "sign_in") {
      if (msg["password_correct"]) this.signedIn = true;
    }
  }

  joinRoom() {
    sessionStorage.setItem("joinRoomId", this.roomId);
    sessionStorage.setItem("joinRoomTitle", this.roomTitle);

    this.analyticsService.trackEvent("Enter room before signup", {props: {"Room title": this.roomTitle, "Room id": this.roomId}});
    
    if (!this.signedIn) this.navigate('/auth/sign-up');
    else window.location.href = '/home';
  }

  goHome() {
    window.location.href = '/home';
  }

}
