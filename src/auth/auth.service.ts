import * as argon2 from "argon2";
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from "./dto/register-dto";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(matricula: string, password: string): Promise<{ access_token: string }> {
        const user = await this.usersService.findOne({ matricula });

        if(!user) throw new UnauthorizedException("Usuário não encontrado")

        const passwordValid = await argon2.verify(user.senha, password);
        if(!passwordValid) throw new UnauthorizedException("Credenciais inválidas")
        
        const payload = {
            matricula: user.matricula,
            role: user.role,
            nome: user.nome
        }

        const {senha:_, ...result} = user
        return {
            access_token: await this.jwtService.signAsync(payload),
            ...result
        };
    }

    async register(nome: string, matricula: string, email: string, senha: string) {
        const existingUser = await this.usersService.findOne({ matricula });
        if (existingUser) throw new ConflictException("Email já cadastrado");

        
        const hashedPassword = await argon2.hash(senha);

        const newUser = await this.usersService.createUser({
            matricula,
            nome,
            email,
            senha: hashedPassword,
            role: "USER"
        })
        const payload = {
            matricula: newUser.matricula,
            role: newUser.role,
            nome: newUser.nome
        }
        const access_token = await this.jwtService.signAsync(payload);

        const {senha: _, ...result } = newUser;
        return { ...result, access_token }
    }
}
