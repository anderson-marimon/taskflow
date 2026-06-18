import { IsStrongPasswordOptions } from 'class-validator';

export const PASSWORD_POLICY = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
} as const satisfies Required<Pick<IsStrongPasswordOptions,
  'minLength' | 'minLowercase' | 'minUppercase' | 'minNumbers' | 'minSymbols'>>;

export const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres e incluir una mayúscula, una minúscula, un número y un símbolo';
