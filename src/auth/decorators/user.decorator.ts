import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type UserPayload = {
    matricula: string;
    nome: string;
    role: string;
    email: string;
    iat?: number;
    exp: number
}

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): UserPayload => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    }
)