import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { ApiEnvelopeResponse } from '@common/decorators/api-envelope-response.decorator';
import { UserResponseDto } from '@features/authentication/dtos/response/user-response.dto';
import { TokenResponseDto } from '@features/authentication/dtos/response/token-response.dto';

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
  @ApiEnvelopeResponse(201, 'Usuario registrado exitosamente', UserResponseDto)
  @ApiEnvelopeResponse(406, 'Datos de entrada inválidos')
  @ApiEnvelopeResponse(409, 'El email ya está registrado')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.registerUseCase.execute(dto);
    res.status(result.statusCode).json(result);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener token de acceso' })
  @ApiEnvelopeResponse(200, 'Inicio de sesión exitoso', TokenResponseDto)
  @ApiEnvelopeResponse(401, 'Credenciales inválidas')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.loginUseCase.execute(dto);
    res.status(result.statusCode).json(result);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión y revocar el token actual' })
  @ApiEnvelopeResponse(200, 'Sesión cerrada exitosamente')
  @ApiEnvelopeResponse(401, 'Token inválido o sesión inactiva')
  async logout(@JwtPayload() payload: TJwtPayload, @Res() res: Response) {
    const result = await this.logoutUseCase.execute(payload.jti);
    res.status(result.statusCode).json(result);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Obtener datos del usuario autenticado' })
  @ApiEnvelopeResponse(200, 'Datos del usuario autenticado', UserResponseDto)
  @ApiEnvelopeResponse(401, 'Token inválido o sesión inactiva')
  async me(@CurrentUser() userId: string, @Res() res: Response) {
    const result = await this.getProfileUseCase.execute(userId);
    res.status(result.statusCode).json(result);
  }
}
