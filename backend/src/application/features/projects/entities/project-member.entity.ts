import { EntityBase } from '@common/bases/entity.base';
import { User } from '@features/authentication/entities/user.entity';
import { Project } from '@features/projects/entities/project.entity';
import { Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('project_members')
@Index('idx_project_members_user_id', ['userId'])
export class ProjectMember extends EntityBase<ProjectMember> {
  @PrimaryColumn({ type: 'uuid', name: 'project_id' })
  projectId: string;

  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => Project, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
