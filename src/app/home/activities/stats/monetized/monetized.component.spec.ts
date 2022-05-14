import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MonetizedComponent } from './monetized.component';

describe('MonetizedComponent', () => {
  let component: MonetizedComponent;
  let fixture: ComponentFixture<MonetizedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonetizedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonetizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
