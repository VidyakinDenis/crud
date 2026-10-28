import { describe, it, expect, beforeEach } from 'vitest';
import type { Kysely } from 'kysely';
import { createKyselyMock, makeUser, makeUserRow } from '../../shared/testFactories.js';
import { UserService } from '../user.service.js';
import type { Database } from '../../database/database.types.js';
import type { UserPatch } from '../dto/user-patch.schema.js';

describe('UserService', () => {
  let db: ReturnType<typeof createKyselyMock>;
  let service: UserService;

  beforeEach(() => {
    db = createKyselyMock();
    service = new UserService(db as unknown as Kysely<Database>);
  });

  describe('getUserById', () => {
    it('возвращает пользователя по id', async () => {
      const row = makeUserRow({ id: 5 });
      db.executeTakeFirst.mockResolvedValue(row);

      const result = await service.getUserById(5);

      expect(db.selectFrom).toHaveBeenCalledWith('users');
      expect(db.selectAll).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalledWith('id', '=', 5);
      expect(db.executeTakeFirst).toHaveBeenCalled();
      expect(result).toEqual(row);
    });

    it('возвращает undefined, если пользователь не найден', async () => {
      db.executeTakeFirst.mockResolvedValue(undefined);

      const result = await service.getUserById(999);

      expect(result).toBeUndefined();
    });

    it('пробрасывает ошибку базы данных', async () => {
      const error = new Error('Database error');
      db.executeTakeFirst.mockRejectedValue(error);

      await expect(service.getUserById(5)).rejects.toThrow(error);
    });
  });

  describe('getAllUsers', () => {
    it('возвращает пользователей с пагинацией', async () => {
      const users = [
        makeUserRow({ id: 1 }),
        makeUserRow({ id: 2 }),
      ];

      db.executeTakeFirstOrThrow.mockResolvedValue({ total: 10 });
      db.execute.mockResolvedValue(users);

      const result = await service.getAllUsers(2, 1);

      expect(db.transaction).toHaveBeenCalled();
      expect(result).toEqual({
        data: users,
        page: 1,
        pageSize: 2,
        total: 10,
        totalPages: 5,
      });
    });

    it('применяет фильтр по login', async () => {
      const users = [makeUserRow({ id: 1, login: 'john' })];

      db.executeTakeFirstOrThrow.mockResolvedValue({ total: 1 });
      db.execute.mockResolvedValue(users);

      const result = await service.getAllUsers(10, 1, 'john');

      expect(db.where).toHaveBeenCalledWith(
        'login',
        'ilike',
        '%john%)',
      );
      expect(db.where).toHaveBeenCalledWith('login', '=', 'john');
      expect(result.data).toEqual(users);
    });

    it('рассчитывает offset для второй страницы', async () => {
      db.executeTakeFirstOrThrow.mockResolvedValue({ total: 25 });
      db.execute.mockResolvedValue([]);

      await service.getAllUsers(10, 2);

      expect(db.limit).toHaveBeenCalledWith(10);
      expect(db.offset).toHaveBeenCalledWith(10);
      expect(db.orderBy).toHaveBeenCalledWith('id');
    });

    it('возвращает ноль страниц, если пользователей нет', async () => {
      db.executeTakeFirstOrThrow.mockResolvedValue({ total: 0 });
      db.execute.mockResolvedValue([]);

      const result = await service.getAllUsers(10, 1);

      expect(result).toEqual({
        data: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it('округляет количество страниц вверх', async () => {
      db.executeTakeFirstOrThrow.mockResolvedValue({ total: 11 });
      db.execute.mockResolvedValue([]);

      const result = await service.getAllUsers(5, 1);

      expect(result.totalPages).toBe(3);
    });

    it('пробрасывает ошибку при получении количества пользователей', async () => {
      const error = new Error('Count query failed');
      db.executeTakeFirstOrThrow.mockRejectedValue(error);

      await expect(service.getAllUsers(10, 1)).rejects.toThrow(error);
    });
  });

  describe('createUser', () => {
    it('создаёт пользователя и возвращает созданную строку', async () => {
      const user = makeUser();
      const userRow = makeUserRow();

      db.executeTakeFirstOrThrow.mockResolvedValue(userRow);

      const result = await service.createUser(user);

      expect(db.insertInto).toHaveBeenCalledWith('users');
      expect(db.values).toHaveBeenCalledWith(user);
      expect(db.returningAll).toHaveBeenCalled();
      expect(db.executeTakeFirstOrThrow).toHaveBeenCalled();
      expect(result).toEqual(userRow);
    });

    it('пробрасывает ошибку при создании пользователя', async () => {
      const error = new Error('Insert failed');
      db.executeTakeFirstOrThrow.mockRejectedValue(error);

      await expect(service.createUser(makeUser())).rejects.toThrow(error);
    });
  });

  describe('patchUser', () => {
    it('обновляет пользователя и возвращает обновлённую строку', async () => {
      const id = 5;
      const dto = {
        name: 'Updated name',
      } as UserPatch;
      const updatedUser = makeUserRow({ id, name: 'Updated name' });

      db.executeTakeFirstOrThrow.mockResolvedValue(updatedUser);

      const result = await service.patchUser(dto, id);

      expect(db.updateTable).toHaveBeenCalledWith('users');
      expect(db.set).toHaveBeenCalledWith(dto);
      expect(db.where).toHaveBeenCalledWith('id', '=', id);
      expect(db.returningAll).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('пробрасывает ошибку при обновлении пользователя', async () => {
      const error = new Error('Update failed');
      db.executeTakeFirstOrThrow.mockRejectedValue(error);

      await expect(
        service.patchUser({ name: 'Updated name' } as UserPatch, 5),
      ).rejects.toThrow(error);
    });
  });

  describe('deleteUserById', () => {
    it('помечает пользователя удалённым и возвращает обновлённую строку', async () => {
      const deletedUser = makeUserRow({ id: 5, deleted: true });
      db.executeTakeFirstOrThrow.mockResolvedValue(deletedUser);

      const result = await service.deleteUserById(5);

      expect(db.updateTable).toHaveBeenCalledWith('users');
      expect(db.set).toHaveBeenCalledWith({ deleted: true });
      expect(db.where).toHaveBeenCalledWith('id', '=', 5);
      expect(db.returningAll).toHaveBeenCalled();
      expect(result).toEqual(deletedUser);
    });

    it('пробрасывает ошибку, если удаление не удалось', async () => {
      const error = new Error('Delete failed');
      db.executeTakeFirstOrThrow.mockRejectedValue(error);

      await expect(service.deleteUserById(999)).rejects.toThrow(error);
    });
  });

  describe('getUsersByLogin', () => {
    it('возвращает пользователя по login', async () => {
      const user = makeUserRow({ login: 'john' });
      db.executeTakeFirst.mockResolvedValue(user);

      const result = await service.getUsersByLogin('john');

      expect(db.selectFrom).toHaveBeenCalledWith('users');
      expect(db.selectAll).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalledWith('login', '=', 'john');
      expect(result).toEqual(user);
    });

    it('возвращает undefined, если пользователь с таким login не найден', async () => {
      db.executeTakeFirst.mockResolvedValue(undefined);

      const result = await service.getUsersByLogin('unknown');

      expect(result).toBeUndefined();
    });

    it('пробрасывает ошибку при поиске пользователя', async () => {
      const error = new Error('Select failed');
      db.executeTakeFirst.mockRejectedValue(error);

      await expect(service.getUsersByLogin('john')).rejects.toThrow(error);
    });
  });
});
