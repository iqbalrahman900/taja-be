import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateOriginalPublishingDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsEmail()
  officialEmail?: string;

  @IsOptional()
  @IsString()
  companyRegistrationNo?: string;

  @IsOptional()
  @IsString()
  picName?: string;

  @IsOptional()
  @IsString()
  picTelNo?: string;

  @IsOptional()
  @IsEmail()
  picEmail?: string;

  @IsOptional()
  @IsString()
  picPosition?: string;
}