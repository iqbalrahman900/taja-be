import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OriginalPublishingService } from './original-publishing.service';
import { OriginalPublishingController } from './original-publishing.controller';
import { OriginalPublishing, OriginalPublishingSchema } from './schemas/original-publishing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OriginalPublishing.name, schema: OriginalPublishingSchema },
    ]),
  ],
  controllers: [OriginalPublishingController],
  providers: [OriginalPublishingService],
  exports: [OriginalPublishingService],
})
export class OriginalPublishingModule {}