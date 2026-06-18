import { HttpStatus } from '@nestjs/common';
import { UpdateProjectUseCase } from '@features/projects/use-cases/update-project.use-case';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { ProjectsService } from '@features/projects/services/projects.service';
import { Project } from '@features/projects/entities/project.entity';
import { EInternalCode } from '@tools/internal-codes';

const mockVerifyProjectAccess = {
  execute: jest.fn(),
} as unknown as VerifyProjectAccessSubquery;

const mockProjectsService = {
  save: jest.fn(),
} as unknown as ProjectsService;

const mockCacheStore = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const ownerId = 'owner-uuid';

describe('UpdateProjectUseCase', () => {
  let useCase: UpdateProjectUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateProjectUseCase(mockVerifyProjectAccess, mockProjectsService, mockCacheStore as any);
  });

  it('propietario actualiza el proyecto con status 200', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Original' });
    const savedProject = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Nuevo nombre' });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockProjectsService.save as jest.Mock).mockResolvedValue(savedProject);

    const result = await useCase.execute('p-id', ownerId, { name: 'Nuevo nombre' });

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.ok).toBe(true);
  });

  it('miembro también puede actualizar con status 200', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Original' });
    const savedProject = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Renombrado' });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockProjectsService.save as jest.Mock).mockResolvedValue(savedProject);

    const result = await useCase.execute('p-id', 'member-id', { name: 'Renombrado' });

    expect(result.statusCode).toBe(HttpStatus.OK);
    expect(result.ok).toBe(true);
  });

  it('usuario sin acceso recibe 404 NOT_FOUND', async () => {
    const errorResponse = {
      ok: false,
      statusCode: HttpStatus.NOT_FOUND,
      internalCode: EInternalCode.NOT_FOUND,
    };
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([errorResponse, null]);

    const result = await useCase.execute('p-id', 'stranger-id', { name: 'Renombrado' });

    expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(result.internalCode).toBe(EInternalCode.NOT_FOUND);
  });

  it('campos undefined en el DTO no modifican la entidad', async () => {
    const project = Object.assign(new Project(), {
      projectId: 'p-id',
      ownerId,
      name: 'Original',
      description: 'Descripción original',
    });
    const savedProject = Object.assign(new Project(), { ...project, name: 'Nuevo nombre' });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockProjectsService.save as jest.Mock).mockResolvedValue(savedProject);

    await useCase.execute('p-id', ownerId, { name: 'Nuevo nombre' });

    const projectPassedToSave = (mockProjectsService.save as jest.Mock).mock.calls[0][0] as Project;
    expect(projectPassedToSave.description).toBe('Descripción original');
    expect(projectPassedToSave.name).toBe('Nuevo nombre');
  });

  it('retorna el proyecto actualizado en el data', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Original' });
    const savedProject = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Actualizado' });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockProjectsService.save as jest.Mock).mockResolvedValue(savedProject);

    const result = await useCase.execute('p-id', ownerId, { name: 'Actualizado' });

    expect(result.data).toBe(savedProject);
  });

  it("llama a cache.del('project-summary:p-id') tras actualizar el proyecto", async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Original' });
    const savedProject = Object.assign(new Project(), { projectId: 'p-id', ownerId, name: 'Actualizado' });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockProjectsService.save as jest.Mock).mockResolvedValue(savedProject);

    await useCase.execute('p-id', ownerId, { name: 'Actualizado' });

    expect(mockCacheStore.del).toHaveBeenCalledWith('project-summary:p-id');
  });
});
