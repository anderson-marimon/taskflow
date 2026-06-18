import { Logger } from '@nestjs/common';
import * as joi from 'joi';
import { loadEnv } from '@environment/load.environment';

type AuthEnvironment = {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
};

export class AuthEnv {
  private static instance: Nullable<AuthEnv> = null;
  private static readonly logger = new Logger(AuthEnv.name);
  private readonly env: AuthEnvironment;

  private constructor(env: AuthEnvironment) {
    this.env = env;
  }

  public static start(): AuthEnv {
    if (this.instance) return this.instance;

    loadEnv();

    const schema = joi
      .object<AuthEnvironment>({
        JWT_SECRET: joi.string().required(),
        JWT_EXPIRES_IN: joi.string().default('24h'),
      })
      .unknown(true);

    const result: joi.ValidationResult<AuthEnvironment> = schema.validate(process.env);

    if (result.error) {
      AuthEnv.logger.error(result.error.message);
      process.exit(1);
    }

    this.instance = new AuthEnv(result.value);
    return this.instance;
  }

  public static get(): AuthEnv {
    if (!this.instance) {
      throw new Error('AuthEnv no ha sido inicializado. Por favor, llama a AuthEnv.start() antes de obtener la instancia.');
    }
    return this.instance;
  }

  public get JWT_SECRET(): string {
    return this.env.JWT_SECRET;
  }

  public get JWT_EXPIRES_IN(): string {
    return this.env.JWT_EXPIRES_IN;
  }
}
