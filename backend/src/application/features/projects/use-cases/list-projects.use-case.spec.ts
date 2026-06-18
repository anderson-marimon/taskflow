import { HttpStatus } from '@nestjs/common';
import { ListProjectsUseCase } from '@features/projects/use-cases/list-projects.use-case';
import { ProjectsService } from '@features/projects/services/projects.service';
import { Project } from '@features/projects/entities/project.entity';

let mockGetManyAndCount: jest.Mock;
let mockQb: Record<string, any>;

const mockProjectsService = {
  repo: {
    createQueryBuilder: jest.fn(),
  },
} as unknown as ProjectsService;

describe('ListProjectsUseCase', () => {
  let useCase: ListProjectsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetManyAndCount = jest.fn();
    mockQb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: mockGetManyAndCount,
    };
    (mockProjectsService.repo.createQueryBuilder as jest.Mock).mockReturnValue(mockQb);
    useCase = new ListProjectsUseCase(mockProjectsService);
  });

  it('retorna paginación correcta con records, total, page, size y totalPages', async () => {
    const projects = [new Project(), new Project()];
    mockGetManyAndCount.mockResolvedValue([projects, 2]);

    const result = await useCase.execute('user-id', { page: 1, size: 20 });

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.data.records).toBe(projects);
    expect(result.data.total).toBe(2);
    expect(result.data.page).toBe(1);
    expect(result.data.size).toBe(20);
    expect(result.data.totalPages).toBe(1);
  });

  it('totalPages se calcula con Math.ceil(total / size)', async () => {
    mockGetManyAndCount.mockResolvedValue([[], 25]);

    const result = await useCase.execute('user-id', { page: 1, size: 10 });

    expect(result.data.totalPages).toBe(3);
  });

  it('invoca createQueryBuilder con leftJoin a project_members', async () => {
    mockGetManyAndCount.mockResolvedValue([[], 0]);

    await useCase.execute('user-id', { page: 1, size: 20 });

    expect(mockProjectsService.repo.createQueryBuilder).toHaveBeenCalledWith('project');
    expect(mockQb.leftJoin).toHaveBeenCalledWith(
      'project_members',
      'pm',
      expect.stringContaining('project_id'),
      expect.objectContaining({ userId: 'user-id' }),
    );
  });

  it('invoca getManyAndCount en un solo round-trip', async () => {
    mockGetManyAndCount.mockResolvedValue([[], 0]);

    await useCase.execute('user-id', { page: 1, size: 20 });

    expect(mockGetManyAndCount).toHaveBeenCalledTimes(1);
  });

  it('la condición WHERE incluye owner_id O member', async () => {
    mockGetManyAndCount.mockResolvedValue([[], 0]);

    await useCase.execute('user-id', { page: 1, size: 20 });

    expect(mockQb.where).toHaveBeenCalledWith(
      expect.stringContaining('owner_id'),
      expect.objectContaining({ userId: 'user-id' }),
    );
  });

  it('página vacía retorna records=[] con total=0', async () => {
    mockGetManyAndCount.mockResolvedValue([[], 0]);

    const result = await useCase.execute('user-id', { page: 1, size: 20 });

    expect(result.data.records).toEqual([]);
    expect(result.data.total).toBe(0);
  });
});
