import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appActiveTaskPickerPopup]'
})
export class ActiveTaskPickerPopupDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}
