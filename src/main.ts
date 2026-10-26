import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder } from '@nestjs/swagger';

(async function () {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder();


  await app.listen(PORT, () => console.log(`Server start on port ${PORT}`));
})();