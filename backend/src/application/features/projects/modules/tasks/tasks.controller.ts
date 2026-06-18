import { Body, Controller, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '@decorators/jwt-payload.decorator';
import { ProjectParamDto } from '@features/projects/dtos/params/project-param.dto';
import { TaskParamsDto } from '@features/projects/modules/tasks/dtos/params/task-params.dto';
import { CreateTaskDto } from '@features/projects/modules/tasks/dtos/body/create-task.dto';
import { UpdateTaskDto } from '@features/projects/modules/tasks/dtos/body/update-task.dto';
import { GetTasksQueryDto } from '@features/projects/modules/tasks/dtos/query/get-tasks-query.dto';
import { CreateTaskUseCase } from '@features/projects/modules/tasks/use-cases/create-task.use-case';
import { ListTasksUseCase } from '@features/projects/modules/tasks/use-cases/list-tasks.use-case';
import { UpdateTaskUseCase } from '@features/projects/modules/tasks/use-cases/update-task.use-case';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarea en el proyecto' })
  @ApiResponse({ status: 201, description: 'Tarea creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Asignado no es miembro del proyecto o datos inválidos' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado o sin acceso' })
  @ApiResponse({ status: 500, description: 'Error inesperado del servidor' })
  async create(
    @Param() param: ProjectParamDto,
    @CurrentUser() userId: string,
    @Body() dto: CreateTaskDto,
    @Res() res: Response,
  ) {
    const result = await this.createTaskUseCase.execute(param.projectId, userId, dto);
    res.status(result.statusCode).json(result);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tareas del proyecto con paginación' })
  @ApiResponse({ status: 200, description: 'Lista paginada de tareas' })
  @ApiResponse({ status: 400, description: 'Parámetros de paginación inválidos' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado o sin acceso' })
  @ApiResponse({ status: 500, description: 'Error inesperado del servidor' })
  async list(
    @Param() param: ProjectParamDto,
    @CurrentUser() userId: string,
    @Query() query: GetTasksQueryDto,
    @Res() res: Response,
  ) {
    const result = await this.listTasksUseCase.execute(param.projectId, userId, query);
    res.status(result.statusCode).json(result);
  }

  @Patch(':taskId')
  @ApiOperation({ summary: 'Actualizar una tarea del proyecto' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Asignado no es miembro del proyecto o datos inválidos' })
  @ApiResponse({ status: 404, description: 'Proyecto o tarea no encontrada o sin acceso' })
  @ApiResponse({ status: 500, description: 'Error inesperado del servidor' })
  async update(
    @Param() param: TaskParamsDto,
    @CurrentUser() userId: string,
    @Body() dto: UpdateTaskDto,
    @Res() res: Response,
  ) {
    const result = await this.updateTaskUseCase.execute(param.projectId, param.taskId, userId, dto);
    res.status(result.statusCode).json(result);
  }
}
