import { Component, OnInit } from '@angular/core';
import { PersistObject } from '../persist-object';

@Component({
  selector: 'app-edit-item-tooltip',
  templateUrl: './edit-item-tooltip.component.html',
  styleUrls: ['./edit-item-tooltip.component.css']
})
export class EditItemTooltipComponent implements OnInit {

  object: PersistObject;

  onMove: Function;
  onRotate: Function;
  onErase: Function;
  onName: Function;

  displayName: string;

  ownerAccountId: string;
  accountId: string;

  x: string;
  y: string;

  constructor() { }

  ngOnInit(): void {
    this.accountId = sessionStorage.getItem("account_id");
  }

}
