import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appFilterPopup]'
})
export class FilterPopupDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }
}
