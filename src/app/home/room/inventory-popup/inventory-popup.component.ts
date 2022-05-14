import { Component, OnInit } from '@angular/core';
import { Handler } from 'src/app/handler';
import { SocketService } from 'src/app/socket/socket.service';

@Component({
  selector: 'app-inventory-popup',
  templateUrl: './inventory-popup.component.html',
  styleUrls: ['./inventory-popup.component.css']
})
export class InventoryPopupComponent extends Handler implements OnInit {

  onClose: Function;
  setActiveItem: Function;

  socketService: SocketService;

  items: any[];

  constructor(socketService: SocketService) {
    super();
    this.socketService = socketService;
  }

  ngOnInit(): void {
    this.socketService.channelReply.get("room").subscribe(msg => {
      if (this[this.snakeToCamel(msg["type"])] != undefined) this[this.snakeToCamel(msg["type"])](msg);
    });

    this.socketService.sendMessage({"channel": "room", "type": "request_inventory"});
  }

  requestInventory(msg: any): void {
    console.log(msg);
    this.items = msg["inventory"];
  }

  buyItem(msg: any): void {
    let done: boolean = false;
    for (let item of this.items) {
      if (item.item_id == msg["item_id"]) {
        item.quantity += 1;
        done = true;
      }
    }
    if (!done) this.socketService.sendMessage({"channel": "room", "type": "request_inventory"});
  }

  removeItem(msg: any): void {
    for (let item of this.items) {
      if (item.item_id == msg["item_id"]) {
        item.quantity -= 1;
        if (item.quantity == 0) this.socketService.sendMessage({"channel": "room", "type": "request_inventory"});
      }
    }
  }

}
