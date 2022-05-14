import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingPopupComponent } from './onboarding-popup.component';

describe('OnboardingPopupComponent', () => {
  let component: OnboardingPopupComponent;
  let fixture: ComponentFixture<OnboardingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardingPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
