import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userMatricula: string, bookCopyId: string) {
    const bookCopy = await this.prisma.bookCopy.findUnique({
      where: { id: bookCopyId },
      include: { book: true },
    });

    if (!bookCopy) {
      throw new BadRequestException('Exemplar não encontrado');
    }

    // Garante que o mesmo livro (bookId) não seja adicionado duas vezes
    const existing = await this.prisma.cartItem.findUnique({
      where: {
        userMatricula_bookId: {
          userMatricula,
          bookId: bookCopy.book.id,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Este livro já está na sua cesta');
    }

    // Verifica disponibilidade do exemplar
    const isAvailable = await this.checkBookCopyAvailability(bookCopyId);
    if (!isAvailable) {
      throw new BadRequestException('Este exemplar não está disponível para empréstimo');
    }

    return this.prisma.cartItem.create({
      data: {
        userMatricula,
        bookId: bookCopy.book.id,
      },
      include: {
        book: true,
      },
    });
  }

  async removeFromCart(userMatricula: string, bookId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: {
        userMatricula_bookId: {
          userMatricula,
          bookId,
        },
      },
    });

    if (!item) throw new BadRequestException('Item não encontrado na cesta');

    return this.prisma.cartItem.delete({
      where: {
        userMatricula_bookId: {
          userMatricula,
          bookId,
        },
      },
    });
  }

  async getCart(userMatricula: string) {
    return this.prisma.cartItem.findMany({
      where: { userMatricula },
      include: { book: true },
    });
  }

  async clearCart(userMatricula: string) {
    return this.prisma.cartItem.deleteMany({ where: { userMatricula } });
  }

  private async checkBookCopyAvailability(bookCopyId: string): Promise<boolean> {
    const copy = await this.prisma.bookCopy.findUnique({ where: { id: bookCopyId } });
    if (!copy) return false;

    const activeLoan = await this.prisma.loan.findFirst({ where: { bookCopyId, status: 'ATIVO' } });
    const activeReservation = await this.prisma.reservation.findFirst({ where: { bookCopyId, status: 'ATIVA' } });

    return copy.status === 'DISPONIVEL' && !activeLoan && !activeReservation;
  }
}
