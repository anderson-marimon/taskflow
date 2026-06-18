import { Inject, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { TasksService } from '@features/projects/modules/tasks/services/tasks.service';
import { ProjectSummaryDto } from '@features/projects/dtos/response/project-summary.dto';
import type { CacheStore } from '@services/cache/cache.port';
import { CACHE_STORE } from '@services/cache/cache.port';

@Injectable()
export class GetProjectSummaryUseCase {
  constructor(
    private readonly verifyProjectAccess: VerifyProjectAccessSubquery,
    @Inject(CACHE_STORE) private readonly cache: CacheStore,
    private readonly tasksService: TasksService,
  ) {}

  async execute(projectId: string, userId: string): Promise<TApiResponse> {
    try {
      const [error] = await this.verifyProjectAccess.execute(projectId, userId);
      if (error) return error;

      const key = `project-summary:${projectId}`;
      const cached = this.cache.get<ProjectSummaryDto>(key);
      if (cached) {
        return ApiResponse.create()
          .withOk(true)
          .withStatusCode(HttpStatus.OK)
          .withInternalCode(EInternalCode.OK)
          .withPrefix('PROJECTS')
          .withMessage('Resumen del proyecto')
          .withData(cached)
          .build();
      }

      const raw = await this.tasksService.aggregateSummary(projectId);
      const dto = new ProjectSummaryDto();
      dto.totalTasks = Number(raw.total);
      dto.completed = Number(raw.completed);
      dto.inProgress = Number(raw.inProgress);
      dto.pending = Number(raw.pending);
      dto.averageResolutionTimeSeconds = raw.avgResolution === null ? null : Math.round(Number(raw.avgResolution));

      this.cache.set(key, dto, 60);

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.OK)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('PROJECTS')
        .withMessage('Resumen del proyecto')
        .withData(dto)
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
