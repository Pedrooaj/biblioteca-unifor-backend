import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'generated/prisma/enums';

/**
 * DTO para cadastro de usuário.
 */
export class RegisterDto {
  @ApiProperty({ description: 'Matrícula do usuário', example: '2023101234' })
  @IsString()
  @IsNotEmpty()
  matricula: string;

  @ApiProperty({ description: 'Nome completo do usuário', example: 'Pedro Alves' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ description: 'E-mail do usuário', example: 'pedro.antonio@unifor.br' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Senha do usuário (mínimo 6 caracteres)', example: 'senhaSegura123' })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({ enum: Role, default: 'USER', description: 'Permissão do usuário', example: 'USER' })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
