import { IsStrongPassword } from '@common/validators/is-strong-password.validator';
import { PASSWORD_POLICY, PASSWORD_POLICY_MESSAGE } from '@common/validators/password.policy';
import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, validate } from 'class-validator';

class TestDto {
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsStrongPassword()
  public password: string;
}

class TestDtoWithOverride {
  @IsStrongPassword({ message: 'OVERRIDE' })
  public password: string;
}

async function getPasswordErrors(password: unknown): Promise<string[]> {
  const instance = plainToInstance(TestDto, { password });
  const errors = await validate(instance);
  const passwordError = errors.find((e) => e.property === 'password');
  if (!passwordError?.constraints) return [];
  return Object.values(passwordError.constraints);
}

describe('PASSWORD_POLICY constant', () => {
  it('expone exactamente las cinco claves requeridas con los valores correctos (PP-R1-S1)', () => {
    expect(PASSWORD_POLICY).toEqual({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });
  });
});

describe('@IsStrongPassword decorator', () => {
  describe('contraseña válida', () => {
    it('acepta una contraseña que cumple los requisitos (PP-R2-S1)', async () => {
      const errors = await getPasswordErrors('Abcd1!xY');
      expect(errors).toHaveLength(0);
    });

    it('acepta Password123! (compatibilidad regresiva PP-R2-S9)', async () => {
      const errors = await getPasswordErrors('Password123!');
      expect(errors).toHaveLength(0);
    });
  });

  describe('contraseñas no conformes', () => {
    it('rechaza una contraseña de menos de 8 caracteres (PP-R2-S2)', async () => {
      const errors = await getPasswordErrors('Ab1!xYZ');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rechaza una contraseña sin letra mayúscula (PP-R2-S3)', async () => {
      const errors = await getPasswordErrors('abcd1!xy');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rechaza una contraseña sin letra minúscula (PP-R2-S4)', async () => {
      const errors = await getPasswordErrors('ABCD1!XY');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rechaza una contraseña sin dígito (PP-R2-S5)', async () => {
      const errors = await getPasswordErrors('Abcd!!XY');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rechaza una contraseña sin símbolo (PP-R2-S6)', async () => {
      const errors = await getPasswordErrors('Abcd12XY');
      expect(errors.length).toBeGreaterThan(0);
    });

    // A spaces-only string satisfies IsString and IsNotEmpty (it has 8+ chars)
    // but fails IsStrongPassword (no uppercase, no digit, no symbol, no lowercase letter).
    it('rechaza una contraseña compuesta solo de espacios (PP-R2-S8)', async () => {
      const errors = await getPasswordErrors('        ');
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('mensaje de error', () => {
    it('el valor del constraint de error es PASSWORD_POLICY_MESSAGE (PP-R4-S1)', async () => {
      const instance = plainToInstance(TestDto, { password: 'weak' });
      const errors = await validate(instance);
      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError).toBeDefined();
      const constraintValues = Object.values(passwordError!.constraints ?? {});
      expect(constraintValues).toContain(PASSWORD_POLICY_MESSAGE);
    });

    it('PASSWORD_POLICY_MESSAGE está en español y cubre todos los criterios', () => {
      expect(PASSWORD_POLICY_MESSAGE).toContain('8');
      expect(PASSWORD_POLICY_MESSAGE.toLowerCase()).toMatch(/mayúscula|mayuscula/);
      expect(PASSWORD_POLICY_MESSAGE.toLowerCase()).toMatch(/minúscula|minuscula/);
      expect(PASSWORD_POLICY_MESSAGE.toLowerCase()).toMatch(/número|numero/);
      expect(PASSWORD_POLICY_MESSAGE.toLowerCase()).toMatch(/símbolo|simbolo/);
    });

    it('el mensaje canónico no puede ser sobreescrito por un validationOptions.message personalizado (security-review)', async () => {
      const instance = plainToInstance(TestDtoWithOverride, { password: 'weak' });
      const errors = await validate(instance);
      const passwordError = errors.find((e) => e.property === 'password');
      expect(passwordError).toBeDefined();
      const constraintValues = Object.values(passwordError!.constraints ?? {});
      expect(constraintValues).toContain(PASSWORD_POLICY_MESSAGE);
      expect(constraintValues).not.toContain('OVERRIDE');
    });
  });
});
