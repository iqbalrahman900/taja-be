import { Test, TestingModule } from '@nestjs/testing';
import { OriginalPublishingController } from './original-publishing.controller';

describe('OriginalPublishingController', () => {
  let controller: OriginalPublishingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OriginalPublishingController],
    }).compile();

    controller = module.get<OriginalPublishingController>(OriginalPublishingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
