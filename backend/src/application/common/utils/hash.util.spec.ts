import { HashUtil } from '@common/utils/hash.util';
import { PASSWORD_POLICY } from '@common/validators/password.policy';
import { isStrongPassword } from 'class-validator';

describe('HashUtil.generateTemporaryPassword', () => {
  describe('statistical contract (PP-R5-S2)', () => {
    it('all 1000 consecutive generated passwords satisfy PASSWORD_POLICY', () => {
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

  describe('length guarantee (PP-R5-S3)', () => {
    it('default call returns a password of at least 8 characters', () => {
      const pwd = HashUtil.generateTemporaryPassword();
      expect(pwd.length).toBeGreaterThanOrEqual(PASSWORD_POLICY.minLength);
    });

    it('clamps length < 8 to 8 (PP-R5-S3)', () => {
      const pwd = HashUtil.generateTemporaryPassword(4);
      expect(pwd.length).toBeGreaterThanOrEqual(PASSWORD_POLICY.minLength);
    });

    it('respects length >= 8 (PP-R5-S3)', () => {
      const pwd = HashUtil.generateTemporaryPassword(12);
      expect(pwd.length).toBe(12);
    });

    it('all 100 passwords generated with length=4 (clamped) satisfy PASSWORD_POLICY (security-review)', () => {
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

  describe('single call compliance (PP-R5-S1)', () => {
    it('a single generated password satisfies all five criteria', () => {
      const pwd = HashUtil.generateTemporaryPassword();
      expect(isStrongPassword(pwd, PASSWORD_POLICY)).toBe(true);
    });
  });
});
