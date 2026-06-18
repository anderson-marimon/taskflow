import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ description: 'UUID del usuario a agregar como miembro', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID('4', { message: 'El userId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El userId es requerido' })
  public userId: string;
}
