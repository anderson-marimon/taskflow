import { HttpStatus } from '@nestjs/common';
import { CreateTaskUseCase } from '@features/projects/modules/tasks/use-cases/create-task.use-case';
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
  save: jest.fn(),
} as unknown as TasksService;

const projectId = 'project-uuid';
const userId = 'user-uuid';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateTaskUseCase(mockVerifyProjectAccess, mockValidateAssigneeIsMember, mockTasksService);
  });

  it('crea tarea con status PENDING y retorna 201', async () => {
    const savedTask = Object.assign(new Task(), {
      taskId: 'task-uuid',
      projectId,
      title: 'Nueva tarea',
      status: TaskStatus.PENDING,
      assigneeId: null,
      deletedAt: null,
    });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockTasksService.save as jest.Mock).mockResolvedValue(savedTask);

    const result = await useCase.execute(projectId, userId, { title: 'Nueva tarea' });

    expect(result.statusCode).toBe(HttpStatus.CREATED);
    expect(result.ok).toBe(true);
    expect(result.internalCode).toBe(EInternalCode.OK);
  });

  it('con assigneeId válido (miembro) retorna 201', async () => {
    const savedTask = Object.assign(new Task(), {
      taskId: 'task-uuid',
      projectId,
      title: 'Tarea con asignado',
      status: TaskStatus.PENDING,
      assigneeId: 'member-uuid',
      deletedAt: null,
    });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockValidateAssigneeIsMember.execute as jest.Mock).mockResolvedValue(true);
    (mockTasksService.save as jest.Mock).mockResolvedValue(savedTask);

    const result = await useCase.execute(projectId, userId, { title: 'Tarea con asignado', assigneeId: 'member-uuid' });

    expect(result.statusCode).toBe(HttpStatus.CREATED);
    expect(result.ok).toBe(true);
  });

  it('con assigneeId de no-miembro retorna 400 BAD_REQUEST', async () => {
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockValidateAssigneeIsMember.execute as jest.Mock).mockResolvedValue(false);

    const result = await useCase.execute(projectId, userId, { title: 'Tarea', assigneeId: 'non-member-uuid' });

    expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(result.ok).toBe(false);
    expect(result.internalCode).toBe(EInternalCode.BAD_REQUEST);
  });

  it('usuario sin acceso al proyecto retorna 404 NOT_FOUND', async () => {
    const errorResponse = {
      ok: false,
      statusCode: HttpStatus.NOT_FOUND,
      internalCode: EInternalCode.NOT_FOUND,
    };
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([errorResponse, null]);

    const result = await useCase.execute(projectId, 'stranger-uuid', { title: 'Tarea' });

    expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(result.ok).toBe(false);
    expect(result.internalCode).toBe(EInternalCode.NOT_FOUND);
  });

  it('retorna tarea sin campo deletedAt', async () => {
    const savedTask = Object.assign(new Task(), {
      taskId: 'task-uuid',
      projectId,
      title: 'Tarea',
      status: TaskStatus.PENDING,
      deletedAt: null,
    });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockTasksService.save as jest.Mock).mockResolvedValue(savedTask);

    const result = await useCase.execute(projectId, userId, { title: 'Tarea' });

    expect(result.data).not.toHaveProperty('deletedAt');
  });
});
