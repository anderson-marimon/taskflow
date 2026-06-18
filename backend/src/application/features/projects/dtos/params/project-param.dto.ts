import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ProjectParamDto {
  @ApiProperty({ description: 'UUID del proyecto', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4', { message: 'El projectId debe ser un UUID válido' })
  public projectId: string;
}
