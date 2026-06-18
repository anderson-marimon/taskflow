import { HttpStatus } from '@nestjs/common';
import { GetProfileUseCase } from '@features/authentication/use-cases/get-profile.use-case';
import { UsersService } from '@features/authentication/services/users.service';
import { User } from '@features/authentication/entities/user.entity';
import { EInternalCode } from '@tools/internal-codes';

const mockUsersService = {
  findById: jest.fn(),
} as unknown as UsersService;

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetProfileUseCase(mockUsersService);
  });

  describe('execute()', () => {
    it('retorna 200 con el usuario sin passwordHash cuando el usuario existe', async () => {
      const user = Object.assign(new User(), {
        userId: 'uuid-1',
        name: 'Ada',
        email: 'ada@example.com',
        passwordHash: '$2b$10$hash',
      });
      (mockUsersService.findById as jest.Mock).mockResolvedValue(user);

      const result = await useCase.execute('uuid-1');

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.ok).toBe(true);
      expect(result.data).not.toHaveProperty('passwordHash');
    });

    it('retorna 404 con código USER_NOT_FOUND cuando el usuario no existe', async () => {
      (mockUsersService.findById as jest.Mock).mockResolvedValue(null);

      const result = await useCase.execute('uuid-inexistente');

      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(result.ok).toBe(false);
      expect(result.internalCode).toBe(EInternalCode.USER_NOT_FOUND);
    });
  });
});
