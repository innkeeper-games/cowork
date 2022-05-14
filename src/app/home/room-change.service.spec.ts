import { TestBed } from '@angular/core/testing';

import { RoomChangeService } from './room-change.service';

describe('RoomChangeService', () => {
  let service: RoomChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomChangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
