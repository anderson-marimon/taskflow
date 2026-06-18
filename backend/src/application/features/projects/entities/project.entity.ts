import { EntityBase } from '@common/bases/entity.base';
import { User } from '@features/authentication/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('projects')
@Index('idx_projects_owner_id', ['ownerId'])
@Index('idx_projects_deleted_at', ['deletedAt'], { where: '"deleted_at" IS NULL' })
export class Project extends EntityBase<Project> {
  @PrimaryGeneratedColumn('uuid', { name: 'project_id' })
  projectId: string;

  @Column({ type: 'uuid', name: 'owner_id' })
  ownerId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: Nullable<string>;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
