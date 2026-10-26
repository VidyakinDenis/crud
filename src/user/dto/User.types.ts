import { User } from './user.table.js';

export type TPublicUser = Omit<User, 'password'>;