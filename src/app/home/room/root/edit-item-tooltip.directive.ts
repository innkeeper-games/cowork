import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appEditItemTooltip]'
})
export class EditItemTooltipDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }
  
}
