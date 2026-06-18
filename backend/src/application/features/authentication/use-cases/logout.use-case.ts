import { Inject, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { SESSION_STORE, SessionStore } from '@services/auth/session-store.port';
import { EInternalCode } from '@tools/internal-codes';

@Injectable()
export class LogoutUseCase {
  constructor(@Inject(SESSION_STORE) private readonly sessionStore: SessionStore) {}

  async execute(jti: string): Promise<TApiResponse> {
    await this.sessionStore.revoke(jti);
    return ApiResponse.create()
      .withOk(true)
      .withStatusCode(HttpStatus.OK)
      .withInternalCode(EInternalCode.OK)
      .withPrefix('AUTH')
      .withMessage('Sesión cerrada exitosamente')
      .withData(null)
      .withErrors([])
      .build();
  }
}
