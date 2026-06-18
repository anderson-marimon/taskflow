import { Injectable } from '@nestjs/common';
import { User } from '@features/authentication/entities/user.entity';
import { UsersService } from '@features/authentication/services/users.service';

@Injectable()
export class FindUserByEmailSubquery {
  constructor(private readonly usersService: UsersService) {}

  async execute(email: string): Promise<Nullable<User>> {
    return this.usersService.findByEmail(email);
  }
}
