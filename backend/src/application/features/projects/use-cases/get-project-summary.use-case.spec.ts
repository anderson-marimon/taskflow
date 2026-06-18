import { HttpStatus } from '@nestjs/common';
import { GetProjectSummaryUseCase } from '@features/projects/use-cases/get-project-summary.use-case';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { TasksService } from '@features/projects/modules/tasks/services/tasks.service';
import { EInternalCode } from '@tools/internal-codes';

const mockVerifyProjectAccess = {
  execute: jest.fn(),
} as unknown as VerifyProjectAccessSubquery;

const mockTasksService = {
  aggregateSummary: jest.fn(),
} as unknown as TasksService;

const mockCacheStore = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const projectId = 'project-uuid';
const userId = 'user-uuid';

describe('GetProjectSummaryUseCase', () => {
  let useCase: GetProjectSummaryUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetProjectSummaryUseCase(mockVerifyProjectAccess, mockCacheStore as any, mockTasksService);
  });

  it('cache hit: retorna DTO cacheado sin llamar a aggregateSummary', async () => {
    const cachedDto = { totalTasks: 5, completed: 2, inProgress: 1, pending: 2, averageResolutionTimeSeconds: 120 };
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockCacheStore.get as jest.Mock).mockReturnValue(cachedDto);

    const result = await useCase.execute(projectId, userId);

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.data).toBe(cachedDto);
    expect(mockTasksService.aggregateSummary).not.toHaveBeenCalled();
  });

  it('cache miss: llama aggregateSummary, llama cache.set con TTL 60 y retorna DTO mapeado', async () => {
    const raw = { total: '5', completed: '2', inProgress: '1', pending: '2', avgResolution: '120.5' };
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockCacheStore.get as jest.Mock).mockReturnValue(null);
    (mockTasksService.aggregateSummary as jest.Mock).mockResolvedValue(raw);

    const result = await useCase.execute(projectId, userId);

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(mockTasksService.aggregateSummary).toHaveBeenCalledWith(projectId);
    expect(mockCacheStore.set).toHaveBeenCalledWith(`project-summary:${projectId}`, result.data, 60);
    expect(result.data).toMatchObject({ totalTasks: 5, completed: 2, inProgress: 1, pending: 2 });
  });

  it('usuario sin acceso al proyecto retorna 404', async () => {
    const errorResponse = {
      ok: false,
      statusCode: HttpStatus.NOT_FOUND,
      internalCode: EInternalCode.NOT_FOUND,
    };
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([errorResponse, null]);

    const result = await useCase.execute(projectId, userId);

    expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(result.ok).toBe(false);
  });

  it('averageResolutionTimeSeconds es null cuando avgResolution es null en el raw result', async () => {
    const raw = { total: '0', completed: '0', inProgress: '0', pending: '0', avgResolution: null };
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, {}]);
    (mockCacheStore.get as jest.Mock).mockReturnValue(null);
    (mockTasksService.aggregateSummary as jest.Mock).mockResolvedValue(raw);

    const result = await useCase.execute(projectId, userId);

    expect(result.data.averageResolutionTimeSeconds).toBeNull();
  });
});
