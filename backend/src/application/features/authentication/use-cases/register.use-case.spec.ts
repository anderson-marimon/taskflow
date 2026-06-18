import { HttpStatus } from '@nestjs/common';
import { RegisterUseCase } from './register.use-case';
import { ValidateRegisterSubquery } from '../subqueries/validate-register.subquery';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';
import { EInternalCode } from '@tools/internal-codes';

const mockValidateRegister = {
  execute: jest.fn(),
} as unknown as ValidateRegisterSubquery;

const mockUsersService = {
  create: jest.fn(),
} as unknown as UsersService;

const registerDto = { name: 'Ada', email: 'ada@example.com', password: 'Str0ng!Pass' };

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUseCase(mockValidateRegister, mockUsersService);
  });

  describe('execute()', () => {
    it('registro exitoso retorna respuesta 201 sin passwordHash en el payload', async () => {
      (mockValidateRegister.execute as jest.Mock).mockResolvedValue([]);
      const savedUser = Object.assign(new User(), {
        userId: 'uuid-1',
        name: 'Ada',
        email: 'ada@example.com',
        passwordHash: '$2b$10$hash',
      });
      (mockUsersService.create as jest.Mock).mockResolvedValue(savedUser);

      const result = await useCase.execute(registerDto);

      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.ok).toBe(true);
      expect(result.data).not.toHaveProperty('passwordHash');
    });

    it('email duplicado retorna respuesta con status 409 y código DUPLICATE_KEY_ERROR', async () => {
      (mockValidateRegister.execute as jest.Mock).mockResolvedValue([
        { origin: String(EInternalCode.DUPLICATE_KEY_ERROR), message: 'El email ya está registrado' },
      ]);

      const result = await useCase.execute(registerDto);

      expect(result.statusCode).toBe(HttpStatus.CONFLICT);
      expect(result.ok).toBe(false);
      expect(result.internalCode).toBe(EInternalCode.DUPLICATE_KEY_ERROR);
    });
  });
});
