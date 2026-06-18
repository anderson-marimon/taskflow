import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { UsersService } from '../services/users.service';

@Injectable()
export class FindUserByEmailSubquery {
  constructor(private readonly usersService: UsersService) {}

  async execute(email: string): Promise<User | null> {
    return this.usersService.findByEmail(email);
  }
}
