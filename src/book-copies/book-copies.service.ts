import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { CopyStatus, BookCondition } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma.service';
import { CreateBookCopyDto } from './dto/book-copy.dto';
import { UpdateBookCopyDto } from './dto/book-copy.dto';

@Injectable()
export class BookCopiesService {
  constructor(private prisma: PrismaService) {}

  async create(createBookCopyDto: CreateBookCopyDto) {
    // Verifica se o livro existe
    const book = await this.prisma.book.findUnique({
      where: { id: createBookCopyDto.bookId },
    });

    if (!book) {
      throw new NotFoundException(
        `Livro com ID ${createBookCopyDto.bookId} não encontrado.`,
      );
    }

    // Se copyNumber não foi informado, busca o próximo número disponível
    let copyNumber = createBookCopyDto.copyNumber;
    if (!copyNumber) {
      const maxCopy = await this.prisma.bookCopy.findFirst({
        where: { bookId: createBookCopyDto.bookId },
        orderBy: { copyNumber: 'desc' },
      });
      copyNumber = maxCopy ? maxCopy.copyNumber + 1 : 1;
    }

    try {
      return await this.prisma.bookCopy.create({
        data: {
          bookId: createBookCopyDto.bookId,
          copyNumber,
          status: createBookCopyDto.status || CopyStatus.DISPONIVEL,
          condition: createBookCopyDto.condition || BookCondition.BOA,
        },
        include: {
          book: true,
        },
      });
    } catch (e) {
      if (this.isPrismaError(e, 'P2002')) {
        throw new ConflictException(
          `Exemplar número ${copyNumber} já existe para este livro.`,
        );
      }
      throw e;
    }
  }

  async findAll() {
    return await this.prisma.bookCopy.findMany({
      include: {
        book: true,
      },
      orderBy: [
        { book: { titulo: 'asc' } },
        { copyNumber: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const bookCopy = await this.prisma.bookCopy.findUnique({
      where: { id },
      include: {
        book: true,
      },
    });

    if (!bookCopy) {
      throw new NotFoundException(`Exemplar com ID ${id} não encontrado.`);
    }

    return bookCopy;
  }

  async findByBook(bookId: string) {
    // Verifica se o livro existe
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException(`Livro com ID ${bookId} não encontrado.`);
    }

    return await this.prisma.bookCopy.findMany({
      where: { bookId },
      include: {
        book: true,
      },
      orderBy: {
        copyNumber: 'asc',
      },
    });
  }

  async update(id: string, updateBookCopyDto: UpdateBookCopyDto) {
    // Primeiro verifica se o exemplar existe
    await this.findOne(id);

    try {
      const dataToUpdate: any = {};
      if (updateBookCopyDto.status !== undefined) {
        dataToUpdate.status = updateBookCopyDto.status;
      }
      if (updateBookCopyDto.condition !== undefined) {
        dataToUpdate.condition = updateBookCopyDto.condition;
      }

      return await this.prisma.bookCopy.update({
        where: { id },
        data: dataToUpdate,
        include: {
          book: true,
        },
      });
    } catch (e) {
      if (this.isPrismaError(e, 'P2025')) {
        throw new NotFoundException(`Exemplar com ID ${id} não encontrado.`);
      }
      throw e;
    }
  }

  async remove(id: string) {
    // Primeiro verifica se o exemplar existe
    await this.findOne(id);

    try {
      return await this.prisma.bookCopy.delete({
        where: { id },
        include: {
          book: true,
        },
      });
    } catch (e) {
      if (this.isPrismaError(e, 'P2025')) {
        throw new NotFoundException(`Exemplar com ID ${id} não encontrado.`);
      }
      // Verifica se há relacionamentos que impedem a deleção
      if (this.isPrismaError(e, 'P2003')) {
        throw new ConflictException(
          'Não é possível deletar o exemplar pois existem empréstimos ou reservas associados.',
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

