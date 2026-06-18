import { UserEntityBuilder } from '@features/authentication/entities/user.entity.builder';
import { User } from '@features/authentication/entities/user.entity';

describe('UserEntityBuilder', () => {
  describe('build()', () => {
    it('retorna una instancia de User cuando todos los campos están presentes', () => {
      const user = UserEntityBuilder.create().withName('Ada Lovelace').withEmail('ada@example.com').withPasswordHash('$2b$hash').build();
      expect(user).toBeInstanceOf(User);
      expect(user.name).toBe('Ada Lovelace');
      expect(user.email).toBe('ada@example.com');
      expect(user.passwordHash).toBe('$2b$hash');
    });

    it('lanza error cuando falta el campo name', () => {
      expect(() => UserEntityBuilder.create().withEmail('ada@example.com').withPasswordHash('$2b$hash').build()).toThrow();
    });

    it('lanza error cuando falta el campo email', () => {
      expect(() => UserEntityBuilder.create().withName('Ada Lovelace').withPasswordHash('$2b$hash').build()).toThrow();
    });

    it('lanza error cuando falta el campo passwordHash', () => {
      expect(() => UserEntityBuilder.create().withName('Ada Lovelace').withEmail('ada@example.com').build()).toThrow();
    });
  });
});
