import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/socket/socket.service';
import { RoomChangeService } from '../../room-change.service';
import { CheckpointService } from '../checkpoint.service';
import { Checkpoint } from '../root/checkpoint/checkpoint';

@Component({
  selector: 'app-checkpoint-list',
  templateUrl: './checkpoint-list.component.html',
  styleUrls: ['./checkpoint-list.component.css']
})
export class CheckpointListComponent implements OnInit {

  checkpoints: Set<Checkpoint> = new Set<Checkpoint>();
  checkpointsList: Checkpoint[] = [];

  socketService: SocketService;
  checkpointService: CheckpointService;
  roomChangeService: RoomChangeService;

  roomTitle: string;

  constructor(socketService: SocketService, checkpointService: CheckpointService, roomChangeService: RoomChangeService) {
    this.socketService = socketService;
    this.checkpointService = checkpointService;
    this.roomChangeService = roomChangeService;
  }

  ngOnInit(): void {
    this.checkpointService.addedCheckpoint.subscribe(member => {
      this.checkpoints.add(member);
      this.checkpointsList = Array.from(this.checkpoints.values());
    });
    this.checkpointService.removedCheckpoint.subscribe(member => {
      this.checkpoints.delete(member);
      this.checkpointsList = Array.from(this.checkpoints.values());
    });
    this.roomChangeService.roomId.subscribe(roomId => {
      this.roomTitle = this.roomChangeService.getRoomData().room_title;
    })
  }

  toggleCheckpoints(): void {
    let dropArea: HTMLElement = document.getElementById("checkpoints") as HTMLElement;
    if (dropArea.style.display == 'none') {
      dropArea.style.display = 'inherit';
      document.getElementById("checkpoints-up-arrow").style.display = "inherit";
      document.getElementById("checkpoints-down-arrow").style.display = "none";
    }
    else {
      dropArea.style.display = 'none';
      document.getElementById("checkpoints-down-arrow").style.display = "inherit";
      document.getElementById("checkpoints-up-arrow").style.display = "none";
    }
  }

  requestWarp(checkpoint: Checkpoint): void {
    this.socketService.sendMessage({"channel": "room", "type": "warp_to_persist_object", "id": checkpoint.id});
  }

}
