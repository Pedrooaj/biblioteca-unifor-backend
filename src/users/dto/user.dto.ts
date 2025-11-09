import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'generated/prisma/enums';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '20230001' })
  @IsString()
  @IsNotEmpty()
  matricula: string;

  @ApiProperty({ example: 'Pedro Almeida' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'pedro@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({ enum: Role, default: Role.ALUNO })
  @IsEnum(Role)
  role: Role;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'Pedro Almeida', required: false })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiProperty({ example: 'pedro@email.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsOptional()
  @IsString()
  @MinLength(6)
  senha?: string;

  @ApiProperty({ enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UserResponseDto {
  @ApiProperty()
  matricula: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
