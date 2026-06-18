import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '@features/authentication/entities/session.entity';
import { Repository } from 'typeorm';
import { SessionStore } from './session-store.port';

@Injectable()
export class DbSessionStore implements SessionStore {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async register(jti: string, userId: string, expiresAt: Date): Promise<void> {
    const session = Object.assign(new Session(), { jti, userId, expiresAt });
    await this.sessionRepository.save(session);
  }

  async isActive(jti: string): Promise<boolean> {
    const session = await this.sessionRepository.findOne({ where: { jti } });
    if (!session) return false;
    if (session.revokedAt !== null) return false;
    if (session.expiresAt < new Date()) return false;
    if (session.deletedAt !== null) return false;
    return true;
  }

  async revoke(jti: string): Promise<void> {
    await this.sessionRepository.update({ jti }, { revokedAt: new Date() });
  }
}
