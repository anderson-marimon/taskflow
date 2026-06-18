import { HashUtil } from '@common/utils/hash.util';
import { PASSWORD_POLICY } from '@common/validators/password.policy';
import { isStrongPassword } from 'class-validator';

describe('HashUtil.generateTemporaryPassword', () => {
  describe('contrato estadístico (PP-R5-S2)', () => {
    it('1000 contraseñas consecutivas generadas satisfacen PASSWORD_POLICY', () => {
      const failures: string[] = [];

      for (let i = 0; i < 1000; i++) {
        const pwd = HashUtil.generateTemporaryPassword();
        if (!isStrongPassword(pwd, PASSWORD_POLICY)) {
          failures.push(pwd);
        }
      }

      expect(failures).toHaveLength(0);
    });
  });

  describe('garantía de longitud (PP-R5-S3)', () => {
    it('la llamada sin argumentos retorna una contraseña de al menos 8 caracteres', () => {
      const pwd = HashUtil.generateTemporaryPassword();
      expect(pwd.length).toBeGreaterThanOrEqual(PASSWORD_POLICY.minLength);
    });

    it('limita la longitud menor a 8 a un mínimo de 8 (PP-R5-S3)', () => {
      const pwd = HashUtil.generateTemporaryPassword(4);
      expect(pwd.length).toBeGreaterThanOrEqual(PASSWORD_POLICY.minLength);
    });

    it('respeta la longitud cuando es mayor o igual a 8 (PP-R5-S3)', () => {
      const pwd = HashUtil.generateTemporaryPassword(12);
      expect(pwd.length).toBe(12);
    });

    it('100 contraseñas generadas con length=4 (ajustado) satisfacen PASSWORD_POLICY (security-review)', () => {
      const failures: string[] = [];

      for (let i = 0; i < 100; i++) {
        const pwd = HashUtil.generateTemporaryPassword(4);
        if (!isStrongPassword(pwd, PASSWORD_POLICY)) {
          failures.push(pwd);
        }
      }

      expect(failures).toHaveLength(0);
    });
  });

  describe('cumplimiento en llamada única (PP-R5-S1)', () => {
    it('una contraseña generada satisface los cinco criterios', () => {
      const pwd = HashUtil.generateTemporaryPassword();
      expect(isStrongPassword(pwd, PASSWORD_POLICY)).toBe(true);
    });
  });
});
