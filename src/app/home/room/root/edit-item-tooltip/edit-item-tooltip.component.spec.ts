import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditItemTooltipComponent } from './edit-item-tooltip.component';

describe('EditItemTooltipComponent', () => {
  let component: EditItemTooltipComponent;
  let fixture: ComponentFixture<EditItemTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditItemTooltipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditItemTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
