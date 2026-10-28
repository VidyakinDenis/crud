import { UserService } from './user.service.js';
import { UserCreateDto } from './dto/user-create.schema.js';
import { UserIdParamsDto, UsersListDto } from './dto/user-params.schema.js';
import { UserPatchDto } from './dto/user-patch.schema.js';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getMyProfile(req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        name: string;
        email: string;
        age: number;
        login: string;
        description: string;
        deleted: boolean;
    }>;
    getUserById(params: UserIdParamsDto): Promise<{
        id: number;
        name: string;
        email: string;
        age: number;
        login: string;
        description: string;
        deleted: boolean;
    }>;
    getAllUsers(query: UsersListDto): Promise<{
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
    CreateUser(body: UserCreateDto): Promise<{
        [x: string]: any;
    }>;
    patchUser(params: UserIdParamsDto, body: UserPatchDto): Promise<{
        id: number;
        name: string;
        email: string;
        age: number;
        login: string;
        description: string;
        deleted: boolean;
    }>;
    deleteUserById(params: UserIdParamsDto): Promise<{
        [x: string]: any;
    }>;
    private toPublic;
}
