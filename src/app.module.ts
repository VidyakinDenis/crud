import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import appConfig from './config/app.config.js';
import databaseConfig from './config/database.config.js';
import jwtConfig from './config/jwt.config.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { PostgresDialect, PostgresDialectConfig } from 'kysely';
import { KyselyModule } from 'nestjs-kysely';
import { Pool } from 'pg';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
      validate: validateEnv,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    UserModule,
    AuthModule,
    KyselyModule.forRoot({
      dialect: new PostgresDialect({
        pool: new Pool({
          host: process.env.PG_HOST,
          port: Number(process.env.PG_PORT),
          user: process.env.PG_USER,
          password: process.env.PG_USER_PASS,
          database: process.env.PG_DB,
        }) as unknown as PostgresDialectConfig['pool'],
      })
    })
  ],
})
export class AppModule {}
