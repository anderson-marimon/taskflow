import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '@features/projects/modules/tasks/entities/task.entity';
import { TaskStatus } from '@features/projects/enums/task-status.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    public readonly repo: Repository<Task>,
  ) {}

  async save(task: Task): Promise<Task> {
    return this.repo.save(task);
  }

  async findByTaskId(projectId: string, taskId: string): Promise<Nullable<Task>> {
    return this.repo.findOne({ where: { taskId, projectId } });
  }

  async softRemove(task: Task): Promise<Task> {
    return this.repo.softRemove(task);
  }

  async aggregateSummary(projectId: string): Promise<{
    total: string;
    completed: string;
    inProgress: string;
    pending: string;
    avgResolution: Nullable<string>;
  }> {
    const raw = await this.repo
      .createQueryBuilder('task')
      .select('COUNT(*)', 'total')
      .addSelect(`COUNT(*) FILTER (WHERE task.status = :completed)`, 'completed')
      .addSelect(`COUNT(*) FILTER (WHERE task.status = :inProgress)`, 'inProgress')
      .addSelect(`COUNT(*) FILTER (WHERE task.status = :pending)`, 'pending')
      .addSelect(
        `AVG(EXTRACT(EPOCH FROM (task.completed_at - task.created_at))) FILTER (WHERE task.status = :completed AND task.completed_at IS NOT NULL)`,
        'avgResolution',
      )
      .where('task.deletedAt IS NULL')
      .andWhere('task.projectId = :projectId')
      .setParameters({
        projectId,
        completed: TaskStatus.COMPLETED,
        inProgress: TaskStatus.IN_PROGRESS,
        pending: TaskStatus.PENDING,
      })
      .getRawOne();
    return raw as { total: string; completed: string; inProgress: string; pending: string; avgResolution: Nullable<string> };
  }
}
