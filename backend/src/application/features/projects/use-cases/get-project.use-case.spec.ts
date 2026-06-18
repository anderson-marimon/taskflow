import { HttpStatus } from '@nestjs/common';
import { GetProjectUseCase } from '@features/projects/use-cases/get-project.use-case';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { Project } from '@features/projects/entities/project.entity';
import { EInternalCode } from '@tools/internal-codes';

const mockVerifyProjectAccess = {
  execute: jest.fn(),
} as unknown as VerifyProjectAccessSubquery;

describe('GetProjectUseCase', () => {
  let useCase: GetProjectUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetProjectUseCase(mockVerifyProjectAccess);
  });

  it('propietario obtiene el proyecto con status 200', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId: 'owner-id', name: 'Proyecto' });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);

    const result = await useCase.execute('p-id', 'owner-id');

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.ok).toBe(true);
    expect(result.data).toBe(project);
  });

  it('miembro obtiene el proyecto con status 200', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId: 'owner-id', name: 'Proyecto' });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);

    const result = await useCase.execute('p-id', 'member-id');

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.data).toBe(project);
  });

  it('usuario sin acceso recibe 404 NOT_FOUND', async () => {
    const errorResponse = {
      ok: false,
      statusCode: HttpStatus.NOT_FOUND,
      internalCode: EInternalCode.NOT_FOUND,
    };
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([errorResponse, null]);

    const result = await useCase.execute('p-id', 'stranger-id');

    expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(result.ok).toBe(false);
    expect(result.internalCode).toBe(EInternalCode.NOT_FOUND);
  });

  it('invoca verifyProjectAccess con projectId y userId correctos', async () => {
    const project = new Project();
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);

    await useCase.execute('project-uuid', 'user-uuid');

    expect(mockVerifyProjectAccess.execute).toHaveBeenCalledWith('project-uuid', 'user-uuid');
  });
});
