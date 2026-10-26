import { Delete, Get, Injectable, Param, Patch, Post } from '@nestjs/common';
import { UserCreate } from './dto/userCreate.schema.js';
import { Database } from '../database/database.types.js';
import { Kysely } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { UserPatch } from './dto/userPatch.schema.js';
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

  async getAllUsers(){
    return await this.db
      .selectFrom('users')
      .selectAll()
      .execute();
  }

  // return this.userService.getUserById(id);

  async createUser(dto:UserCreate){
    return await this.db
      .insertInto('users')
      .values(dto)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async patchUser(dto: UserPatch, id: number){
    return await this.db
      .updateTable('users')
      .set(dto)
      .where("id",'=',id)
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  async deleteUserById(id: number){
    return await this.db
      .deleteFrom("users")
      .where("id","=", id)
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  async getUsersByLogin(login: string){
    return await this.db
      .selectFrom('users')
      .selectAll()
      .where('login', '=', login)
      .executeTakeFirst();
  }
}
