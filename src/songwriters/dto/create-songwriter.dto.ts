import { IsString, IsEmail, IsOptional, IsDateString, IsNotEmpty, ValidateNested, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class PenNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class HeirDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsString()
  @IsNotEmpty()
  relationship: string;
}

export class ContractDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  terms?: string;
}

export class CreateSongwriterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  icNumber: string;

  @IsString()
  @IsOptional()
  address: string; // Added address field

  @IsBoolean()
  @IsOptional()
  macp: boolean; // Added MACP status field

  @IsString()
  @IsOptional()
  tinNumber: string; // Added TIN Number field

  @IsDateString()
  dateOfBirth: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PenNameDto)
  @IsOptional()
  penNames?: PenNameDto[];

  @ValidateNested()
  @Type(() => ContractDto)
  @IsOptional()
  contract?: ContractDto;

  @IsString()
  @IsOptional()
  deal?: string;

  @ValidateNested()
  @Type(() => HeirDto)
  @IsOptional()
  heir?: HeirDto;
}