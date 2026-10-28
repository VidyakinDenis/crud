import { UserCreate } from './dto/user-create.schema.js';
import { Database } from '../database/database.types.js';
import { Kysely } from 'kysely';
import { UserPatch } from './dto/user-patch.schema.js';
export declare class UserService {
    private readonly db;
    constructor(db: Kysely<Database>);
    getUserById(id: number): Promise<{
        [x: string]: any;
    } | undefined>;
    getAllUsers(pageSize: number, page: number, login?: string): Promise<{
        data: {
            id: any;
            name: any;
            email: any;
            age: any;
            login: any;
            description: any;
        }[];
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    }>;
    createUser(dto: UserCreate): Promise<{
        [x: string]: any;
    }>;
    patchUser(dto: UserPatch, id: number): Promise<{
        [x: string]: any;
    }>;
    deleteUserById(id: number): Promise<{
        [x: string]: any;
    }>;
    getUsersByLogin(login: string): Promise<{
        [x: string]: any;
    } | undefined>;
}
