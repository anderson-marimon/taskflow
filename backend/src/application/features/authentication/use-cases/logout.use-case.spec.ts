import { HttpStatus } from '@nestjs/common';
import { LogoutUseCase } from './logout.use-case';
import { SessionStore } from '@services/auth/session-store.port';

const mockSessionStore: SessionStore = {
  register: jest.fn(),
  isActive: jest.fn(),
  revoke: jest.fn(),
};

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LogoutUseCase(mockSessionStore);
  });

  describe('execute()', () => {
    it('revoca el jti proporcionado y sessionStore.revoke es llamado con el jti correcto', async () => {
      (mockSessionStore.revoke as jest.Mock).mockResolvedValue(undefined);
      const result = await useCase.execute('jti-activo-123');
      expect(mockSessionStore.revoke).toHaveBeenCalledWith('jti-activo-123');
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.ok).toBe(true);
    });

    it('es idempotente: dos llamadas con el mismo jti no lanzan error', async () => {
      (mockSessionStore.revoke as jest.Mock).mockResolvedValue(undefined);
      await expect(useCase.execute('jti-abc')).resolves.not.toThrow();
      await expect(useCase.execute('jti-abc')).resolves.not.toThrow();
      expect(mockSessionStore.revoke).toHaveBeenCalledTimes(2);
    });
  });
});
