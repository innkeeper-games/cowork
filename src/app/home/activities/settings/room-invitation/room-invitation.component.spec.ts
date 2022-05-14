import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RoomInvitationComponent } from './room-invitation.component';

describe('RoomInvitationComponent', () => {
  let component: RoomInvitationComponent;
  let fixture: ComponentFixture<RoomInvitationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomInvitationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
