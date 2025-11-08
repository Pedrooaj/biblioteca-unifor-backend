import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto, UpdateBookDto } from './dto/book.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Livros (Books)')
@ApiBearerAuth()
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Criar um novo livro (apenas admin)' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os livros com paginação' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 10)',
    example: 10,
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.booksService.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um livro específico' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Atualizar um livro (apenas admin)' })
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Deletar um livro (apenas admin)' })
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}

