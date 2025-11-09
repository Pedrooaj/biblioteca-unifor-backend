import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { MailService } from 'src/mail/mail.service';



@Module({
  imports: [UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "3h"}
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
  exports: [AuthService],
  
})
export class AuthModule {}
