import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get, NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post, Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserPatch, UserPatchSchema } from './dto/user-patch.schema.js';
import { UserCreateDto, UserCreateSchema } from './dto/user-create.schema.js';
import { User } from './dto/user.table.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UserIdParamSchema, UserIdParamsDto, UsersListDto, UsersListSchema } from './dto/user-params.schema.js';
import { UserPatchDto } from './dto/user-patch.schema.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Получить своего пользователя',
    description: 'Возвращает вашего пользователя',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBearerAuth()
  async getMyProfile(@Req() req: { user: { id: number } }) {
    const user = await this.userService.getUserById(req.user.id);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserResponseDto })
  @ApiQuery({ name: 'id', required: true })
  @ApiOperation({
    summary: 'Получить пользователя',
    description: 'Возвращает пользователя',
  })
  async getUserById(@Query() params: UserIdParamsDto) {
    const safeParams = UserIdParamSchema.safeParse(params);
    if (!safeParams.success) throw new BadRequestException(safeParams.error.flatten());
    const user = await this.userService.getUserById(safeParams.data.id);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить всех пользователей',
    description: 'Возвращает список всех строк таблицы users',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiQuery({ name: 'login', required: false, example: 'anna_login' })
  async getAllUsers(@Query() query: UsersListDto) {
    const safeParams = UsersListSchema.safeParse(query);
    if (!safeParams.success) throw new BadRequestException(safeParams.error?.flatten());
    const { page, pageSize, login } = safeParams.data;
    const users = await this.userService.getAllUsers(page, pageSize, login);
    if (!users) throw new NotFoundException('Users not found');
    return users;
  }

  @ApiOperation({
    summary: 'Создать пользователя',
    description: 'Создаёт пользорвателя',
  })
  @Post('/create')
  @ApiOkResponse({ type: UserResponseDto })
  async CreateUser(@Body() body: UserCreateDto) {
    const result = UserCreateSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return await this.userService.createUser(result.data);
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить пользователя',
    description: 'Возвращает пользователя',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiParam({ name: 'id', required: true })
  async patchUser(@Param() params: UserIdParamsDto, @Body() body: UserPatchDto) {
    const safeParams = UserIdParamSchema.safeParse(params);
    if (!safeParams.success) throw new BadRequestException(safeParams.error.flatten());
    const safeBody = UserPatchSchema.safeParse(body);
    if (!safeBody.success) throw new BadRequestException(safeBody.error.flatten());
    const user = await this.userService.patchUser(safeBody.data, safeParams.data.id);
    return this.toPublic(user);
  }


  @ApiOperation({
    summary: 'Удалить пользвателя',
    description: 'удаляет пользователя',
  })
  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'id', required: true })
  @ApiBearerAuth()
  async deleteUserById(@Param('id') params: UserIdParamsDto) {
    const safeParams = UserIdParamSchema.safeParse(params);
    if (!safeParams.success) throw new BadRequestException(safeParams.error.flatten());
    return await this.userService.deleteUserById(safeParams.data.id);
  }

  private toPublic(user: User) {
    const { password, ...publicUser } = user;
    return publicUser;
  }
}
