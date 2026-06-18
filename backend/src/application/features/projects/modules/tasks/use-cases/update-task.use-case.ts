import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { ValidateAssigneeIsMemberSubquery } from '@features/projects/modules/tasks/subqueries/validate-assignee-is-member.subquery';
import { TasksService } from '@features/projects/modules/tasks/services/tasks.service';
import { UpdateTaskDto } from '@features/projects/modules/tasks/dtos/body/update-task.dto';
import { TaskStatus } from '@features/projects/enums/task-status.enum';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    private readonly verifyProjectAccess: VerifyProjectAccessSubquery,
    private readonly validateAssigneeIsMember: ValidateAssigneeIsMemberSubquery,
    private readonly tasksService: TasksService,
  ) {}

  async execute(projectId: string, taskId: string, userId: string, dto: UpdateTaskDto): Promise<TApiResponse> {
    try {
      const [error] = await this.verifyProjectAccess.execute(projectId, userId);
      if (error) return error;

      const task = await this.tasksService.findByTaskId(projectId, taskId);
      if (!task) {
        return ApiResponse.create()
          .withOk(false)
          .withStatusCode(HttpStatus.NOT_FOUND)
          .withInternalCode(EInternalCode.NOT_FOUND)
          .withPrefix('TASKS')
          .withMessage('Tarea no encontrada en el proyecto')
          .build();
      }

      if (dto.assigneeId !== undefined && dto.assigneeId !== null) {
        const isValid = await this.validateAssigneeIsMember.execute(projectId, dto.assigneeId);
        if (!isValid) {
          return ApiResponse.create()
            .withOk(false)
            .withStatusCode(HttpStatus.BAD_REQUEST)
            .withInternalCode(EInternalCode.BAD_REQUEST)
            .withPrefix('TASKS')
            .withMessage('El nuevo asignado no es miembro del proyecto')
            .build();
        }
      }

      const wasCompleted = task.status === TaskStatus.COMPLETED;

      task.update({
        title: dto.title,
        description: dto.description,
        status: dto.status ?? undefined,
        assigneeId: dto.assigneeId,
      });

      const isCompleted = task.status === TaskStatus.COMPLETED;
      if (!wasCompleted && isCompleted) task.completedAt = new Date();
      else if (wasCompleted && !isCompleted) task.completedAt = null;

      const saved = await this.tasksService.save(task);

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.OK)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('TASKS')
        .withMessage('Tarea actualizada exitosamente')
        .withData(saved)
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
