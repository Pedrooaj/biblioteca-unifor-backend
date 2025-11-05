import { ApiProperty } from '@nestjs/swagger';
import { CopyStatus, BookCondition } from 'generated/prisma/enums';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class CreateBookCopyDto {
  @ApiProperty({
    description: 'ID do livro ao qual o exemplar pertence',
    example: 'clxka1z0q0000abcde1234567',
  })
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @ApiProperty({
    description: 'Número do exemplar (sequencial por livro)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  copyNumber?: number;

  @ApiProperty({
    description: 'Status do exemplar',
    enum: CopyStatus,
    example: CopyStatus.DISPONIVEL,
    required: false,
  })
  @IsEnum(CopyStatus)
  @IsOptional()
  status?: CopyStatus;

  @ApiProperty({
    description: 'Condição física do exemplar',
    enum: BookCondition,
    example: BookCondition.BOA,
    required: false,
  })
  @IsEnum(BookCondition)
  @IsOptional()
  condition?: BookCondition;
}

export class UpdateBookCopyDto {
  @ApiProperty({
    description: 'Status do exemplar',
    enum: CopyStatus,
    example: CopyStatus.DISPONIVEL,
    required: false,
  })
  @IsEnum(CopyStatus)
  @IsOptional()
  status?: CopyStatus;

  @ApiProperty({
    description: 'Condição física do exemplar',
    enum: BookCondition,
    example: BookCondition.BOA,
    required: false,
  })
  @IsEnum(BookCondition)
  @IsOptional()
  condition?: BookCondition;
}

