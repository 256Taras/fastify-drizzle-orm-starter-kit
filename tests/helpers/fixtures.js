/**
 * @template T Extends Record<string, unknown>
 * @param {T} fixture
 * @returns {T}
 */
export function fixtureFactory(fixture) {
  const proxyCache = new WeakMap();

  /**
   * @param {unknown} target - Target object to create proxy for
   * @returns {unknown} Proxy object
   */
  function createProxy(target) {
    if (target == null || typeof target !== "object") {
      return target;
    }

    if (proxyCache.has(target)) {
      return proxyCache.get(target);
    }

    const proxy = new Proxy(target, {
      /**
       * @param {Record<string, unknown>} t
       * @param {string | symbol} p
       */
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

  // @ts-expect-error - Return type is generic and inferred from fixture parameter
  return createProxy(fixture);
}
