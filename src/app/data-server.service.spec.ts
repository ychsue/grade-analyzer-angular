import { TestBed, inject } from '@angular/core/testing';

import { DataServerService } from './data-server.service';

describe('DataServerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataServerService]
    });
  });

  it('should be created', inject([DataServerService], (service: DataServerService) => {
    expect(service).toBeTruthy();
  }));
});
