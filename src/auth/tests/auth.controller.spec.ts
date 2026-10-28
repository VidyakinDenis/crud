import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException, HttpStatus, UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from '../auth.controller.js';
import { AuthService } from '../auth.service.js';
import type { UserCreateDto } from '../../user/dto/user-create.schema.js';
import type { UserLoginDto } from '../dto/userLogin.schema.js';
import type { RefreshTokenDto } from '../dto/tokens.schema.js';
import { makeUser } from '../../shared/testFactories.js';

describe('AuthController', () => {
  let controller: AuthController;

  const authService = {
    login: vi.fn(),
    registration: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  };

  const tokens = { accessToken: 'access.jwt', refreshToken: 'refresh.jwt' };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  describe('login', () => {
    it('передаёт данные в сервис и возвращает токены', async () => {
      authService.login.mockResolvedValue(tokens);

      const result = await controller.login({ login: 'denis', password: 'secret123' } as UserLoginDto);

      expect(authService.login).toHaveBeenCalledWith({ login: 'denis', password: 'secret123' });
      expect(result).toEqual(tokens);
    });

    it('пробрасывает 401 от сервиса (неверный логин или пароль)', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException());

      await expect(
        controller.login({ login: 'denis', password: 'wrong' } as UserLoginDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it.each([
      ['пустое тело', {}],
      ['нет пароля', { login: 'denis' }],
      ['нет логина', { password: 'secret123' }],
      ['логин не строка', { login: 123, password: 'secret123' }],
    ])('400: %s', async (_name, body) => {
      await expect(controller.login(body as unknown as UserLoginDto)).rejects.toThrow(BadRequestException);
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('registration', () => {
    it('регистрирует пользователя и возвращает токены', async () => {
      authService.registration.mockResolvedValue(tokens);

      const result = await controller.registration(makeUser({ login: 'denis' }) as UserCreateDto);

      expect(authService.registration).toHaveBeenCalledWith(expect.objectContaining({ login: 'denis' }));
      expect(result).toEqual(tokens);
    });

    it('подставляет deleted=false по умолчанию', async () => {
      authService.registration.mockResolvedValue(tokens);
      const { deleted, ...body } = makeUser();

      await controller.registration(body as UserCreateDto);

      expect(authService.registration).toHaveBeenCalledWith(expect.objectContaining({ deleted: false }));
    });

    it('пробрасывает 409, если логин занят', async () => {
      authService.registration.mockRejectedValue(new ConflictException());

      await expect(controller.registration(makeUser() as UserCreateDto)).rejects.toThrow(ConflictException);
    });

    it.each([
      ['короткий логин', { login: 'ab' }],
      ['короткий пароль', { password: '12345' }],
      ['невалидный email', { email: 'not-an-email' }],
      ['отрицательный возраст', { age: -1 }],
    ])('400: %s', async (_name, override) => {
      await expect(
        controller.registration(makeUser(override) as UserCreateDto),
      ).rejects.toThrow(BadRequestException);
      expect(authService.registration).not.toHaveBeenCalled();
    });

    it('400 на пустое тело', async () => {
      await expect(controller.registration({} as UserCreateDto)).rejects.toThrow(BadRequestException);
      expect(authService.registration).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('передаёт refresh-токен в сервис', async () => {
      authService.logout.mockResolvedValue(HttpStatus.NO_CONTENT);

      await controller.logout({ refreshToken: 'refresh.jwt' } as RefreshTokenDto);

      expect(authService.logout).toHaveBeenCalledWith('refresh.jwt');
    });

    it.each([
      ['пустое тело', {}],
      ['токен не строка', { refreshToken: 123 }],
    ])('400: %s', async (_name, body) => {
      await expect(controller.logout(body as unknown as RefreshTokenDto)).rejects.toThrow(BadRequestException);
      expect(authService.logout).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('передаёт токен в сервис и возвращает новую пару', async () => {
      const newTokens = { accessToken: 'new.access', refreshToken: 'new.refresh' };
      authService.refresh.mockResolvedValue(newTokens);

      const result = await controller.refresh({ refreshToken: 'refresh.jwt' } as RefreshTokenDto);

      expect(authService.refresh).toHaveBeenCalledWith('refresh.jwt');
      expect(result).toEqual(newTokens);
    });

    it('пробрасывает 401 от сервиса (токен не найден или невалиден)', async () => {
      authService.refresh.mockRejectedValue(new UnauthorizedException('token not found'));

      await expect(
        controller.refresh({ refreshToken: 'bad' } as RefreshTokenDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it.each([
      ['пустое тело', {}],
      ['токен не строка', { refreshToken: 123 }],
    ])('400: %s', async (_name, body) => {
      await expect(controller.refresh(body as unknown as RefreshTokenDto)).rejects.toThrow(BadRequestException);
      expect(authService.refresh).not.toHaveBeenCalled();
    });
  });
});