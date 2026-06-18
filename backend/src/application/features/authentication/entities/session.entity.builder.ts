import { Session } from './session.entity';

export class SessionEntityBuilder {
  private readonly session: Partial<Session> = {};

  public static create(): SessionEntityBuilder {
    return new SessionEntityBuilder();
  }

  public withJti(jti: string): SessionEntityBuilder {
    this.session.jti = jti;
    return this;
  }

  public withUserId(userId: string): SessionEntityBuilder {
    this.session.userId = userId;
    return this;
  }

  public withExpiresAt(expiresAt: Date): SessionEntityBuilder {
    this.session.expiresAt = expiresAt;
    return this;
  }

  public build(): Session {
    const requiredFields: (keyof Session)[] = ['jti', 'userId', 'expiresAt'];
    for (const field of requiredFields) {
      if (this.session[field] === undefined) {
        throw new Error(`Falta el campo requerido para crear la sesión: ${field}`);
      }
    }
    return Object.assign(new Session(), this.session);
  }
}
