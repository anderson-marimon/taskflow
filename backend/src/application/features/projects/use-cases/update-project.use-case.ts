import { Inject, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { ProjectsService } from '@features/projects/services/projects.service';
import { UpdateProjectDto } from '@features/projects/dtos/body/update-project.dto';
import type { CacheStore } from '@services/cache/cache.port';
import { CACHE_STORE } from '@services/cache/cache.port';

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    private readonly verifyProjectAccess: VerifyProjectAccessSubquery,
    private readonly projectsService: ProjectsService,
    @Inject(CACHE_STORE) private readonly cache: CacheStore,
  ) {}

  async execute(projectId: string, userId: string, dto: UpdateProjectDto): Promise<TApiResponse> {
    try {
      const [error, project] = await this.verifyProjectAccess.execute(projectId, userId);
      if (error) return error;

      project!.update(dto);
      const saved = await this.projectsService.save(project!);
      this.cache.del(`project-summary:${projectId}`);

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.OK)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('PROJECTS')
        .withMessage('Proyecto actualizado exitosamente')
        .withData(saved)
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
