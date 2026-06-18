import { EntityBase } from '@common/bases/entity.base';
import { User } from '@features/authentication/entities/user.entity';
import { TaskStatus } from '@features/projects/enums/task-status.enum';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tasks')
@Index('idx_tasks_project_id', ['projectId'])
@Index('idx_tasks_assignee_id', ['assigneeId'])
@Index('idx_tasks_status', ['status'])
@Index('idx_tasks_deleted_at', ['deletedAt'], { where: '"deleted_at" IS NULL' })
export class Task extends EntityBase<Task> {
  @PrimaryGeneratedColumn('uuid', { name: 'task_id' })
  taskId: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: Nullable<string>;

  @Column({ type: 'enum', enum: TaskStatus, enumName: 'task_status', default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'uuid', name: 'assignee_id', nullable: true })
  assigneeId: Nullable<string>;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;
}
