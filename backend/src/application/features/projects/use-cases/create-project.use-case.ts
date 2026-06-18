import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { ProjectEntityBuilder } from '@features/projects/entities/project.entity.builder';
import { ProjectMemberEntityBuilder } from '@features/projects/entities/project-member.entity.builder';
import { ProjectsService } from '@features/projects/services/projects.service';
import { ProjectMembersService } from '@features/projects/services/project-members.service';
import { CreateProjectDto } from '@features/projects/dtos/body/create-project.dto';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly projectMembersService: ProjectMembersService,
  ) {}

  async execute(ownerId: string, dto: CreateProjectDto): Promise<TApiResponse> {
    try {
      const project = ProjectEntityBuilder.create()
        .withOwnerId(ownerId)
        .withName(dto.name)
        .withDescription(dto.description ?? null)
        .build();

      const saved = await this.projectsService.save(project);

      const member = ProjectMemberEntityBuilder.create()
        .withProjectId(saved.projectId)
        .withUserId(ownerId)
        .build();

      await this.projectMembersService.save(member);

      saved.prune(['deletedAt']);

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.CREATED)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('PROJECTS')
        .withMessage('Proyecto creado exitosamente')
        .withData(saved)
        .withErrors([])
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
