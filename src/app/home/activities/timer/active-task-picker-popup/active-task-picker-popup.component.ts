import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl} from '@angular/platform-browser';
import { SocketService } from 'src/app/socket/socket.service';
import { ListsService } from '../../tasks/lists.service';

@Component({
  selector: 'app-active-task-picker-popup',
  templateUrl: './active-task-picker-popup.component.html',
  styleUrls: ['./active-task-picker-popup.component.css']
})
export class ActiveTaskPickerPopupComponent implements OnInit {
  
  data: any = {};
  onClose: Function;

  listsService: ListsService;
  socketService: SocketService;

  constructor(listsService: ListsService, socketService: SocketService) {
    this.listsService = listsService;
    this.socketService = socketService;
  }

  ngOnInit(): void {
    let modalContent: HTMLElement = document.getElementsByClassName("modal-content")[0] as HTMLElement;
    let listId: string;
    for (let id of this.listsService.lists.keys()) {
      if (this.listsService.lists.get(id).data["title"] != "Archive") listId = id;
    }
    this.data["list_id"] = listId;
    modalContent.focus();
  }

  onTaskClick(taskData: any): void {
    this.socketService.sendMessage({channel: "tasks", type: "set_listing_active", listing_id: taskData.listing_id, active: true});
    this.onClose();
  }
}
