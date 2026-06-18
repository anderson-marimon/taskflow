import { HttpStatus } from '@nestjs/common';
import { DeleteProjectUseCase } from '@features/projects/use-cases/delete-project.use-case';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { ProjectsService } from '@features/projects/services/projects.service';
import { Project } from '@features/projects/entities/project.entity';
import { EInternalCode } from '@tools/internal-codes';

const mockVerifyProjectAccess = {
  execute: jest.fn(),
} as unknown as VerifyProjectAccessSubquery;

const mockProjectsService = {
  softRemove: jest.fn(),
} as unknown as ProjectsService;

const ownerId = 'owner-uuid';

describe('DeleteProjectUseCase', () => {
  let useCase: DeleteProjectUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteProjectUseCase(mockVerifyProjectAccess, mockProjectsService);
  });

  it('propietario elimina el proyecto con status 200 y deletedAt seteado', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Proyecto' });
    const deletedProject = Object.assign(new Project(), { ...project, deletedAt: new Date() });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockProjectsService.softRemove as jest.Mock).mockResolvedValue(deletedProject);

    const result = await useCase.execute('p-id', ownerId);

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.ok).toBe(true);
    expect(result.data.deletedAt).toBeTruthy();
  });

  it('miembro intenta eliminar y recibe 403 FORBIDDEN', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Proyecto' });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);

    const result = await useCase.execute('p-id', 'member-id');

    expect(result.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(result.internalCode).toBe(EInternalCode.FORBIDDEN);
    expect(result.ok).toBe(false);
    expect(mockProjectsService.softRemove).not.toHaveBeenCalled();
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
    expect(result.internalCode).toBe(EInternalCode.NOT_FOUND);
  });

  it('el método softRemove del servicio es invocado para el propietario', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Proyecto' });
    const deletedProject = Object.assign(new Project(), { ...project, deletedAt: new Date() });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockProjectsService.softRemove as jest.Mock).mockResolvedValue(deletedProject);

    await useCase.execute('p-id', ownerId);

    expect(mockProjectsService.softRemove).toHaveBeenCalledWith(project);
  });
});
