import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appTag]'
})
export class TagDirective {

  public viewContainerRef: ViewContainerRef

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}
