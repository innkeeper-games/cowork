import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appRoomInvitation]'
})
export class RoomInvitationDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }
}
