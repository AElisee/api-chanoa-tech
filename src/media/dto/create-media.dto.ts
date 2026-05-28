import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MediaType } from '../entities/media.entity';

export class CreateMediaDto {
  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
