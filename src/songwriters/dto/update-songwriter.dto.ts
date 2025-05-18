// src/songwriters/dto/update-songwriter.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSongwriterDto } from './create-songwriter.dto';

export class UpdateSongwriterDto extends PartialType(CreateSongwriterDto) {}