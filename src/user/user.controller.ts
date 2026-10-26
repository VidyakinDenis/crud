import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get, NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import type { UserPatch } from './dto/userPatch.schema.js';
import { UserCreateSchema } from './dto/userCreate.schema.js';
import { User } from './dto/user.table.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() req: { user: { sub: number } }) {
    const user = await this.userService.getUserById(req.user.sub);
    if (!user) throw new NotFoundException('User not found');
    const { password, ...publicUser }: User = user;

    return publicUser
  };

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: number) {
    const user =  await this.userService.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    const { password, ...publicUser }: User = user;

    return publicUser
  };

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getAllUsers(){
    const users =  await this.userService.getAllUsers();
    if (!users.length) throw new NotFoundException('Users not found');
    return users.map(user => {
      const { password, ...publicUser }: User = user
      return publicUser
    })
  }

  @Post("/create")
  async CreateUser(@Body() body: unknown) {
    const result = UserCreateSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return await this.userService.createUser(result.data);
  }

  @Patch("/:id")
  @UseGuards(JwtAuthGuard)
  async PatchUser(@Param("id", ParseIntPipe)id: number, dto: UserPatch){
    const user  =  await this.userService.patchUser(dto, id)
    const { password, ...publicUser }: User = user
    return publicUser
  }

  @Delete("/:id")
  @UseGuards(JwtAuthGuard)
  async deleteUserById(@Param('id') id: number) {
    return await this.userService.deleteUserById(id)
  }
}
