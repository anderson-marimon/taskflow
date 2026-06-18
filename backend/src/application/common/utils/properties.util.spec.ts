import { PropertiesUtil } from '@common/utils/properties.util';
import { HttpStatus } from '@nestjs/common';
import { EInternalCode } from '@tools/internal-codes';

describe('PropertiesUtil', () => {
  describe('isEmpty', () => {
    it('retorna respuesta BAD_REQUEST cuando el objeto no tiene propiedades', () => {
      const result = PropertiesUtil.isEmpty({}, 'TEST_PREFIX');

      expect(result).not.toBeNull();
      expect(result!.ok).toBe(false);
      expect(result!.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result!.internalCode).toBe(EInternalCode.BAD_REQUEST);
      expect(result!.prefix).toBe('TEST_PREFIX');
    });

    it('retorna null cuando el objeto tiene al menos una propiedad', () => {
      const result = PropertiesUtil.isEmpty({ label: 'something' }, 'TEST_PREFIX');
      expect(result).toBeNull();
    });

    it('retorna null cuando el objeto tiene múltiples propiedades', () => {
      const result = PropertiesUtil.isEmpty({ a: 1, b: 2, c: undefined }, 'TEST_PREFIX');
      expect(result).toBeNull();
    });
  });

  describe('cleanPropertyUtil', () => {
    it('retorna el valor cuando es un string no vacío', () => {
      expect(PropertiesUtil.cleanPropertyUtil('hello')).toBe('hello');
    });

    it('retorna ownValue cuando el string es vacío o en blanco', () => {
      expect(PropertiesUtil.cleanPropertyUtil('  ', 'fallback')).toBe('fallback');
    });

    it('retorna ownValue cuando el valor es undefined', () => {
      expect(PropertiesUtil.cleanPropertyUtil(undefined, 'fallback')).toBe('fallback');
    });

    it('retorna null cuando el valor y ownValue son ambos undefined', () => {
      expect(PropertiesUtil.cleanPropertyUtil(undefined, undefined)).toBeNull();
    });

    it('retorna el valor cuando es un array no vacío', () => {
      expect(PropertiesUtil.cleanPropertyUtil([1, 2])).toEqual([1, 2]);
    });

    it('retorna ownValue cuando el array está vacío', () => {
      expect(PropertiesUtil.cleanPropertyUtil([] as unknown, 'fallback')).toBe('fallback');
    });

    it('retorna el valor cuando es una instancia de Date válida', () => {
      const d = new Date('2024-01-01');
      expect(PropertiesUtil.cleanPropertyUtil(d)).toEqual(d);
    });

    it('retorna el valor cuando es un número, incluyendo 0', () => {
      expect(PropertiesUtil.cleanPropertyUtil(0, 99)).toBe(0);
    });
  });
});
