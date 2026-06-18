import { Injectable } from '@nestjs/common';
import type { CacheStore } from '@services/cache/cache.port';

@Injectable()
export class InMemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, { value: unknown; expiresAt: number }>();

  get<T>(key: string): Nullable<T> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  del(key: string): void {
    this.store.delete(key);
  }
}
