import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '@features/projects/modules/tasks/entities/task.entity';

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
}
