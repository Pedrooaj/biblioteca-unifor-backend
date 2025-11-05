import { ApiProperty } from '@nestjs/swagger';
import { BookType } from 'generated/prisma/enums';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsInt,
  IsArray,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'ISBN do livro (único)',
    example: '978-85-333-0227-3',
  })
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @ApiProperty({
    description: 'Título do livro',
    example: 'O Senhor dos Anéis',
  })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({
    description: 'Autor principal do livro',
    example: 'J.R.R. Tolkien',
  })
  @IsString()
  @IsNotEmpty()
  autor: string;

  @ApiProperty({
    description: 'Lista de co-autores',
    example: ['Christopher Tolkien'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  coAutores?: string[];

  @ApiProperty({
    description: 'Edição do livro',
    example: '1ª edição',
  })
  @IsString()
  @IsNotEmpty()
  edicao: string;

  @ApiProperty({
    description: 'Ano de edição',
    example: 2023,
  })
  @IsInt()
  @Min(1)
  anoEdicao: number;

  @ApiProperty({
    description: 'Idioma do livro',
    example: 'Português',
  })
  @IsString()
  @IsNotEmpty()
  idioma: string;

  @ApiProperty({
    description: 'Editora/Publicação',
    example: 'HarperCollins',
  })
  @IsString()
  @IsNotEmpty()
  publicacao: string;

  @ApiProperty({
    description: 'Resumo do livro',
    example: 'Uma aventura épica na Terra Média...',
    required: false,
  })
  @IsString()
  @IsOptional()
  resumo?: string;

  @ApiProperty({
    description: 'URL da imagem da capa',
    example: 'https://example.com/capa.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Tipo do livro',
    enum: BookType,
    example: BookType.FISICO,
  })
  @IsEnum(BookType)
  @IsNotEmpty()
  tipo: BookType;
}

export class UpdateBookDto {
  @ApiProperty({
    description: 'ISBN do livro (único)',
    example: '978-85-333-0227-3',
    required: false,
  })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiProperty({
    description: 'Título do livro',
    example: 'O Senhor dos Anéis',
    required: false,
  })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({
    description: 'Autor principal do livro',
    example: 'J.R.R. Tolkien',
    required: false,
  })
  @IsString()
  @IsOptional()
  autor?: string;

  @ApiProperty({
    description: 'Lista de co-autores',
    example: ['Christopher Tolkien'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  coAutores?: string[];

  @ApiProperty({
    description: 'Edição do livro',
    example: '1ª edição',
    required: false,
  })
  @IsString()
  @IsOptional()
  edicao?: string;

  @ApiProperty({
    description: 'Ano de edição',
    example: 2023,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  anoEdicao?: number;

  @ApiProperty({
    description: 'Idioma do livro',
    example: 'Português',
    required: false,
  })
  @IsString()
  @IsOptional()
  idioma?: string;

  @ApiProperty({
    description: 'Editora/Publicação',
    example: 'HarperCollins',
    required: false,
  })
  @IsString()
  @IsOptional()
  publicacao?: string;

  @ApiProperty({
    description: 'Resumo do livro',
    example: 'Uma aventura épica na Terra Média...',
    required: false,
  })
  @IsString()
  @IsOptional()
  resumo?: string;

  @ApiProperty({
    description: 'URL da imagem da capa',
    example: 'https://example.com/capa.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Tipo do livro',
    enum: BookType,
    example: BookType.FISICO,
    required: false,
  })
  @IsEnum(BookType)
  @IsOptional()
  tipo?: BookType;
}

