import { OriginError } from '@common/builders/origin-error.builder';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { HttpStatus, Logger } from '@nestjs/common';
import { EInternalCode } from '@tools/internal-codes';

export function InternalError(error: unknown, debug = false): TApiResponse {
  const errorMessage = error instanceof Error ? error.message : 'error inesperado';

  Logger.error(errorMessage);

  if (debug) {
    Logger.error(error);
  }

  return ApiResponse.create()
    .withOk(false)
    .withStatusCode(HttpStatus.INTERNAL_SERVER_ERROR)
    .withInternalCode(EInternalCode.INTERNAL_SERVER_ERROR)
    .withPrefix('INTERNAL_SERVER_ERROR')
    .withMessage('Error inesperado')
    .withErrors([OriginError.create().withOrigin('server').withMessage(errorMessage).build()])
    .build();
}
