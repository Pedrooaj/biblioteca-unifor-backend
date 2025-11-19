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

  async checkout(userMatricula: string, dataLimite: string) {
    // Busca os itens da cesta
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userMatricula },
      include: { book: true },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cesta está vazia');
    }

    const dataLimiteDate = new Date(dataLimite);
    if (dataLimiteDate <= new Date()) {
      throw new BadRequestException('Data limite deve ser no futuro');
    }

    const results = {
      successfulLoans: [],
      failedItems: [],
    };

    // Processa cada item da cesta
    for (const item of cartItems) {
      try {
        // Busca um exemplar disponível do livro
        const availableCopy = await this.prisma.bookCopy.findFirst({
          where: {
            bookId: item.bookId,
            status: 'DISPONIVEL',
            loans: {
              none: {
                status: 'ATIVO',
              },
            },
            reservation: null,
          },
        });

        if (!availableCopy) {
          // Se não encontrar exemplar, busca todos para dar um feedback claro
          const allCopies = await this.prisma.bookCopy.findMany({
            where: { bookId: item.bookId },
            select: { id: true, copyNumber: true, status: true },
          });

          results.failedItems.push({
            bookId: item.bookId,
            titulo: item.book.titulo,
            reason: 'Nenhum exemplar disponível para empréstimo no momento.',
            exemplares: allCopies,
          });
          continue;
        }

        // Cria o empréstimo
        const loan = await this.prisma.loan.create({
          data: {
            userMatricula,
            bookCopyId: availableCopy.id,
            dataLimite: dataLimiteDate,
          },
          include: {
            bookCopy: {
              include: { book: true },
            },
          },
        });

        // Atualiza o status do exemplar para ALUGADO
        await this.prisma.bookCopy.update({
          where: { id: availableCopy.id },
          data: { status: 'ALUGADO' },
        });

        results.successfulLoans.push({
          loanId: loan.id,
          bookId: item.bookId,
          titulo: item.book.titulo,
          exemplar: availableCopy.copyNumber,
          dataEmprestimo: loan.dataEmprestimo,
          dataLimite: loan.dataLimite,
        });
      } catch (error) {
        results.failedItems.push({
          bookId: item.bookId,
          titulo: item.book.titulo,
          reason: error.message || 'Erro ao processar empréstimo',
        });
      }
    }

    // Limpa a cesta após tentar processar todos os itens
    await this.prisma.cartItem.deleteMany({ where: { userMatricula } });

    return {
      status: results.failedItems.length === 0 ? 'COMPLETO' : 'PARCIAL',
      totalItens: cartItems.length,
      ...results,
    };
  }

  async reserveBook(userMatricula: string, bookId: string, dataLimite: string) {
    // Verifica se o livro existe
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new BadRequestException('Livro não encontrado');
    }

    const dataLimiteDate = new Date(dataLimite);
    if (dataLimiteDate <= new Date()) {
      throw new BadRequestException('Data limite deve ser no futuro');
    }

    // Verifica se o usuário já tem uma reserva ativa para este livro
    const existingReservation = await this.prisma.reservation.findFirst({
      where: {
        user: { matricula: userMatricula },
        bookCopy: { bookId },
        status: 'ATIVA',
      },
    });

    if (existingReservation) {
      throw new BadRequestException('Você já tem uma reserva ativa para este livro');
    }

    // Verifica se há algum exemplar disponível
    const availableCopy = await this.prisma.bookCopy.findFirst({
      where: {
        bookId,
        status: 'DISPONIVEL',
        loans: {
          none: {
            status: 'ATIVO',
          },
        },
        reservation: null,
      },
    });

    if (availableCopy) {
      throw new BadRequestException(
        'Há exemplares disponíveis para empréstimo. Use a cesta para emprestar ao invés de reservar.',
      );
    }

    // Se chegou aqui, todos os exemplares estão emprestados
    // Busca o primeiro exemplar emprestado para criar a reserva
    const borrowedCopy = await this.prisma.bookCopy.findFirst({
      where: {
        bookId,
        loans: {
          some: {
            status: 'ATIVO',
          },
        },
      },
    });

    if (!borrowedCopy) {
      throw new BadRequestException('Nenhum exemplar encontrado para reserva');
    }

    // Cria a reserva
    const reservation = await this.prisma.reservation.create({
      data: {
        userMatricula,
        bookCopyId: borrowedCopy.id,
        dataLimite: dataLimiteDate,
      },
      include: {
        bookCopy: {
          include: { book: true },
        },
      },
    });

    return {
      reservationId: reservation.id,
      bookId: book.id,
      titulo: book.titulo,
      dataReserva: reservation.dataReserva,
      dataLimite: reservation.dataLimite,
      status: reservation.status,
      mensagem: 'Reserva criada com sucesso. Você será notificado quando o livro estiver disponível.',
    };
  }

  async returnBook(userMatricula: string, loanId: string) {
    // Busca o empréstimo
    const loan = await this.prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        bookCopy: {
          include: { book: true },
        },
        user: true,
      },
    });

    if (!loan) {
      throw new BadRequestException('Empréstimo não encontrado');
    }

    // Verifica se o empréstimo pertence ao usuário
    if (loan.userMatricula !== userMatricula) {
      throw new BadRequestException('Você não tem permissão para devolver este livro');
    }

    // Verifica se o livro já foi devolvido
    if (loan.status === 'DEVOLVIDO') {
      throw new BadRequestException('Este livro já foi devolvido');
    }

    const dataDevolucao = new Date();

    // Atualiza o empréstimo como devolvido
    const updatedLoan = await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'DEVOLVIDO',
        dataDevolucao,
      },
      include: {
        bookCopy: {
          include: { book: true },
        },
      },
    });

    // Verifica se há reservas para este exemplar
    const reservation = await this.prisma.reservation.findUnique({
      where: { bookCopyId: loan.bookCopyId },
    });

    // Atualiza o status do exemplar
    if (reservation && reservation.status === 'ATIVA') {
      // Se há reserva ativa, marca como RESERVADO
      await this.prisma.bookCopy.update({
        where: { id: loan.bookCopyId },
        data: { status: 'RESERVADO' },
      });
    } else {
      // Caso contrário, marca como DISPONIVEL
      await this.prisma.bookCopy.update({
        where: { id: loan.bookCopyId },
        data: { status: 'DISPONIVEL' },
      });
    }

    return {
      loanId: updatedLoan.id,
      bookId: updatedLoan.bookCopy.book.id,
      titulo: updatedLoan.bookCopy.book.titulo,
      dataEmprestimo: updatedLoan.dataEmprestimo,
      dataDevolucao: updatedLoan.dataDevolucao,
      status: updatedLoan.status,
      tempoEmprestimo: Math.floor(
        (updatedLoan.dataDevolucao.getTime() - updatedLoan.dataEmprestimo.getTime()) / (1000 * 60 * 60 * 24),
      ),
      mensagem: 'Livro devolvido com sucesso',
    };
  }

  async getMyLoans(userMatricula: string) {
    const loans = await this.prisma.loan.findMany({
      where: { userMatricula },
      include: {
        bookCopy: {
          include: { book: true },
        },
      },
      orderBy: { dataEmprestimo: 'desc' },
    });

    return loans.map((loan) => ({
      loanId: loan.id,
      bookId: loan.bookCopy.book.id,
      titulo: loan.bookCopy.book.titulo,
      autor: loan.bookCopy.book.autor,
      exemplar: loan.bookCopy.copyNumber,
      dataEmprestimo: loan.dataEmprestimo,
      dataLimite: loan.dataLimite,
      dataDevolucao: loan.dataDevolucao,
      status: loan.status,
      renovacoes: loan.renovacoes,
      estaAtrasado: loan.status === 'ATIVO' && new Date() > loan.dataLimite,
    }));
  }

  async getMyReservations(userMatricula: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: { userMatricula },
      include: {
        bookCopy: {
          include: { book: true },
        },
      },
      orderBy: { dataReserva: 'desc' },
    });

    return reservations.map((reservation) => ({
      reservationId: reservation.id,
      bookId: reservation.bookCopy.book.id,
      titulo: reservation.bookCopy.book.titulo,
      autor: reservation.bookCopy.book.autor,
      dataReserva: reservation.dataReserva,
      dataLimite: reservation.dataLimite,
      status: reservation.status,
    }));
  }

  private async checkBookCopyAvailability(bookCopyId: string): Promise<boolean> {
    const copy = await this.prisma.bookCopy.findUnique({ where: { id: bookCopyId } });
    if (!copy) return false;

    const activeLoan = await this.prisma.loan.findFirst({ where: { bookCopyId, status: 'ATIVO' } });
    const activeReservation = await this.prisma.reservation.findFirst({ where: { bookCopyId, status: 'ATIVA' } });

    return copy.status === 'DISPONIVEL' && !activeLoan && !activeReservation;
  }
}
