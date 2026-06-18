import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@features/authentication/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<Nullable<User>> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findById(id: string): Promise<Nullable<User>> {
    return this.usersRepository.findOne({ where: { userId: id } });
  }
}
