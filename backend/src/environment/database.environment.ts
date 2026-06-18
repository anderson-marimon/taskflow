import { Logger } from '@nestjs/common';
import * as joi from 'joi';
import { loadEnv } from '@environment/load.environment';

type DatabaseEnvironment = {
  DATABASE_URL: string;
};

export class DatabaseEnv {
  private static instance: Nullable<DatabaseEnv> = null;
  private static readonly logger = new Logger(DatabaseEnv.name);
  private readonly env: DatabaseEnvironment;

  private constructor(env: DatabaseEnvironment) {
    this.env = env;
  }

  public static start(): DatabaseEnv {
    if (this.instance) return this.instance;

    loadEnv();

    const schema = joi
      .object<DatabaseEnvironment>({
        DATABASE_URL: joi.string().required(),
      })
      .unknown(true);

    const result: joi.ValidationResult<DatabaseEnvironment> = schema.validate(process.env);

    if (result.error) {
      DatabaseEnv.logger.error(result.error.message);
      process.exit(1);
    }

    this.instance = new DatabaseEnv(result.value);
    return this.instance;
  }

  public static get(): DatabaseEnv {
    if (!this.instance) {
      throw new Error('DatabaseEnv no ha sido inicializado. Por favor, llama a DatabaseEnv.start() antes de obtener la instancia.');
    }
    return this.instance;
  }

  public get DATABASE_URL(): string {
    return this.env.DATABASE_URL;
  }
}
