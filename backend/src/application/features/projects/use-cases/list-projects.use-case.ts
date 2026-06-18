import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { PaginatorDto } from '@common/dto/paginator.dto';
import { Project } from '@features/projects/entities/project.entity';
import { ProjectsService } from '@features/projects/services/projects.service';

@Injectable()
export class ListProjectsUseCase {
  constructor(private readonly projectsService: ProjectsService) {}

  async execute(userId: string, dto: PaginatorDto): Promise<TApiResponse> {
    try {
      const { page, size } = dto;

      const [records, total] = await this.projectsService.repo
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.owner', 'owner')
        .leftJoin('project_members', 'pm', 'pm.project_id = project.project_id AND pm.user_id = :userId', { userId })
        .where('project.owner_id = :userId OR pm.user_id IS NOT NULL', { userId })
        .orderBy('project.createdAt', 'DESC')
        .skip((page - 1) * size)
        .take(size)
        .getManyAndCount();

      const pagination: TPagination<Project> = {
        records,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      };

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.OK)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('PROJECTS')
        .withMessage('Proyectos obtenidos exitosamente')
        .withData(pagination)
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
