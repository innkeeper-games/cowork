import { TestBed } from '@angular/core/testing';

import { CheckpointServiceService } from './checkpoint-service.service';

describe('CheckpointServiceService', () => {
  let service: CheckpointServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckpointServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
