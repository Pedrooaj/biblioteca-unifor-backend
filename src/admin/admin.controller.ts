import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('admin')
export class AdminController {

    @Roles("ADMIN")
    @Get()
    get(){
       return "Testando Rota Admin" 
    }
}
