import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator';
import { TaskStatus } from '@features/projects/enums/task-status.enum';

export class CreateTaskDto {
  @ApiProperty({ description: 'Título de la tarea', example: 'Arreglar bug de autenticación' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  @Transform(({ value }) => value?.trim())
  public title: string;

  @ApiProperty({ description: 'Descripción de la tarea', example: 'Descripción detallada del trabajo a realizar', nullable: true })
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Transform(({ value }) => value?.trim())
  public description: Nullable<string>;

  @ApiProperty({ description: 'Estado inicial de la tarea', enum: TaskStatus, nullable: true })
  @ValidateIf((_, value) => value !== null)
  @IsEnum(TaskStatus, { message: 'El estado debe ser un valor válido de TaskStatus' })
  public status: Nullable<TaskStatus>;

  @ApiProperty({ description: 'UUID del usuario asignado a la tarea', example: '550e8400-e29b-41d4-a716-446655440000', nullable: true })
  @ValidateIf((_, value) => value !== null)
  @IsUUID('4', { message: 'El assigneeId debe ser un UUID válido' })
  public assigneeId: Nullable<string>;
}
