/* eslint-disable security/detect-object-injection -- Safe: fixture factory creates controlled proxies for test data cloning */
export function fixtureFactory<T extends Record<string, unknown>>(fixture: T): T {
  const proxyCache = new WeakMap<object, unknown>();

  function createProxy(target: unknown): unknown {
    if (target == null || typeof target !== "object") {
      return target;
    }

    // Don't proxy Date objects - they need to be used as-is
    if (target instanceof Date) {
      return target;
    }

    if (proxyCache.has(target)) {
      return proxyCache.get(target);
    }

    const proxy = new Proxy(target as Record<string, unknown>, {
      get(t, p) {
        if (typeof p === "symbol" || !(p in t)) {
          // @ts-expect-error -- Proxy trap requires returning value for symbol keys which TypeScript cannot type correctly
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
