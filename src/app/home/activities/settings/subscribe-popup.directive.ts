import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appSubscribePopup]'
})
export class SubscribePopupDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}
