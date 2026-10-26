import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { z } from 'zod';

export interface UserTable {
  id: Generated<number>,
  name: string,
  email: string,
  password: string,
  age: number,
  login: string,
  description: string,
  deleted: boolean
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;