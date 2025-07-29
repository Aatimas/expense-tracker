import {
  IsEmail,
  IsNotEmpty,
  isString,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

//validate email and password
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
