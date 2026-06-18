import { PASSWORD_POLICY } from '@common/validators/password.policy';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';

export class HashUtil {
  private static readonly SALT_ROUNDS = 10;

  public static hashPassword(password: string): string {
    return bcrypt.hashSync(password, this.SALT_ROUNDS);
  }

  public static sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  public static comparePassword(password: string, storedHash: string): boolean {
    if (storedHash.startsWith('$2')) {
      return bcrypt.compareSync(password, storedHash);
    }

    if (storedHash.length === 64) {
      const legacyHash = createHash('sha256').update(password).digest('hex');
      return legacyHash === storedHash;
    }

    return false;
  }

  public static getEncoderName(): string {
    return 'bcrypt';
  }

  public static generateTemporaryPassword(length: number = 12): string {
    const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const LOWER = 'abcdefghijklmnopqrstuvwxyz';
    const DIGITS = '0123456789';
    const SYMBOLS = '!@#$%&*';
    const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

    const len = Math.max(length, PASSWORD_POLICY.minLength);
    const chars: string[] = [];

    for (let i = 0; i < PASSWORD_POLICY.minUppercase; i++) {
      chars.push(UPPER.charAt(randomInt(UPPER.length)));
    }
    for (let i = 0; i < PASSWORD_POLICY.minLowercase; i++) {
      chars.push(LOWER.charAt(randomInt(LOWER.length)));
    }
    for (let i = 0; i < PASSWORD_POLICY.minNumbers; i++) {
      chars.push(DIGITS.charAt(randomInt(DIGITS.length)));
    }
    for (let i = 0; i < PASSWORD_POLICY.minSymbols; i++) {
      chars.push(SYMBOLS.charAt(randomInt(SYMBOLS.length)));
    }

    const remaining = len - chars.length;
    for (let i = 0; i < remaining; i++) {
      chars.push(ALL.charAt(randomInt(ALL.length)));
    }

    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
  }
}
