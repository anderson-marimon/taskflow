import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse, TApiResponse } from '@common/builders/server-response.builder';
import { InternalError } from '@common/builders/internal-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { UsersService } from '@features/authentication/services/users.service';

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly usersService: UsersService) {}

  async execute(userId: string): Promise<TApiResponse> {
    try {
      const user = await this.usersService.findById(userId);

      if (!user) {
        return ApiResponse.create()
          .withOk(false)
          .withStatusCode(HttpStatus.NOT_FOUND)
          .withInternalCode(EInternalCode.USER_NOT_FOUND)
          .withPrefix('AUTH')
          .withMessage('Usuario no encontrado')
          .withData(null)
          .withErrors([])
          .build();
      }

      user.prune(['passwordHash']);

      return ApiResponse.create()
        .withOk(true)
        .withStatusCode(HttpStatus.OK)
        .withInternalCode(EInternalCode.OK)
        .withPrefix('AUTH')
        .withMessage('Datos del usuario autenticado')
        .withData(user)
        .withErrors([])
        .build();
    } catch (error) {
      return InternalError(error);
    }
  }
}
