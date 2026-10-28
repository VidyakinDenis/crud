import { UserController } from '../user.controller.js';
import { Test } from '@nestjs/testing';
import { UserService } from '../user.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { UsersListDto } from '../dto/user-params.schema.js';
import { UserCreateDto } from '../dto/user-create.schema.js';
import { UserPatchDto } from '../dto/user-patch.schema.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeUser, makeUserRow } from '../../shared/testFactories.js';

describe('UserController', () => {
  let controller: UserController;

  const userService = {
    getUserById: vi.fn(),
    getAllUsers: vi.fn(),
    createUser: vi.fn(),
    patchUser: vi.fn(),
    deleteUserById: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(UserController);
  });

  describe('getMyProfile', () => {
    it('возвращает профиль без пароля', async () => {
      userService.getUserById.mockResolvedValue(makeUserRow({ id: 1, login: 'denis' }));

      const result = await controller.getMyProfile({ user: { id: 1 } });

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(result).toMatchObject({ id: 1, login: 'denis' });
      expect(result).not.toHaveProperty('password');
    });

    it('404, если пользователя нет', async () => {
      userService.getUserById.mockResolvedValue(undefined);

      await expect(controller.getMyProfile({ user: { id: 1 } })).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserById', () => {
    it('возвращает пользователя без пароля', async () => {
      userService.getUserById.mockResolvedValue(makeUserRow({ id: 5 }));

      const result = await controller.getUserById(5);

      expect(userService.getUserById).toHaveBeenCalledWith(5);
      expect(result).toMatchObject({ id: 5 });
      expect(result).not.toHaveProperty('password');
    });

    it('404, если пользователя нет', async () => {
      userService.getUserById.mockResolvedValue(undefined);

      await expect(controller.getUserById(999)).rejects.toThrow(NotFoundException);
    });

    it.each([-1, 0])('400 на некорректный id (%s)', async (id) => {
      await expect(controller.getUserById(id)).rejects.toThrow(BadRequestException);
      expect(userService.getUserById).not.toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    it('передаёт page, pageSize и login в сервис', async () => {
      const users = [makeUserRow(), makeUserRow()];
      userService.getAllUsers.mockResolvedValue(users);

      const result = await controller.getAllUsers({ page: 2, pageSize: 10, login: 'anna' } as UsersListDto);

      expect(userService.getAllUsers).toHaveBeenCalledWith(2, 10, 'anna');
      expect(result).toBe(users);
    });

    it('подставляет значения по умолчанию (page=1, pageSize=20)', async () => {
      userService.getAllUsers.mockResolvedValue([]);

      await controller.getAllUsers({} as UsersListDto);

      expect(userService.getAllUsers).toHaveBeenCalledWith(1, 20, undefined);
    });

    it('приводит строки из query к числам', async () => {
      userService.getAllUsers.mockResolvedValue([]);

      await controller.getAllUsers({ page: '3', pageSize: '5' } as unknown as UsersListDto);

      expect(userService.getAllUsers).toHaveBeenCalledWith(3, 5, undefined);
    });

    it('пустой массив возвращается как есть, это не 404', async () => {
      userService.getAllUsers.mockResolvedValue([]);

      await expect(controller.getAllUsers({} as UsersListDto)).resolves.toEqual([]);
    });

    it('404, если сервис вернул undefined', async () => {
      userService.getAllUsers.mockResolvedValue(undefined);

      await expect(controller.getAllUsers({} as UsersListDto)).rejects.toThrow(NotFoundException);
    });

    it.each([
      ['page не число', { page: 'abc' }],
      ['page меньше 1', { page: 0 }],
      ['pageSize больше 100', { pageSize: 101 }],
      ['пустой login', { login: '' }],
    ])('400: %s', async (_name, query) => {
      await expect(controller.getAllUsers(query as unknown as UsersListDto)).rejects.toThrow(BadRequestException);
      expect(userService.getAllUsers).not.toHaveBeenCalled();
    });
  });

  describe('CreateUser', () => {
    it('создаёт пользователя по валидному телу', async () => {
      const created = makeUserRow({ login: 'denis' });
      userService.createUser.mockResolvedValue(created);

      const result = await controller.CreateUser(makeUser({ login: 'denis' }) as UserCreateDto);

      expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({ login: 'denis' }));
      expect(result).toBe(created);
    });

    it('подставляет deleted=false по умолчанию', async () => {
      userService.createUser.mockResolvedValue(makeUserRow());
      const { deleted, ...body } = makeUser();

      await controller.CreateUser(body as UserCreateDto);

      expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({ deleted: false }));
    });

    it.each([
      ['короткий логин', { login: 'ab' }],
      ['короткий пароль', { password: '12345' }],
      ['невалидный email', { email: 'not-an-email' }],
      ['отрицательный возраст', { age: -1 }],
      ['дробный возраст', { age: 20.5 }],
      ['слишком длинное описание', { description: 'x'.repeat(301) }],
      ['пустое имя', { name: '   ' }],
    ])('400: %s', async (_name, override) => {
      const body = makeUser(override) as UserCreateDto;

      await expect(controller.CreateUser(body)).rejects.toThrow(BadRequestException);
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('400 на пустое тело', async () => {
      await expect(controller.CreateUser({} as UserCreateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('patchUser', () => {
    it('обновляет и возвращает пользователя без пароля', async () => {
      userService.patchUser.mockResolvedValue(makeUserRow({ id: 5, name: 'New name' }));

      const result = await controller.patchUser(5, { name: 'New name' } as UserPatchDto);

      expect(userService.patchUser).toHaveBeenCalledWith({ name: 'New name' }, 5);
      expect(result).toMatchObject({ id: 5, name: 'New name' });
      expect(result).not.toHaveProperty('password');
    });

    it('обрезает пробелы в строках (trim)', async () => {
      userService.patchUser.mockResolvedValue(makeUserRow());

      await controller.patchUser(5, { name: '  Denis  ' } as UserPatchDto);

      expect(userService.patchUser).toHaveBeenCalledWith({ name: 'Denis' }, 5);
    });

    it('400 на некорректный id', async () => {
      await expect(controller.patchUser(-1, { name: 'x' } as UserPatchDto)).rejects.toThrow(BadRequestException);
      expect(userService.patchUser).not.toHaveBeenCalled();
    });

    it.each([
      ['age не число', { age: 'abc' }],
      ['age равен 0', { age: 0 }],
      ['невалидный email', { email: 'nope' }],
      ['пустое имя', { name: '' }],
    ])('400 на некорректное тело: %s', async (_name, body) => {
      await expect(controller.patchUser(5, body as unknown as UserPatchDto)).rejects.toThrow(BadRequestException);
      expect(userService.patchUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteUserById', () => {
    it('удаляет пользователя и возвращает результат сервиса', async () => {
      userService.deleteUserById.mockResolvedValue(true);

      await expect(controller.deleteUserById(5)).resolves.toBe(true);
      expect(userService.deleteUserById).toHaveBeenCalledWith(5);
    });

    it('400 на некорректный id', async () => {
      await expect(controller.deleteUserById(0)).rejects.toThrow(BadRequestException);
      expect(userService.deleteUserById).not.toHaveBeenCalled();
    });
  });
});