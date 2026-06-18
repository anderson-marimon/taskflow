import { Inject, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { HashUtil } from '@common/utils/hash.util';
import { SESSION_STORE } from '@services/auth/session-store.port';
import type { SessionStore } from '@services/auth/session-store.port';
import { EInternalCode } from '@tools/internal-codes';
import { FindUserByEmailSubquery } from '@features/authentication/subqueries/find-user-by-email.subquery';
import { LoginDto } from '@features/authentication/dtos/body/login.dto';

const INVALID_CREDENTIALS_RESPONSE = (): TApiResponse =>
  ApiResponse.create()
    .withOk(false)
    .withStatusCode(HttpStatus.UNAUTHORIZED)
    .withInternalCode(EInternalCode.UNAUTHORIZED)
    .withPrefix('AUTH')
    .withMessage('Credenciales inválidas')
    .build();

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly findUserByEmail: FindUserByEmailSubquery,
    private readonly jwtService: JwtService,
    @Inject(SESSION_STORE) private readonly sessionStore: SessionStore,
  ) {}

  async execute(dto: LoginDto): Promise<TApiResponse> {
    const user = await this.findUserByEmail.execute(dto.email);
    if (!user) return INVALID_CREDENTIALS_RESPONSE();

    const passwordMatch = HashUtil.comparePassword(dto.password, user.passwordHash);
    if (!passwordMatch) return INVALID_CREDENTIALS_RESPONSE();

    const jti = randomUUID();
    const accessToken = await this.jwtService.signAsync({ sub: user.userId, jti });
    const expiresAt = new Date(Date.now() + 86400 * 1000);
    await this.sessionStore.register(jti, user.userId, expiresAt);

    return ApiResponse.create()
      .withOk(true)
      .withStatusCode(HttpStatus.OK)
      .withInternalCode(EInternalCode.OK)
      .withPrefix('AUTH')
      .withMessage('Inicio de sesión exitoso')
      .withData({ accessToken })
      .build();
  }
}
