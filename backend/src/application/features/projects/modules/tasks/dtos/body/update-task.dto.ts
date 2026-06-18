import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { TaskStatus } from '@features/projects/enums/task-status.enum';

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Título de la tarea', example: 'Arreglar bug de autenticación' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  title?: string;

  @ApiPropertyOptional({ description: 'Descripción de la tarea', example: 'Descripción detallada del trabajo a realizar' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ description: 'Estado de la tarea', enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'UUID del asignado (null para limpiar, omitir para no tocar)', nullable: true, example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @ValidateIf((o) => o.assigneeId !== null)
  @IsUUID('4')
  assigneeId?: Nullable<string>;
}
