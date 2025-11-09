import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    async sendPasswordRecovery(email: string, code: string) {
        await this.mailerService.sendMail({
            to: email,
            subject: "Recuperação de senha",
            html: `
        <div style="font-family:sans-serif; text-align:center">
          <h2>Recuperação de Senha</h2>
          <p>Seu código de verificação é:</p>
          <h1>${code}</h1>
          <p>Esse código expira em alguns minutos.</p>
        </div>
      `
        })
    }
}
