import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiResponse({ status: 201, description: 'Proyecto creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 500, description: 'Error inesperado del servidor' })
  async create(@CurrentUser() userId: string, @Body() dto: CreateProjectDto, @Res() res: Response) {
    const result = await this.createProjectUseCase.execute(userId, dto);
    res.status(result.statusCode).json(result);
  }

  @Get()
  @ApiOperation({ summary: 'Listar proyectos donde el usuario es propietario o miembro' })
  @ApiResponse({ status: 200, description: 'Lista paginada de proyectos' })
  @ApiResponse({ status: 400, description: 'Parámetros de paginación inválidos' })
  @ApiResponse({ status: 500, description: 'Error inesperado del servidor' })
  async list(@CurrentUser() userId: string, @Query() query: GetProjectsQueryDto, @Res() res: Response) {
    const result = await this.listProjectsUseCase.execute(userId, query);
    res.status(result.statusCode).json(result);
  }

  @Get(':projectId/summary')
  @ApiOperation({ summary: 'Obtener resumen estadístico de tareas del proyecto' })
  @ApiResponse({ status: 200, description: 'Resumen del proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado o sin acceso' })
  @ApiResponse({ status: 500, description: 'Error inesperado del servidor' })
  async summary(@Param() param: ProjectParamDto, @CurrentUser() userId: string, @Res() res: Response) {
    const result = await this.getProjectSummaryUseCase.execute(param.projectId, userId);
    res.status(result.statusCode).json(result);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Obtener detalle de un proyecto por ID' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado o sin acceso' })
  @ApiResponse({ status: 500, description: 'Error inesperado del servidor' })
  async get(@Param() param: ProjectParamDto, @CurrentUser() userId: string, @Res() res: Response) {
    const result = await this.getProjectUseCase.execute(param.projectId, userId);
    res.status(result.statusCode).json(result);
  }

  @Patch(':projectId')
  @ApiOperation({ summary: 'Actualizar un proyecto (propietario o miembro)' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado o sin acceso' })
  @ApiResponse({ status: 500, description: 'Error inesperado del servidor' })
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
  @ApiResponse({ status: 200, description: 'Proyecto eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'Solo el propietario puede eliminar el proyecto' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado o sin acceso' })
  @ApiResponse({ status: 500, description: 'Error inesperado del servidor' })
  async delete(@Param() param: ProjectParamDto, @CurrentUser() userId: string, @Res() res: Response) {
    const result = await this.deleteProjectUseCase.execute(param.projectId, userId);
    res.status(result.statusCode).json(result);
  }

  @Post(':projectId/members')
  @ApiOperation({ summary: 'Agregar un miembro al proyecto (solo propietario)' })
  @ApiResponse({ status: 201, description: 'Miembro agregado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 403, description: 'Solo el propietario puede agregar miembros' })
  @ApiResponse({ status: 404, description: 'Proyecto sin acceso o usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'El usuario ya es miembro del proyecto' })
  @ApiResponse({ status: 500, description: 'Error inesperado del servidor' })
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
