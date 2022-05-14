import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ListComponent } from './list/list.component';

@Injectable({
  providedIn: 'root'
})
export class ListsService {

  public lists: Map<string, ListComponent> = new Map<string, ListComponent>();

  public disabledLists: Map<string, number> = new Map<string, number>();

  constructor() { }
}
