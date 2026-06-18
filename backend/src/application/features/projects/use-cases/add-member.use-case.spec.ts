import { HttpStatus } from '@nestjs/common';
import { AddMemberUseCase } from '@features/projects/use-cases/add-member.use-case';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { FindUserByIdSubquery } from '@features/projects/subqueries/find-user-by-id.subquery';
import { ProjectMembersService } from '@features/projects/services/project-members.service';
import { Project } from '@features/projects/entities/project.entity';
import { ProjectMember } from '@features/projects/entities/project-member.entity';
import { User } from '@features/authentication/entities/user.entity';
import { EInternalCode } from '@tools/internal-codes';

const mockVerifyProjectAccess = {
  execute: jest.fn(),
} as unknown as VerifyProjectAccessSubquery;

const mockFindUserById = {
  execute: jest.fn(),
} as unknown as FindUserByIdSubquery;

const mockProjectMembersService = {
  findMember: jest.fn(),
  save: jest.fn(),
} as unknown as ProjectMembersService;

const ownerId = 'owner-uuid';
const targetUserId = 'target-user-uuid';

describe('AddMemberUseCase', () => {
  let useCase: AddMemberUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new AddMemberUseCase(mockVerifyProjectAccess, mockFindUserById, mockProjectMembersService);
  });

  it('propietario agrega un miembro con status 201', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId });
    const targetUser = Object.assign(new User(), { userId: targetUserId });
    const savedMember = Object.assign(new ProjectMember(), { projectId: 'p-id', userId: targetUserId });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockFindUserById.execute as jest.Mock).mockResolvedValue(targetUser);
    (mockProjectMembersService.findMember as jest.Mock).mockResolvedValue(null);
    (mockProjectMembersService.save as jest.Mock).mockResolvedValue(savedMember);

    const result = await useCase.execute('p-id', ownerId, { userId: targetUserId });

    expect(result.statusCode).toBe(HttpStatus.CREATED);
    expect(result.ok).toBe(true);
  });

  it('miembro intenta agregar y recibe 403 FORBIDDEN', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);

    const result = await useCase.execute('p-id', 'member-id', { userId: targetUserId });

    expect(result.statusCode).toBe(HttpStatus.FORBIDDEN);
    expect(result.internalCode).toBe(EInternalCode.FORBIDDEN);
    expect(mockProjectMembersService.save).not.toHaveBeenCalled();
  });

  it('usuario sin acceso recibe 404 NOT_FOUND', async () => {
    const errorResponse = {
      ok: false,
      statusCode: HttpStatus.NOT_FOUND,
      internalCode: EInternalCode.NOT_FOUND,
    };
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([errorResponse, null]);

    const result = await useCase.execute('p-id', 'stranger-id', { userId: targetUserId });

    expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(result.internalCode).toBe(EInternalCode.NOT_FOUND);
  });

  it('usuario objetivo no existe → 404 USER_NOT_FOUND', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockFindUserById.execute as jest.Mock).mockResolvedValue(null);

    const result = await useCase.execute('p-id', ownerId, { userId: 'non-existent-uuid' });

    expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(result.internalCode).toBe(EInternalCode.USER_NOT_FOUND);
  });

  it('usuario objetivo ya es miembro → 409 CONFLICT', async () => {
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId });
    const targetUser = Object.assign(new User(), { userId: targetUserId });
    const existingMember = Object.assign(new ProjectMember(), { projectId: 'p-id', userId: targetUserId });
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockFindUserById.execute as jest.Mock).mockResolvedValue(targetUser);
    (mockProjectMembersService.findMember as jest.Mock).mockResolvedValue(existingMember);

    const result = await useCase.execute('p-id', ownerId, { userId: targetUserId });

    expect(result.statusCode).toBe(HttpStatus.CONFLICT);
    expect(result.internalCode).toBe(EInternalCode.CONFLICT);
    expect(mockProjectMembersService.save).not.toHaveBeenCalled();
  });

  it('invoca findUserById, findMember y save en el orden correcto', async () => {
    const callOrder: string[] = [];
    const project = Object.assign(new Project(), { projectId: 'p-id', ownerId });
    const targetUser = Object.assign(new User(), { userId: targetUserId });
    const savedMember = new ProjectMember();
    (mockVerifyProjectAccess.execute as jest.Mock).mockResolvedValue([null, project]);
    (mockFindUserById.execute as jest.Mock).mockImplementation(async () => {
      callOrder.push('findUserById');
      return targetUser;
    });
    (mockProjectMembersService.findMember as jest.Mock).mockImplementation(async () => {
      callOrder.push('findMember');
      return null;
    });
    (mockProjectMembersService.save as jest.Mock).mockImplementation(async () => {
      callOrder.push('save');
      return savedMember;
    });

    await useCase.execute('p-id', ownerId, { userId: targetUserId });

    expect(callOrder).toEqual(['findUserById', 'findMember', 'save']);
  });
});
