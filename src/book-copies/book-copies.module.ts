import { Module } from '@nestjs/common';
import { BookCopiesController } from './book-copies.controller';
import { BookCopiesService } from './book-copies.service';
import { PrismaService } from 'src/prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [BookCopiesController],
  providers: [BookCopiesService, PrismaService],
})
export class BookCopiesModule {}

