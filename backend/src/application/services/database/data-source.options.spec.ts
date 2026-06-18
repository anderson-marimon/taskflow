import { buildDataSourceOptions } from './data-source.options';

jest.mock('@environment/database.environment', () => ({
  DatabaseEnv: {
    get: () => ({ DATABASE_URL: 'postgresql://mock:mock@localhost:5432/test' }),
  },
}));

describe('buildDataSourceOptions', () => {
  it('returns type postgres', () => {
    const options = buildDataSourceOptions();
    expect(options.type).toBe('postgres');
  });

  it('returns url from DatabaseEnv.get().DATABASE_URL', () => {
    const options = buildDataSourceOptions();
    expect(options.url).toBe('postgresql://mock:mock@localhost:5432/test');
  });

  it('returns synchronize: false', () => {
    const options = buildDataSourceOptions();
    expect(options.synchronize).toBe(false);
  });

  it('returns logging: false', () => {
    const options = buildDataSourceOptions();
    expect(options.logging).toBe(false);
  });

  it('returns migrations array with at least one string element', () => {
    const options = buildDataSourceOptions();
    expect(Array.isArray(options.migrations)).toBe(true);
    expect((options.migrations as string[]).length).toBeGreaterThan(0);
    expect(typeof (options.migrations as string[])[0]).toBe('string');
  });
});
