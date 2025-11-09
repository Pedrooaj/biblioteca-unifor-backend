
import { IsEmail, IsString } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}

