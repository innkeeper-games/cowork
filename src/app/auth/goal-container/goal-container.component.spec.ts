import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GoalContainerComponent } from './goal-container.component';

describe('GoalContainerComponent', () => {
  let component: GoalContainerComponent;
  let fixture: ComponentFixture<GoalContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
