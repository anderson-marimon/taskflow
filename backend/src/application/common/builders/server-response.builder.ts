import { TOriginError } from '@common/builders/origin-error.builder';
import { HttpStatus } from '@nestjs/common';
import { EInternalCode } from '@tools/internal-codes';

export type TApiResponse<TData = any> = {
  ok: boolean;
  statusCode: HttpStatus;
  internalCode: EInternalCode;
  prefix: string;
  message: string;
  data: TData;
  errors: TOriginError[];
};

export class ApiResponse {
  private apiResponse: Partial<TApiResponse> = {};

  public static create() {
    return new ApiResponse();
  }

  public withOk(ok: boolean): ApiResponse {
    this.apiResponse.ok = ok;
    return this;
  }

  public withStatusCode(statusCode: HttpStatus): ApiResponse {
    this.apiResponse.statusCode = statusCode;
    return this;
  }

  public withInternalCode(internalCode: EInternalCode): ApiResponse {
    this.apiResponse.internalCode = internalCode;
    return this;
  }

  public withPrefix(prefix: string): ApiResponse {
    this.apiResponse.prefix = prefix;
    return this;
  }

  public withMessage(message: string): ApiResponse {
    this.apiResponse.message = message;
    return this;
  }

  public withData(data: unknown): ApiResponse {
    this.apiResponse.data = data;
    return this;
  }

  public withErrors(errors: TOriginError[]): ApiResponse {
    this.apiResponse.errors = errors;
    return this;
  }

  public build(): TApiResponse {
    const requiredFields: (keyof TApiResponse)[] = ['ok', 'statusCode', 'internalCode', 'prefix', 'message'];

    for (const field of requiredFields) {
      if (this.apiResponse[field] === undefined) {
        throw new Error(`Falta el campo requerido para crear la respuesta de la API: ${field}`);
      }
    }

    return Object.assign(this.apiResponse);
  }
}
