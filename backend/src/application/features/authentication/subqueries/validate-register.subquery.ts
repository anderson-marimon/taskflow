import { Injectable } from '@nestjs/common';
import { OriginError, TOriginError } from '@common/builders/origin-error.builder';
import { EInternalCode } from '@tools/internal-codes';
import { UsersService } from '../services/users.service';

@Injectable()
export class ValidateRegisterSubquery {
  constructor(private readonly usersService: UsersService) {}

  async execute(email: string): Promise<TOriginError[]> {
    const existing = await this.usersService.findByEmail(email);
    if (!existing) return [];
    return [
      OriginError.create()
        .withOrigin(String(EInternalCode.DUPLICATE_KEY_ERROR))
        .withMessage('El email ya está registrado')
        .build(),
    ];
  }
}
