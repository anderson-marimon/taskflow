import { Module } from '@nestjs/common';
import { DatabaseModule } from '@services/database/database.module';
import { CacheModule } from '@services/cache/cache.module';
import { AuthenticationModule } from '@features/authentication/authentication.module';
import { ProjectsModule } from '@features/projects/projects.module';

@Module({
  imports: [DatabaseModule, CacheModule, AuthenticationModule, ProjectsModule],
})
export class AppModule {}
