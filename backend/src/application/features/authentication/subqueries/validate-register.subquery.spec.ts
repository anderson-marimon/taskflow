import { ValidateRegisterSubquery } from '@features/authentication/subqueries/validate-register.subquery';
import { UsersService } from '@features/authentication/services/users.service';
import { User } from '@features/authentication/entities/user.entity';
import { EInternalCode } from '@tools/internal-codes';

const mockUsersService = {
  findByEmail: jest.fn(),
} as unknown as UsersService;

describe('ValidateRegisterSubquery', () => {
  let subquery: ValidateRegisterSubquery;

  beforeEach(() => {
    jest.clearAllMocks();
    subquery = new ValidateRegisterSubquery(mockUsersService);
  });

  describe('execute()', () => {
    it('email único retorna arreglo vacío de errores', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);
      const errors = await subquery.execute('nuevo@example.com');
      expect(errors).toHaveLength(0);
    });

    it('email ya registrado retorna arreglo con un error de código DUPLICATE_KEY_ERROR', async () => {
      const existing = new User();
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(existing);
      const errors = await subquery.execute('ada@example.com');
      expect(errors).toHaveLength(1);
      expect(errors[0].origin).toBe(String(EInternalCode.DUPLICATE_KEY_ERROR));
    });
  });
});
