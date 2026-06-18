export type TJwtPayload = {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
};

export interface SessionStore {
  register(jti: string, userId: string, expiresAt: Date): Promise<void>;
  isActive(jti: string): Promise<boolean>;
  revoke(jti: string): Promise<void>;
}

export const SESSION_STORE = Symbol('SESSION_STORE');
