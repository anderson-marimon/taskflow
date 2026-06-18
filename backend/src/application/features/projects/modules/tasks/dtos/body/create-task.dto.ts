import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: 'Título de la tarea', example: 'Arreglar bug de autenticación' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  title: string;

  @ApiPropertyOptional({ description: 'Descripción de la tarea', example: 'Descripción detallada del trabajo a realizar' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ description: 'UUID del usuario asignado a la tarea', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID('4')
  assigneeId?: string;
}
