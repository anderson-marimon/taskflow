import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { PASSWORD_POLICY, PASSWORD_POLICY_MESSAGE } from '@common/validators/password.policy';

export class RegisterDto {
  @ApiProperty({ example: 'Ada Lovelace' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ada@example.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Str0ng!Pass' })
  @IsStrongPassword(PASSWORD_POLICY, { message: PASSWORD_POLICY_MESSAGE })
  password: string;
}
