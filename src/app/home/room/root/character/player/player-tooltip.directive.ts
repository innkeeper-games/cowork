import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appPlayerTooltip]'
})
export class PlayerTooltipDirective {
  
  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}
