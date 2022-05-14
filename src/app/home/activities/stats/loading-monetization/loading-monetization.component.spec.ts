import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoadingMonetizationComponent } from './loading-monetization.component';

describe('LoadingMonetizationComponent', () => {
  let component: LoadingMonetizationComponent;
  let fixture: ComponentFixture<LoadingMonetizationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingMonetizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingMonetizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
