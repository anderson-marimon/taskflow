import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { PaginatorDto } from '@common/dto/paginator.dto';
import { Task } from '@features/projects/modules/tasks/entities/task.entity';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { TasksService } from '@features/projects/modules/tasks/services/tasks.service';

@Injectable()
export class ListTasksUseCase {
  constructor(
    private readonly verifyProjectAccess: VerifyProjectAccessSubquery,
    private readonly tasksService: TasksService,
  ) {}

  async execute(projectId: string, userId: string, dto: PaginatorDto): Promise<TApiResponse> {
    try {
      const [error] = await this.verifyProjectAccess.execute(projectId, userId);
      if (error) return error;

      const { page, size } = dto;

      const [records, total] = await this.tasksService.repo
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.assignee', 'assignee')
        .where('task.project_id = :projectId', { projectId })
        .skip((page - 1) * size)
        .take(size)
        .getManyAndCount();

      const pagination: TPagination<Task> = {
        records,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      };

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.OK)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('TASKS')
        .withMessage('Tareas obtenidas exitosamente')
        .withData(pagination)
        .withErrors([])
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
