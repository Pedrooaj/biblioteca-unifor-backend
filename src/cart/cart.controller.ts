import { Controller, Post, Delete, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { User, UserPayload } from 'src/auth/decorators/user.decorator';

@ApiTags('Cesta (Cart)')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post(':bookCopyId')
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
}
