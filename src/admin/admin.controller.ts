import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {

    @Get()
    @Roles("ADMINISTRADOR")
    // mostra o cadeado no Swagger
    @ApiOperation({ summary: 'Rota exclusiva para admins', description: 'Somente usuários com role ADMIN podem acessar esta rota' })
    @ApiResponse({ status: 200, description: 'Rota acessada com sucesso' })
    @ApiResponse({ status: 401, description: 'Usuário não autenticado' })
    @ApiResponse({ status: 403, description: 'Usuário não possui permissão (role inválida)' })
    get() {
        return "Segredo secreto que apenas administradores tem acesso"
    }
}
