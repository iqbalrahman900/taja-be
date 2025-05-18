// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { SongwritersModule } from './songwriters/songwriters.module';
import { OriginalPublishingModule } from './original-publishing/original-publishing.module';
import { TaggingSongsModule } from './tagging-songs/tagging-songs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CatalogsModule,
    SongwritersModule,
    OriginalPublishingModule,
    TaggingSongsModule,
  ],
})
export class AppModule {}