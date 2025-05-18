// src/catalogs/dto/create-catalog.dto.ts
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsUrl, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CatalogType, CatalogStatus, SongType, VersionType } from '../schemas/catalog.schema';

export class CreateCatalogDto {
  @IsOptional()
  @IsString()
  tapNumber?: string; // Optional as it will be auto-generated if not provided

  @IsNotEmpty()
  @IsString()
  title: string;
  
  @IsOptional()
  @IsString()
  alternateTitle?: string;

  @IsOptional()
  @IsString()
  performer?: string;

  @IsOptional()
  @IsEnum(CatalogType)
  type?: CatalogType;
  
  @IsOptional()
  @IsEnum(VersionType)
  versionType?: VersionType; // Added version type field for remix/cover

  @IsOptional()
  @IsString()
  invCode?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipiCode?: string[];

  @IsOptional()
  @IsString()
  iswcCode?: string;

  @IsOptional()
  @IsString()
  isrcCode?: string;

  @IsOptional()
  @IsString()
  tagging?: string;
  
  @IsOptional()
  @IsUrl()
  youtubeLink?: string;

  @IsOptional()
  @IsEnum(SongType)
  songType?: SongType;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsEnum(CatalogStatus)
  status?: CatalogStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateIn?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOut?: Date;

  @IsOptional()
  @IsString()
  audioFilePath?: string;

  @IsOptional()
  @IsString()
  parentTapNumber?: string; // For remix/cover versions

  // NEW FIELD: Country cover number
  @IsOptional()
  @IsNumber()
  countrycover?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedCountries?: string[];


}