import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminController } from './admin/admin.controller';
import { ConfigModule } from '@nestjs/config';
import { FoldersModule } from './folders/folders.module';
import { BooksModule } from './books/books.module';
import { BookCopiesModule } from './book-copies/book-copies.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { CartModule } from './cart/cart.module';
import { MailModule } from './mail/mail.module';


@Module({
  imports: [AuthModule, UsersModule, ConfigModule.forRoot({
    isGlobal: true
  }), FoldersModule, BooksModule, BookCopiesModule, CartModule, MailModule],
  controllers: [AppController, AdminController],
  providers: [AppService, PrismaService, {
      provide: APP_GUARD,
      useClass: AuthGuard
    }],
  exports: [
    PrismaService
  ]
})
export class AppModule {}
