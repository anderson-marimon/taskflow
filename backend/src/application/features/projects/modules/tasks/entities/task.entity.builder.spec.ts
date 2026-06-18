import { TaskEntityBuilder } from '@features/projects/modules/tasks/entities/task.entity.builder';
import { Task } from '@features/projects/modules/tasks/entities/task.entity';
import { TaskStatus } from '@features/projects/enums/task-status.enum';

describe('TaskEntityBuilder', () => {
  it('retorna una instancia de Task', () => {
    const task = TaskEntityBuilder.create().withProjectId('uuid-project').withTitle('Mi tarea').build();
    expect(task).toBeInstanceOf(Task);
  });

  it('asigna projectId correctamente', () => {
    const task = TaskEntityBuilder.create().withProjectId('uuid-project').withTitle('Test').build();
    expect(task.projectId).toBe('uuid-project');
  });

  it('asigna title correctamente', () => {
    const task = TaskEntityBuilder.create().withProjectId('uuid-project').withTitle('Arreglar bug').build();
    expect(task.title).toBe('Arreglar bug');
  });

  it('asigna description correctamente', () => {
    const task = TaskEntityBuilder.create().withProjectId('uuid-project').withTitle('Test').withDescription('Descripción de la tarea').build();
    expect(task.description).toBe('Descripción de la tarea');
  });

  it('asigna status correctamente', () => {
    const task = TaskEntityBuilder.create().withProjectId('uuid-project').withTitle('Test').withStatus(TaskStatus.IN_PROGRESS).build();
    expect(task.status).toBe(TaskStatus.IN_PROGRESS);
  });

  it('asigna assigneeId correctamente', () => {
    const task = TaskEntityBuilder.create().withProjectId('uuid-project').withTitle('Test').withAssigneeId('uuid-assignee').build();
    expect(task.assigneeId).toBe('uuid-assignee');
  });

  it('status por defecto es PENDING', () => {
    const task = TaskEntityBuilder.create().withProjectId('uuid-project').withTitle('Test').build();
    expect(task.status).toBe(TaskStatus.PENDING);
  });

  it('build() sin title lanza error', () => {
    expect(() => TaskEntityBuilder.create().withProjectId('uuid-project').build()).toThrow();
  });

  it('build() sin projectId lanza error', () => {
    expect(() => TaskEntityBuilder.create().withTitle('Test').build()).toThrow();
  });
});
