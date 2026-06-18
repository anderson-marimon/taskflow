import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { EInternalCode } from '@tools/internal-codes';
import { Project } from '@features/projects/entities/project.entity';
import { ProjectsService } from '@features/projects/services/projects.service';

@Injectable()
export class VerifyProjectAccessSubquery {
  constructor(private readonly projectsService: ProjectsService) {}

  async execute(projectId: string, userId: string): Promise<[Nullable<TApiResponse>, Nullable<Project>]> {
    const project = await this.projectsService.repo
      .createQueryBuilder('project')
      .leftJoin('project_members', 'pm', 'pm.project_id = project.project_id AND pm.user_id = :userId', { userId })
      .where('project.project_id = :projectId', { projectId })
      .andWhere('(project.owner_id = :userId OR pm.user_id IS NOT NULL)', { userId })
      .getOne();

    if (!project) {
      return [
        ApiResponse.create()
          .withOk(false)
          .withStatusCode(HttpStatus.NOT_FOUND)
          .withInternalCode(EInternalCode.NOT_FOUND)
          .withPrefix('PROJECTS')
          .withMessage('Proyecto no encontrado o sin acceso')
          .withData(null)
          .withErrors([])
          .build(),
        null,
      ];
    }

    return [null, project];
  }
}
