import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appInventoryPopup]'
})
export class InventoryPopupDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }
}
