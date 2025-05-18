import { Test, TestingModule } from '@nestjs/testing';
import { TaggingSongsService } from './tagging-songs.service';

describe('TaggingSongsService', () => {
  let service: TaggingSongsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaggingSongsService],
    }).compile();

    service = module.get<TaggingSongsService>(TaggingSongsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
