import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomChangeService {

  changeSource: Subject<string> = new Subject<any>();
  public roomId: Observable<string> = this.changeSource.asObservable();

  currentRoomId: string;
  roomData: any;

  constructor() { }

  setRoom(roomId: string): void {
    this.changeSource.next(roomId);
    this.currentRoomId = roomId;
  }

  setRoomData(data: any): void {
    this.roomData = data;
  }

  getRoomData(): any {
    return this.roomData;
  }
}
