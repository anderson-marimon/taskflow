import { SessionEntityBuilder } from '@features/authentication/entities/session.entity.builder';
import { Session } from '@features/authentication/entities/session.entity';

describe('SessionEntityBuilder', () => {
  describe('build()', () => {
    it('retorna una instancia de Session cuando todos los campos están presentes', () => {
      const expiresAt = new Date();
      const session = SessionEntityBuilder.create().withJti('some-jti-uuid').withUserId('user-uuid').withExpiresAt(expiresAt).build();
      expect(session).toBeInstanceOf(Session);
      expect(session.jti).toBe('some-jti-uuid');
      expect(session.userId).toBe('user-uuid');
      expect(session.expiresAt).toBe(expiresAt);
    });

    it('lanza error cuando falta el campo jti', () => {
      expect(() => SessionEntityBuilder.create().withUserId('user-uuid').withExpiresAt(new Date()).build()).toThrow();
    });

    it('lanza error cuando falta el campo userId', () => {
      expect(() => SessionEntityBuilder.create().withJti('some-jti-uuid').withExpiresAt(new Date()).build()).toThrow();
    });

    it('lanza error cuando falta el campo expiresAt', () => {
      expect(() => SessionEntityBuilder.create().withJti('some-jti-uuid').withUserId('user-uuid').build()).toThrow();
    });
  });
});
