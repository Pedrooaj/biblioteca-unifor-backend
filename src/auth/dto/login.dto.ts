import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO para login de usuário.
 * Define os dados necessários para autenticação.
 */
export class LoginDto {
  @ApiProperty({ description: 'Matrícula do usuário', example: '2023101234' })
  @IsString()
  @IsNotEmpty()
  matricula: string;

  @ApiProperty({ description: 'Senha do usuário (mínimo 6 caracteres)', example: 'senhaSegura123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;
}
