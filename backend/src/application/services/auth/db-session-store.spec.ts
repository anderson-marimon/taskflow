import { DbSessionStore } from './db-session-store';
import { Session } from '@features/authentication/entities/session.entity';
import { Repository } from 'typeorm';

describe('DbSessionStore', () => {
  let store: DbSessionStore;
  let repo: jest.Mocked<Pick<Repository<Session>, 'findOne' | 'save' | 'update'>>;

  beforeEach(() => {
    repo = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    store = new DbSessionStore(repo as any);
  });

  describe('register', () => {
    it('crea sesión en el repositorio con el jti dado', async () => {
      repo.save.mockResolvedValue({} as Session);
      await store.register('jti-123', 'user-456', new Date('2030-01-01'));
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ jti: 'jti-123', userId: 'user-456' }),
      );
    });
  });

  describe('isActive', () => {
    it('retorna verdadero si revokedAt es null, expiresAt en el futuro y deletedAt es null', async () => {
      repo.findOne.mockResolvedValue({
        jti: 'jti-123',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400 * 1000),
        deletedAt: null,
      } as Session);
      const result = await store.isActive('jti-123');
      expect(result).toBe(true);
    });

    it('retorna falso si revokedAt no es null', async () => {
      repo.findOne.mockResolvedValue({
        jti: 'jti-123',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400 * 1000),
        deletedAt: null,
      } as Session);
      const result = await store.isActive('jti-123');
      expect(result).toBe(false);
    });

    it('retorna falso si expiresAt está en el pasado', async () => {
      repo.findOne.mockResolvedValue({
        jti: 'jti-123',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
        deletedAt: null,
      } as Session);
      const result = await store.isActive('jti-123');
      expect(result).toBe(false);
    });

    it('retorna falso si deletedAt no es null (soft-deleted)', async () => {
      repo.findOne.mockResolvedValue({
        jti: 'jti-123',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400 * 1000),
        deletedAt: new Date(),
      } as Session);
      const result = await store.isActive('jti-123');
      expect(result).toBe(false);
    });

    it('retorna falso si jti no existe en DB', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await store.isActive('jti-inexistente');
      expect(result).toBe(false);
    });
  });

  describe('revoke', () => {
    it('actualiza revokedAt al momento actual', async () => {
      repo.update.mockResolvedValue({ affected: 1 } as any);
      await store.revoke('jti-123');
      expect(repo.update).toHaveBeenCalledWith({ jti: 'jti-123' }, expect.objectContaining({ revokedAt: expect.any(Date) }));
    });
  });
});
