import { IsEmail, IsNotEmpty, IsString, IsOptional, IsDateString, IsBoolean, ValidateNested } from 'class-validator';
import { Type as TransformType, Type } from 'class-transformer';

// Contract class embedded within the main DTO
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

export class CreateOriginalPublishingDto {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsEmail()
  officialEmail: string;

  @IsNotEmpty()
  @IsString()
  companyRegistrationNo: string;
  
  @IsNotEmpty()
  @IsString()
  tinNumber: string;
  
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  picName: string;

  @IsNotEmpty()
  @IsString()
  picTelNo: string;

  @IsNotEmpty()
  @IsEmail()
  picEmail: string;

  @IsNotEmpty()
  @IsString()
  picPosition: string;
  
  @IsString()
  @IsOptional()
  deal?: string;
  
  @ValidateNested()
  @Type(() => ContractDto)
  @IsOptional()
  contract?: ContractDto;
}