import { ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Handler } from 'src/app/handler';
import { SocketService } from 'src/app/socket/socket.service';
import { MembersService } from '../../members.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { RoomChangeService } from '../../room-change.service';
import { Activity } from '../activity';
import { TasksService } from '../tasks.service';
import { TimerService } from '../timer.service';
import { ActiveTaskPickerPopupDirective } from './active-task-picker-popup.directive';
import { ActiveTaskPickerPopupComponent } from './active-task-picker-popup/active-task-picker-popup.component';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent extends Handler implements OnInit, Activity {
  header: string = "Timer";

  @ViewChild(ActiveTaskPickerPopupDirective, { static: true }) public activeTaskPickerPopupHost: ActiveTaskPickerPopupDirective;
  componentFactoryResolver: ComponentFactoryResolver;

  tabs: Array<string> = ["host"];

  socketService: SocketService;

  roomChangeService: RoomChangeService;

  roomId: string;

  tasksService: TasksService;
  activeTaskData: any = {"task_id": null, "title": "You need an active task to participate. Select this to pick one."};
  activeTask: boolean = false;

  timerService: TimerService;
  timeRemaining: Date;
  timerSubscription: Subscription;

  notificationsService: NotificationsService;

  membersService: MembersService;

  timeToSubmit: number = 25;
  sessionId: string;
  participants: any[];
  
  joinedSession: boolean = false;

  rightVisibility: string = "visible";
  leftVisibility: string = "visible";

  startButtonDisplay: string = "block";
  leaveButtonDisplay: string = "none";

  participantsDisplay: string = "none";

  joinDisplay: string = "none";
  sessions: any[] = [];

  cdr: ChangeDetectorRef;

  constructor(socketService: SocketService, roomChangeService: RoomChangeService, cdr: ChangeDetectorRef, tasksService: TasksService, timerService: TimerService, notificationsService: NotificationsService, membersService: MembersService, componentFactoryResolver: ComponentFactoryResolver) {
    super();
    this.socketService = socketService;
    this.roomChangeService = roomChangeService;
    this.tasksService = tasksService;
    this.timerService = timerService;
    this.notificationsService = notificationsService;
    this.membersService = membersService;
    this.componentFactoryResolver = componentFactoryResolver;
    this.cdr = cdr;
  }

  ngOnInit(): void {
    if (!this.socketService.channelIsRegistered("timer")) this.socketService.register("timer");
    this.socketService.channelReply.get("timer").subscribe(msg => {
      this[this.snakeToCamel(msg["type"])](msg);
    });
    this.roomChangeService.roomId.subscribe(roomId => this.changeRoom(roomId));
    this.tasksService.activeTask.subscribe(data => {
      this.activeTaskData = data; this.activeTask = true;
      this.cdr.detectChanges();
    });
    this.timeRemaining = new Date(0, 0, 0, 0, this.timeToSubmit);
    this.participants = [];
  }

  changeActiveTask(onCloseResume?: Function): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ActiveTaskPickerPopupComponent);

    const viewContainerRef = this.activeTaskPickerPopupHost.viewContainerRef;

    let componentRef: ComponentRef<ActiveTaskPickerPopupComponent>;

    componentRef = viewContainerRef.createComponent(componentFactory);

    let instance: ActiveTaskPickerPopupComponent = <ActiveTaskPickerPopupComponent>componentRef.instance;
    //instance.data = this.activeTaskData;
    instance.onClose = this.closeActiveTaskPopupPicker.bind(this);
  }

  closeActiveTaskPopupPicker(event?: Event): void {
    if (event == undefined || (event.target as HTMLElement).classList.contains("modal") ||
      (event.target as HTMLElement).classList.contains("close-active-task-picker") ||
      (event.target as HTMLElement).classList.contains("close-button")) {
      const viewContainerRef = this.activeTaskPickerPopupHost.viewContainerRef;
      viewContainerRef.clear();
    }
  }


  changeRoom(roomId: string): void {
    this.roomId = roomId;
    this.socketService.sendMessage({channel: "timer", type: "request_active_sessions", room_id: this.roomId});
  }

  addTime(event: Event, time: number): void {
    this.timeToSubmit += time;
    this.rightVisibility = "visible";
    this.leftVisibility = "visible";
    if (this.timeToSubmit > 45 || this.timeToSubmit < 10) this.timeToSubmit -= time;
    if (this.timeToSubmit == 45) {
      this.rightVisibility = "hidden";
    }
    else if (this.timeToSubmit == 10) {
      this.leftVisibility = "hidden";
    }
    this.timeRemaining.setMinutes(this.timeToSubmit);
    this.timeRemaining = new Date(0, 0, 0, 0, this.timeToSubmit);
  }

  // start a session (from the server)
  // remember this can come from anyone!
  startSession(msg: any): void {
    let mySession: boolean = false;
    for (let participant of msg["participants"]) if (participant.account_id == sessionStorage.getItem("account_id")) mySession = true;
    if (mySession) {
      // I started this session
      this.participants = msg["participants"];
      this.sessionId = msg["session_id"];
      sessionStorage.setItem("session_id", this.sessionId);
      this.timeRemaining = new Date(0, 0, 0, 0, msg["duration"], 0);
      this.timerService.startTimer();
      if (this.timerSubscription != null) this.timerSubscription.unsubscribe();
      this.timerSubscription = this.timerService.timerSource.subscribe(second => this.countdown());
  
      this.leftVisibility = "hidden";
      this.rightVisibility = "hidden";
      this.startButtonDisplay = "none";
    
      // reveal leave session button, participants
      // TODO: the below could absolutely cause glitches if two people choose the same display name
      this.leaveButtonDisplay = "block";
  
      this.participantsDisplay = "initial";
    }
    else {
      // someone else started the session, add it to the join zone
      let session: any = msg;
      session.expected_end_time = msg.expected_end_time + "Z";
      this.sessions.push(session);
      if (this.sessions.length > 0) {
        this.joinDisplay = "flex";
      }
      else {
        this.joinDisplay = "none";
      }
    }
  }

  requestActiveSessions(msg: any): void {
    this.sessions = [];
    for (let session of msg["messages"]) {
      session.expected_end_time = session.expected_end_time + "Z";
      if (session.session_id == sessionStorage.getItem("session_id")) this.socketService.sendMessage({channel: "timer", type: "join_session", room_id: this.roomId, session_id: session.session_id});
      this.sessions.push(session);
    }
    if (this.sessions.length > 0) {
      this.joinDisplay = "flex";
    }
    else {
      this.joinDisplay = "none";
    }
  }

  joinSession(msg: any): void {
    let mySession: boolean = false;
    for (let participant of msg["participants"]) if (participant.account_id == sessionStorage.getItem("account_id")) mySession = true;
    if (mySession) {
      // I started this session
      this.sessionId = msg["session_id"];
      sessionStorage.setItem("session_id", this.sessionId);
      this.timeRemaining = new Date((new Date(msg["expected_end_time"])).getTime() - Date.now());
      this.timerService.startTimer();
      if (this.timerSubscription != null) this.timerSubscription.unsubscribe();
      this.timerSubscription = this.timerService.timerSource.subscribe(second => this.countdown());
  
      this.leftVisibility = "hidden";
      this.rightVisibility = "hidden";
      this.startButtonDisplay = "none";

      this.joinDisplay = "none";
  
      this.participants = msg["participants"];
  
      // reveal leave session button, participants
      // TODO: the below could absolutely cause glitches if two people choose the same display name
      this.leaveButtonDisplay = "block";
  
      this.participantsDisplay = "initial";
    }
    else if (msg["session_id"] == this.sessionId) {
      this.participants.push(msg["display_name"]);
    }
  }

  leaveSession(msg: any): void {
    if (msg["success"] == true && msg["display_name"].includes(sessionStorage.getItem("display_name"))) {
      this.sessionId = msg["session_id"];

      this.socketService.sendMessage({channel: "timer", type: "request_active_sessions", room_id: this.roomId});
      this.socketService.sendMessage({channel: "stats", type: "request_sessions"});
      this.socketService.sendMessage({channel: "stats", type: "request_achievements"});

      this.leaveButtonDisplay = "none";
      this.timeRemaining = new Date(0, 0, 0, 0, this.timeToSubmit, 0);
      this.timerService.stopTimer();
      sessionStorage.removeItem("session_id");
      if (this.timerSubscription != null) this.timerSubscription.unsubscribe();

      this.leftVisibility = "visible";
      this.rightVisibility = "visible";
      this.startButtonDisplay = "block";
      this.leaveButtonDisplay = "none";
      this.participantsDisplay = "none";
    }
    else if (msg["session_id"] == this.sessionId) {
      let newParticipants: any[] = [];
      for (let participant of this.participants) {
        console.log(participant);
        if (participant["display_name"] != (msg["display_name"])) newParticipants.push(participant);
      }
      this.participants = newParticipants;
    }
  }

  // TODO END SESSION
  endSession(msg: any) {
    if (msg["session_id"] == this.sessionId) {
      this.sessionId = msg["session_id"];

      this.socketService.sendMessage({channel: "timer", type: "request_active_sessions", room_id: this.roomId});
      this.socketService.sendMessage({channel: "stats", type: "request_sessions"});
      this.socketService.sendMessage({channel: "stats", type: "request_achievements"});

      this.leaveButtonDisplay = "none";
      this.timeRemaining = new Date(0, 0, 0, 0, this.timeToSubmit, 0);
      this.timerService.stopTimer();
      sessionStorage.removeItem("session_id");
      if (this.timerSubscription != null) this.timerSubscription.unsubscribe();

      this.leftVisibility = "visible";
      this.rightVisibility = "visible";
      this.startButtonDisplay = "block";
      this.leaveButtonDisplay = "none";
      this.participantsDisplay = "none";
    }
    else {
      let newSessions: any[] = [];
      for (let session of this.sessions) if (session.session_id != msg["session_id"]) newSessions.push(session);
      this.sessions = newSessions;
    }
  }

  start(): void {
    if (this.activeTask) this.socketService.sendMessage({channel: "timer", type: "start_session", room_id: this.roomId, consumable: 0, duration: this.timeToSubmit, is_break: false});
    else this.changeActiveTask();
  }

  join(sessionId: string): void {
    if (this.activeTask) this.socketService.sendMessage({channel: "timer", type: "join_session", room_id: this.roomId, session_id: sessionId});
    else this.changeActiveTask();
  }

  leave(): void {
    this.socketService.sendMessage({channel: "timer", type: "leave_session", room_id: this.roomId, session_id: this.sessionId});
  }

  openTooltip(displayName: string, accountId: string): void {
    this.membersService.openTooltip(displayName, accountId);
  }

  countdown(): void {
    let newDate = new Date(0, 0, 0, 0, this.timeRemaining.getMinutes(), 0);
    if (this.timeRemaining.getSeconds() == 0) {
      if (this.timeRemaining.getMinutes() == 0) {
        this.timeRemaining = new Date(0, 0, 0, 0, this.timeToSubmit);
        this.timerService.stopTimer();
        this.timerSubscription.unsubscribe();
        this.leftVisibility = "visible";
        this.rightVisibility = "visible";
      }
      else {
        newDate.setSeconds(59);
        newDate.setMinutes(this.timeRemaining.getMinutes() - 1);
      }
    }
    else {
      newDate.setSeconds(this.timeRemaining.getSeconds() - 1);
    }
    this.timeRemaining = newDate;
  }

}
