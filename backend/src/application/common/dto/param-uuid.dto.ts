import { IsNotEmpty, IsUUID } from 'class-validator';

export class ParamUuidDto {
  @IsUUID('4', { message: 'El id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El id es requerido' })
  id: string;
}
