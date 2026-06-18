import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';

@Injectable()
export class GetProjectUseCase {
  constructor(private readonly verifyProjectAccess: VerifyProjectAccessSubquery) {}

  async execute(projectId: string, userId: string): Promise<TApiResponse> {
    try {
      const [error, project] = await this.verifyProjectAccess.execute(projectId, userId);
      if (error) return error;

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.OK)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('PROJECTS')
        .withMessage('Proyecto obtenido exitosamente')
        .withData(project)
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
