import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UserCreate, UserCreateDto } from '../user/dto/user-create.schema.js';
import { UserCreateSchema } from '../user/dto/user-create.schema.js';
import { UserLogin, UserLoginDto } from './dto/userLogin.schema.js';
import { UserLoginSchema } from './dto/userLogin.schema.js';
import { RefreshTokenDto, RefreshTokenSchema, TokensPairDto } from './dto/tokens.schema.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserResponseDto } from '../user/dto/user-response.dto.js';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post("/login")
  @ApiOkResponse({ type: UserLoginDto })
  @ApiOperation({
    summary: 'получить токены',
    description: 'Возвращает пару токенов',
  })
  async login(@Body() userDto: UserLoginDto) {
    const result = UserLoginSchema.safeParse(userDto);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return await this.authService.login(result.data);
  }

  @Post("/registration")
  @ApiOkResponse({ type: TokensPairDto })
  @ApiOperation({
    summary: 'Зарегестрировать пользователя',
    description: 'Возвращает пару токенов',
  })
  async registration(@Body() userDto: UserCreateDto) {
    const result = UserCreateSchema.safeParse(userDto);
    if (!result.success) {
      throw new BadRequestException(result.error.flatten());
    }
    return await this.authService.registration(result.data);
  }


  @Post("/logout")
  @ApiNoContentResponse({ description: 'Токен отозван' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Деавторизировать пользоватекля',
    description: 'отзывает рефреш токен',
  })
  async logout(@Body() refreshToken: RefreshTokenDto) {
    const result = RefreshTokenSchema.safeParse(refreshToken);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return await this.authService.logout(result.data.refreshToken);
  }

  @Post("/refresh")
  @ApiOkResponse({ type: TokensPairDto })
  @ApiOperation({
    summary: 'получить токены',
    description: 'Возвращает пару токенов и отзывает полученный рефреш',
  })
  async refresh(@Body() refreshToken: RefreshTokenDto) {
    const result = RefreshTokenSchema.safeParse(refreshToken);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return await this.authService.refresh(result.data.refreshToken);
  }


}
