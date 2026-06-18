import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from '@common/builders/server-response.builder';
import { SESSION_STORE } from '@services/auth/session-store.port';
import type { SessionStore, TJwtPayload } from '@services/auth/session-store.port';
import { IS_PUBLIC_KEY } from '@decorators/public.decorator';
import { EInternalCode } from '@tools/internal-codes';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject(SESSION_STORE) private readonly sessionStore: SessionStore,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) return true;

    const request = ctx.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new HttpException(
        ApiResponse.create()
          .withOk(false)
          .withStatusCode(HttpStatus.UNAUTHORIZED)
          .withInternalCode(EInternalCode.TOKEN_MISSING)
          .withPrefix('AUTH')
          .withMessage('Token no proporcionado')
          .withData(null)
          .withErrors([])
          .build(),
        HttpStatus.UNAUTHORIZED,
      );
    }

    let payload: TJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<TJwtPayload>(token);
    } catch (err: any) {
      const isExpired = err?.name === 'TokenExpiredError';
      throw new HttpException(
        ApiResponse.create()
          .withOk(false)
          .withStatusCode(HttpStatus.UNAUTHORIZED)
          .withInternalCode(isExpired ? EInternalCode.TOKEN_EXPIRED : EInternalCode.TOKEN_INVALID)
          .withPrefix('AUTH')
          .withMessage(isExpired ? 'Token expirado' : 'Token inválido')
          .withData(null)
          .withErrors([])
          .build(),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const active = await this.sessionStore.isActive(payload.jti);
    if (!active) {
      throw new HttpException(
        ApiResponse.create()
          .withOk(false)
          .withStatusCode(HttpStatus.UNAUTHORIZED)
          .withInternalCode(EInternalCode.SESSION_REVOKED)
          .withPrefix('AUTH')
          .withMessage('Sesión revocada o inactiva')
          .withData(null)
          .withErrors([])
          .build(),
        HttpStatus.UNAUTHORIZED,
      );
    }

    request.user = payload;
    return true;
  }
}
