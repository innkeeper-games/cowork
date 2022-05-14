import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaskEditorPopupComponent } from './task-editor-popup.component';

describe('TaskEditorPopupComponent', () => {
  let component: TaskEditorPopupComponent;
  let fixture: ComponentFixture<TaskEditorPopupComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskEditorPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskEditorPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
