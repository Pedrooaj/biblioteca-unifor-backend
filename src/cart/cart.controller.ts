import { Controller, Post, Delete, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { User, UserPayload } from 'src/auth/decorators/user.decorator';
import { CheckoutDto } from './dto/checkout.dto';
import { ReserveBookDto } from './dto/reserve-book.dto';

@ApiTags('Cesta (Cart)')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add/:bookCopyId')
  @ApiOperation({ summary: 'Adicionar exemplar à cesta' })
  @ApiResponse({ status: 201, description: 'Exemplar adicionado à cesta' })
  addToCart(@Param('bookCopyId') bookCopyId: string, @User() user: UserPayload) {
    return this.cartService.addToCart(user.matricula, bookCopyId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar itens da cesta do usuário' })
  getCart(@User() user: UserPayload) {
    return this.cartService.getCart(user.matricula);
  }

  @Delete(':bookId')
  @ApiOperation({ summary: 'Remover um livro da cesta (por bookId)' })
  removeFromCart(@Param('bookId') bookId: string, @User() user: UserPayload) {
    return this.cartService.removeFromCart(user.matricula, bookId);
  }

  @Delete()
  @ApiOperation({ summary: 'Limpar a cesta do usuário' })
  clearCart(@User() user: UserPayload) {
    return this.cartService.clearCart(user.matricula);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Converter cesta em empréstimo(s)' })
  @ApiResponse({ status: 201, description: 'Empréstimo(s) criado(s) com sucesso' })
  @ApiResponse({ status: 400, description: 'Cesta vazia ou erro na validação' })
  checkout(@User() user: UserPayload, @Body() checkoutDto: CheckoutDto) {
    return this.cartService.checkout(user.matricula, checkoutDto.dataLimite);
  }

  @Post('reserve/:bookId')
  @ApiOperation({ summary: 'Reservar um livro quando não há exemplares disponíveis' })
  @ApiResponse({ status: 201, description: 'Reserva criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Livro não encontrado ou já há exemplares disponíveis' })
  reserveBook(
    @Param('bookId') bookId: string,
    @Body() reserveDto: ReserveBookDto,
    @User() user: UserPayload,
  ) {
    return this.cartService.reserveBook(user.matricula, bookId, reserveDto.dataLimite);
  }

  @Post('return/:loanId')
  @ApiOperation({ summary: 'Devolver um livro emprestado' })
  @ApiResponse({ status: 200, description: 'Livro devolvido com sucesso' })
  @ApiResponse({ status: 400, description: 'Empréstimo não encontrado ou já devolvido' })
  returnBook(@Param('loanId') loanId: string, @User() user: UserPayload) {
    return this.cartService.returnBook(user.matricula, loanId);
  }

  @Get('loans')
  @ApiOperation({ summary: 'Listar meus empréstimos' })
  @ApiResponse({ status: 200, description: 'Lista de empréstimos do usuário' })
  getMyLoans(@User() user: UserPayload) {
    return this.cartService.getMyLoans(user.matricula);
  }

  @Get('reservations')
  @ApiOperation({ summary: 'Listar minhas reservas' })
  @ApiResponse({ status: 200, description: 'Lista de reservas do usuário' })
  getMyReservations(@User() user: UserPayload) {
    return this.cartService.getMyReservations(user.matricula);
  }
}