import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
          transport: {
        host: "smtp.gmail.com", 
        port: 587,
        secure: true,
            
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        },
      },
      defaults: {
        from: '"Equipe Suporte" uniforbiblioteca@gmail.com'
      },
      template: {
        dir: join(__dirname, 'templates'),
        options: {
          strict: true
        }
      }
      })
    
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
