import { TestBed } from '@angular/core/testing';

import { WebMonetizationService } from './web-monetization.service';

describe('WebMonetizationService', () => {
  let service: WebMonetizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebMonetizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
