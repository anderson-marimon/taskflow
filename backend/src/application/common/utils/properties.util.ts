import { OriginError } from '@common/builders/origin-error.builder';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { HttpStatus } from '@nestjs/common';
import { EInternalCode } from '@tools/internal-codes';

export class PropertiesUtil {
  public static isEmpty(object: Record<string, any>, prefix: string): Nullable<TApiResponse> {
    const properties = Object.keys(object);

    if (properties.length === 0) {
      return ApiResponse.create()
        .withOk(false)
        .withStatusCode(HttpStatus.BAD_REQUEST)
        .withInternalCode(EInternalCode.BAD_REQUEST)
        .withPrefix(prefix)
        .withMessage('No se enviaron propiedades para actualizar')
        .withErrors([OriginError.create().withOrigin('properties').withMessage('Para actualizar una cita se deben enviar propiedades').build()])
        .build();
    }

    return null;
  }

  public static cleanPropertyUtil<T = any>(value?: T, ownValue?: T): Nullable<T> {
    if (typeof value === 'string') {
      return value.trim() !== '' ? value : ownValue !== undefined ? ownValue : null;
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value : ownValue !== undefined ? ownValue : null;
    }

    if (value instanceof Date) {
      return value.getTime() > 0 ? value : ownValue !== undefined ? ownValue : null;
    }

    return value !== undefined && value !== null ? value : ownValue !== undefined ? ownValue : null;
  }
}
