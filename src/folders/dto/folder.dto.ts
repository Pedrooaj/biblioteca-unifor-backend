// /src/folder/dto/folder.dto.ts

// Certifique-se de ter 'class-validator' e 'class-transformer' instalados
// npm install class-validator class-transformer
import { ApiProperty } from '@nestjs/swagger';
import { FolderRole } from 'generated/prisma/enums';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({
    description: 'Nome da nova pasta',
    example: 'Meus Livros Favoritos',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;
}

export class UpdateFolderDto {
  @ApiProperty({
    description: 'Novo nome para a pasta',
    example: 'Favoritos Atualizado',
  })
  @IsString()
  @IsNotEmpty()
  nome: string;
}

export class AddUserToFolderDto {
  @ApiProperty({
    description: 'Matrícula do usuário a ser adicionado',
    example: '202300123',
  })
  @IsString()
  @IsNotEmpty()
  userMatricula: string;

  @ApiProperty({
    description: 'Papel do novo usuário na pasta',
    enum: FolderRole,
    example: FolderRole.LEITOR,
  })
  @IsEnum(FolderRole)
  @IsNotEmpty()
  role: FolderRole;
}

export class AddBookToFolderDto {
  @ApiProperty({
    description: 'ID do livro (cuid) a ser adicionado',
    example: 'clxka1z0q0000abcde1234567',
  })
  @IsString()
  @IsNotEmpty()
  bookId: string;
}