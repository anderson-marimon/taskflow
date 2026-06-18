import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ada@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  @IsEmail({}, { message: 'El email debe ser un correo electrónico válido' })
  public email: string;

  @ApiProperty({ example: 'Str0ng!Pass' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  public password: string;
}
