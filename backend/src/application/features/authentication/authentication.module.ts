import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEnv } from '@environment/auth.environment';
import { DbSessionStore } from '@services/auth/db-session-store';
import { SESSION_STORE } from '@services/auth/session-store.port';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { User } from '@features/authentication/entities/user.entity';
import { Session } from '@features/authentication/entities/session.entity';
import { UsersService } from '@features/authentication/services/users.service';
import { SessionsService } from '@features/authentication/services/sessions.service';
import { ValidateRegisterSubquery } from '@features/authentication/subqueries/validate-register.subquery';
import { FindUserByEmailSubquery } from '@features/authentication/subqueries/find-user-by-email.subquery';
import { RegisterUseCase } from '@features/authentication/use-cases/register.use-case';
import { LoginUseCase } from '@features/authentication/use-cases/login.use-case';
import { LogoutUseCase } from '@features/authentication/use-cases/logout.use-case';
import { GetProfileUseCase } from '@features/authentication/use-cases/get-profile.use-case';
import { AuthenticationController } from '@features/authentication/authentication.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session]),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: AuthEnv.get().JWT_SECRET,
        signOptions: { expiresIn: AuthEnv.get().JWT_EXPIRES_IN as JwtSignOptions['expiresIn'] },
      }),
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    LogoutUseCase,
    GetProfileUseCase,
    ValidateRegisterSubquery,
    FindUserByEmailSubquery,
    UsersService,
    SessionsService,
    { provide: SESSION_STORE, useClass: DbSessionStore },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthenticationModule {}
