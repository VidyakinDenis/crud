var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, Req, UseGuards, } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserPatchSchema } from './dto/user-patch.schema.js';
import { UserCreateDto, UserCreateSchema } from './dto/user-create.schema.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UserIdParamSchema, UserIdParamsDto, UsersListDto, UsersListSchema } from './dto/user-params.schema.js';
import { UserPatchDto } from './dto/user-patch.schema.js';
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async getMyProfile(req) {
        const user = await this.userService.getUserById(req.user.id);
        if (!user)
            throw new NotFoundException('User not found');
        return this.toPublic(user);
    }
    async getUserById(params) {
        const safeParams = UserIdParamSchema.safeParse(params);
        if (!safeParams.success)
            throw new BadRequestException(safeParams.error.flatten());
        const user = await this.userService.getUserById(safeParams.data.id);
        if (!user)
            throw new NotFoundException('User not found');
        return this.toPublic(user);
    }
    async getAllUsers(query) {
        const safeParams = UsersListSchema.safeParse(query);
        if (!safeParams.success)
            throw new BadRequestException(safeParams.error?.flatten());
        const { page, pageSize, login } = safeParams.data;
        const users = await this.userService.getAllUsers(page, pageSize, login);
        if (!users)
            throw new NotFoundException('Users not found');
        return users;
    }
    async CreateUser(body) {
        const result = UserCreateSchema.safeParse(body);
        if (!result.success) {
            throw new BadRequestException(result.error.flatten());
        }
        return await this.userService.createUser(result.data);
    }
    async patchUser(params, body) {
        const safeParams = UserIdParamSchema.safeParse(params);
        if (!safeParams.success)
            throw new BadRequestException(safeParams.error.flatten());
        const safeBody = UserPatchSchema.safeParse(body);
        if (!safeBody.success)
            throw new BadRequestException(safeBody.error.flatten());
        const user = await this.userService.patchUser(safeBody.data, safeParams.data.id);
        return this.toPublic(user);
    }
    async deleteUserById(params) {
        const safeParams = UserIdParamSchema.safeParse(params);
        if (!safeParams.success)
            throw new BadRequestException(safeParams.error.flatten());
        return await this.userService.deleteUserById(safeParams.data.id);
    }
    toPublic(user) {
        const { password, ...publicUser } = user;
        return publicUser;
    }
};
__decorate([
    Get('/my'),
    UseGuards(JwtAuthGuard),
    ApiOperation({
        summary: 'Получить своего пользователя',
        description: 'Возвращает вашего пользователя',
    }),
    ApiOkResponse({ type: UserResponseDto }),
    ApiBearerAuth(),
    __param(0, Req()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMyProfile", null);
__decorate([
    Get('/:id'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOkResponse({ type: UserResponseDto }),
    ApiQuery({ name: 'id', required: true }),
    ApiOperation({
        summary: 'Получить пользователя',
        description: 'Возвращает пользователя',
    }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserIdParamsDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
__decorate([
    Get('/'),
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Получить всех пользователей',
        description: 'Возвращает список всех строк таблицы users',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'pageSize', required: false, example: 20 }),
    ApiQuery({ name: 'login', required: false, example: 'anna_login' }),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsersListDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllUsers", null);
__decorate([
    ApiOperation({
        summary: 'Создать пользователя',
        description: 'Создаёт пользорвателя',
    }),
    Post('/create'),
    ApiOkResponse({ type: UserResponseDto }),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserCreateDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "CreateUser", null);
__decorate([
    Patch('/:id'),
    ApiBearerAuth(),
    ApiOperation({
        summary: 'Получить пользователя',
        description: 'Возвращает пользователя',
    }),
    ApiOkResponse({ type: UserResponseDto }),
    ApiParam({ name: 'id', required: true }),
    __param(0, Param()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserIdParamsDto, UserPatchDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "patchUser", null);
__decorate([
    ApiOperation({
        summary: 'Удалить пользвателя',
        description: 'удаляет пользователя',
    }),
    Delete('/:id'),
    UseGuards(JwtAuthGuard),
    ApiQuery({ name: 'id', required: true }),
    ApiBearerAuth(),
    __param(0, Param('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserIdParamsDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUserById", null);
UserController = __decorate([
    Controller('users'),
    __metadata("design:paramtypes", [UserService])
], UserController);
export { UserController };
//# sourceMappingURL=user.controller.js.map