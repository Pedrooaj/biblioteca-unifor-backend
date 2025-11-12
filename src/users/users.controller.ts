import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }


    @Roles("SUPER")
    @Get()
    async getAll(@Query("skip") skip?: string, @Query("take") take?: string) {
        const users = await this.userService.users({
            skip: skip ? Number(skip) : undefined,
            take: take ? Number(take) : undefined,
        });

        return {
            message: 'Usuários listados com sucesso.',
            count: users.length,
            data: users,
        };
    }

    @Roles("SUPER")
    @Post()
    async createUser(@Body() user: CreateUserDto) {
        const newUser = await this.userService.createUser({
            ...user
        });
        return {
            message: 'Usuário criado com sucesso.',
            data: newUser,
        };
    }

    @Roles("SUPER")
    @Patch(":matricula")
    async updateUser(@Param("matricula") matricula: string, @Body() user: UpdateUserDto) {
        const updatedUser = await this.userService.updateUser({
            where: { matricula },
            data: {
                ...user
            },
        });
        return {
            message: 'Usuário atualizado com sucesso.',
            data: updatedUser,
        };
    }

    @Roles("SUPER")
    @Delete(":matricula")
    async deleteUser(@Param("matricula") matricula: string) {
        await this.userService.deleteUser({ matricula });
        return { message: 'Usuário removido com sucesso.' };
    }

    @Roles("SUPER")
    @Get(":matricula")
    async getUser(@Param("matricula") matricula: string) {
        const user = await this.userService.findOne({ matricula });
        return {
            message: 'Usuário encontrado com sucesso.',
            data: user,
        };
    }



}
