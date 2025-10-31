import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { RegisterDto } from './dto/register-dto';
import { AuthGuard } from './auth.guard';
import { Public } from 'src/public/SkipAuth';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("login")
    login(@Body() loginDto: LoginDto){
        return this.authService.login(loginDto.matricula, loginDto.senha)
    }

    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post("register")
    register(@Body() registerDto: RegisterDto){
        return this.authService.register(
            registerDto.nome, 
            registerDto.matricula, 
            registerDto.email, 
            registerDto.senha
        )
    }

    @Get("profile")
    async getProfile(@Req() req){
        return req.user;
    }
}   
