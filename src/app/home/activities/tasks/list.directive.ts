import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appList]'
})
export class ListDirective {

  public viewContainerRef: ViewContainerRef

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}
