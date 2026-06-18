import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginatorDto {
  @ApiPropertyOptional({ description: 'Número de página (desde 1)', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página mínima es 1' })
  public page: number = 1;

  @ApiPropertyOptional({ description: 'Tamaño de página (máximo 100)', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El tamaño debe ser un número entero' })
  @Min(1, { message: 'El tamaño mínimo es 1' })
  @Max(100, { message: 'El tamaño máximo es 100' })
  public size: number = 20;
}
