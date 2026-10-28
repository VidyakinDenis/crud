import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';

import { AuthService } from '../auth.service.js';
import { UserService } from '../../user/user.service.js';
import type { Database } from '../../database/database.types.js';
import { createKyselyMock } from '../../shared/testFactories.js';
import type { UserCreateDto } from '../../user/dto/user-create.schema.js';
import type { UserLogin } from '../dto/userLogin.schema.js';

describe('AuthService', () => {
  let db: ReturnType<typeof createKyselyMock>;
  let service: AuthService;

  let userService: {
    getUsersByLogin: ReturnType<typeof vi.fn>;
  };

  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
    verifyAsync: ReturnType<typeof vi.fn>;
  };

  let configService: {
    getOrThrow: ReturnType<typeof vi.fn>;
  };

  const user = {
    id: 5,
    name: 'John',
    email: 'john@example.com',
    login: 'john',
    password: 'hashed-password',
    description: null,
    age: 25,
    deleted: false,
  };

  const loginDto: UserLogin = {
    login: 'john',
    password: 'password123',
  };

  const createDto = {
    name: 'John',
    email: 'john@example.com',
    login: 'john',
    password: 'password123',
    age: 25,
    description: 'Test user',
  } as UserCreateDto;

  const accessToken = 'access-token';
  const refreshToken = 'refresh-token';

  const hashToken = (token: string) =>
    createHash('sha256').update(token).digest('hex');

  beforeEach(() => {
    vi.restoreAllMocks();

    db = createKyselyMock();

    userService = {
      getUsersByLogin: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn()
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken),
      verifyAsync: vi.fn(),
    };

    configService = {
      getOrThrow: vi.fn((key: string) => {
        if (key === 'JWT_ACCESS_KEY') return 'access-secret';
        if (key === 'JWT_REFRESH_KEY') return 'refresh-secret';

        throw new Error(`Unknown config key: ${key}`);
      }),
    };

    service = new AuthService(
      db as unknown as Kysely<Database>,
      userService as unknown as UserService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('авторизует пользователя и возвращает токены', async () => {
      userService.getUsersByLogin.mockResolvedValue(user);
      vi.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      db.execute.mockResolvedValue(undefined);

      const result = await service.login(loginDto);

      expect(userService.getUsersByLogin).toHaveBeenCalledWith('john');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: 5, type: 'access' },
        { secret: 'access-secret', expiresIn: '15m' },
      );

      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ sub: 5, type: 'refresh' }),
        { secret: 'refresh-secret', expiresIn: '30d' },
      );

      expect(db.insertInto).toHaveBeenCalledWith('refresh_tokens');
      expect(db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 5,
          token_hash: hashToken(refreshToken),
          revoked_at: null,
        }),
      );

      expect(result).toEqual({ accessToken, refreshToken });
    });

    it('выбрасывает UnauthorizedException, если пользователь не найден', async () => {
      userService.getUsersByLogin.mockResolvedValue(undefined);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('выбрасывает UnauthorizedException при неправильном пароле', async () => {
      userService.getUsersByLogin.mockResolvedValue(user);

      vi.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        service.login({
          login: user.login,
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('пробрасывает ошибку поиска пользователя', async () => {
      userService.getUsersByLogin.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.login(loginDto)).rejects.toThrow('Database error');
    });
  });

  describe('registration', () => {
    it('регистрирует пользователя и возвращает токены', async () => {
      userService.getUsersByLogin.mockResolvedValue(undefined);

      vi.spyOn(bcrypt, 'hash').mockResolvedValue(
        'new-hashed-password' as never,
      );

      db.executeTakeFirstOrThrow.mockResolvedValue({
        ...user,
        password: 'new-hashed-password',
      });

      db.execute.mockResolvedValue(undefined);

      const result = await service.registration(createDto);

      expect(userService.getUsersByLogin).toHaveBeenCalledWith('john');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(db.transaction).toHaveBeenCalled();

      expect(db.insertInto).toHaveBeenCalledWith('users');
      expect(db.values).toHaveBeenNthCalledWith(1, {
        ...createDto,
        password: 'new-hashed-password',
      });

      expect(db.insertInto).toHaveBeenCalledWith('refresh_tokens');
      expect(db.values).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          user_id: 5,
          token_hash: hashToken(refreshToken),
          revoked_at: null,
        }),
      );

      expect(result).toEqual({ accessToken, refreshToken });
    });

    it('выбрасывает HttpException, если login уже занят', async () => {
      userService.getUsersByLogin.mockResolvedValue(user);

      const hashSpy = vi.spyOn(bcrypt, 'hash');

      await expect(service.registration(createDto)).rejects.toThrow(
        HttpException,
      );

      expect(hashSpy).not.toHaveBeenCalled();
      expect(db.transaction).not.toHaveBeenCalled();

      hashSpy.mockRestore();
    });

    it('пробрасывает ошибку хеширования пароля', async () => {
      userService.getUsersByLogin.mockResolvedValue(undefined);

      vi.spyOn(bcrypt, 'hash').mockRejectedValue(
        new Error('Hash failed'),
      );

      await expect(service.registration(createDto)).rejects.toThrow(
        'Hash failed',
      );
    });

    it('пробрасывает ошибку создания пользователя', async () => {
      userService.getUsersByLogin.mockResolvedValue(undefined);

      vi.spyOn(bcrypt, 'hash').mockResolvedValue(
        'new-hashed-password' as never,
      );

      db.executeTakeFirstOrThrow.mockRejectedValue(
        new Error('Insert failed'),
      );

      await expect(service.registration(createDto)).rejects.toThrow(
        'Insert failed',
      );
    });
  });

  describe('logout', () => {
    it('удаляет refresh-токен и возвращает NO_CONTENT', async () => {
      db.executeTakeFirst.mockResolvedValue({ numDeletedRows: 1n });

      const result = await service.logout(refreshToken);

      expect(db.deleteFrom).toHaveBeenCalledWith('refresh_tokens');
      expect(db.where).toHaveBeenCalledWith(
        'token_hash',
        '=',
        hashToken(refreshToken),
      );

      expect(result).toBe(HttpStatus.NO_CONTENT);
    });

    it('возвращает NOT_FOUND, если токен не найден', async () => {
      db.executeTakeFirst.mockResolvedValue({ numDeletedRows: 0n });

      const result = await service.logout(refreshToken);

      expect(result).toBe(HttpStatus.NOT_FOUND);
    });

    it('пробрасывает ошибку базы данных', async () => {
      db.executeTakeFirst.mockRejectedValue(
        new Error('Delete failed'),
      );

      await expect(service.logout(refreshToken)).rejects.toThrow(
        'Delete failed',
      );
    });
  });

  describe('getPayloadFromToken', () => {
    it('проверяет токен с секретом refresh-токена', async () => {
      const payload = {
        sub: 5,
        type: 'refresh',
        jti: 'token-id',
      };

      jwtService.verifyAsync.mockResolvedValue(payload);

      const result = await service.getPayloadFromToken(refreshToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        refreshToken,
        { secret: 'refresh-secret' },
      );

      expect(configService.getOrThrow).toHaveBeenCalledWith(
        'JWT_REFRESH_KEY',
      );

      expect(result).toEqual(payload);
    });

    it('пробрасывает ошибку проверки токена', async () => {
      jwtService.verifyAsync.mockRejectedValue(
        new Error('Token expired'),
      );

      await expect(
        service.getPayloadFromToken(refreshToken),
      ).rejects.toThrow('Token expired');
    });
  });

  describe('refresh', () => {
    it('обновляет токены и сохраняет новый refresh-токен', async () => {
      db.executeTakeFirst.mockResolvedValue({
        user_id: 5,
        token_hash: hashToken(refreshToken),
        revoked_at: null,
      });

      jwtService.verifyAsync.mockResolvedValue({
        sub: 5,
        type: 'refresh',
        jti: 'token-id',
      });

      db.execute.mockResolvedValue(undefined);

      const result = await service.refresh(refreshToken);

      expect(db.transaction).toHaveBeenCalled();

      expect(db.selectFrom).toHaveBeenCalledWith('refresh_tokens');
      expect(db.where).toHaveBeenCalledWith(
        'token_hash',
        '=',
        hashToken(refreshToken),
      );

      expect(db.deleteFrom).toHaveBeenCalledWith('refresh_tokens');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        refreshToken,
        { secret: 'refresh-secret' },
      );

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);

      expect(db.insertInto).toHaveBeenCalledWith('refresh_tokens');
      expect(db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 5,
          token_hash: hashToken(refreshToken),
          revoked_at: null,
        }),
      );

      expect(result).toEqual({ accessToken, refreshToken });
    });

    it('выбрасывает UnauthorizedException, если токен отсутствует в базе', async () => {
      db.executeTakeFirst.mockResolvedValue(undefined);

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException('token not found'),
      );

      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('выбрасывает UnauthorizedException при недействительном токене', async () => {
      db.executeTakeFirst.mockResolvedValue({
        user_id: 5,
        token_hash: hashToken(refreshToken),
      });

      jwtService.verifyAsync.mockRejectedValue(
        new Error('Token expired'),
      );

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );

      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('отклоняет токен с неправильным типом', async () => {
      db.executeTakeFirst.mockResolvedValue({
        user_id: 5,
        token_hash: hashToken(refreshToken),
      });

      jwtService.verifyAsync.mockResolvedValue({
        sub: 5,
        type: 'access',
      });

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        new UnauthorizedException('Invalid token type'),
      );

      expect(db.deleteFrom).toHaveBeenCalledWith('refresh_tokens');
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('пробрасывает ошибку базы данных', async () => {
      db.executeTakeFirst.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.refresh(refreshToken)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
