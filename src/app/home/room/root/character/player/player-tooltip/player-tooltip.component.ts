import { Component, OnDestroy, OnInit } from '@angular/core';
import { Vector } from 'kontra';
import { Subscription } from 'rxjs';
import { AnalyticsService } from 'src/app/analytics.service';
import { Handler } from 'src/app/handler';
import { SocketService } from 'src/app/socket/socket.service';
import { Player } from '../player';

@Component({
  selector: 'app-player-tooltip',
  templateUrl: './player-tooltip.component.html',
  styleUrls: ['./player-tooltip.component.css']
})
export class PlayerTooltipComponent extends Handler implements OnInit, OnDestroy {

  displayName: string;
  id: string;
  activeTaskData: any = {"task_id": null, "title": "Loading..."};
  pro: boolean = false;
  position: Vector;

  x: string;
  y: string;

  onClose: Function;

  socketService: SocketService;
  analyticsService: AnalyticsService;

  subscription: Subscription;

  constructor(socketService: SocketService, analyticsService: AnalyticsService) {
    super();
    this.socketService = socketService;
    this.analyticsService = analyticsService;
  }

  ngOnInit(): void {
    const width: number = 300;
    const height: number = 150;

    const marginBottom: number = 18;

    this.subscription = this.socketService.channelReply.get("room").subscribe(msg => {
      if (msg["type"] == "request_player_information") this[this.snakeToCamel(msg["type"])](msg);
    });

    this.x = (this.position.x - (width / 2) - (32 / 2)).toString() + "px";
    this.y = (this.position.y - height - marginBottom).toString() + "px";

    this.socketService.sendMessage({ channel: "tasks", type: "request_player_information", "persist_object_id": this.id });
    this.analyticsService.trackEvent("Open player tooltip");
  }

  requestPlayerInformation(msg: any): void {
    this.activeTaskData = msg;
    this.pro = msg["pro"];
    if (!msg["public"]) {
      this.activeTaskData["title"] = "This user's active task is not currently available.";
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
