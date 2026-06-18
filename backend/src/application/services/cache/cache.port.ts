export interface CacheStore {
  get<T>(key: string): Nullable<T>;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  del(key: string): void;
}

export const CACHE_STORE = Symbol('CACHE_STORE');
