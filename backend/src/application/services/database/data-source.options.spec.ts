import { buildDataSourceOptions } from '@services/database/data-source.options';

jest.mock('@environment/database.environment', () => ({
  DatabaseEnv: {
    get: () => ({ DATABASE_URL: 'postgresql://mock:mock@localhost:5432/test' }),
  },
}));

describe('buildDataSourceOptions', () => {
  it('retorna el type postgres', () => {
    const options = buildDataSourceOptions();
    expect(options.type).toBe('postgres');
  });

  it('retorna la url desde DatabaseEnv.get().DATABASE_URL', () => {
    const options = buildDataSourceOptions();
    expect(options.url).toBe('postgresql://mock:mock@localhost:5432/test');
  });

  it('retorna synchronize en false', () => {
    const options = buildDataSourceOptions();
    expect(options.synchronize).toBe(false);
  });

  it('retorna logging en false', () => {
    const options = buildDataSourceOptions();
    expect(options.logging).toBe(false);
  });

  it('retorna un array de migrations con al menos un elemento string', () => {
    const options = buildDataSourceOptions();
    expect(Array.isArray(options.migrations)).toBe(true);
    expect((options.migrations as string[]).length).toBeGreaterThan(0);
    expect(typeof (options.migrations as string[])[0]).toBe('string');
  });

  it('incluye glob de entidades de features', () => {
    const options = buildDataSourceOptions();
    expect(Array.isArray(options.entities)).toBe(true);
    expect((options.entities as string[]).length).toBeGreaterThan(0);
    const globPattern = (options.entities as string[])[0];
    expect(globPattern).toMatch(/features/);
    expect(globPattern).toMatch(/\.entity\./);
  });
});
