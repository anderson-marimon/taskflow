import { Logger } from '@nestjs/common';
import { ServerEnv } from '@environment/server.environment';

jest.mock('@environment/load.environment', () => ({
  loadEnv: jest.fn(),
}));

describe('ServerEnv', () => {
  const VALID_ENV = {
    PORT: '3000',
    API_VERSION: 'v1',
    ALLOWED_ORIGINS: 'http://localhost:3000',
    ALLOWED_METHODS: 'GET,POST',
    ALLOWED_HEADERS: 'Content-Type',
    TRUST_PROXY_HOPS: '1',
  };

  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    (ServerEnv as any).instance = null;
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    Object.assign(process.env, VALID_ENV);
  });

  afterEach(() => {
    for (const key of Object.keys(VALID_ENV)) delete process.env[key];
    (ServerEnv as any).instance = null;
    jest.restoreAllMocks();
  });

  describe('start()', () => {
    it('retorna una instancia con los valores convertidos cuando las variables son válidas', () => {
      const instance = ServerEnv.start();
      expect(instance.PORT).toBe(3000);
      expect(instance.API_VERSION).toBe('v1');
      expect(instance.ALLOWED_ORIGINS).toBe('http://localhost:3000');
      expect(instance.ALLOWED_METHODS).toBe('GET,POST');
      expect(instance.ALLOWED_HEADERS).toBe('Content-Type');
      expect(instance.TRUST_PROXY_HOPS).toBe(1);
    });

    it('retorna la misma instancia al llamarse dos veces (singleton)', () => {
      const first = ServerEnv.start();
      const second = ServerEnv.start();
      expect(first).toBe(second);
    });

    it('registra un error y no lanza cuando falta una variable requerida', () => {
      delete process.env.PORT;
      expect(() => ServerEnv.start()).not.toThrow();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('get()', () => {
    it('lanza error cuando no se llamó a start()', () => {
      expect(() => ServerEnv.get()).toThrow();
    });

    it('retorna la instancia luego de llamar a start()', () => {
      const started = ServerEnv.start();
      expect(ServerEnv.get()).toBe(started);
    });
  });
});
