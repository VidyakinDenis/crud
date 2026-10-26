import {NestFactory} from "@nestjs/core"
import { AppModule } from './app/app.module.js';

(async function start (){
  const PORT = process.env.PORT || 5000
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api');

  await app.listen(PORT, () => console.log(`Server start on port ${PORT}`))
})()