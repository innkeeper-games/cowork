import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chatSource: Subject<any> = new Subject<any>();
  public chatMessage: Observable<any> = this.chatSource.asObservable();


  constructor() { }

  pushChatMessage(chat: any): void {
    this.chatSource.next(chat);
  }
}