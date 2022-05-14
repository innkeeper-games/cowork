import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appTask]'
})
export class TaskDirective {

  public viewContainerRef: ViewContainerRef

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}
