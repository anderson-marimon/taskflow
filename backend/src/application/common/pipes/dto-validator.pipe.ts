import { OriginError } from '@common/builders/origin-error.builder';
import { ApiResponse } from '@common/builders/server-response.builder';
import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { EInternalCode } from '@tools/internal-codes';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class DtoValidatorPipe implements PipeTransform {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this._isClass(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object as object, { whitelist: true });

    if (errors.length > 0) {
      const response = ApiResponse.create()
        .withOk(false)
        .withStatusCode(HttpStatus.NOT_ACCEPTABLE)
        .withInternalCode(EInternalCode.NOT_ACCEPTABLE)
        .withPrefix('DTO_VALIDATOR')
        .withMessage('La petición contiene datos inválidos')
        .withErrors(this._formatErrors(errors))
        .build();

      throw new HttpException(response, HttpStatus.NOT_ACCEPTABLE);
    }

    return object;
  }

  private _isClass(metatype: unknown): boolean {
    const nativeTypes = [String, Boolean, Number, Array, Object, Date, Buffer];
    return typeof metatype === 'function' && metatype.prototype !== undefined && !nativeTypes.includes(metatype as any);
  }

  private _formatErrors(errors: ValidationError[]): { origin: string; message: string }[] {
    const formatted: { origin: string; message: string }[] = [];
    for (const error of errors) {
      formatted.push(
        OriginError.create()
          .withOrigin(error.property)
          .withMessage(Object.values(error.constraints ?? {}).join(', '))
          .build(),
      );
    }
    return formatted;
  }
}
