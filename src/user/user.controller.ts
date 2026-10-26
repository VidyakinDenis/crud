import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import type { UserCreate } from './dto/userCreate.schema.js';
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
    return await this.userService.getUserById(req.user.sub);
  };

  @Get('/:id')
  async getUserById(@Param('id') id: number) {
    return await this.userService.getUserById(id);
  };

  @Get('/')
  async getAllUsers(){
    return await this.userService.getAllUsers();
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
  async PatchUser(@Param("id", ParseIntPipe)id: number, dto: UserPatch){
    return await this.userService.patchUser(dto, id)
  }

  @Delete("/:id")
  async deleteUserById(@Param('id') id: number) {
    return await this.userService.deleteUserById(id)
  }
}
