import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NotMonetizedComponent } from './not-monetized.component';

describe('NotMonetizedComponent', () => {
  let component: NotMonetizedComponent;
  let fixture: ComponentFixture<NotMonetizedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NotMonetizedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotMonetizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
