/**
 * @file Integration tests for users router v1
 */

import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { users } from "#modules/users/users.model.js";

import { fixtures as baseFixtures, createTestingApp, dbUtils } from "../../helpers/index.js";

import { usersListFixtures as fixtures, getEndpoint, TESTING_METHOD, validationCases } from "./users.router.v1.fixtures.js";

/**
 * Helper to hash passwords in seed data
 * @param {object[]} seedData - Seed data with password: "hashed_password"
 * @returns {Promise<object[]>} Seed data with hashed passwords
 */
async function hashPasswords(seedData) {
  const hashedPassword = await baseFixtures.createUserSeed().then((u) => u.password);
  return seedData.map((user) => ({
    ...user,
    password: user.password === "hashed_password" ? hashedPassword : user.password,
  }));
}

describe(`${TESTING_METHOD}-${getEndpoint()}`, () => {
  let app;
  let database;
  let teardown;

  before(async () => {
    const payload = await createTestingApp();
    app = payload.app;
    database = payload.database;
    teardown = payload.teardown;
  });

  beforeEach(async () => {
    await dbUtils.cleanUp(database.drizzle);
  });

  after(async () => {
    await teardown();
  });

  describe("Basic pagination", () => {
    it("[200] should return paginated users list", async () => {
      const seedData = await hashPasswords(fixtures.seeds.common.MULTIPLE_USERS.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.PAGINATED_LIST.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.data.length >= fixtures.positive.PAGINATED_LIST.out.minDataLength);
      assert.deepStrictEqual(Object.keys(data.meta).sort(), fixtures.positive.PAGINATED_LIST.out.metaKeys.sort());
    });

    it("[200] should return correct pagination metadata", async () => {
      const seedData = await hashPasswords(fixtures.seeds.positive.FIFTEEN_USERS.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.PAGINATION_METADATA.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(data.meta.page, fixtures.positive.PAGINATION_METADATA.out.meta.page);
      assert.strictEqual(data.meta.limit, fixtures.positive.PAGINATION_METADATA.out.meta.limit);
    });

    it("[200] should return empty array when no users exist", async () => {
      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.EMPTY_RESULT.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(data.data.length, fixtures.positive.EMPTY_RESULT.out.dataLength);
      assert.strictEqual(data.meta.itemCount, fixtures.positive.EMPTY_RESULT.out.metaTotal);
    });

    it("[200] should handle page beyond available results", async () => {
      const seedData = await hashPasswords(fixtures.seeds.common.SINGLE_USER.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.PAGE_BEYOND.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(data.data.length, fixtures.positive.PAGE_BEYOND.out.dataLength);
    });
  });

  describe("Filtering", () => {
    it("[200] should filter by email with $eq operator", async () => {
      const seedData = await hashPasswords(fixtures.seeds.positive.FILTER_EMAIL.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.FILTER_EMAIL_EQ.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(data.data.length > 0);
      for (const user of data.data) {
        assert.strictEqual(user.email, fixtures.positive.FILTER_EMAIL_EQ.out.expectedEmail);
      }
    });

    it("[200] should filter by role with $eq operator", async () => {
      const seedData = await hashPasswords(fixtures.seeds.positive.FILTER_ROLE.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.FILTER_ROLE_EQ.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      for (const user of data.data) {
        assert.strictEqual(user.role, fixtures.positive.FILTER_ROLE_EQ.out.expectedRole);
      }
    });

    it("[200] should filter by email with $in operator", async () => {
      const seedData = await hashPasswords(fixtures.seeds.positive.IN_OPERATOR.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.FILTER_EMAIL_IN.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      const allowedEmails = new Set(fixtures.positive.FILTER_EMAIL_IN.out.allowedEmails);
      for (const user of data.data) {
        assert.ok(allowedEmails.has(user.email));
      }
    });

    it("[200] should handle multiple filters", async () => {
      const seedData = await hashPasswords(fixtures.seeds.positive.MULTIPLE_FILTERS.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.MULTIPLE_FILTERS.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      for (const user of data.data) {
        assert.strictEqual(user.role, fixtures.positive.MULTIPLE_FILTERS.out.expectedRole);
        assert.ok(user.email.toLowerCase().includes(fixtures.positive.MULTIPLE_FILTERS.out.emailContains));
      }
    });
  });

  describe("Sorting", () => {
    it("[200] should sort by single field", async () => {
      const seedData = await hashPasswords(fixtures.seeds.common.MULTIPLE_USERS.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.SORT_SINGLE.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(data.data.length > 0);
    });

    it("[200] should sort by multiple fields", async () => {
      const seedData = await hashPasswords(fixtures.seeds.positive.COMPLEX_QUERY.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.SORT_MULTIPLE.in.query,
      });

      assert.strictEqual(response.statusCode, 200);
    });
  });

  describe("Search", () => {
    it("[200] should search by text", async () => {
      const seedData = await hashPasswords(fixtures.seeds.positive.SEARCH_DATA.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.SEARCH.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(Array.isArray(data.data));
    });
  });

  describe("Select fields", () => {
    it("[200] should return only selected single field", async () => {
      const seedData = await hashPasswords(fixtures.seeds.common.SINGLE_USER.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.SELECT_SINGLE.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(data.data.length > 0);
      for (const field of fixtures.positive.SELECT_SINGLE.out.expectedFields) {
        assert.ok(field in data.data[0]);
      }
    });

    it("[200] should return only selected multiple fields", async () => {
      const seedData = await hashPasswords(fixtures.seeds.common.SINGLE_USER.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.SELECT_MULTIPLE.in.query,
      });

      const data = response.json();
      const user = data.data[0];

      assert.strictEqual(response.statusCode, 200);
      for (const field of fixtures.positive.SELECT_MULTIPLE.out.expectedFields) {
        assert.ok(field in user);
      }
    });
  });

  describe("Complex scenarios", () => {
    it("[200] should handle filter + search + sort", async () => {
      const seedData = await hashPasswords(fixtures.seeds.positive.SEARCH_DATA.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.COMPLEX_QUERY.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      for (const user of data.data) {
        assert.strictEqual(user.role, fixtures.positive.COMPLEX_QUERY.out.expectedRole);
      }
    });

    it("[200] should handle complex query with all features", async () => {
      const seedData = await hashPasswords(fixtures.seeds.positive.COMPLEX_QUERY.data);
      await dbUtils.seed(database.drizzle, users, seedData);

      const response = await app.inject({
        method: TESTING_METHOD,
        path: getEndpoint(),
        query: fixtures.positive.COMPLEX_ALL_FEATURES.in.query,
      });

      const data = response.json();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(data.data.length <= fixtures.positive.COMPLEX_ALL_FEATURES.out.maxDataLength);
    });
  });

  describe("Validation errors", () => {
    for (const { fixture, name } of validationCases) {
      it(`[400] should return error for ${name}`, async () => {
        const response = await app.inject({
          method: TESTING_METHOD,
          path: getEndpoint(),
          query: fixture.in.query,
        });

        assert.strictEqual(response.statusCode, 400);
      });
    }
  });

  describe("Future improvements", () => {
    it.todo("[200] should support cursor-based pagination");
    it.todo("[429] should handle rate limiting");
    it.todo("[200] should cache frequently accessed queries");
  });
});
