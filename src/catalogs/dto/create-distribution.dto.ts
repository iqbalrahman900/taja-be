// src/catalogs/dto/create-distribution.dto.ts
import { IsDate, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDistributionDto {
  @IsNotEmpty()
  @IsMongoId()
  catalogId: string;

  @IsNotEmpty()
  @IsString()
  tapNumber: string;

  @IsNotEmpty()
  @IsString()
  distributor: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}
