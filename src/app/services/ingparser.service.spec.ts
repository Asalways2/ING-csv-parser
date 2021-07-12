import { TestBed } from '@angular/core/testing';

import { INGparserService } from './ingparser.service';

describe('INGparserService', () => {
  let service: INGparserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(INGparserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
