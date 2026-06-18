import { Module } from '@nestjs/common';
import { DatabaseModule } from '@services/database/database.module';
import { AuthenticationModule } from '@features/authentication/authentication.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule],
})
export class AppModule {}
