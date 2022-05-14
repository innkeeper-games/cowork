import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appTagsPopup]'
})
export class TagsPopupDirective {

  public viewContainerRef: ViewContainerRef

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}
