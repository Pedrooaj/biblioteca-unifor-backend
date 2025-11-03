import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { AddBookToFolderDto, AddUserToFolderDto, CreateFolderDto, UpdateFolderDto } from './dto/folder.dto';
import { User, UserPayload } from 'src/auth/decorators/user.decorator';

@ApiTags("Pastas (Folders)")
@ApiBearerAuth()
@Controller('folders')
export class FoldersController {
    constructor(private readonly folderService: FoldersService) { }

    @Post()
    @ApiOperation({ summary: "Criar uma nova Pasta" })
    create(
        @Body() createFolderDto: CreateFolderDto,
        @User() user: UserPayload
    ) {
        return this.folderService.createFolder(createFolderDto.nome, user.matricula)
    }


    @Get('my')
    @ApiOperation({ summary: 'Listar todas as minhas pastas' })
    getMyFolders(@User() user: UserPayload) {
        
        return this.folderService.getMyFolders(user.matricula);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obter detalhes de uma pasta específica' })
    getById(@Param('id') id: string, @User() user: UserPayload) {
        return this.folderService.getFolderById(id, user.matricula);
    }

    @Patch(':id/name')
    @ApiOperation({ summary: 'Atualizar o nome de uma pasta (Editor ou +)' })
    updateName(
        @Param('id') id: string,
        @Body() updateFolderDto: UpdateFolderDto,
        @User() user: UserPayload,
    ) {
        return this.folderService.updateFolderName(
            id,
            updateFolderDto.nome,
            user.matricula,
        );
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Deletar uma pasta (Apenas proprietário)' })
    delete(@Param('id') id: string, @User() user: UserPayload) {
        return this.folderService.deleteFolder(id, user.matricula);
    }

    @Post(':id/books')
    @ApiOperation({ summary: 'Adicionar um livro a uma pasta (Editor ou +)' })
    addBook(
        @Param('id') folderId: string,
        @Body() addBookDto: AddBookToFolderDto,
        @User() user: UserPayload,
    ) {
        return this.folderService.addBookToFolder(
            folderId,
            user.matricula,
            addBookDto.bookId,
        );
    }

    @Delete(':id/books/:bookId')
    @ApiOperation({ summary: 'Remover um livro de uma pasta (Editor ou +)' })
    removeBook(
        @Param('id') folderId: string,
        @Param('bookId') bookId: string,
        @User() user: UserPayload,
    ) {
        return this.folderService.removeBookFromFolder(
            folderId,
            user.matricula,
            bookId,
        );
    }

    // --- Gerenciamento de Usuários ---

    @Post(':id/users')
    @ApiOperation({ summary: 'Adicionar um usuário a uma pasta (Apenas proprietário)' })
    addUser(
        @Param('id') folderId: string,
        @Body() addUserDto: AddUserToFolderDto,
        @User() user: UserPayload, // Este é o usuário que está fazendo a requisição
    ) {
        return this.folderService.addUserToFolder(
            folderId,
            user.matricula, // A matrícula do requisitante (proprietário)
            addUserDto.userMatricula, // A matrícula do novo usuário
            addUserDto.role,
        );
    }

    @Delete(':id/users/:userMatricula')
    @ApiOperation({ summary: 'Remover um usuário de uma pasta (Apenas proprietário)' })
    removeUser(
        @Param('id') folderId: string,
        @Param('userMatricula') userToRemoveMatricula: string,
        @User() user: UserPayload, // O usuário que está fazendo a requisição
    ) {
        return this.folderService.removeUserFromFolder(
            folderId,
            user.matricula,
            userToRemoveMatricula,
        );
    }
}
