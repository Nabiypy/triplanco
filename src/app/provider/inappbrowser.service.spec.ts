import { TestBed } from '@angular/core/testing';

import { InappbrowserService } from './inappbrowser.service';

describe('InappbrowserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InappbrowserService = TestBed.get(InappbrowserService);
    expect(service).toBeTruthy();
  });
});
