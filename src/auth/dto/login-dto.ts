import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  matricula: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;
}
