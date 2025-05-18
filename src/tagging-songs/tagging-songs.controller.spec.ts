import { Test, TestingModule } from '@nestjs/testing';
import { TaggingSongsController } from './tagging-songs.controller';

describe('TaggingSongsController', () => {
  let controller: TaggingSongsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaggingSongsController],
    }).compile();

    controller = module.get<TaggingSongsController>(TaggingSongsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
