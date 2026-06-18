import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TaskParamsDto {
  @ApiProperty({ description: 'UUID del proyecto', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4')
  projectId: string;

  @ApiProperty({ description: 'UUID de la tarea', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4')
  taskId: string;
}
