import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

(async function start() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ZodValidationPipe());

    const config = new DocumentBuilder()
      .setTitle('Example')
      .setDescription('The users API description')
      .addBearerAuth()
      .setVersion('1.0')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/swagger', app, documentFactory);

    await app.listen(process.env.SWAGGEER_PORT ?? 3000);
  }

  await bootstrap();


  await app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
})();