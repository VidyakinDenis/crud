var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import appConfig from './config/app.config.js';
import databaseConfig from './config/database.config.js';
import jwtConfig from './config/jwt.config.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { PostgresDialect } from 'kysely';
import { KyselyModule } from 'nestjs-kysely';
import { Pool } from 'pg';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
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
                    }),
                })
            })
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map