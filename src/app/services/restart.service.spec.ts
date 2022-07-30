import { TestBed } from '@angular/core/testing';

import { RestartService } from './restart.service';

describe('RestartService', () => {
  let service: RestartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RestartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
