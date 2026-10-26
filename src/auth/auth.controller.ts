import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { UserCreate } from '../user/dto/userCreate.schema.js';
import { UserCreateSchema } from '../user/dto/userCreate.schema.js';
import type { UserLogin } from './dto/userLogin.schema.js';
import { UserLoginSchema } from './dto/userLogin.schema.js';
import { RefreshTokenSchema } from './dto/refreshToken.shcema.js';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  async login(@Body() userDto: UserLogin) {
    const result = UserLoginSchema.safeParse(userDto);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return await this.authService.login(result.data);
  }

  @Post("/registration")
  async registration(@Body() userDto: UserCreate) {
    const result = UserCreateSchema.safeParse(userDto);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return await this.authService.registration(result.data);
  }

  @Post("/logout")
  async logout(@Body() refreshToken: string) {
    const result = RefreshTokenSchema.safeParse(refreshToken);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return await this.authService.logout(result.data.refreshToken);
  }

  @Post("/refresh")
  async refresh(@Body() refreshToken: string) {
    const result = RefreshTokenSchema.safeParse(refreshToken);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return await this.authService.refresh(result.data.refreshToken);
  }


}
