import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '@decorators/jwt-payload.decorator';
import { CreateProjectDto } from '@features/projects/dtos/body/create-project.dto';
import { UpdateProjectDto } from '@features/projects/dtos/body/update-project.dto';
import { AddMemberDto } from '@features/projects/dtos/body/add-member.dto';
import { ProjectParamDto } from '@features/projects/dtos/params/project-param.dto';
import { GetProjectsQueryDto } from '@features/projects/dtos/query/get-projects-query.dto';
import { CreateProjectUseCase } from '@features/projects/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '@features/projects/use-cases/list-projects.use-case';
import { GetProjectUseCase } from '@features/projects/use-cases/get-project.use-case';
import { UpdateProjectUseCase } from '@features/projects/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from '@features/projects/use-cases/delete-project.use-case';
import { AddMemberUseCase } from '@features/projects/use-cases/add-member.use-case';
import { GetProjectSummaryUseCase } from '@features/projects/use-cases/get-project-summary.use-case';
import { ApiEnvelopeResponse } from '@common/decorators/api-envelope-response.decorator';
import { ProjectResponseDto } from '@features/projects/dtos/response/project-response.dto';
import { ProjectMemberResponseDto } from '@features/projects/dtos/response/project-member-response.dto';
import { ProjectSummaryDto } from '@features/projects/dtos/response/project-summary.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly addMemberUseCase: AddMemberUseCase,
    private readonly getProjectSummaryUseCase: GetProjectSummaryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proyecto' })
  @ApiEnvelopeResponse(201, 'Proyecto creado exitosamente', ProjectResponseDto)
  @ApiEnvelopeResponse(401, 'Token inválido o sesión inactiva')
  @ApiEnvelopeResponse(406, 'Datos de entrada inválidos')
  async create(@CurrentUser() userId: string, @Body() dto: CreateProjectDto, @Res() res: Response) {
    const result = await this.createProjectUseCase.execute(userId, dto);
    res.status(result.statusCode).json(result);
  }

  @Get()
  @ApiOperation({ summary: 'Listar proyectos donde el usuario es propietario o miembro' })
  @ApiEnvelopeResponse(200, 'Lista paginada de proyectos', ProjectResponseDto, { paginated: true })
  @ApiEnvelopeResponse(401, 'Token inválido o sesión inactiva')
  async list(@CurrentUser() userId: string, @Query() query: GetProjectsQueryDto, @Res() res: Response) {
    const result = await this.listProjectsUseCase.execute(userId, query);
    res.status(result.statusCode).json(result);
  }

  @Get(':projectId/summary')
  @ApiOperation({ summary: 'Obtener resumen estadístico de tareas del proyecto' })
  @ApiEnvelopeResponse(200, 'Resumen del proyecto', ProjectSummaryDto)
  @ApiEnvelopeResponse(401, 'Token inválido o sesión inactiva')
  @ApiEnvelopeResponse(404, 'Proyecto no encontrado o sin acceso')
  async summary(@Param() param: ProjectParamDto, @CurrentUser() userId: string, @Res() res: Response) {
    const result = await this.getProjectSummaryUseCase.execute(param.projectId, userId);
    res.status(result.statusCode).json(result);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Obtener detalle de un proyecto por ID' })
  @ApiEnvelopeResponse(200, 'Proyecto encontrado', ProjectResponseDto)
  @ApiEnvelopeResponse(401, 'Token inválido o sesión inactiva')
  @ApiEnvelopeResponse(404, 'Proyecto no encontrado o sin acceso')
  async get(@Param() param: ProjectParamDto, @CurrentUser() userId: string, @Res() res: Response) {
    const result = await this.getProjectUseCase.execute(param.projectId, userId);
    res.status(result.statusCode).json(result);
  }

  @Patch(':projectId')
  @ApiOperation({ summary: 'Actualizar un proyecto (propietario o miembro)' })
  @ApiEnvelopeResponse(200, 'Proyecto actualizado exitosamente', ProjectResponseDto)
  @ApiEnvelopeResponse(401, 'Token inválido o sesión inactiva')
  @ApiEnvelopeResponse(404, 'Proyecto no encontrado o sin acceso')
  @ApiEnvelopeResponse(406, 'Datos de entrada inválidos')
  async update(
    @Param() param: ProjectParamDto,
    @CurrentUser() userId: string,
    @Body() dto: UpdateProjectDto,
    @Res() res: Response,
  ) {
    const result = await this.updateProjectUseCase.execute(param.projectId, userId, dto);
    res.status(result.statusCode).json(result);
  }

  @Delete(':projectId')
  @ApiOperation({ summary: 'Eliminar un proyecto (solo propietario, soft-delete)' })
  @ApiEnvelopeResponse(200, 'Proyecto eliminado exitosamente', ProjectResponseDto)
  @ApiEnvelopeResponse(401, 'Token inválido o sesión inactiva')
  @ApiEnvelopeResponse(403, 'Solo el propietario puede eliminar el proyecto')
  @ApiEnvelopeResponse(404, 'Proyecto no encontrado o sin acceso')
  async delete(@Param() param: ProjectParamDto, @CurrentUser() userId: string, @Res() res: Response) {
    const result = await this.deleteProjectUseCase.execute(param.projectId, userId);
    res.status(result.statusCode).json(result);
  }

  @Post(':projectId/members')
  @ApiOperation({ summary: 'Agregar un miembro al proyecto (solo propietario)' })
  @ApiEnvelopeResponse(201, 'Miembro agregado exitosamente', ProjectMemberResponseDto)
  @ApiEnvelopeResponse(401, 'Token inválido o sesión inactiva')
  @ApiEnvelopeResponse(403, 'Solo el propietario puede agregar miembros')
  @ApiEnvelopeResponse(404, 'Proyecto sin acceso o usuario no encontrado')
  @ApiEnvelopeResponse(406, 'Datos de entrada inválidos')
  @ApiEnvelopeResponse(409, 'El usuario ya es miembro del proyecto')
  async addMember(
    @Param() param: ProjectParamDto,
    @CurrentUser() userId: string,
    @Body() dto: AddMemberDto,
    @Res() res: Response,
  ) {
    const result = await this.addMemberUseCase.execute(param.projectId, userId, dto);
    res.status(result.statusCode).json(result);
  }
}
