import { Delete, Get, Injectable, Param, Patch, Post } from '@nestjs/common';
import { UserCreate } from './dto/user-create.schema.js';
import { Database } from '../database/database.types.js';
import { Kysely } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { UserPatch } from './dto/user-patch.schema.js';
import { AuthService } from '../auth/auth.service.js';

@Injectable()
export class UserService {
  constructor(
    @InjectKysely() private readonly db: Kysely<Database>,
  ) {
  }

  async getUserById(id: number) {
    return await this.db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  };

  async getAllUsers(pageSize: number, page: number, login?: string) {

    return await this.db.transaction().execute(async (trx) => {
      let usersQuery = trx
        .selectFrom('users')
        .select(['id', 'name', 'email', 'login', 'description', 'age']);

      let countQuery = trx
        .selectFrom('users');


      if (login) {
        usersQuery = usersQuery.where('login', 'ilike', `%${login}%)`);
        countQuery = countQuery.where('login', '=', login);

      }
      const { total } = await countQuery
        .select((eb) => eb.fn.countAll<number>().as('total'))
        .executeTakeFirstOrThrow();

      const users = await usersQuery
        .orderBy('id')
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .execute();


      return {
        data: users,
        page,
        pageSize,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / pageSize),
      };
    });
  }

  async createUser(dto: UserCreate) {
    return await this.db
      .insertInto('users')
      .values(dto)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async patchUser(dto: UserPatch, id: number) {
    return await this.db
      .updateTable('users')
      .set(dto)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async deleteUserById(id: number) {
    return await this.db
      .updateTable('users')
      .set({ 'deleted': true })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getUsersByLogin(login: string) {
    return await this.db
      .selectFrom('users')
      .selectAll()
      .where('login', '=', login)
      .executeTakeFirst();
  }
}
