import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TJwtPayload } from '@services/auth/session-store.port';

export const JwtPayload = createParamDecorator((_: unknown, ctx: ExecutionContext): TJwtPayload => {
  return ctx.switchToHttp().getRequest().user as TJwtPayload;
});

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  return (ctx.switchToHttp().getRequest().user as TJwtPayload)?.sub;
});
