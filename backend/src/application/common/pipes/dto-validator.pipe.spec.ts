import { DtoValidatorPipe } from '@common/pipes/dto-validator.pipe';
import { ArgumentMetadata, HttpException, HttpStatus } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import 'reflect-metadata';

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

  describe('eliminación de propiedades no declaradas (mass-assignment hardening)', () => {
    it('elimina una propiedad extra no declarada en el DTO', async () => {
      const result = await pipe.transform({ name: 'Alice', hacker: 'evil' }, meta);

      expect(result).not.toHaveProperty('hacker');
    });

    it('preserva las propiedades declaradas', async () => {
      const result = await pipe.transform({ name: 'Alice', hacker: 'evil' }, meta);

      expect(result).toHaveProperty('name', 'Alice');
    });
  });

  describe('entrada válida (solo campos declarados)', () => {
    it('retorna la instancia sin lanzar error', async () => {
      const result = await pipe.transform({ name: 'Alice' }, meta);

      expect(result).toHaveProperty('name', 'Alice');
    });
  });

  describe('entrada inválida (falla de restricción del decorador)', () => {
    it('lanza HttpException con status 406 cuando falla una restricción', async () => {
      await expect(pipe.transform({ name: '' }, meta)).rejects.toBeInstanceOf(HttpException);
    });

    it('el status de la excepción es NOT_ACCEPTABLE (406)', async () => {
      try {
        await pipe.transform({ name: '' }, meta);
        fail('expected exception not thrown');
      } catch (err) {
        expect((err as HttpException).getStatus()).toBe(HttpStatus.NOT_ACCEPTABLE);
      }
    });

    it('la respuesta de la excepción contiene ok:false, statusCode 406, prefix DTO_VALIDATOR', async () => {
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

  describe('metatipo no-clase (primitive guard)', () => {
    it('retorna el valor sin modificar cuando el metatipo es String', async () => {
      const result = await pipe.transform('raw-value', { metatype: String, type: 'param', data: '' });

      expect(result).toBe('raw-value');
    });

    it('retorna el valor sin modificar cuando el metatipo es undefined', async () => {
      const result = await pipe.transform('raw-value', { metatype: undefined, type: 'param', data: '' });

      expect(result).toBe('raw-value');
    });
  });
});
