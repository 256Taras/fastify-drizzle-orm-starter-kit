import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { getManyUserFixtures as fixtures } from "./get-many-user.fixtures.ts";

import type { User, UsersListResponse } from "#modules/users/users.contracts.ts";
import { assertHasValidPagination, assertMatchesShape } from "#tests/helpers/assertions/assertions.ts";
import type { TestContext } from "#tests/helpers/types/test-context.types.ts";
import { createEndpoint } from "#tests/helpers/utils/endpoint.utils.ts";
import { createTestContext } from "#tests/helpers/utils/testing-app.utils.ts";

const TESTING_METHOD = "GET";
const endpoint = createEndpoint("/v1/users/");

describe(`${TESTING_METHOD} ${endpoint()}`, () => {
  let ctx: TestContext;

  before(async () => {
    ctx = await createTestContext();
  });

  beforeEach(async () => {
    await ctx.db.cleanUp();
  });

  after(async () => {
    await ctx.teardown();
  });

  describe("Success Cases", () => {
    it("[200] should return paginated users list", async () => {
      await ctx.db.seed(fixtures.seeds.MULTIPLE_USERS);
      const { PAGINATED_LIST } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: PAGINATED_LIST.input.query,
      });

      const data = response.json<UsersListResponse>();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.data.length >= 2);
      assertHasValidPagination(data.meta, { expectedPage: 1, expectedLimit: 10 });
    });

    it("[200] should return correct pagination metadata", async () => {
      await ctx.db.seed(fixtures.seeds.MANY_USERS(15));
      const { PAGINATION_METADATA } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: PAGINATION_METADATA.input.query,
      });

      const data = response.json<UsersListResponse>();

      assert.strictEqual(response.statusCode, 200);
      assertHasValidPagination(data.meta, {
        minItemCount: 15,
        expectedPage: 2,
        expectedLimit: 5,
      });
    });

    it("[200] should return empty array when no users exist", async () => {
      const { EMPTY_RESULT } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: EMPTY_RESULT.input.query,
      });

      const data = response.json<UsersListResponse>();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(data.data.length, 0);
      assert.strictEqual(data.meta.itemCount, 0);
    });

    it("[200] should filter by email with $eq operator", async () => {
      await ctx.db.seed(fixtures.seeds.SEARCH_USERS);
      const { FILTER_EMAIL } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: FILTER_EMAIL.input.query,
      });

      const data = response.json<UsersListResponse>();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(data.data.length > 0);
      assert.ok(data.data.every((user: User) => user.email === FILTER_EMAIL.expected.matchEvery.email));
    });

    it("[200] should filter by email with $in operator", async () => {
      await ctx.db.seed(fixtures.seeds.SEARCH_USERS);
      const { FILTER_EMAIL_IN } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: FILTER_EMAIL_IN.input.query,
      });

      const data = response.json<UsersListResponse>();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(data.data.every((user: User) => FILTER_EMAIL_IN.expected.matchSome.includes(user.email)));
    });

    it("[200] should handle multiple filters", async () => {
      await ctx.db.seed(fixtures.seeds.SEARCH_USERS);
      const { MULTIPLE_FILTERS } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: MULTIPLE_FILTERS.input.query,
      });

      const data = response.json<UsersListResponse>();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(data.data.every((user: User) => user.role === MULTIPLE_FILTERS.expected.matchEvery.role));
      assert.ok(data.data.every((user: User) => user.email.toLowerCase().includes(MULTIPLE_FILTERS.expected.emailContains)));
    });

    it("[200] should sort by multiple fields", async () => {
      await ctx.db.seed(fixtures.seeds.MANY_USERS(10));
      const { SORT_MULTIPLE } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: SORT_MULTIPLE.input.query,
      });

      const data = response.json<UsersListResponse>();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(data.data.length > 0);
    });

    it("[200] should return only selected multiple fields", async () => {
      await ctx.db.seed(fixtures.seeds.SINGLE_USER);
      const { SELECT_MULTIPLE } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: SELECT_MULTIPLE.input.query,
      });

      const data = response.json<UsersListResponse>();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(Array.isArray(data.data));
      assert.ok(data.data.length > 0);
      assertMatchesShape(data.data[0], SELECT_MULTIPLE.expected.shape);
    });

    it("[200] should handle complex query with all features", async () => {
      await ctx.db.seed(fixtures.seeds.MANY_USERS(15));
      const { COMPLEX_ALL_FEATURES } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: COMPLEX_ALL_FEATURES.input.query,
      });

      const data = response.json<UsersListResponse>();

      assert.strictEqual(response.statusCode, 200);
      assert.ok(data.data.length <= COMPLEX_ALL_FEATURES.expected.maxLength);
    });
  });

  describe("Error Cases - Validation", () => {
    it("[400] should return error for invalid limit", async () => {
      const { INVALID_LIMIT } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: INVALID_LIMIT.input.query,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should return error for invalid filter operator", async () => {
      const { INVALID_FILTER_OPERATOR } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: INVALID_FILTER_OPERATOR.input.query,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should return error for invalid enum value", async () => {
      const { INVALID_ENUM } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        query: INVALID_ENUM.input.query,
      });

      assert.strictEqual(response.statusCode, 400);
    });
  });
});
