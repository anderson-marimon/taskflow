import { DtoValidatorPipe } from '@common/pipes/dto-validator.pipe';
import { ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import 'reflect-metadata';

/**
 * Minimal DTO used only within this spec.
 * Only `name` is decorated — any other property is undeclared.
 */
class StubDto {
  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name must not be empty' })
  name: string;
}

describe('DtoValidatorPipe', () => {
  let pipe: DtoValidatorPipe;

  beforeEach(() => {
    pipe = new DtoValidatorPipe();
  });

  const meta: ArgumentMetadata = { metatype: StubDto, type: 'body', data: '' };

  describe('stripping undeclared properties (mass-assignment hardening)', () => {
    it('strips an extra property not declared on the DTO', async () => {
      const result = await pipe.transform({ name: 'Alice', hacker: 'evil' }, meta);

      expect(result).not.toHaveProperty('hacker');
    });

    it('preserves declared properties', async () => {
      const result = await pipe.transform({ name: 'Alice', hacker: 'evil' }, meta);

      expect(result).toHaveProperty('name', 'Alice');
    });
  });

  describe('valid input (declared fields only)', () => {
    it('returns the instance without throwing', async () => {
      const result = await pipe.transform({ name: 'Alice' }, meta);

      expect(result).toHaveProperty('name', 'Alice');
    });
  });

  describe('invalid input (decorator constraint fails)', () => {
    it('throws HttpException with status 406 when a constraint fails', async () => {
      await expect(pipe.transform({ name: '' }, meta)).rejects.toBeInstanceOf(HttpException);
    });

    it('exception status is NOT_ACCEPTABLE (406)', async () => {
      try {
        await pipe.transform({ name: '' }, meta);
        fail('expected exception not thrown');
      } catch (err) {
        expect((err as HttpException).getStatus()).toBe(HttpStatus.NOT_ACCEPTABLE);
      }
    });

    it('exception response contains ok:false, statusCode 406, prefix DTO_VALIDATOR', async () => {
      try {
        await pipe.transform({ name: '' }, meta);
        fail('expected exception not thrown');
      } catch (err) {
        const response = (err as HttpException).getResponse() as any;
        expect(response.ok).toBe(false);
        expect(response.statusCode).toBe(HttpStatus.NOT_ACCEPTABLE);
        expect(response.prefix).toBe('DTO_VALIDATOR');
        expect(Array.isArray(response.errors)).toBe(true);
        expect(response.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('non-class metatype (primitive guard)', () => {
    it('returns value as-is when metatype is String', async () => {
      const result = await pipe.transform('raw-value', { metatype: String, type: 'param', data: '' });

      expect(result).toBe('raw-value');
    });

    it('returns value as-is when metatype is undefined', async () => {
      const result = await pipe.transform('raw-value', { metatype: undefined, type: 'param', data: '' });

      expect(result).toBe('raw-value');
    });
  });
});
