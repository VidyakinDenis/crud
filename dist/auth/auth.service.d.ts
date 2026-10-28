import { HttpStatus } from '@nestjs/common';
import { Kysely } from 'kysely';
import { Database } from '../database/database.types.js';
import { UserCreateDto } from '../user/dto/user-create.schema.js';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import { UserLogin } from './dto/userLogin.schema.js';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly db;
    private userService;
    private jwtService;
    private readonly config;
    constructor(db: Kysely<Database>, userService: UserService, jwtService: JwtService, config: ConfigService);
    login(userDto: UserLogin): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    registration(userDto: UserCreateDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private saveRefreshToken;
    private generateTokens;
    private hashToken;
    private validateUser;
    logout(refreshToken: string): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND>;
    getPayloadFromToken(token: string): Promise<{
        sub: number;
        type: 'refresh' | "access";
        jti?: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
