import { NewUser, User } from '../user/dto/user.table.js';
import { faker } from '@faker-js/faker';

import type { Kysely } from 'kysely';
import { vi } from 'vitest';
import { Database } from '../database/database.types.js';

export const makeUser = (overrides: Partial<NewUser> = {}): NewUser => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  login: `${faker.internet.username()}_${faker.string.alphanumeric(4)}`,
  password: 'hashed-password',
  age: faker.number.int({ min: 18, max: 80 }),
  description: faker.lorem.sentence(),
  deleted: false,
  ...overrides,
});

let nextId = 1;
export const makeUserRow = (overrides: Partial<User> = {}): User => ({
  id: nextId++,
  ...makeUser(),
  ...overrides,
});


type MockFunction = ReturnType<typeof vi.fn>;

export type KyselyMock = Record<string, MockFunction>;

const CHAIN_METHODS = [
  'selectFrom',
  'insertInto',
  'updateTable',
  'deleteFrom',
  'select',
  'selectAll',
  'where',
  'values',
  'set',
  'returningAll',
  'returning',
  'orderBy',
  'limit',
  'offset',
  'execute',
  'executeTakeFirst',
  'executeTakeFirstOrThrow',
];

export function createKyselyMock(): KyselyMock {
  const db: KyselyMock = {};

  for (const method of CHAIN_METHODS) {
    db[method] = vi.fn().mockReturnValue(db);
  }

  db.execute = vi.fn();
  db.executeTakeFirst = vi.fn();
  db.executeTakeFirstOrThrow = vi.fn();

  db.transaction = vi.fn().mockReturnValue({
    execute: vi.fn((callback: (trx: unknown) => unknown) => callback(db)),
  });

  return db;
}