var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { HttpException, HttpStatus, Injectable, UnauthorizedException, } from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { Kysely } from 'kysely';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import { createHash, randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
let AuthService = class AuthService {
    db;
    userService;
    jwtService;
    config;
    constructor(db, userService, jwtService, config) {
        this.db = db;
        this.userService = userService;
        this.jwtService = jwtService;
        this.config = config;
    }
    async login(userDto) {
        const user = await this.validateUser(userDto);
        const tokens = await this.generateTokens(user.id);
        await this.saveRefreshToken(tokens.refreshToken, user.id);
        return tokens;
    }
    async registration(userDto) {
        const candidate = await this.userService.getUsersByLogin(userDto.login);
        if (candidate) {
            throw new HttpException('User with this login is exists', HttpStatus.CONFLICT);
        }
        const hashedPassword = await bcrypt.hash(userDto.password, 10);
        return await this.db.transaction().execute(async (trx) => {
            const user = await trx
                .insertInto('users')
                .values({ ...userDto, password: hashedPassword })
                .returningAll()
                .executeTakeFirstOrThrow();
            const tokens = await this.generateTokens(user.id);
            await this.saveRefreshToken(tokens.refreshToken, user.id, trx);
            return tokens;
        });
    }
    async saveRefreshToken(token, user_id, db = this.db) {
        await db.insertInto('refresh_tokens')
            .values({
            user_id: user_id,
            token_hash: this.hashToken(token),
            expires_at: dayjs().add(30, 'days').toDate(),
            revoked_at: null,
        })
            .execute();
    }
    async generateTokens(user_id) {
        const accessToken = await this.jwtService.signAsync({ sub: user_id, type: 'access' }, { secret: this.config.getOrThrow('JWT_ACCESS_KEY'), expiresIn: '15m' });
        const refreshToken = await this.jwtService.signAsync({ sub: user_id, type: 'refresh', jti: randomUUID() }, { secret: this.config.getOrThrow('JWT_REFRESH_KEY'), expiresIn: '30d' });
        return { accessToken, refreshToken };
    }
    hashToken = (token) => createHash('sha256').update(token).digest('hex');
    async validateUser(userDto) {
        const user = await this.userService.getUsersByLogin(userDto.login);
        if (!user) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }
        const passwordEqual = await bcrypt.compare(userDto.password, user.password);
        if (!passwordEqual) {
            throw new UnauthorizedException('Неверный логин или пароль');
        }
        return user;
    }
    async logout(refreshToken) {
        const hashedToken = this.hashToken(refreshToken);
        const deleted = await this.db
            .deleteFrom('refresh_tokens')
            .where('token_hash', '=', hashedToken)
            .executeTakeFirst();
        if (deleted.numDeletedRows <= 0)
            return HttpStatus.NOT_FOUND;
        return HttpStatus.NO_CONTENT;
    }
    async getPayloadFromToken(token) {
        return await this.jwtService.verifyAsync(token, {
            secret: this.config.getOrThrow('JWT_REFRESH_KEY'),
        });
    }
    async refresh(refreshToken) {
        return await this.db.transaction().execute(async (trx) => {
            const hashedToken = this.hashToken(refreshToken);
            const foundedToken = await trx
                .selectFrom('refresh_tokens')
                .selectAll()
                .where('token_hash', '=', hashedToken)
                .executeTakeFirst();
            if (!foundedToken)
                throw new UnauthorizedException('token not found');
            let payload;
            try {
                payload = await this.getPayloadFromToken(refreshToken);
            }
            catch {
                throw new UnauthorizedException('Invalid refresh token');
            }
            await trx
                .deleteFrom('refresh_tokens')
                .where('token_hash', '=', hashedToken)
                .executeTakeFirst();
            if (payload.type !== 'refresh')
                throw new UnauthorizedException('Invalid token type');
            const tokens = await this.generateTokens(payload.sub);
            await this.saveRefreshToken(tokens.refreshToken, payload.sub, trx);
            return tokens;
        });
    }
};
AuthService = __decorate([
    Injectable(),
    __param(0, InjectKysely()),
    __metadata("design:paramtypes", [Kysely,
        UserService,
        JwtService,
        ConfigService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map