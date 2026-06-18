import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@features/authentication/entities/user.entity';

@Injectable()
export class FindUserByIdSubquery {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async execute(userId: string): Promise<Nullable<User>> {
    return this.usersRepo.findOne({ where: { userId } });
  }
}
