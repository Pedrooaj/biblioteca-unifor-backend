import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookCopiesService } from './book-copies.service';
import { CreateBookCopyDto, UpdateBookCopyDto } from './dto/book-copy.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Exemplares (Book Copies)')
@ApiBearerAuth()
@Controller('book-copies')
export class BookCopiesController {
  constructor(private readonly bookCopiesService: BookCopiesService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Criar um novo exemplar (apenas admin)' })
  create(@Body() createBookCopyDto: CreateBookCopyDto) {
    return this.bookCopiesService.create(createBookCopyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os exemplares' })
  findAll() {
    return this.bookCopiesService.findAll();
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Listar exemplares de um livro específico' })
  findByBook(@Param('bookId') bookId: string) {
    return this.bookCopiesService.findByBook(bookId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um exemplar específico' })
  findOne(@Param('id') id: string) {
    return this.bookCopiesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Atualizar um exemplar (apenas admin)' })
  update(@Param('id') id: string, @Body() updateBookCopyDto: UpdateBookCopyDto) {
    return this.bookCopiesService.update(id, updateBookCopyDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Deletar um exemplar (apenas admin)' })
  remove(@Param('id') id: string) {
    return this.bookCopiesService.remove(id);
  }
}

