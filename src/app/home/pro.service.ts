import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

/*
  Keeps track of and reports whether the user has a Pro membership.
*/

export class ProService {

  proSource: Subject<boolean> = new Subject<any>();
  public pro: Observable<boolean> = this.proSource.asObservable();

  currentlyPro: boolean = false;

  constructor() { }

  setPro(pro: boolean): void {
    this.proSource.next(true);
  }
}
