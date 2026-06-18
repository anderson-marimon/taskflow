import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { ProjectMemberEntityBuilder } from '@features/projects/entities/project-member.entity.builder';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { FindUserByIdSubquery } from '@features/projects/subqueries/find-user-by-id.subquery';
import { ProjectMembersService } from '@features/projects/services/project-members.service';
import { AddMemberDto } from '@features/projects/dtos/body/add-member.dto';

@Injectable()
export class AddMemberUseCase {
  constructor(
    private readonly verifyProjectAccess: VerifyProjectAccessSubquery,
    private readonly findUserById: FindUserByIdSubquery,
    private readonly projectMembersService: ProjectMembersService,
  ) {}

  async execute(projectId: string, requesterId: string, dto: AddMemberDto): Promise<TApiResponse> {
    try {
      const [error, project] = await this.verifyProjectAccess.execute(projectId, requesterId);
      if (error) return error;

      if (project!.ownerId !== requesterId) {
        return ApiResponse.create()
          .withOk(false)
          .withStatusCode(HttpStatus.FORBIDDEN)
          .withInternalCode(EInternalCode.FORBIDDEN)
          .withPrefix('PROJECTS')
          .withMessage('Solo el propietario puede agregar miembros al proyecto')
          .withData(null)
          .withErrors([])
          .build();
      }

      const targetUser = await this.findUserById.execute(dto.userId);
      if (!targetUser) {
        return ApiResponse.create()
          .withOk(false)
          .withStatusCode(HttpStatus.NOT_FOUND)
          .withInternalCode(EInternalCode.USER_NOT_FOUND)
          .withPrefix('PROJECTS')
          .withMessage('El usuario objetivo no existe')
          .withData(null)
          .withErrors([])
          .build();
      }

      const existingMember = await this.projectMembersService.findMember(projectId, dto.userId);
      if (existingMember) {
        return ApiResponse.create()
          .withOk(false)
          .withStatusCode(HttpStatus.CONFLICT)
          .withInternalCode(EInternalCode.CONFLICT)
          .withPrefix('PROJECTS')
          .withMessage('El usuario ya es miembro del proyecto')
          .withData(null)
          .withErrors([])
          .build();
      }

      const member = ProjectMemberEntityBuilder.create()
        .withProjectId(projectId)
        .withUserId(dto.userId)
        .build();

      const saved = await this.projectMembersService.save(member);

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.CREATED)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('PROJECTS')
        .withMessage('Miembro agregado exitosamente')
        .withData(saved)
        .withErrors([])
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
