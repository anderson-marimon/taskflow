import { HttpStatus } from '@nestjs/common';
import { CreateProjectUseCase } from '@features/projects/use-cases/create-project.use-case';
import { ProjectsService } from '@features/projects/services/projects.service';
import { ProjectMembersService } from '@features/projects/services/project-members.service';
import { Project } from '@features/projects/entities/project.entity';
import { ProjectMember } from '@features/projects/entities/project-member.entity';
import { EInternalCode } from '@tools/internal-codes';

const mockProjectsService = {
  save: jest.fn(),
} as unknown as ProjectsService;

const mockProjectMembersService = {
  save: jest.fn(),
} as unknown as ProjectMembersService;

const ownerId = 'owner-uuid';
const dto = { name: 'Test Project', description: 'Una descripción' };

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateProjectUseCase(mockProjectsService, mockProjectMembersService);
  });

  it('crea proyecto exitosamente con status 201', async () => {
    const savedProject = Object.assign(new Project(), {
      projectId: 'project-uuid',
      ownerId,
      name: dto.name,
      description: dto.description,
      deletedAt: null,
    });
    (mockProjectsService.save as jest.Mock).mockResolvedValue(savedProject);
    (mockProjectMembersService.save as jest.Mock).mockResolvedValue({});

    const result = await useCase.execute(ownerId, dto);

    expect(result.statusCode).toBe(HttpStatus.CREATED);
    expect(result.ok).toBe(true);
    expect(result.internalCode).toBe(EInternalCode.OK);
  });

  it('inserta al propietario como miembro automáticamente', async () => {
    const savedProject = Object.assign(new Project(), {
      projectId: 'project-uuid',
      ownerId,
      name: dto.name,
      deletedAt: null,
    });
    (mockProjectsService.save as jest.Mock).mockResolvedValue(savedProject);
    (mockProjectMembersService.save as jest.Mock).mockResolvedValue({});

    await useCase.execute(ownerId, dto);

    expect(mockProjectMembersService.save).toHaveBeenCalledTimes(1);
    const savedMember = (mockProjectMembersService.save as jest.Mock).mock.calls[0][0] as ProjectMember;
    expect(savedMember.userId).toBe(ownerId);
    expect(savedMember.projectId).toBe('project-uuid');
  });

  it('retorna proyecto sin campo deletedAt', async () => {
    const savedProject = Object.assign(new Project(), {
      projectId: 'project-uuid',
      ownerId,
      name: dto.name,
      deletedAt: null,
    });
    (mockProjectsService.save as jest.Mock).mockResolvedValue(savedProject);
    (mockProjectMembersService.save as jest.Mock).mockResolvedValue({});

    const result = await useCase.execute(ownerId, dto);

    expect(result.data).not.toHaveProperty('deletedAt');
  });

  it('invoca ProjectEntityBuilder con ownerId y name del DTO', async () => {
    const savedProject = Object.assign(new Project(), {
      projectId: 'project-uuid',
      ownerId,
      name: dto.name,
      deletedAt: null,
    });
    (mockProjectsService.save as jest.Mock).mockResolvedValue(savedProject);
    (mockProjectMembersService.save as jest.Mock).mockResolvedValue({});

    await useCase.execute(ownerId, dto);

    const projectPassedToSave = (mockProjectsService.save as jest.Mock).mock.calls[0][0] as Project;
    expect(projectPassedToSave.ownerId).toBe(ownerId);
    expect(projectPassedToSave.name).toBe(dto.name);
  });

  it('lanza InternalError ante falla inesperada', async () => {
    (mockProjectsService.save as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute(ownerId, dto);

    expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(result.ok).toBe(false);
    expect(result.internalCode).toBe(EInternalCode.INTERNAL_SERVER_ERROR);
  });
});
