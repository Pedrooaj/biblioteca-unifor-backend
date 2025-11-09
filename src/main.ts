import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { seedSuperUser } from './seed/superuser.seed';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await seedSuperUser(app);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }));

  const config = new DocumentBuilder()
  .setTitle("Unifor Biblioteca API")
  .setDescription("Esta api se trata de todo o fluxo e regra de négocios do aplicativo de bibliteca da universidade de fortaleza. Nesta api esta sendo utilizad Supabase com banco de dados e prisma como ORM para relações SQL.")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
