/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call */
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { usersListFixtures as fixtures, getEndpoint, TESTING_METHOD } from "./get-many-user.fixtures.ts";

import type { User } from "#modules/users/users.contracts.ts";
import { assertHasValidPagination, assertMatchesShape, createDbHelper, createTestingApp } from "#tests/helpers/index.ts";

describe(`${TESTING_METHOD}-${getEndpoint()}`, () => {
  let app: Awaited<ReturnType<typeof createTestingApp>>["app"];
  let db: ReturnType<typeof createDbHelper>;
  let teardown: () => Promise<void>;

  before(async () => {
    const payload = await createTestingApp();
    app = payload.app;
    teardown = payload.teardown;
    // @ts-expect-error - Drizzle database types are complex, this works at runtime
    db = createDbHelper(payload.database.drizzle);
  });

  beforeEach(async () => {
    await db.cleanUp();
  });

  after(async () => {
    await teardown();
  });

  it("[200] should return paginated users list", async () => {
    await db.seed(fixtures.seeds.MULTIPLE_USERS);

    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.positive.PAGINATED_LIST.in.query,
    });

    const data = response.json();

    assert.strictEqual(response.statusCode, 200);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length >= 2);
    assertHasValidPagination(data.meta, { expectedPage: 1, expectedLimit: 10 });
  });

  it("[200] should return correct pagination metadata", async () => {
    await db.seed(fixtures.seeds.MANY_USERS(15));

    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.positive.PAGINATION_METADATA.in.query,
    });

    const data = response.json();

    assert.strictEqual(response.statusCode, 200);
    assertHasValidPagination(data.meta, {
      minItemCount: 15,
      expectedPage: 2,
      expectedLimit: 5,
    });
  });

  it("[200] should return empty array when no users exist", async () => {
    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.positive.EMPTY_RESULT.in.query,
    });

    const data = response.json();

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(data.data.length, 0);
    assert.strictEqual(data.meta.itemCount, 0);
  });

  it("[200] should filter by email with $eq operator", async () => {
    await db.seed(fixtures.seeds.SEARCH_USERS);

    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.positive.FILTER_EMAIL.in.query,
    });

    const data = response.json();
    const expected = fixtures.positive.FILTER_EMAIL.out.matchEvery;

    assert.strictEqual(response.statusCode, 200);
    assert.ok(data.data.length > 0);

    assert.ok(data.data.every((user: User) => user.email === expected.email));
  });

  it("[200] should filter by email with $in operator", async () => {
    await db.seed(fixtures.seeds.SEARCH_USERS);

    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.positive.FILTER_EMAIL_IN.in.query,
    });

    const data = response.json();
    const allowedEmails = fixtures.positive.FILTER_EMAIL_IN.out.matchSome;

    assert.strictEqual(response.statusCode, 200);
    assert.ok(data.data.every((user: User) => allowedEmails.includes(user.email)));
  });

  it("[200] should handle multiple filters", async () => {
    await db.seed(fixtures.seeds.SEARCH_USERS);

    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.positive.MULTIPLE_FILTERS.in.query,
    });

    const data = response.json();
    const expected = fixtures.positive.MULTIPLE_FILTERS.out;

    assert.strictEqual(response.statusCode, 200);
    assert.ok(data.data.every((user: User) => user.role === expected.matchEvery.role));
    assert.ok(data.data.every((user: User) => user.email.toLowerCase().includes(expected.emailContains)));
  });

  it("[200] should sort by multiple fields", async () => {
    await db.seed(fixtures.seeds.MANY_USERS(10));

    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.positive.SORT_MULTIPLE.in.query,
    });

    const data = response.json();

    assert.strictEqual(response.statusCode, 200);
    assert.ok(data.data.length > 0);
  });

  it("[200] should return only selected multiple fields", async () => {
    await db.seed(fixtures.seeds.SINGLE_USER);

    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.positive.SELECT_MULTIPLE.in.query,
    });

    const data = response.json();
    const expected = fixtures.positive.SELECT_MULTIPLE.out.shape;

    assert.strictEqual(response.statusCode, 200);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length > 0, "Response should contain at least one user");
    const user = data.data[0];
    assertMatchesShape(user, expected);
  });

  it("[200] should handle complex query with all features", async () => {
    await db.seed(fixtures.seeds.MANY_USERS(15));

    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.positive.COMPLEX_ALL_FEATURES.in.query,
    });

    const data = response.json();
    const expected = fixtures.positive.COMPLEX_ALL_FEATURES.out;

    assert.strictEqual(response.statusCode, 200);
    assert.ok(data.data.length <= expected.maxLength);
  });

  it("[400] should return error for invalid limit", async () => {
    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.negative.INVALID_LIMIT.in.query,
    });

    assert.strictEqual(response.statusCode, 400);
  });

  it("[400] should return error for invalid filter operator", async () => {
    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.negative.INVALID_FILTER_OPERATOR.in.query,
    });

    assert.strictEqual(response.statusCode, 400);
  });

  it("[400] should return error for invalid enum value", async () => {
    const response = await app.inject({
      method: TESTING_METHOD,
      path: getEndpoint(),
      query: fixtures.negative.INVALID_ENUM.in.query,
    });

    assert.strictEqual(response.statusCode, 400);
  });
});
