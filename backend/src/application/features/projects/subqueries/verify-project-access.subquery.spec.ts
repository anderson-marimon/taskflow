import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { ProjectsService } from '@features/projects/services/projects.service';
import { Project } from '@features/projects/entities/project.entity';
import { HttpStatus } from '@nestjs/common';
import { EInternalCode } from '@tools/internal-codes';

let mockGetOne: jest.Mock;
let mockQueryBuilder: any;

const mockProjectsService = {
  repo: {
    createQueryBuilder: jest.fn(),
  },
} as unknown as ProjectsService;

describe('VerifyProjectAccessSubquery', () => {
  let subquery: VerifyProjectAccessSubquery;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOne = jest.fn();
    mockQueryBuilder = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: mockGetOne,
    };
    (mockProjectsService.repo.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);
    subquery = new VerifyProjectAccessSubquery(mockProjectsService);
  });

  it('propietario tiene acceso → devuelve [null, project]', async () => {
    const project = new Project();
    mockGetOne.mockResolvedValue(project);
    const [error, result] = await subquery.execute('project-id', 'owner-id');
    expect(error).toBeNull();
    expect(result).toBe(project);
  });

  it('miembro tiene acceso → devuelve [null, project]', async () => {
    const project = new Project();
    mockGetOne.mockResolvedValue(project);
    const [error, result] = await subquery.execute('project-id', 'member-id');
    expect(error).toBeNull();
    expect(result).toBe(project);
  });

  it('usuario sin relación → devuelve [respuesta 404, null]', async () => {
    mockGetOne.mockResolvedValue(null);
    const [error, result] = await subquery.execute('project-id', 'stranger-id');
    expect(error).not.toBeNull();
    expect(error!.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(error!.internalCode).toBe(EInternalCode.NOT_FOUND);
    expect(result).toBeNull();
  });

  it('proyecto soft-deleted → devuelve [respuesta 404, null]', async () => {
    mockGetOne.mockResolvedValue(null);
    const [error, result] = await subquery.execute('deleted-project-id', 'owner-id');
    expect(error).not.toBeNull();
    expect(error!.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(result).toBeNull();
  });
});
