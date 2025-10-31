import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { RegisterDto } from './dto/register-dto';
import { AuthGuard } from './guards/auth.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth') // Agrupa os endpoints no Swagger sob "Auth"
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * Endpoint para login de usuários.
     * 
     * @param loginDto - Objeto contendo matrícula e senha do usuário
     * @returns Token JWT e informações do usuário logado
     */
    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("login")
    @ApiOperation({ summary: 'Login do usuário' })
    @ApiResponse({ status: 200, description: 'Usuário logado com sucesso' })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto.matricula, loginDto.senha);
    }

    /**
     * Endpoint para registrar novos usuários.
     * 
     * @param registerDto - Objeto contendo nome, matrícula, e-mail e senha
     * @returns Dados do usuário criado
     */
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post("register")
    @ApiOperation({ summary: 'Registro de novo usuário' })
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos ou usuário já existe' })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(
            registerDto.nome,
            registerDto.matricula,
            registerDto.email,
            registerDto.senha
        );
    }

    /**
     * Endpoint para obter informações do perfil do usuário autenticado.
     * 
     * Requer que o usuário esteja autenticado via JWT.
     * 
     * @param req - Requisição HTTP, contém o usuário autenticado em req.user
     * @returns Dados do usuário autenticado
     */
    @ApiBearerAuth()
    @Get("profile")
    @ApiOperation({ summary: 'Retorna perfil do usuário autenticado' })
    @ApiResponse({ status: 200, description: 'Perfil do usuário retornado com sucesso' })
    @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
    async getProfile(@Req() req) {
        return req.user;
    }
}
