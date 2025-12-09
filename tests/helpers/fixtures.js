/**
 * @template T extends Record<string, any>
 * @param {T} fixture
 * @returns {T}
 */
export function fixtureFactory(fixture) {
  const proxyCache = new WeakMap();

  /**
   * @param {any} target
   * @returns {any}
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
       * @param {object} t
       * @param {string | symbol} p
       */
      get(t, p) {
        if (typeof p === "symbol" || !(p in t)) {
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

  return createProxy(fixture);
}
