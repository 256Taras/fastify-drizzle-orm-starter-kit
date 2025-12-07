/**
 * @file Test fixtures
 */

import { ROLES_NAMES } from "#libs/constants/common.constants.js";
import encrypterService from "#libs/encryption/encrypter.service.js";

const DEFAULT_PASSWORD = "password123";

/**
 * Creates admin seed data
 * @param {object} [overrides] - Override default values
 * @returns {Promise<object>} Admin data with hashed password
 */
export async function createAdminSeed(overrides = {}) {
  const encrypter = encrypterService();
  const hashedPassword = await encrypter.getHash(DEFAULT_PASSWORD);

  return {
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    password: hashedPassword,
    role: ROLES_NAMES.admin,
    ...overrides,
  };
}

/**
 * Creates multiple user seeds
 * @param {number} count - Number of users to create
 * @param {object} [overrides] - Base overrides for all users
 * @param {Function} [customizer] - Optional async function to customize each user (receives index, baseData)
 * @returns {Promise<object[]>} Array of user data
 */
export async function createMultipleUserSeeds(count, overrides = {}, customizer) {
  const seeds = [];
  for (let i = 0; i < count; i++) {
    const baseData = {
      email: `user${i + 1}@example.com`,
      firstName: `User${i + 1}`,
      ...overrides,
    };
    const customData = customizer ? await customizer(i, baseData) : {};
    seeds.push(await createUserSeed({ ...baseData, ...customData }));
  }
  return seeds;
}

/**
 * Creates user seed data
 * @param {object} [overrides] - Override default values
 * @returns {Promise<object>} User data with hashed password
 */
export async function createUserSeed(overrides = {}) {
  const encrypter = encrypterService();
  const hashedPassword = await encrypter.getHash(DEFAULT_PASSWORD);

  return {
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    password: hashedPassword,
    role: ROLES_NAMES.user,
    ...overrides,
  };
}

/**
 * Creates an identity-like fixture wrapper using a Proxy.
 *
 * The returned Proxy preserves the shape of the input fixture object (identity),
 * but overrides property access:
 *  - Throws an error if the requested fixture key does not exist.
 *  - Returns a deep-cloned value (via `structuredClone`) for each access, ensuring
 *    test isolation and preventing accidental mutations.
 *
 * @template T extends Record<string, any>
 *
 * @param {T} fixture
 *   Source fixture object containing keys like `seeds`, `positive`, `negative`,
 *   `common`, etc.
 *
 * @returns {T}
 *   A Proxy that behaves like the original fixture (identity), but each property
 *   access yields a cloned value and includes strict key validation.
 *
 * @throws {Error}
 *   If accessing an unknown fixture key.
 */
export function fixtureFactory(fixture) {
  // @ts-ignore - ignore that returned type is not the same as input, but its specific behavior of Proxy
  return new Proxy(fixture, {
    /**
     *
     * @param target
     * @param prop
     */
    get(target, prop) {
      if (!(prop in target)) {
        const availableKeys = Object.keys(target).join(", ");
        throw new Error(`Fixture "${String(prop)}" does not exist. Available: [${availableKeys}]`);
      }

      // structuredClone - native, fast, reliable
      return structuredClone(target[prop]);
    },
  });
}

export const fixtures = {
  createUserSeed,
  createAdminSeed,
  createMultipleUserSeeds,
  fixtureFactory,
};
