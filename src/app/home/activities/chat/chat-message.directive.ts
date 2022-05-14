import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appChatMessage]'
})
export class ChatMessageDirective {

  public viewContainerRef: ViewContainerRef

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}
