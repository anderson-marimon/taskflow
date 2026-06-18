import { EntityBase } from '@common/bases/entity.base';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
@Index('uq_users_email_active', ['email'], { unique: true, where: '"deleted_at" IS NULL' })
export class User extends EntityBase<User> {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  passwordHash: string;
}
