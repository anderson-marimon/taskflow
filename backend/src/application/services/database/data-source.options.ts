import { DatabaseEnv } from '@environment/database.environment';
import { join } from 'path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export function buildDataSourceOptions(): PostgresConnectionOptions {
  return {
    type: 'postgres',
    url: DatabaseEnv.get().DATABASE_URL,
    synchronize: false,
    logging: false,
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  };
}
