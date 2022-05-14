import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveTaskPickerPopupComponent } from './active-task-picker-popup.component';

describe('ActiveTaskPickerPopupComponent', () => {
  let component: ActiveTaskPickerPopupComponent;
  let fixture: ComponentFixture<ActiveTaskPickerPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveTaskPickerPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveTaskPickerPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
