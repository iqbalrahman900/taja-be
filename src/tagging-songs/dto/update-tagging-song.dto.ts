import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateTaggingSongDto {
  @IsOptional()
  @IsString()
  categoryName?: string;
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}