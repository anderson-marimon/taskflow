import { Inject, Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { ValidateAssigneeIsMemberSubquery } from '@features/projects/modules/tasks/subqueries/validate-assignee-is-member.subquery';
import { TaskEntityBuilder } from '@features/projects/modules/tasks/entities/task.entity.builder';
import { TasksService } from '@features/projects/modules/tasks/services/tasks.service';
import { CreateTaskDto } from '@features/projects/modules/tasks/dtos/body/create-task.dto';
import type { CacheStore } from '@services/cache/cache.port';
import { CACHE_STORE } from '@services/cache/cache.port';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    private readonly verifyProjectAccess: VerifyProjectAccessSubquery,
    private readonly validateAssigneeIsMember: ValidateAssigneeIsMemberSubquery,
    private readonly tasksService: TasksService,
    @Inject(CACHE_STORE) private readonly cache: CacheStore,
  ) {}

  async execute(projectId: string, userId: string, dto: CreateTaskDto): Promise<TApiResponse> {
    try {
      const [error] = await this.verifyProjectAccess.execute(projectId, userId);
      if (error) return error;

      if (dto.assigneeId) {
        const isValid = await this.validateAssigneeIsMember.execute(projectId, dto.assigneeId);
        if (!isValid) {
          return ApiResponse.create()
            .withOk(false)
            .withStatusCode(HttpStatus.BAD_REQUEST)
            .withInternalCode(EInternalCode.BAD_REQUEST)
            .withPrefix('TASKS')
            .withMessage('El asignado no es miembro del proyecto')
            .build();
        }
      }

      const task = TaskEntityBuilder.create()
        .withProjectId(projectId)
        .withTitle(dto.title)
        .withDescription(dto.description ?? null)
        .withStatus(dto.status ?? null)
        .withAssigneeId(dto.assigneeId ?? null)
        .build();

      const saved = await this.tasksService.save(task);
      saved.prune(['deletedAt']);
      this.cache.del(`project-summary:${projectId}`);

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.CREATED)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('TASKS')
        .withMessage('Tarea creada exitosamente')
        .withData(saved)
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
