import { Module } from '@nestjs/common';
import { PostgresDialect, PostgresDialectConfig } from 'kysely';
import { KyselyModule } from 'nestjs-kysely';
import { Pool } from 'pg';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module.js';
import { AuthModule } from '../auth/auth.module.js';


@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true
    }),
    KyselyModule.forRoot({
      dialect: new PostgresDialect({
        pool: new Pool({
          host: process.env.PG_HOST,
          port: Number(process.env.PG_PORT),
          user: process.env.PG_USER,
          password: process.env.PG_USER_PASS,
          database: process.env.PG_DB,
        })as unknown as PostgresDialectConfig['pool'],
      }),
    }),
    UserModule,
    AuthModule,
  ],
})


export class AppModule {
}
