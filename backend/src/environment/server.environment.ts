import { loadEnv } from '@environment/load.environment';
import { Logger } from '@nestjs/common';
import * as joi from 'joi';

type ServerEnvironment = {
  PORT: number;
  API_VERSION: string;
  ALLOWED_ORIGINS: string;
  ALLOWED_METHODS: string;
  ALLOWED_HEADERS: string;
  TRUST_PROXY_HOPS: number;
};

export class ServerEnv {
  private static instance: Nullable<ServerEnv> = null;
  private static readonly logger = new Logger(ServerEnv.name);
  private readonly env: ServerEnvironment;

  private constructor(env: ServerEnvironment) {
    this.env = env;
  }

  public static start(): ServerEnv {
    if (this.instance) return this.instance;

    loadEnv();

    const schema = joi
      .object<ServerEnvironment>({
        PORT: joi.number().required(),
        API_VERSION: joi.string().required(),
        ALLOWED_ORIGINS: joi.string().required(),
        ALLOWED_METHODS: joi.string().required(),
        ALLOWED_HEADERS: joi.string().required(),
        TRUST_PROXY_HOPS: joi.number().required(),
      })
      .unknown(true);

    const result: joi.ValidationResult<ServerEnvironment> = schema.validate(process.env);

    if (result.error) {
      ServerEnv.logger.error(`La variable de entorno ${result.error.message} no se encuentra definida`);
      ServerEnv.logger.warn('Por favor, define todas las variables de entorno requeridas antes de iniciar el servidor');
    }

    this.instance = new ServerEnv(result.value);
    return this.instance;
  }

  public static get(): ServerEnv {
    if (!this.instance) {
      throw new Error('ServerEnv no ha sido inicializado. Por favor, llama a ServerEnv.start() antes de obtener la instancia.');
    }
    return this.instance;
  }

  public get PORT(): number {
    return this.env.PORT;
  }

  public get API_VERSION(): string {
    return this.env.API_VERSION;
  }

  public get ALLOWED_ORIGINS(): string {
    return this.env.ALLOWED_ORIGINS;
  }

  public get ALLOWED_METHODS(): string {
    return this.env.ALLOWED_METHODS;
  }

  public get ALLOWED_HEADERS(): string {
    return this.env.ALLOWED_HEADERS;
  }

  public get TRUST_PROXY_HOPS(): number {
    return this.env.TRUST_PROXY_HOPS;
  }
}
