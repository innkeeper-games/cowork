import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubpageLinkComponent } from './subpage-link.component';

describe('SubpageLinkComponent', () => {
  let component: SubpageLinkComponent;
  let fixture: ComponentFixture<SubpageLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubpageLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubpageLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
