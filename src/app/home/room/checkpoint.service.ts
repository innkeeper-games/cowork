import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { RoomChangeService } from '../room-change.service';
import { Checkpoint } from './root/checkpoint/checkpoint';

@Injectable({
  providedIn: 'root'
})
export class CheckpointService {

  roomChangeService: RoomChangeService;

  addedCheckpointSource: Subject<Checkpoint> = new Subject<Checkpoint>();
  removedCheckpointSource: Subject<Checkpoint> = new Subject<Checkpoint>();

  public addedCheckpoint: Observable<Checkpoint> = this.addedCheckpointSource.asObservable();
  public removedCheckpoint: Observable<Checkpoint> = this.removedCheckpointSource.asObservable();

  checkpoints: Set<Checkpoint> = new Set<Checkpoint>();

  constructor(roomChangeService: RoomChangeService) {
    this.roomChangeService = roomChangeService;
    this.roomChangeService.roomId.subscribe((roomId: string) => {
      for (let checkpoint of this.checkpoints) this.removeCheckpoint(checkpoint);
    });
  }

  addCheckpoint(checkpoint: Checkpoint): void {
    this.addedCheckpointSource.next(checkpoint);
    this.checkpoints.add(checkpoint);
  }

  removeCheckpoint(checkpoint: Checkpoint): void {
    this.removedCheckpointSource.next(checkpoint);
  }

  getCheckpoints(): Set<Checkpoint> {
    return this.checkpoints;
  }
}
