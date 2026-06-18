import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponseDto } from '@common/dto/api-response.dto';

export const ApiEnvelopeResponse = (status: number, description: string, dataDto?: Type<unknown>, options?: { paginated?: boolean }) => {
  const extraModels: Type<unknown>[] = dataDto ? [ApiResponseDto, dataDto] : [ApiResponseDto];

  const buildDataShape = (): object | undefined => {
    if (!dataDto) return undefined;
    if (options?.paginated) {
      return {
        type: 'object',
        properties: {
          records: { type: 'array', items: { $ref: getSchemaPath(dataDto) } },
          total: { type: 'number' },
          page: { type: 'number' },
          size: { type: 'number' },
          totalPages: { type: 'number' },
        },
      };
    }
    return { $ref: getSchemaPath(dataDto) };
  };

  const dataShape = buildDataShape();
  const schema: object = dataShape
    ? { allOf: [{ $ref: getSchemaPath(ApiResponseDto) }, { properties: { data: dataShape } }] }
    : { $ref: getSchemaPath(ApiResponseDto) };

  return applyDecorators(ApiExtraModels(...extraModels), ApiResponse({ status, description, schema }));
};
