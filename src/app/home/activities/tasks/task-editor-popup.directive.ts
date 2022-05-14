import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appTaskEditorPopup]'
})
export class TaskEditorPopupDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}