import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEnv } from '@environment/auth.environment';
import { DbSessionStore } from '@services/auth/db-session-store';
import { SESSION_STORE } from '@services/auth/session-store.port';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { UsersService } from './services/users.service';
import { SessionsService } from './services/sessions.service';
import { ValidateRegisterSubquery } from './subqueries/validate-register.subquery';
import { FindUserByEmailSubquery } from './subqueries/find-user-by-email.subquery';
import { RegisterUseCase } from './use-cases/register.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { AuthenticationController } from './authentication.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session]),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: AuthEnv.get().JWT_SECRET,
        signOptions: { expiresIn: AuthEnv.get().JWT_EXPIRES_IN as any },
      }),
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    LogoutUseCase,
    ValidateRegisterSubquery,
    FindUserByEmailSubquery,
    UsersService,
    SessionsService,
    { provide: SESSION_STORE, useClass: DbSessionStore },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthenticationModule {}
