import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { Handler } from 'src/app/handler';
import { SocketService } from 'src/app/socket/socket.service';
import { WebMonetizationService } from 'src/app/web-monetization/web-monetization.service';
import { Activity } from '../activity';
import { TasksService } from '../tasks.service';
import { randInt } from 'kontra';
import { NotificationsService } from '../../notifications/notifications.service';
import { StatsService } from '../stats.service';
import { ProService } from '../../pro.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent extends Handler implements OnInit, Activity {
  header: string = "Stats";

  webMonetizationService: WebMonetizationService;
  socketService: SocketService;
  tasksService: TasksService;
  notificationsService: NotificationsService;
  proService: ProService;
  statsService: StatsService;

  pro: boolean;

  tagBreakdownStackedBar: Chart;
  taskBreakdownPieChart: Chart;

  sessions: any;
  achievements: any[];

  tags: Map<string, any> = new Map<string, any>();
  millisecondsPerTagPerDay: Map<string, number[]>;

  listings: any[];

  millisecondsPerListing: Map<string, number>;
  minutesOnDeletedListings: number;

  fromDate: Date;
  toDate: Date;

  days: number;
  hours: number;
  minutes: number = 0;

  constructor(webMonetizationService: WebMonetizationService, socketService: SocketService, tasksService: TasksService, notificationsService: NotificationsService, proService: ProService, statsService: StatsService) {
    super();
    this.webMonetizationService = webMonetizationService;
    this.socketService = socketService;
    this.tasksService = tasksService;
    this.proService = proService;
    this.tasksService.setOnListsDoneLoading(this.updateData.bind(this));
    this.notificationsService = notificationsService;
    this.millisecondsPerListing = new Map<string, number>();
    this.statsService = statsService;
  }

  ngOnInit(): void {
    this.proService.pro.subscribe(pro => {
      if (pro) {
        this.socketService.sendMessage({channel: "stats", type: "request_sessions"});
      }
      this.pro = pro
    });

    this.fromDate = new Date(new Date().setDate(new Date().getDate() - 6));
    this.toDate = new Date(new Date().setDate(new Date().getDate()));
    this.toDate.setHours(23, 59);

    (document.getElementById("from") as HTMLInputElement).value = this.fromDate.toLocaleDateString("fr-CA", {'year': 'numeric', 'month': 'numeric', 'day': 'numeric'});
    (document.getElementById("to") as HTMLInputElement).value = this.toDate.toLocaleDateString("fr-CA", {'year': 'numeric', 'month': 'numeric', 'day': 'numeric'});

    if (!this.socketService.channelIsRegistered("stats")) this.socketService.register("stats");
    this.socketService.channelReply.get("stats").subscribe(msg => {
      this[this.snakeToCamel(msg["type"])](msg);
    });

    this.socketService.sendMessage({channel: "stats", type: "request_achievements"});

    const ctx = (document.getElementById('tag-breakdown-stacked-bar') as HTMLCanvasElement).getContext('2d');
    this.tagBreakdownStackedBar = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }]
      }
    });

    const ctx2 = (document.getElementById('task-breakdown-pie') as HTMLCanvasElement).getContext('2d');
    this.taskBreakdownPieChart = new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }]
      }
    });
  }

  onDatesChanged(): void {
    this.fromDate = new Date((document.getElementById("from") as HTMLInputElement).value);
    this.toDate = new Date((document.getElementById("to") as HTMLInputElement).value);
    this.toDate.setHours(23, 59);
    this.updateData();
  }

  updateData(): void {
    let millisecondsInDuration: number = 0;
    this.tags = new Map<string, any>();
    this.millisecondsPerTagPerDay = new Map<string, number[]>();
    this.listings = [];
    this.minutesOnDeletedListings = 0;

    const oneDay = 24 * 60 * 60 * 1000;
    let daysInSelection: number = Math.ceil((this.toDate.getTime() - this.fromDate.getTime()) / oneDay);

    for (let session in this.sessions) {
      for (let span of this.sessions[session].spans) {
        // check that span ended
        let convertedStartTime: Date = new Date(span.start_time + "Z");

        let convertedEndTime: Date = new Date(span.end_time + "Z");

        let listing: any = this.tasksService.getListing(span.listing_id);
        let ms: number = ((new Date(span.end_time)).valueOf() - (new Date(span.start_time).valueOf()));

        if (listing != null) {
          if (this.statsService.hasListing(span.listing_id)) {
            this.statsService.setMillisecondsForListing(span.listing_id, this.statsService.getMillisecondsForListing(span.listing_id) + ms);
          }
          else {
            this.statsService.setMillisecondsForListing(span.listing_id, ms);
          }
        }

        if (convertedStartTime >= this.fromDate && convertedEndTime <= (this.toDate) && span.end_time != null) {
          millisecondsInDuration += ms;
          if (listing != null) {
            if (this.millisecondsPerListing.has(span.listing_id)) {
              this.millisecondsPerListing.set(span.listing_id, this.millisecondsPerListing.get(span.listing_id) + ms);
            }
            else {
              this.listings.push(listing);
              this.millisecondsPerListing.set(span.listing_id, ms);
            }
          }
          else {
            this.minutesOnDeletedListings += ms / 60000;
          }

          let tags: any = span.tags;
          let spanDay: number = Math.floor((convertedEndTime.getTime() - this.fromDate.getTime()) / oneDay) + 1;
          
          for (let tag of tags) {
            if (this.tags.has(tag.tag_id)) {
              this.millisecondsPerTagPerDay.get(tag.tag_id)[spanDay] += ms / 60000;
            }
            else {
              this.tags.set(tag.tag_id, tag);
              this.millisecondsPerTagPerDay.set(tag.tag_id, Array(daysInSelection).fill(0));
              this.millisecondsPerTagPerDay.get(tag.tag_id)[spanDay] += ms / 60000;
            }
          }
        }
      }
    }

    let seconds: number = millisecondsInDuration / 1000;
    let days: number = Math.floor(seconds / (3600*24));
    seconds -= days*3600*24;
    let hours: number = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    let minutes: number = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    this.days = days;
    this.hours = hours;
    this.minutes = minutes;

    this.minutesOnDeletedListings = Math.floor(this.minutesOnDeletedListings);

    this.listings.sort(function(a: any, b: any){
      a.minutes = Math.floor(this.millisecondsPerListing.get(a.listing_id) / 60000);
      b.minutes = Math.floor(this.millisecondsPerListing.get(b.listing_id) / 60000);
      return this.millisecondsPerListing.get(b.listing_id) - this.millisecondsPerListing.get(a.listing_id);
    }.bind(this));

    if (this.listings.length == 1) this.listings[0].minutes = Math.floor(this.millisecondsPerListing.get(this.listings[0].listing_id) / 60000)

    this.taskBreakdownPieChart.data.labels = [];

    this.taskBreakdownPieChart.destroy();

    let taskLabels: string[] = [];
    let taskData: number[] = [];

    for (let listing of this.listings) {
      let title: string;
      if (listing.title.length > 25) title = listing.title.substr(0, 24) + "...";
      else title = listing.title;
      taskLabels.push("Minutes spent on \"" + title + "\"");
      taskData.push(listing.minutes);
    }

    const ctx2 = (document.getElementById('task-breakdown-pie') as HTMLCanvasElement).getContext('2d');
    this.taskBreakdownPieChart = new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: taskLabels,
        datasets: [{
          label: 'Minutes',
          data: taskData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }]
      },
    });

    this.tagBreakdownStackedBar.destroy();

    let tagLabels: string[] = [];
    let tagDatasets: any[] = [];

    for (let tagId of this.tags.keys()) {
      let color: string = "rgba(" + randInt(0, 255) + ", " + randInt(0, 255) + ", " + randInt(0, 255) + ", 1.0)";
      tagDatasets.push({
        label: this.tags.get(tagId).title,
        data: this.millisecondsPerTagPerDay.get(tagId),
        backgroundColor: color
      });
    }

    for (let i = 0; i < daysInSelection; i++) {
      var date: Date = new Date(this.fromDate);
      date.setDate(date.getDate() + i);
      tagLabels.push(date.toDateString());
    }

    const ctx = (document.getElementById('tag-breakdown-stacked-bar') as HTMLCanvasElement).getContext('2d');
    this.tagBreakdownStackedBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: tagLabels,
        datasets: tagDatasets
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Time per Tag per Day'
          },
        },
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true
          }
        }
      }
    });
  }

  requestAchievements(msg: any): void {
    this.achievements = [];
    for (let achievement of msg["achievements"]) {
      if (achievement.just_completed) this.notificationsService.pushNotification('stats');
      achievement.progress = Math.min(achievement.progress * 100, 100);
    }
    this.achievements = msg["achievements"];
  }

  completeAhievement(msg: any): void {
    if (this.achievements != undefined){
      for (let achievement of this.achievements) {
        if (achievement.achievement_id == msg["achievement_id"]) {
          this.notificationsService.pushNotification('stats');
          achievement.just_completed = true;
        }
      }
    }
  }

  requestSessions(msg: any): void {
    this.sessions = msg.sessions;
    this.updateData();
  }

  handleState(state: String) {
    let current: HTMLElement = (document.getElementsByClassName("current-state")[0] as HTMLElement);
    current.classList.remove("current-state");
    if (state == "pending") {
      let loading: HTMLElement = (document.getElementsByTagName("app-loading-monetization")[0] as HTMLElement);
      current = loading;
    }
    else if (state == "started") {
      let monetized: HTMLElement = (document.getElementsByTagName("app-monetized")[0] as HTMLElement);
      current = monetized;
    }
    else {
      // state is stopped or error state
      let notMonetized: HTMLElement = (document.getElementsByTagName("app-not-monetized")[0] as HTMLElement);
      current = notMonetized;
    }
    current.classList.add("current-state");
  }

}
