import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaggingSongsService } from './tagging-songs.service';
import { TaggingSongsController } from './tagging-songs.controller';
import { TaggingSong, TaggingSongSchema } from './schemas/tagging-song.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TaggingSong.name, schema: TaggingSongSchema },
    ]),
  ],
  controllers: [TaggingSongsController],
  providers: [TaggingSongsService],
  exports: [TaggingSongsService],
})
export class TaggingSongsModule {}