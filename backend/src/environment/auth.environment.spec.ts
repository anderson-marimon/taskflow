import { AuthEnv } from '@environment/auth.environment';

jest.mock('@environment/load.environment', () => ({
  loadEnv: jest.fn(),
}));

describe('AuthEnv', () => {
  beforeEach(() => {
    (AuthEnv as any).instance = null;
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    (AuthEnv as any).instance = null;
  });

  describe('start()', () => {
    it('llama a process.exit(1) cuando JWT_SECRET está ausente', () => {
      delete process.env.JWT_SECRET;
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit(1)');
      });
      expect(() => AuthEnv.start()).toThrow('process.exit(1)');
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });

    it('retorna instancia con JWT_EXPIRES_IN por defecto cuando no se define', () => {
      process.env.JWT_SECRET = 'supersecret';
      delete process.env.JWT_EXPIRES_IN;
      const instance = AuthEnv.start();
      expect(instance.JWT_EXPIRES_IN).toBe('24h');
    });

    it('retorna instancia singleton cuando JWT_SECRET está presente', () => {
      process.env.JWT_SECRET = 'supersecret';
      const instance = AuthEnv.start();
      expect(instance.JWT_SECRET).toBe('supersecret');
    });

    it('retorna la misma instancia al llamarse dos veces (singleton)', () => {
      process.env.JWT_SECRET = 'supersecret';
      const first = AuthEnv.start();
      const second = AuthEnv.start();
      expect(first).toBe(second);
    });
  });

  describe('get()', () => {
    it('lanza error cuando se llama antes de start()', () => {
      expect(() => AuthEnv.get()).toThrow();
    });
  });
});
