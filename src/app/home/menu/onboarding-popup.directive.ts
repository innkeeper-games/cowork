import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appOnboardingPopup]'
})
export class OnboardingPopupDirective {

  public viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef
  }

}
