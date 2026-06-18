import { EntityBase } from '@common/bases/entity.base';
import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('sessions')
@Index('idx_sessions_user_id', ['userId'])
export class Session extends EntityBase<Session> {
  @PrimaryColumn('uuid')
  jti: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', name: 'revoked_at', nullable: true })
  revokedAt: Nullable<Date>;
}
