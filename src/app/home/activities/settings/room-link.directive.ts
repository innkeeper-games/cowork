import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appRoomLink]'
})
export class RoomLinkDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }
}
