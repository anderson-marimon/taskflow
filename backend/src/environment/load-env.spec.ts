import * as dotenv from 'dotenv';
import { _resetForTest, loadEnv } from './load-env';

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

  it('does not throw when called', () => {
    expect(() => loadEnv()).not.toThrow();
  });

  it('is idempotent — config called exactly once after two loadEnv() calls', () => {
    loadEnv();
    loadEnv();
    expect(dotenv.config).toHaveBeenCalledTimes(1);
  });

  it('does not override env vars already set before loadEnv()', () => {
    process.env.TEST_TASKFLOW_SENTINEL = 'original';
    loadEnv();
    expect(process.env.TEST_TASKFLOW_SENTINEL).toBe('original');
  });
});
