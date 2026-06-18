import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { HashUtil } from '@common/utils/hash.util';
import { EInternalCode } from '@tools/internal-codes';
import { UserEntityBuilder } from '@features/authentication/entities/user.entity.builder';
import { ValidateRegisterSubquery } from '@features/authentication/subqueries/validate-register.subquery';
import { UsersService } from '@features/authentication/services/users.service';
import { RegisterDto } from '@features/authentication/dtos/body/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly validateRegister: ValidateRegisterSubquery,
    private readonly usersService: UsersService,
  ) {}

  async execute(dto: RegisterDto): Promise<TApiResponse> {
    const errors = await this.validateRegister.execute(dto.email);

    if (errors.length > 0) {
      return ApiResponse.create()
        .withOk(false)
        .withStatusCode(HttpStatus.CONFLICT)
        .withInternalCode(EInternalCode.DUPLICATE_KEY_ERROR)
        .withPrefix('AUTH')
        .withMessage('El email ya está registrado')
        .withData(null)
        .withErrors(errors)
        .build();
    }

    const passwordHash = HashUtil.hashPassword(dto.password);
    const user = UserEntityBuilder.create().withName(dto.name).withEmail(dto.email).withPasswordHash(passwordHash).build();
    const saved = await this.usersService.create(user);
    saved.prune(['passwordHash']);

    return ApiResponse.create()
      .withOk(true)
      .withStatusCode(HttpStatus.CREATED)
      .withInternalCode(EInternalCode.OK)
      .withPrefix('AUTH')
      .withMessage('Usuario registrado exitosamente')
      .withData(saved)
      .withErrors([])
      .build();
  }
}
