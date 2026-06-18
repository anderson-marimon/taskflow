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
    it('calls process.exit(1) when DATABASE_URL is absent', () => {
      delete process.env.DATABASE_URL;
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit(1)');
      });
      expect(() => DatabaseEnv.start()).toThrow('process.exit(1)');
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockRestore();
    });

    it('returns an instance with DATABASE_URL when env var is valid', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
      const instance = DatabaseEnv.start();
      expect(instance.DATABASE_URL).toBe('postgresql://test:test@localhost:5432/testdb');
    });

    it('returns the same instance when called twice (singleton)', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
      const first = DatabaseEnv.start();
      const second = DatabaseEnv.start();
      expect(first).toBe(second);
    });
  });

  describe('get()', () => {
    it('throws when start() has not been called', () => {
      expect(() => DatabaseEnv.get()).toThrow();
    });
  });
});
