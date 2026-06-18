import { HttpStatus } from '@nestjs/common';
import { ListTasksUseCase } from '@features/projects/modules/tasks/use-cases/list-tasks.use-case';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { TasksService } from '@features/projects/modules/tasks/services/tasks.service';
import { Task } from '@features/projects/modules/tasks/entities/task.entity';
import { EInternalCode } from '@tools/internal-codes';

let mockGetManyAndCount: jest.Mock;
let mockQb: Record<string, any>;

const mockVerifyProjectAccess = {
  execute: jest.fn(),
} as unknown as VerifyProjectAccessSubquery;

const mockTasksService = {
  repo: {
    createQueryBuilder: jest.fn(),
  },
} as unknown as TasksService;

const projectId = 'project-uuid';
const userId = 'user-uuid';

describe('ListTasksUseCase', () => {
  let useCase: ListTasksUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetManyAndCount = jest.fn();
    mockQb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: mockGetManyAndCount,
    };
    (mockTasksService.repo.createQueryBuilder as jest.Mock).mockReturnValue(mockQb);
    useCase = new ListTasksUseCase(mockVerifyProjectAccess, mockTasksService);
  });

  it('retorna paginación correcta con records, total, page, size y totalPages', async () => {
    const tasks = [new Task(), new Task()];
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    mockGetManyAndCount.mockResolvedValue([tasks, 2]);

    const result = await useCase.execute(projectId, userId, { page: 1, size: 20 });

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.data.records).toBe(tasks);
    expect(result.data.total).toBe(2);
    expect(result.data.page).toBe(1);
    expect(result.data.size).toBe(20);
    expect(result.data.totalPages).toBe(1);
  });

  it('totalPages calculado con Math.ceil', async () => {
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    mockGetManyAndCount.mockResolvedValue([[], 25]);

    const result = await useCase.execute(projectId, userId, { page: 1, size: 10 });

    expect(result.data.totalPages).toBe(3);
  });

  it('invoca createQueryBuilder con leftJoinAndSelect del asignado', async () => {
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    mockGetManyAndCount.mockResolvedValue([[], 0]);

    await useCase.execute(projectId, userId, { page: 1, size: 20 });

    expect(mockTasksService.repo.createQueryBuilder).toHaveBeenCalledWith('task');
    expect(mockQb.leftJoinAndSelect).toHaveBeenCalledWith('task.assignee', 'assignee');
  });

  it('invoca getManyAndCount en un solo round-trip', async () => {
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    mockGetManyAndCount.mockResolvedValue([[], 0]);

    await useCase.execute(projectId, userId, { page: 1, size: 20 });

    expect(mockGetManyAndCount).toHaveBeenCalledTimes(1);
  });

  it('usuario sin acceso retorna 404 NOT_FOUND', async () => {
    const errorResponse = {
      ok: false,
      statusCode: HttpStatus.NOT_FOUND,
      internalCode: EInternalCode.NOT_FOUND,
    };
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([errorResponse, null]);

    const result = await useCase.execute(projectId, 'stranger-uuid', { page: 1, size: 20 });

    expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(result.ok).toBe(false);
  });

  it('lista vacía retorna records=[] con total=0', async () => {
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    mockGetManyAndCount.mockResolvedValue([[], 0]);

    const result = await useCase.execute(projectId, userId, { page: 1, size: 20 });

    expect(result.data.records).toEqual([]);
    expect(result.data.total).toBe(0);
  });
});
