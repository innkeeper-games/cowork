import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SocketService } from 'src/app/socket/socket.service';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  socketService: SocketService;

  activeTaskSource: Subject<any>;
  public activeTask: Observable<any>;

  activeTaskId: string;

  listings: Map<string, any>;

  listsDoneLoading: number = 0;
  onListsDoneLoading: Function;

  constructor(socketService: SocketService) {
    this.socketService = socketService;
    this.activeTaskSource = new Subject<any>();
    this.activeTask = this.activeTaskSource.asObservable();
    
    this.listings = new Map<string, any>();
  }

  setActiveTask(data: any) {
    let id: string = data.task_id;

    this.activeTaskSource.next(data);

    this.activeTaskId = id;
  }

  addListing(listing: any): void {
    this.listings.set(listing.listing_id, listing);
  }

  removeListing(id: string): boolean {
    return this.listings.delete(id);
  }

  getListing(id: string): any {
    if (this.listings.has(id)) return this.listings.get(id);
    return null;
  }

  register(): void {
    this.listsDoneLoading--;
  }

  listDoneLoading(): void {
    this.listsDoneLoading++;

    if (this.listsDoneLoading == 0) {
      this.onListsDoneLoading();
    }
  }

  setOnListsDoneLoading(onListsDoneLoading: Function) {
    this.onListsDoneLoading = onListsDoneLoading;
  }
}
