import { TestBed, inject } from '@angular/core/testing';

import { SurveyStructureService } from './survey-structure.service';

describe('SurveyStructureService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SurveyStructureService]
    });
  });

  it('should be created', inject([SurveyStructureService], (service: SurveyStructureService) => {
    expect(service).toBeTruthy();
  }));
});
