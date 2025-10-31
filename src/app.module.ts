import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminController } from './admin/admin.controller';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AppController, AdminController],
  providers: [AppService, PrismaService],
  exports: [
    PrismaService
  ]
})
export class AppModule {}
