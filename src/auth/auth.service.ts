import * as argon2 from "argon2";
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { MailService } from "src/mail/mail.service";


const passwordResetCodes = new Map<string, string>();

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private mailService: MailService
    ) { }

    async login(matricula: string, password: string): Promise<{ access_token: string }> {
        const user = await this.usersService.findOne({ matricula });

        if (!user) throw new UnauthorizedException("Usuário não encontrado")

        const passwordValid = await argon2.verify(user.senha, password);
        if (!passwordValid) throw new UnauthorizedException("Credenciais inválidas")

        const payload = {
            matricula: user.matricula,
            role: user.role,
            nome: user.nome,
            email: user.email,

        }

        const access_token = await this.jwtService.signAsync(payload)
        return { access_token };
    }

    async register(nome: string, matricula: string, email: string, senha: string) {
        let existingUser = null;
        try {
            existingUser = await this.usersService.findOne({ matricula });
        } catch (error) {
            if(!(error instanceof NotFoundException)){
                throw error;
            }
        }

        if (existingUser) throw new ConflictException("Email já cadastrado");


        const hashedPassword = await argon2.hash(senha);

        const newUser = await this.usersService.createUser({
            matricula,
            nome,
            email,
            senha: hashedPassword,
            role: "ALUNO"
        })
        const payload = {
            matricula: newUser.matricula,
            role: newUser.role,
            nome: newUser.nome,
            email: newUser.email
        }
        const access_token = await this.jwtService.signAsync(payload);

        return { access_token }
    }

    async profile(matricula: string) {
        const user = await this.usersService.findOne({ matricula });
        if (!user) throw new UnauthorizedException("Usuário não encontrado");

        const { senha: _, ...result } = user;
        return result;

    }

    async sendRecoveryCode(email: string) {
        const user = await this.usersService.findOne({ email });
        if (!user) throw new NotFoundException("Usuário não encontrado.")

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        passwordResetCodes.set(email, code);

        await this.mailService.sendPasswordRecovery(email, code);
        return { message: 'Código enviado para o e-mail' };
    }

    async verifyCode(email: string, code: string) {
        const savedCode = passwordResetCodes.get(email);
        if (!savedCode || savedCode !== code) {
            throw new BadRequestException("Codigo inválido ou expirado");
        }

        const token = await this.jwtService.signAsync(
            { email, recovery: true },
            { expiresIn: '10m' }
        )

        passwordResetCodes.delete(email);

        return { access_token: token }
    }

    async resetPassword(email: string, newPassword: string){
        const user = await this.usersService.findOne({ email });
        if(!user) throw new NotFoundException("Usuário não encontrado.");

        const hashed = await argon2.hash(newPassword);
        await this.usersService.updateUser({
            data: {
               senha: hashed
            },
            where: { email }
        })

        return { message: "Senha redefinida com sucesso!" }
    }
}
