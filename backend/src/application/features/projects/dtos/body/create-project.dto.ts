import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ description: 'Nombre del proyecto', example: 'Mi Proyecto' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  public name: string;

  @ApiProperty({ description: 'Descripción del proyecto', example: 'Descripción detallada', nullable: true })
  @ValidateIf((_, value) => value !== null)
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  public description: Nullable<string>;
}
