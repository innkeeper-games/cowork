import { Injectable } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  public timerSource: Observable<number>;

  constructor() { }

  startTimer(): void {
    this.timerSource = timer(1000, 1000);
  }

  stopTimer(): void {
    this.timerSource = null;
  }
}