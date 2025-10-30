import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'generated/prisma/enums';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  matricula: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
