import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@features/projects/entities/project.entity';
import { ProjectMember } from '@features/projects/entities/project-member.entity';
import { User } from '@features/authentication/entities/user.entity';
import { ProjectsService } from '@features/projects/services/projects.service';
import { ProjectMembersService } from '@features/projects/services/project-members.service';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { FindUserByIdSubquery } from '@features/projects/subqueries/find-user-by-id.subquery';
import { CreateProjectUseCase } from '@features/projects/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '@features/projects/use-cases/list-projects.use-case';
import { GetProjectUseCase } from '@features/projects/use-cases/get-project.use-case';
import { UpdateProjectUseCase } from '@features/projects/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from '@features/projects/use-cases/delete-project.use-case';
import { AddMemberUseCase } from '@features/projects/use-cases/add-member.use-case';
import { ProjectsController } from '@features/projects/projects.controller';
import { TasksModule } from '@features/projects/modules/tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember, User]),
    TasksModule,
  ],
  controllers: [ProjectsController],
  providers: [
    CreateProjectUseCase,
    ListProjectsUseCase,
    GetProjectUseCase,
    UpdateProjectUseCase,
    DeleteProjectUseCase,
    AddMemberUseCase,
    VerifyProjectAccessSubquery,
    FindUserByIdSubquery,
    ProjectsService,
    ProjectMembersService,
  ],
})
export class ProjectsModule {}
