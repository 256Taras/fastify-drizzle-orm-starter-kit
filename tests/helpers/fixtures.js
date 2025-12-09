/**
 * @template T extends Record<string, any>
 * @param {T} fixture
 * @returns {T}
 * @throws {Error}
 */
export function fixtureFactory(fixture) {
  /**
   * @param {any} target
   * @returns {any}
   */
  function createProxy(target) {
    // @ts-ignore
    return new Proxy(target, {
      /**
       * @param {object} t
       * @param {string | symbol} p
       */
      get(t, p) {
        if (!(p in t)) {
          const availableKeys = Object.keys(t).join(", ");
          throw new Error(`Fixture "${String(p)}" does not exist. Available: [${availableKeys}]`);
        }

        const value = t[p];

        // Functions cannot be cloned, return as-is
        if (typeof value === "function") {
          return value;
        }

        // Objects and arrays need recursive proxying to avoid cloning functions
        if (value !== null && typeof value === "object") {
          return createProxy(value);
        }

        // Primitives can be cloned safely
        return structuredClone(value);
      },
    });
  }

  return createProxy(fixture);
}
