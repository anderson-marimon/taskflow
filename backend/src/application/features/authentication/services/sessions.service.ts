import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
  ) {}

  async create(session: Session): Promise<Session> {
    return this.sessionsRepository.save(session);
  }

  async findByJti(jti: string): Promise<Session | null> {
    return this.sessionsRepository.findOne({ where: { jti } });
  }

  async revoke(jti: string, revokedAt: Date): Promise<void> {
    await this.sessionsRepository.update({ jti }, { revokedAt });
  }
}
