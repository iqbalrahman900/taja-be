// src/catalogs/dto/create-contributor.dto.ts
import { IsEnum, IsInt, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ContributorRole, PublisherType } from '../schemas/contributor.schema';

export class CreateContributorDto {
  @IsNotEmpty()
  @IsMongoId()
  catalogId: string;

  @IsNotEmpty()
  @IsString()
  tapNumber: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(ContributorRole)
  role: ContributorRole;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  royaltyPercentage: number;

  @IsOptional()
  @IsString()
  manager?: string;

  @IsOptional()
  @IsEnum(PublisherType)
  publisherType?: PublisherType;

  @IsOptional()
  @IsString()
  publisherName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  publisherPercentage?: number;

  @IsOptional()
  @IsString()
  subPublisherName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  subPublisherPercentage?: number;
}