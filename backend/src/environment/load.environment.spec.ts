import * as dotenv from 'dotenv';
import { _resetForTest, loadEnv } from '@environment/load.environment';

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('loadEnv', () => {
  beforeEach(() => {
    _resetForTest();
    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.TEST_TASKFLOW_SENTINEL;
  });

  it('no lanza error al ser invocada', () => {
    expect(() => loadEnv()).not.toThrow();
  });

  it('es idempotente: config se llama una sola vez tras dos llamadas a loadEnv()', () => {
    loadEnv();
    loadEnv();
    expect(dotenv.config).toHaveBeenCalledTimes(1);
  });

  it('no sobreescribe variables de entorno ya definidas antes de loadEnv()', () => {
    process.env.TEST_TASKFLOW_SENTINEL = 'original';
    loadEnv();
    expect(process.env.TEST_TASKFLOW_SENTINEL).toBe('original');
  });
});
