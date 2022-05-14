import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appVendorPopup]'
})
export class VendorPopupDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}
