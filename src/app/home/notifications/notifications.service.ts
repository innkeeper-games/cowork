import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  notificationsSource: Subject<string> = new Subject<any>();
  public roomId: Observable<string> = this.notificationsSource.asObservable();


  constructor() { }

  pushNotification(activity: string): void {
    this.notificationsSource.next(activity);
  }
}
