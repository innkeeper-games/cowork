import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appUpdateNotesPopup]'
})
export class UpdateNotesPopupDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}