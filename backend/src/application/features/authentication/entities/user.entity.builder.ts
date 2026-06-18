import { User } from './user.entity';

export class UserEntityBuilder {
  private readonly user: Partial<User> = {};

  public static create(): UserEntityBuilder {
    return new UserEntityBuilder();
  }

  public withName(name: string): UserEntityBuilder {
    this.user.name = name;
    return this;
  }

  public withEmail(email: string): UserEntityBuilder {
    this.user.email = email;
    return this;
  }

  public withPasswordHash(passwordHash: string): UserEntityBuilder {
    this.user.passwordHash = passwordHash;
    return this;
  }

  public build(): User {
    const requiredFields: (keyof User)[] = ['name', 'email', 'passwordHash'];
    for (const field of requiredFields) {
      if (this.user[field] === undefined) {
        throw new Error(`Falta el campo requerido para crear el usuario: ${field}`);
      }
    }
    return Object.assign(new User(), this.user);
  }
}
