import { DtoValidatorPipe } from '@common/pipes/dto-validator.pipe';
import { ServerEnv } from '@environment/server.environment';
import { Logger } from '@nestjs/common/services/logger.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const env = ServerEnv.start();

  const port = env.PORT;
  const apiVersion = env.API_VERSION;
  const origin = env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim());
  const methods = env.ALLOWED_METHODS.split(',').map((method) => method.trim());
  const allowedHeaders = env.ALLOWED_HEADERS.split(',').map((header) => header.trim());
  const trustProxyHops = env.TRUST_PROXY_HOPS;
  const server = await NestFactory.create(AppModule);

  server.getHttpAdapter().getInstance().set('trust proxy', trustProxyHops);
  server.use(helmet());
  server.enableCors({ origin, methods, allowedHeaders });
  server.setGlobalPrefix(apiVersion);
  server.useGlobalPipes(new DtoValidatorPipe());

  await server.listen(port, () => {
    logger.debug(`Servidor iniciado en el puerto ${port}, versión de API ${apiVersion}`);
  });
}

bootstrap();
