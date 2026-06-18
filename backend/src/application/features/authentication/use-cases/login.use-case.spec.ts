import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './login.use-case';
import { FindUserByEmailSubquery } from '../subqueries/find-user-by-email.subquery';
import { SessionStore } from '@services/auth/session-store.port';
import { HashUtil } from '@common/utils/hash.util';
import { User } from '../entities/user.entity';
import { EInternalCode } from '@tools/internal-codes';

jest.mock('@common/utils/hash.util');

const mockFindUserByEmail = {
  execute: jest.fn(),
} as unknown as FindUserByEmailSubquery;

const mockJwtService = {
  signAsync: jest.fn(),
} as unknown as JwtService;

const mockSessionStore: SessionStore = {
  register: jest.fn(),
  isActive: jest.fn(),
  revoke: jest.fn(),
};

const loginDto = { email: 'ada@example.com', password: 'Str0ng!Pass' };

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(mockFindUserByEmail, mockJwtService, mockSessionStore);
  });

  describe('execute()', () => {
    it('credenciales válidas retorna 200 con accessToken y registra sesión en SessionStore', async () => {
      const user = Object.assign(new User(), {
        userId: 'uuid-ada',
        email: 'ada@example.com',
        passwordHash: '$2b$10$hash',
      });
      (mockFindUserByEmail.execute as jest.Mock).mockResolvedValue(user);
      (HashUtil.comparePassword as jest.Mock).mockReturnValue(true);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('jwt.token.here');
      (mockSessionStore.register as jest.Mock).mockResolvedValue(undefined);

      const result = await useCase.execute(loginDto);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.ok).toBe(true);
      expect(result.data).toHaveProperty('accessToken', 'jwt.token.here');
      expect(mockSessionStore.register).toHaveBeenCalledTimes(1);
    });

    it('email inexistente retorna 401 con mensaje Credenciales inválidas', async () => {
      (mockFindUserByEmail.execute as jest.Mock).mockResolvedValue(null);

      const result = await useCase.execute(loginDto);

      expect(result.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(result.ok).toBe(false);
      expect(result.internalCode).toBe(EInternalCode.UNAUTHORIZED);
      expect(result.message).toBe('Credenciales inválidas');
    });

    it('password incorrecta retorna 401 con el mismo mensaje idéntico que email inexistente', async () => {
      const user = Object.assign(new User(), { userId: 'uuid-ada', passwordHash: '$2b$10$hash' });
      (mockFindUserByEmail.execute as jest.Mock).mockResolvedValue(user);
      (HashUtil.comparePassword as jest.Mock).mockReturnValue(false);

      const result = await useCase.execute(loginDto);

      expect(result.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(result.ok).toBe(false);
      expect(result.internalCode).toBe(EInternalCode.UNAUTHORIZED);
      expect(result.message).toBe('Credenciales inválidas');
    });

    it('los mensajes de error de email inexistente y password incorrecta son idénticos', async () => {
      (mockFindUserByEmail.execute as jest.Mock).mockResolvedValue(null);
      const resultNoUser = await useCase.execute(loginDto);

      const user = Object.assign(new User(), { userId: 'uuid-ada', passwordHash: '$2b$10$hash' });
      (mockFindUserByEmail.execute as jest.Mock).mockResolvedValue(user);
      (HashUtil.comparePassword as jest.Mock).mockReturnValue(false);
      const resultBadPass = await useCase.execute(loginDto);

      expect(resultNoUser.message).toBe(resultBadPass.message);
      expect(resultNoUser.internalCode).toBe(resultBadPass.internalCode);
      expect(resultNoUser.statusCode).toBe(resultBadPass.statusCode);
    });
  });
});
