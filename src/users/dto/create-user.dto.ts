import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Matches(/^\d{5,20}$/)
  id: string;

  @IsString()
  @Length(2, 100)
  name: string;

  @Transform(({ value }: { value: string }) => value?.trim().toLowerCase())
  @IsEmail()
  @Length(5, 254)
  email: string;

  @IsInt()
  @Min(0)
  @Max(130)
  age: number;

  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/)
  phone: string;
}
