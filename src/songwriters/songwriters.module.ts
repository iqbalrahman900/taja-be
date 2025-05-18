// src/songwriters/songwriters.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SongwritersService } from './songwriters.service';
import { SongwritersController } from './songwriters.controller';
import { Songwriter, SongwriterSchema } from './schemas/songwriter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Songwriter.name, schema: SongwriterSchema },
    ]),
  ],
  controllers: [SongwritersController],
  providers: [SongwritersService],
  exports: [SongwritersService],
})
export class SongwritersModule {}