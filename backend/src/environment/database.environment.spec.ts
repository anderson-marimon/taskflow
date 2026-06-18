import { DatabaseEnv } from './database.environment';

jest.mock('@environment/load-env', () => ({
  loadEnv: jest.fn(),
}));

describe('DatabaseEnv', () => {
  beforeEach(() => {
    (DatabaseEnv as any).instance = null;
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.DATABASE_URL;
    (DatabaseEnv as any).instance = null;
  });

  describe('start()', () => {
    it('llama a process.exit(1) cuando falta DATABASE_URL', () => {
      delete process.env.DATABASE_URL;
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit(1)');
      });
      expect(() => DatabaseEnv.start()).toThrow('process.exit(1)');
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });

    it('retorna una instancia con DATABASE_URL cuando la variable es válida', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
      const instance = DatabaseEnv.start();
      expect(instance.DATABASE_URL).toBe('postgresql://test:test@localhost:5432/testdb');
    });

    it('retorna la misma instancia al llamarse dos veces (singleton)', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
      const first = DatabaseEnv.start();
      const second = DatabaseEnv.start();
      expect(first).toBe(second);
    });
  });

  describe('get()', () => {
    it('lanza error cuando no se llamó a start()', () => {
      expect(() => DatabaseEnv.get()).toThrow();
    });
  });
});
