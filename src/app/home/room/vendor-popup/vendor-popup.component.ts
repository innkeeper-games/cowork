import { Component, OnInit } from '@angular/core';
import { Handler } from 'src/app/handler';
import { SocketService } from 'src/app/socket/socket.service';

@Component({
  selector: 'app-vendor-popup',
  templateUrl: './vendor-popup.component.html',
  styleUrls: ['./vendor-popup.component.css']
})
export class VendorPopupComponent extends Handler implements OnInit {

  onClose: Function;

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

    this.socketService.sendMessage({"channel": "room", "type": "request_items"});
  }

  submitBuyItem(itemId: number): void {
    this.socketService.sendMessage({"channel": "room", "type": "buy_item", "item_id": itemId});
  }

  requestItems(msg: any): void {
    console.log(msg);
    this.items = msg["items"];
  }

  buyItem(msg: any): void {
    console.log(msg);
  }

}
