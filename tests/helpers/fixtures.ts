/* eslint-disable security/detect-object-injection */
/**
 * Creates a deep proxy for fixtures to prevent accidental mutations
 * @template T - Type of fixture object
 * @param fixture - Fixture object to wrap in proxy
 * @returns Proxy-wrapped fixture
 */
export function fixtureFactory<T extends Record<string, unknown>>(fixture: T): T {
  const proxyCache = new WeakMap<object, unknown>();

  function createProxy(target: unknown): unknown {
    if (target == null || typeof target !== "object") {
      return target;
    }

    if (proxyCache.has(target)) {
      return proxyCache.get(target);
    }

    const proxy = new Proxy(target as Record<string, unknown>, {
      get(t, p) {
        if (typeof p === "symbol" || !(p in t)) {
          // @ts-expect-error - Proxy indexing with symbol or dynamic string
          return t[p];
        }

        const value = t[p];

        if (typeof value === "function" || value === null) {
          return value;
        }

        if (typeof value === "object") {
          return createProxy(value);
        }

        return structuredClone(value);
      },
    });

    proxyCache.set(target, proxy);
    return proxy;
  }

  return createProxy(fixture) as T;
}
