import { Test, TestingModule } from '@nestjs/testing';
import { SongwritersService } from './songwriters.service';

describe('SongwritersService', () => {
  let service: SongwritersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SongwritersService],
    }).compile();

    service = module.get<SongwritersService>(SongwritersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
