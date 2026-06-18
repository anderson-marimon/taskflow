import { DatabaseEnv } from '@environment/database.environment';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

export function buildDataSourceOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    url: DatabaseEnv.get().DATABASE_URL,
    synchronize: false,
    logging: false,
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  };
}
