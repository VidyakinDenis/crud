import { HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UserCreateDto } from '../user/dto/user-create.schema.js';
import { UserLoginDto } from './dto/userLogin.schema.js';
import { RefreshTokenDto } from './dto/tokens.schema.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(userDto: UserLoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    registration(userDto: UserCreateDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: RefreshTokenDto): Promise<HttpStatus.NO_CONTENT | HttpStatus.NOT_FOUND>;
    refresh(refreshToken: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
