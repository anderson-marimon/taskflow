import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { ProjectsService } from '@features/projects/services/projects.service';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    private readonly verifyProjectAccess: VerifyProjectAccessSubquery,
    private readonly projectsService: ProjectsService,
  ) {}

  async execute(projectId: string, userId: string): Promise<TApiResponse> {
    try {
      const [error, project] = await this.verifyProjectAccess.execute(projectId, userId);
      if (error) return error;

      if (project!.ownerId !== userId) {
        return ApiResponse.create()
          .withOk(false)
          .withStatusCode(HttpStatus.FORBIDDEN)
          .withInternalCode(EInternalCode.FORBIDDEN)
          .withPrefix('PROJECTS')
          .withMessage('Solo el propietario puede eliminar el proyecto')
          .withData(null)
          .withErrors([])
          .build();
      }

      const deleted = await this.projectsService.softRemove(project!);

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.OK)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('PROJECTS')
        .withMessage('Proyecto eliminado exitosamente')
        .withData(deleted)
        .withErrors([])
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
