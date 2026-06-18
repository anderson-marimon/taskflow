import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '@features/projects/entities/project.entity';
import { ProjectMember } from '@features/projects/entities/project-member.entity';
import { User } from '@features/authentication/entities/user.entity';
import { Task } from '@features/projects/modules/tasks/entities/task.entity';
import { TasksService } from '@features/projects/modules/tasks/services/tasks.service';
import { ValidateAssigneeIsMemberSubquery } from '@features/projects/modules/tasks/subqueries/validate-assignee-is-member.subquery';
import { VerifyProjectAccessSubquery } from '@features/projects/subqueries/verify-project-access.subquery';
import { CreateTaskUseCase } from '@features/projects/modules/tasks/use-cases/create-task.use-case';
import { ListTasksUseCase } from '@features/projects/modules/tasks/use-cases/list-tasks.use-case';
import { UpdateTaskUseCase } from '@features/projects/modules/tasks/use-cases/update-task.use-case';
import { TasksController } from '@features/projects/modules/tasks/tasks.controller';
import { ProjectsService } from '@features/projects/services/projects.service';
import { ProjectMembersService } from '@features/projects/services/project-members.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Project, ProjectMember, User])],
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    ListTasksUseCase,
    UpdateTaskUseCase,
    ValidateAssigneeIsMemberSubquery,
    VerifyProjectAccessSubquery,
    TasksService,
    ProjectsService,
    ProjectMembersService,
  ],
  exports: [TasksService],
})
export class TasksModule {}
