import { PropertiesUtil } from '@common/utils/properties.util';
import { HttpStatus } from '@nestjs/common';
import { EInternalCode } from '@tools/internal-codes';

describe('PropertiesUtil', () => {
  describe('isEmpty', () => {
    it('returns BAD_REQUEST response when object has no keys', () => {
      const result = PropertiesUtil.isEmpty({}, 'TEST_PREFIX');

      expect(result).not.toBeNull();
      expect(result!.ok).toBe(false);
      expect(result!.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result!.internalCode).toBe(EInternalCode.BAD_REQUEST);
      expect(result!.prefix).toBe('TEST_PREFIX');
    });

    it('returns null when object has at least one key', () => {
      const result = PropertiesUtil.isEmpty({ label: 'something' }, 'TEST_PREFIX');
      expect(result).toBeNull();
    });

    it('returns null with multiple keys', () => {
      const result = PropertiesUtil.isEmpty({ a: 1, b: 2, c: undefined }, 'TEST_PREFIX');
      expect(result).toBeNull();
    });
  });

  describe('cleanPropertyUtil', () => {
    it('returns value when it is a non-empty string', () => {
      expect(PropertiesUtil.cleanPropertyUtil('hello')).toBe('hello');
    });

    it('returns ownValue when string is blank/empty', () => {
      expect(PropertiesUtil.cleanPropertyUtil('  ', 'fallback')).toBe('fallback');
    });

    it('returns ownValue when value is undefined', () => {
      expect(PropertiesUtil.cleanPropertyUtil(undefined, 'fallback')).toBe('fallback');
    });

    it('returns null when value is undefined and ownValue is also undefined', () => {
      expect(PropertiesUtil.cleanPropertyUtil(undefined, undefined)).toBeNull();
    });

    it('returns value when it is a non-empty array', () => {
      expect(PropertiesUtil.cleanPropertyUtil([1, 2])).toEqual([1, 2]);
    });

    it('returns ownValue when array is empty', () => {
      expect(PropertiesUtil.cleanPropertyUtil([] as unknown, 'fallback')).toBe('fallback');
    });

    it('returns value when it is a valid Date', () => {
      const d = new Date('2024-01-01');
      expect(PropertiesUtil.cleanPropertyUtil(d)).toEqual(d);
    });

    it('returns value when it is a number (including 0)', () => {
      expect(PropertiesUtil.cleanPropertyUtil(0, 99)).toBe(0);
    });
  });
});
