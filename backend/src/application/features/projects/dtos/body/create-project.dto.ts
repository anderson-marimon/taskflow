import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Nombre del proyecto', example: 'Mi Proyecto' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({ description: 'Descripción del proyecto', example: 'Descripción detallada' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  description?: string;
}
