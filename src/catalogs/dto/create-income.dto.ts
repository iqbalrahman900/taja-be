// src/catalogs/dto/create-income.dto.ts
import { IsDate, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIncomeDto {
  @IsNotEmpty()
  @IsMongoId()
  catalogId: string;

  @IsNotEmpty()
  @IsString()
  tapNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  source?: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;
}