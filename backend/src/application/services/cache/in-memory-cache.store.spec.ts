import { InMemoryCacheStore } from '@services/cache/in-memory-cache.store';

describe('InMemoryCacheStore', () => {
  let store: InMemoryCacheStore;

  beforeEach(() => {
    store = new InMemoryCacheStore();
  });

  it('set y get devuelven el valor almacenado', () => {
    store.set('clave', { x: 1 }, 60);
    expect(store.get('clave')).toEqual({ x: 1 });
  });

  it('get retorna null para key inexistente', () => {
    expect(store.get<string>('no-existe')).toBeNull();
  });

  it('get retorna null cuando el TTL está vencido', () => {
    const originalDateNow = Date.now;
    Date.now = () => 1_000_000;
    store.set('clave', 'valor', 10);
    Date.now = () => 1_000_000 + 11_000;
    expect(store.get<string>('clave')).toBeNull();
    Date.now = originalDateNow;
  });

  it('del borra la entrada y get posterior retorna null', () => {
    store.set('clave', 'valor', 60);
    store.del('clave');
    expect(store.get<string>('clave')).toBeNull();
  });
});
