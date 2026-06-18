import { HttpStatus } from '@nestjs/common';
import { UpdateTaskUseCase } from '@features/projects/modules/tasks/use-cases/update-task.use-case';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { ValidateAssigneeIsMemberSubquery } from '@features/projects/modules/tasks/subqueries/validate-assignee-is-member.subquery';
import { TasksService } from '@features/projects/modules/tasks/services/tasks.service';
import { Task } from '@features/projects/modules/tasks/entities/task.entity';
import { TaskStatus } from '@features/projects/enums/task-status.enum';
import { EInternalCode } from '@tools/internal-codes';

const mockVerifyProjectAccess = {
  execute: jest.fn(),
} as unknown as VerifyProjectAccessSubquery;

const mockValidateAssigneeIsMember = {
  execute: jest.fn(),
} as unknown as ValidateAssigneeIsMemberSubquery;

const mockTasksService = {
  findByTaskId: jest.fn(),
  save: jest.fn(),
} as unknown as TasksService;

const projectId = 'project-uuid';
const taskId = 'task-uuid';
const userId = 'user-uuid';

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateTaskUseCase(mockVerifyProjectAccess, mockValidateAssigneeIsMember, mockTasksService);
  });

  it('actualiza status correctamente y retorna 200', async () => {
    const task = Object.assign(new Task(), { taskId, projectId, title: 'Tarea', status: TaskStatus.PENDING });
    const savedTask = Object.assign(new Task(), { taskId, projectId, title: 'Tarea', status: TaskStatus.IN_PROGRESS });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockTasksService.findByTaskId as jest.Mock).mockResolvedValue(task);
    (mockTasksService.save as jest.Mock).mockResolvedValue(savedTask);

    const result = await useCase.execute(projectId, taskId, userId, { status: TaskStatus.IN_PROGRESS });

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.ok).toBe(true);
  });

  it('assigneeId=null limpia el campo assignee', async () => {
    const task = Object.assign(new Task(), { taskId, projectId, title: 'Tarea', assigneeId: 'member-uuid' });
    const savedTask = Object.assign(new Task(), { taskId, projectId, title: 'Tarea', assigneeId: null });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockTasksService.findByTaskId as jest.Mock).mockResolvedValue(task);
    (mockTasksService.save as jest.Mock).mockResolvedValue(savedTask);

    const result = await useCase.execute(projectId, taskId, userId, { assigneeId: null });

    expect(result.statusCode).toBe(HttpStatus.OK);
    const taskPassedToSave = (mockTasksService.save as jest.Mock).mock.calls[0][0] as Task;
    expect(taskPassedToSave.assigneeId).toBeNull();
  });

  it('assigneeId=undefined no toca el campo assignee', async () => {
    const task = Object.assign(new Task(), { taskId, projectId, title: 'Tarea', assigneeId: 'member-uuid' });
    const savedTask = Object.assign(new Task(), { taskId, projectId, title: 'Tarea actualizada', assigneeId: 'member-uuid' });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockTasksService.findByTaskId as jest.Mock).mockResolvedValue(task);
    (mockTasksService.save as jest.Mock).mockResolvedValue(savedTask);

    const result = await useCase.execute(projectId, taskId, userId, { title: 'Tarea actualizada' });

    expect(result.statusCode).toBe(HttpStatus.OK);
    const taskPassedToSave = (mockTasksService.save as jest.Mock).mock.calls[0][0] as Task;
    expect(taskPassedToSave.assigneeId).toBe('member-uuid');
  });

  it('nuevo assigneeId de no-miembro retorna 400 BAD_REQUEST', async () => {
    const task = Object.assign(new Task(), { taskId, projectId, title: 'Tarea', assigneeId: null });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockTasksService.findByTaskId as jest.Mock).mockResolvedValue(task);
    (mockValidateAssigneeIsMember.execute as jest.Mock).mockResolvedValue(false);

    const result = await useCase.execute(projectId, taskId, userId, { assigneeId: 'non-member-uuid' });

    expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(result.ok).toBe(false);
    expect(result.internalCode).toBe(EInternalCode.BAD_REQUEST);
  });

  it('tarea no encontrada en el proyecto retorna 404 NOT_FOUND', async () => {
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockTasksService.findByTaskId as jest.Mock).mockResolvedValue(null);

    const result = await useCase.execute(projectId, 'non-existent-task', userId, { title: 'Update' });

    expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(result.ok).toBe(false);
    expect(result.internalCode).toBe(EInternalCode.NOT_FOUND);
  });

  it('usuario sin acceso al proyecto retorna 404 NOT_FOUND', async () => {
    const errorResponse = {
      ok: false,
      statusCode: HttpStatus.NOT_FOUND,
      internalCode: EInternalCode.NOT_FOUND,
    };
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([errorResponse, null]);

    const result = await useCase.execute(projectId, taskId, 'stranger-uuid', { title: 'Update' });

    expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(result.ok).toBe(false);
  });

  it('transición a COMPLETED establece completedAt con timestamp actual', async () => {
    const task = Object.assign(new Task(), { taskId, projectId, title: 'Tarea', status: TaskStatus.PENDING, completedAt: null });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockTasksService.findByTaskId as jest.Mock).mockResolvedValue(task);
    (mockTasksService.save as jest.Mock).mockResolvedValue(task);

    await useCase.execute(projectId, taskId, userId, { status: TaskStatus.COMPLETED });

    const saved = (mockTasksService.save as jest.Mock).mock.calls[0][0] as Task;
    expect(saved.completedAt).toBeInstanceOf(Date);
  });

  it('salida de COMPLETED a PENDING establece completedAt en null', async () => {
    const task = Object.assign(new Task(), { taskId, projectId, title: 'Tarea', status: TaskStatus.COMPLETED, completedAt: new Date() });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockTasksService.findByTaskId as jest.Mock).mockResolvedValue(task);
    (mockTasksService.save as jest.Mock).mockResolvedValue(task);

    await useCase.execute(projectId, taskId, userId, { status: TaskStatus.PENDING });

    const saved = (mockTasksService.save as jest.Mock).mock.calls[0][0] as Task;
    expect(saved.completedAt).toBeNull();
  });

  it('cambio de campo sin modificar status no altera completedAt', async () => {
    const originalDate = new Date('2026-01-01T00:00:00Z');
    const task = Object.assign(new Task(), { taskId, projectId, title: 'Tarea', status: TaskStatus.COMPLETED, completedAt: originalDate });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockTasksService.findByTaskId as jest.Mock).mockResolvedValue(task);
    (mockTasksService.save as jest.Mock).mockResolvedValue(task);

    await useCase.execute(projectId, taskId, userId, { title: 'Nuevo título' });

    const saved = (mockTasksService.save as jest.Mock).mock.calls[0][0] as Task;
    expect(saved.completedAt).toBe(originalDate);
  });
});
