import { PASSWORD_POLICY, PASSWORD_POLICY_MESSAGE } from '@common/validators/password.policy';
import { applyDecorators } from '@nestjs/common';
import { IsStrongPassword as BuiltinIsStrongPassword, ValidationOptions } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return applyDecorators(BuiltinIsStrongPassword(PASSWORD_POLICY, { ...validationOptions, message: PASSWORD_POLICY_MESSAGE }));
}
