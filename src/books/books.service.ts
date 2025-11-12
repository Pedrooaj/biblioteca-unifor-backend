import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { CopyStatus, BookCondition } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { CreateBookDto, FilterBooksDto } from './dto/book.dto';
import { UpdateBookDto } from './dto/book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    try {
      // Criar o livro e seus exemplares em uma transação
      const book = await this.prisma.$transaction(async (tx) => {
        // 1. Criar o livro
        const createdBook = await tx.book.create({
          data: {
            isbn: createBookDto.isbn,
            titulo: createBookDto.titulo,
            autor: createBookDto.autor,
            coAutores: createBookDto.coAutores || [],
            edicao: createBookDto.edicao,
            anoEdicao: createBookDto.anoEdicao,
            idioma: createBookDto.idioma,
            publicacao: createBookDto.publicacao,
            resumo: createBookDto.resumo,
            imageUrl: createBookDto.imageUrl,
            tipo: createBookDto.tipo,
          },
        });

        // 2. Criar os exemplares automaticamente
        if (createBookDto.numeroExemplares > 0) {
          const copies = Array.from(
            { length: createBookDto.numeroExemplares },
            (_, index) => ({
              bookId: createdBook.id,
              copyNumber: index + 1,
              status: CopyStatus.DISPONIVEL,
              condition: BookCondition.BOA,
            }),
          );

          await tx.bookCopy.createMany({
            data: copies,
          });
        }

        // 3. Retornar o livro com os exemplares criados
        return await tx.book.findUnique({
          where: { id: createdBook.id },
          include: {
            copies: true,
          },
        });
      });

      return book;
    } catch (e) {
      if (this.isPrismaError(e, 'P2002')) {
        throw new ConflictException(
          `Livro com ISBN ${createBookDto.isbn} já existe.`,
        );
      }
      throw e;
    }
  }

  async findAll(page: number = 1, limit: number = 10, filters?: FilterBooksDto) {
    const skip = (page - 1) * limit;
    const take = limit;

    // Construir o objeto where do Prisma baseado nos filtros
    const where: Prisma.BookWhereInput = {};

    if (filters?.search) {
      // Busca geral em múltiplos campos
      where.OR = [
        { titulo: { contains: filters.search, mode: 'insensitive' } },
        { autor: { contains: filters.search, mode: 'insensitive' } },
        { isbn: { contains: filters.search, mode: 'insensitive' } },
      ];
    } else {
      // Filtros específicos
      if (filters?.titulo) {
        where.titulo = { contains: filters.titulo, mode: 'insensitive' };
      }
      if (filters?.autor) {
        where.autor = { contains: filters.autor, mode: 'insensitive' };
      }
      if (filters?.isbn) {
        where.isbn = { contains: filters.isbn, mode: 'insensitive' };
      }
      if (filters?.anoEdicao) {
        where.anoEdicao = filters.anoEdicao;
      }
      if (filters?.edicao) {
        where.edicao = { contains: filters.edicao, mode: 'insensitive' };
      }
    }

    const [books, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip,
        take,
        include: {
          copies: true,
        },
        orderBy: {
          titulo: 'asc',
        },
      }),
      this.prisma.book.count({ where }),
    ]);

    return {
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        copies: true,
      },
    });

    if (!book) {
      throw new NotFoundException(`Livro com ID ${id} não encontrado.`);
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    // Primeiro verifica se o livro existe
    await this.findOne(id);

    try {
      // Remove campos undefined para não atualizar com undefined
      const dataToUpdate: any = {};
      if (updateBookDto.isbn !== undefined) dataToUpdate.isbn = updateBookDto.isbn;
      if (updateBookDto.titulo !== undefined) dataToUpdate.titulo = updateBookDto.titulo;
      if (updateBookDto.autor !== undefined) dataToUpdate.autor = updateBookDto.autor;
      if (updateBookDto.coAutores !== undefined) dataToUpdate.coAutores = updateBookDto.coAutores;
      if (updateBookDto.edicao !== undefined) dataToUpdate.edicao = updateBookDto.edicao;
      if (updateBookDto.anoEdicao !== undefined) dataToUpdate.anoEdicao = updateBookDto.anoEdicao;
      if (updateBookDto.idioma !== undefined) dataToUpdate.idioma = updateBookDto.idioma;
      if (updateBookDto.publicacao !== undefined) dataToUpdate.publicacao = updateBookDto.publicacao;
      if (updateBookDto.resumo !== undefined) dataToUpdate.resumo = updateBookDto.resumo;
      if (updateBookDto.imageUrl !== undefined) dataToUpdate.imageUrl = updateBookDto.imageUrl;
      if (updateBookDto.tipo !== undefined) dataToUpdate.tipo = updateBookDto.tipo;

      return await this.prisma.book.update({
        where: { id },
        data: dataToUpdate,
      });
    } catch (e) {
      if (this.isPrismaError(e, 'P2002')) {
        throw new ConflictException(
          `Livro com ISBN ${updateBookDto.isbn} já existe.`,
        );
      }
      if (this.isPrismaError(e, 'P2025')) {
        throw new NotFoundException(`Livro com ID ${id} não encontrado.`);
      }
      throw e;
    }
  }

  async remove(id: string) {
    // Primeiro verifica se o livro existe
    await this.findOne(id);

    try {
      return await this.prisma.book.delete({
        where: { id },
      });
    } catch (e) {
      if (this.isPrismaError(e, 'P2025')) {
        throw new NotFoundException(`Livro com ID ${id} não encontrado.`);
      }
      // Verifica se há relacionamentos que impedem a deleção
      if (this.isPrismaError(e, 'P2003')) {
        throw new ConflictException(
          'Não é possível deletar o livro pois existem exemplares, empréstimos ou reservas associados.',
        );
      }
      throw e;
    }
  }

  /**
   * Helper para checagem de erros do Prisma
   */
  private isPrismaError(e: any, code: string): boolean {
    return (
      e instanceof Prisma.PrismaClientKnownRequestError && e.code === code
    );
  }
}

