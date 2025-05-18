import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTaggingSongDto {
  @IsNotEmpty()
  @IsString()
  categoryName: string;
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}