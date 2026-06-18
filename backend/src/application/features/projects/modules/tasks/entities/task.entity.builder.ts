import { TaskStatus } from '@features/projects/enums/task-status.enum';
import { Task } from '@features/projects/modules/tasks/entities/task.entity';

export class TaskEntityBuilder {
  private readonly task: Partial<Task> = {
    status: TaskStatus.PENDING,
  };

  public static create(): TaskEntityBuilder {
    return new TaskEntityBuilder();
  }

  public withProjectId(projectId: string): TaskEntityBuilder {
    this.task.projectId = projectId;
    return this;
  }

  public withTitle(title: string): TaskEntityBuilder {
    this.task.title = title;
    return this;
  }

  public withDescription(description: Nullable<string>): TaskEntityBuilder {
    this.task.description = description;
    return this;
  }

  public withStatus(status: TaskStatus): TaskEntityBuilder {
    this.task.status = status;
    return this;
  }

  public withAssigneeId(assigneeId: Nullable<string>): TaskEntityBuilder {
    this.task.assigneeId = assigneeId;
    return this;
  }

  public build(): Task {
    const requiredFields: (keyof Task)[] = ['projectId', 'title'];
    for (const field of requiredFields) {
      if (this.task[field] === undefined) {
        throw new Error(`Falta el campo requerido para crear la tarea: ${field}`);
      }
    }
    return Object.assign(new Task(), this.task);
  }
}
