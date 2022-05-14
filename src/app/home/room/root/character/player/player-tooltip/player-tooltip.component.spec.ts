import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

<<<<<<< HEAD:src/app/home/activities/stats/monetized/monetized.component.spec.ts
import { MonetizedComponent } from './monetized.component';

describe('MonetizedComponent', () => {
  let component: MonetizedComponent;
  let fixture: ComponentFixture<MonetizedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonetizedComponent ]
=======
import { PlayerTooltipComponent } from './player-tooltip.component';

describe('PlayerTooltipComponent', () => {
  let component: PlayerTooltipComponent;
  let fixture: ComponentFixture<PlayerTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerTooltipComponent ]
>>>>>>> ocean:src/app/home/room/root/player/player-tooltip/player-tooltip.component.spec.ts
    })
    .compileComponents();
  }));

  beforeEach(() => {
<<<<<<< HEAD:src/app/home/activities/stats/monetized/monetized.component.spec.ts
    fixture = TestBed.createComponent(MonetizedComponent);
=======
    fixture = TestBed.createComponent(PlayerTooltipComponent);
>>>>>>> ocean:src/app/home/room/root/player/player-tooltip/player-tooltip.component.spec.ts
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
