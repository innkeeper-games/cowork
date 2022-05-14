import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateNotesPopupComponent } from './update-notes-popup.component';

describe('UpdateNotesPopupComponent', () => {
  let component: UpdateNotesPopupComponent;
  let fixture: ComponentFixture<UpdateNotesPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateNotesPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateNotesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
