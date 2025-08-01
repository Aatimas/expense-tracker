import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
