import { Test, TestingModule } from '@nestjs/testing';
import { SongwritersController } from './songwriters.controller';

describe('SongwritersController', () => {
  let controller: SongwritersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongwritersController],
    }).compile();

    controller = module.get<SongwritersController>(SongwritersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
