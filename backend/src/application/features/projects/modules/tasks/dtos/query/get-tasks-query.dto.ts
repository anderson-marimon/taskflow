import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginatorDto } from '@common/dto/paginator.dto';
import { TaskStatus } from '@features/projects/enums/task-status.enum';

export class GetTasksQueryDto extends PaginatorDto {
  @ApiPropertyOptional({ description: 'Filtrar por estado de la tarea', enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'Filtrar por UUID del asignado', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID('4')
  assigneeId?: string;
}
