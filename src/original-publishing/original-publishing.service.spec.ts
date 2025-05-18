import { Test, TestingModule } from '@nestjs/testing';
import { OriginalPublishingService } from './original-publishing.service';

describe('OriginalPublishingService', () => {
  let service: OriginalPublishingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OriginalPublishingService],
    }).compile();

    service = module.get<OriginalPublishingService>(OriginalPublishingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
