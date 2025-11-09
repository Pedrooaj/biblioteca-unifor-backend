import { INestApplication } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import * as argon2 from "argon2";

export async function seedSuperUser(app: INestApplication) {
    const prisma = app.get(PrismaService);
    const email = process.env.SUPER_EMAIL;
    const existing = await prisma.user.findUnique({ where: { email, role: "SUPER" } });

    if (!existing) {
        const hashed = await argon2.hash(process.env.SUPER_PASSWORD);

        await prisma.user.create({
            data: {
                email,
                senha: hashed,
                nome: "Administrador",
                role: "SUPER",
                matricula: "000000"
            }
        })
        console.log('✅ SuperUser criado automaticamente!');
    } else {
        console.log('ℹ️ SuperUser já existe, nenhum novo usuário criado.');
    }

}