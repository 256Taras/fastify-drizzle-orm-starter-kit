import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { refreshTokensFixtures as fixtures } from "./refresh-tokens.fixtures.ts";

import type { Credentials } from "#modules/auth/auth.contracts.ts";
import type { TestContext } from "#tests/helpers/types/test-context.types.ts";
import { createEndpoint } from "#tests/helpers/utils/endpoint.utils.ts";
import { createTestContext } from "#tests/helpers/utils/testing-app.utils.ts";

const TESTING_METHOD = "PUT";
const endpoint = createEndpoint("/v1/auth/refresh-tokens");

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
    it("[200] should refresh tokens with valid refresh token", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { VALID_REFRESH } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: VALID_REFRESH.input.headers,
      });

      const data = response.json<Credentials>();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(typeof data.accessToken, "string");
      assert.strictEqual(typeof data.refreshToken, "string");
      assert.ok(data.user);
    });

    it("[200] should return user data with refreshed tokens", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { VALID_REFRESH } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: VALID_REFRESH.input.headers,
      });

      const data = response.json<Credentials>();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(data.user.email, VALID_REFRESH.expected.user.email);
      assert.ok(!("password" in data.user));
    });
  });

  describe("Error Cases - Authentication", () => {
    it("[401] should reject missing authorization header", async () => {
      const { MISSING_AUTH } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: MISSING_AUTH.input.headers,
      });

      assert.strictEqual(response.statusCode, 401);
    });

    it("[401] should reject invalid token format", async () => {
      const { MALFORMED_HEADER } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: MALFORMED_HEADER.input.headers,
      });

      assert.strictEqual(response.statusCode, 401);
    });

    it("[401] should reject malformed JWT", async () => {
      const { INVALID_TOKEN } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: INVALID_TOKEN.input.headers,
      });

      assert.strictEqual(response.statusCode, 401);
    });

    it("[401] should reject access token instead of refresh token", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { ACCESS_TOKEN_INSTEAD_OF_REFRESH } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: ACCESS_TOKEN_INSTEAD_OF_REFRESH.input.headers,
      });

      assert.strictEqual(response.statusCode, 401);
    });
  });

  describe("Error Cases - Token Reuse", () => {
    it("[401] should invalidate old refresh token after use", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { VALID_REFRESH } = fixtures.positive;

      const firstResponse = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: VALID_REFRESH.input.headers,
      });
      assert.strictEqual(firstResponse.statusCode, 200);

      const secondResponse = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: VALID_REFRESH.input.headers,
      });
      assert.strictEqual(secondResponse.statusCode, 401);
    });
  });
});
