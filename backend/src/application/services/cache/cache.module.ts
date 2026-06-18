import { Global, Module } from '@nestjs/common';
import { CACHE_STORE } from '@services/cache/cache.port';
import { InMemoryCacheStore } from '@services/cache/in-memory-cache.store';

@Global()
@Module({
  providers: [{ provide: CACHE_STORE, useClass: InMemoryCacheStore }],
  exports: [CACHE_STORE],
})
export class CacheModule {}
