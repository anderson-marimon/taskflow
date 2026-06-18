import { Module } from '@nestjs/common';
import { DatabaseModule } from '@services/database/database.module';
import { AuthenticationModule } from '@features/authentication/authentication.module';
import { ProjectsModule } from '@features/projects/projects.module';

@Module({
  imports: [DatabaseModule, AuthenticationModule, ProjectsModule],
})
export class AppModule {}
