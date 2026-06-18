import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { SessionStore } from '@services/auth/session-store.port';
import { EInternalCode } from '@tools/internal-codes';

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

const mockJwtService = {
  verifyAsync: jest.fn(),
};

const mockSessionStore: SessionStore = {
  register: jest.fn(),
  isActive: jest.fn(),
  revoke: jest.fn(),
};

function buildContext(authHeader?: string, isPublic = false) {
  mockReflector.getAllAndOverride.mockReturnValue(isPublic);
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ headers: { authorization: authHeader }, user: undefined }),
    }),
  } as any;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new JwtAuthGuard(mockReflector as any, mockJwtService as any, mockSessionStore);
  });

  describe('canActivate()', () => {
    it('ruta marcada como pública retorna verdadero sin verificar token', async () => {
      const ctx = buildContext(undefined, true);
      const result = await guard.canActivate(ctx);
      expect(result).toBe(true);
      expect(mockJwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it('sin header Authorization lanza HttpException 401 con código TOKEN_MISSING', async () => {
      const ctx = buildContext(undefined, false);
      await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
      try {
        await guard.canActivate(ctx);
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(err.getResponse().internalCode).toBe(EInternalCode.TOKEN_MISSING);
      }
    });

    it('JWT con firma inválida lanza HttpException 401 con código TOKEN_INVALID', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));
      const ctx = buildContext('Bearer invalid.token.here', false);
      await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
      try {
        await guard.canActivate(ctx);
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(err.getResponse().internalCode).toBe(EInternalCode.TOKEN_INVALID);
      }
    });

    it('JWT expirado lanza HttpException 401 con código TOKEN_EXPIRED', async () => {
      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      mockJwtService.verifyAsync.mockRejectedValue(expiredError);
      const ctx = buildContext('Bearer expired.token.here', false);
      await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
      try {
        await guard.canActivate(ctx);
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(err.getResponse().internalCode).toBe(EInternalCode.TOKEN_EXPIRED);
      }
    });

    it('jti revocado lanza HttpException 401 con código SESSION_REVOKED', async () => {
      const payload = { sub: 'user-id', jti: 'revoked-jti', iat: 1000, exp: 9999 };
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      (mockSessionStore.isActive as jest.Mock).mockResolvedValue(false);
      const ctx = buildContext('Bearer valid.token.here', false);
      await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
      try {
        await guard.canActivate(ctx);
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
        expect(err.getResponse().internalCode).toBe(EInternalCode.SESSION_REVOKED);
      }
    });

    it('token válido y jti activo adjunta payload a request.user y retorna verdadero', async () => {
      const payload = { sub: 'user-id', jti: 'active-jti', iat: 1000, exp: 9999 };
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      (mockSessionStore.isActive as jest.Mock).mockResolvedValue(true);
      const request: any = { headers: { authorization: 'Bearer valid.token.here' }, user: undefined };
      mockReflector.getAllAndOverride.mockReturnValue(false);
      const ctx = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({ getRequest: () => request }),
      } as any;
      const result = await guard.canActivate(ctx);
      expect(result).toBe(true);
      expect(request.user).toEqual(payload);
    });
  });
});
