import { DatabaseEnv } from '@environment/database.environment';
import { buildDataSourceOptions } from '@services/database/data-source.options';
import { DataSource } from 'typeorm';

DatabaseEnv.start();

export default new DataSource({
  ...buildDataSourceOptions(),
  entities: ['dist/**/*.entity.{ts,js}'],
});
