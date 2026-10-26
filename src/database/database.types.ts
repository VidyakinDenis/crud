import { UserTable } from '../user/dto/user.table.js';
import { RefreshTokensTable } from '../auth/refresh_tokens.table.js';

export type Database = {
  users: UserTable
  refresh_tokens: RefreshTokensTable
}