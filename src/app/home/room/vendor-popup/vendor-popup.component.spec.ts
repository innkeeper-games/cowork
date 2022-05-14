import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorPopupComponent } from './vendor-popup.component';

describe('VendorPopupComponent', () => {
  let component: VendorPopupComponent;
  let fixture: ComponentFixture<VendorPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
