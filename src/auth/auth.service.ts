import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectKysely } from 'nestjs-kysely';
import { Kysely } from 'kysely';
import { Database } from '../database/database.types.js';
import { UserCreate, UserCreateDto } from '../user/dto/user-create.schema.js';
import { UserService } from '../user/user.service.js';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UserLogin } from './dto/userLogin.schema.js';
import dayjs from 'dayjs';
import { createHash, randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectKysely() private readonly db: Kysely<Database>,
    private userService: UserService,
    private jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
  }


  async login(userDto: UserLogin) {

    const user = await this.validateUser(userDto);
    const tokens = await this.generateTokens(user.id);
    await this.saveRefreshToken(tokens.refreshToken, user.id);

    return tokens;
  }

  async registration(userDto: UserCreateDto) {
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

  private async saveRefreshToken(token: string, user_id: number, db: Kysely<Database> = this.db) {
    await db.insertInto('refresh_tokens')
      .values({
        user_id: user_id,
        token_hash: this.hashToken(token),
        expires_at: dayjs().add(30, 'days').toDate(),
        revoked_at: null,
      })
      .execute();
  }

  private async generateTokens(user_id: number) {
    const accessToken = await this.jwtService.signAsync(
      { sub: user_id, type: 'access' },
      { secret: this.config.getOrThrow<string>('JWT_ACCESS_KEY'), expiresIn: '15m' },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user_id, type: 'refresh', jti: randomUUID() },
      { secret: this.config.getOrThrow<string>('JWT_REFRESH_KEY'), expiresIn: '30d' },
    );

    return { accessToken, refreshToken };
  }

  private hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

  private async validateUser(userDto: UserLogin) {
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

  async logout(refreshToken: string) {
    const hashedToken = this.hashToken(refreshToken);

    const deleted = await this.db
      .deleteFrom('refresh_tokens')
      .where('token_hash', '=', hashedToken)
      .executeTakeFirst();

    if (deleted.numDeletedRows <= 0) return HttpStatus.NOT_FOUND;
    return HttpStatus.NO_CONTENT;

  }

  async getPayloadFromToken(token: string): Promise <{ sub: number, type: 'refresh' | "access", jti?: string }> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_KEY'),
    });
  }

  async refresh(refreshToken: string) {

    return await this.db.transaction().execute(async (trx) => {
      const hashedToken = this.hashToken(refreshToken);

      const foundedToken = await trx
        .selectFrom('refresh_tokens')
        .selectAll()
        .where('token_hash', '=', hashedToken)
        .executeTakeFirst();

      if (!foundedToken) throw new UnauthorizedException('token not found');

      let payload: { sub: number; type: string; jti?: string };
      try {
        payload = await this.getPayloadFromToken(refreshToken)
      } catch {
        throw new UnauthorizedException('Invalid refresh token');
      }

      await trx
        .deleteFrom('refresh_tokens')
        .where('token_hash', '=', hashedToken)
        .executeTakeFirst();

      if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type');
      const tokens = await this.generateTokens(payload.sub);
      await this.saveRefreshToken(tokens.refreshToken, payload.sub, trx);



      return tokens;
    });
  }
}
