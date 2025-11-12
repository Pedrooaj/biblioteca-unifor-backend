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
import { CreateBookDto, UpdateBookDto, FilterBooksDto } from './dto/book.dto';
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
  @ApiOperation({ summary: 'Listar todos os livros com paginação e filtros' })
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
  @ApiQuery({
    name: 'titulo',
    required: false,
    type: String,
    description: 'Filtro por título (busca parcial)',
    example: 'Senhor dos Anéis',
  })
  @ApiQuery({
    name: 'autor',
    required: false,
    type: String,
    description: 'Filtro por autor (busca parcial)',
    example: 'Tolkien',
  })
  @ApiQuery({
    name: 'isbn',
    required: false,
    type: String,
    description: 'Filtro por ISBN (busca parcial)',
    example: '978-85',
  })
  @ApiQuery({
    name: 'anoEdicao',
    required: false,
    type: Number,
    description: 'Filtro por ano de edição exato',
    example: 2023,
  })
  @ApiQuery({
    name: 'edicao',
    required: false,
    type: String,
    description: 'Filtro por edição (busca parcial)',
    example: '1ª edição',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Busca geral em múltiplos campos',
    example: 'Tolkien',
  })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('titulo') titulo?: string,
    @Query('autor') autor?: string,
    @Query('isbn') isbn?: string,
    @Query('anoEdicao') anoEdicao?: string,
    @Query('edicao') edicao?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    const anoEdicaoNumber = anoEdicao ? parseInt(anoEdicao, 10) : undefined;

    const filters: FilterBooksDto = {
      titulo,
      autor,
      isbn,
      anoEdicao: anoEdicaoNumber,
      edicao,
      search,
    };

    return this.booksService.findAll(pageNumber, limitNumber, filters);
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

