import { Injectable, OnInit } from '@angular/core';

import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProService } from '../home/pro.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnInit {

  socket: WebSocketSubject<any>;

  replySource: Subject<any>;
  public reply: Observable<any>;

  replySources: Map<string, Subject<any>>;
  public channelReply: Map<string, Observable<any>>;

  httpClient: HttpClient;

  proService: ProService;

  authenticated: boolean = false;
  unsentMessages: Array<any> = [];

  updateNotes: any[];
  onUpdateNotes: Function;
  
  constructor(httpClient: HttpClient, proService: ProService) {
    this.httpClient = httpClient;
    this.replySource = new Subject<any>();
    this.reply = this.replySource.asObservable();
    this.replySources = new Map<string, Subject<any>>();
    this.channelReply = new Map<string, Observable<any>>();
    this.proService = proService;
    this.establishWebsocket();
  }

  ngOnInit(): void {
    window.onfocus = function(event: FocusEvent) {
      if (this.socket.isStopped) document.location.reload();
    }.bind(this);
  }

  establishWebsocket() {
    this.httpClient.get('https://ws.joincowork.com', {responseType: 'text', withCredentials: true}).subscribe(data => {

      this.socket = webSocket('wss://ws.joincowork.com:4433');

      this.socket.subscribe(
        msg => {
          if (msg["password_correct"] == true) {
            sessionStorage.setItem("username", msg["username"]);
            sessionStorage.setItem("account_id", msg["account_id"]);
            sessionStorage.setItem("display_name", msg["display_name"]);
            sessionStorage.setItem("server_ip", msg["server_ip"]);

            this.proService.setPro(msg["pro"]);
            this.updateNotes = msg["update_notes"];
            if (this.onUpdateNotes != undefined) this.onUpdateNotes(msg["update_notes"]);
          }

          this.setResponse(msg);

          // in the future, the below should be the only way to get messages.
          // classes should subscribe to individual channels.
          let channel: string = msg["channel"];
          if (this.channelIsRegistered(channel)) {
            this.replySources.get(channel).next(msg);
          }
        },
        // reconnect on error or completion
        function(err) {console.log(err)},
        this.connectToMain.bind(this)
      );

      let newUnsentMessages: any[] = [];
      for (let msg of this.unsentMessages) {
        if (msg["channel"] == "auth" || msg["channel"] == "public") this.sendMessage(msg);
        else newUnsentMessages.push(msg);
      }
      this.unsentMessages = newUnsentMessages;

      window.setInterval(() => {
        this.sendMessage({channel: "auth", type: "pong"});
      }, 3000);
    });
  }

  connectToMain(): void {
    this.socket = webSocket('wss://ws.joincowork.com:4434');
    this.authenticated = true;

    this.socket.subscribe(
      msg => {

        if (msg["password_correct"] == true) {
          sessionStorage.setItem("username", msg["username"]);
          sessionStorage.setItem("account_id", msg["account_id"]);
          sessionStorage.setItem("display_name", msg["display_name"]);
          this.proService.setPro(msg["pro"]);
          this.updateNotes = msg["update_notes"];
          if (this.onUpdateNotes != undefined) this.onUpdateNotes(msg["update_notes"]);
        }

        this.setResponse(msg);

        // in the future, the below should be the only way to get messages.
        // classes should subscribe to individual channels.
        let channel: string = msg["channel"];
        if (this.channelIsRegistered(channel)) {
          this.replySources.get(channel).next(msg);
        }
      },
      // reconnect on error or completion
      function(err) {console.log(err)},
      function() {console.log("complete")},
    );

    while (this.unsentMessages.length > 0) {
      this.sendMessage(this.unsentMessages.pop());
    }
  }

  setOnUpdateNotes(f: Function) {
    this.onUpdateNotes = f;
    if (this.updateNotes != undefined) this.onUpdateNotes(this.updateNotes);
  }

  setResponse(msg: any) {
    this.replySource.next(msg);
  }

  sendMessage(msg: any): void {
    if (this.socket === undefined || (!this.authenticated && msg["channel"] != "auth" && msg["channel"] != "public")) {
      this.unsentMessages.push(msg);
    }
    else {
      this.socket.next(msg);
    }
  }

  channelIsRegistered(channel: string) {
    return this.replySources.has(channel);
  }

  register(channel: string) {
    this.replySources.set(channel, new Subject<any>());
    this.channelReply.set(channel, this.replySources.get(channel).asObservable());
  }
}
