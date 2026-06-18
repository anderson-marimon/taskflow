import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '@decorators/public.decorator';
import { CurrentUser, JwtPayload } from '@decorators/jwt-payload.decorator';
import type { TJwtPayload } from '@services/auth/session-store.port';
import { RegisterDto } from '@features/authentication/dtos/body/register.dto';
import { LoginDto } from '@features/authentication/dtos/body/login.dto';
import { RegisterUseCase } from '@features/authentication/use-cases/register.use-case';
import { LoginUseCase } from '@features/authentication/use-cases/login.use-case';
import { LogoutUseCase } from '@features/authentication/use-cases/logout.use-case';
import { GetProfileUseCase } from '@features/authentication/use-cases/get-profile.use-case';

@ApiTags('Authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.registerUseCase.execute(dto);
    res.status(result.statusCode).json(result);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token de acceso' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso con accessToken' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.loginUseCase.execute(dto);
    res.status(result.statusCode).json(result);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión y revocar el token actual' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 401, description: 'Token inválido o sesión inactiva' })
  async logout(@JwtPayload() payload: TJwtPayload, @Res() res: Response) {
    const result = await this.logoutUseCase.execute(payload.jti);
    res.status(result.statusCode).json(result);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Obtener datos del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Datos del usuario autenticado' })
  @ApiResponse({ status: 401, description: 'Token inválido o sesión inactiva' })
  async me(@CurrentUser() userId: string, @Res() res: Response) {
    const result = await this.getProfileUseCase.execute(userId);
    res.status(result.statusCode).json(result);
  }
}
