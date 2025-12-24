import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { logOutFixtures as fixtures } from "./log-out.fixtures.ts";

import type { StatusOutput } from "#modules/auth/auth.contracts.ts";
import type { TestContext } from "#tests/helpers/types/test-context.types.ts";
import { createEndpoint } from "#tests/helpers/utils/endpoint.utils.ts";
import { createTestContext } from "#tests/helpers/utils/testing-app.utils.ts";

const TESTING_METHOD = "POST";

const endpoint = createEndpoint("/v1/auth/log-out");

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
    it("[200] should log out user with valid refresh token", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { VALID_LOGOUT } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: VALID_LOGOUT.input.headers,
      });

      const data = response.json<StatusOutput>();
      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(data.status, VALID_LOGOUT.expected.body.status);
    });
  });

  describe("Error Cases - Authentication", () => {
    it("[401] should reject request without authorization header", async () => {
      const { MISSING_AUTH } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: MISSING_AUTH.input.headers,
      });

      assert.strictEqual(response.statusCode, 401);
    });

    it("[401] should reject request with malformed token", async () => {
      const { INVALID_TOKEN } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: INVALID_TOKEN.input.headers,
      });

      assert.strictEqual(response.statusCode, 401);
    });

    it("[401] should reject access token (requires refresh token)", async () => {
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
    it("[401] should reject already used refresh token", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { VALID_LOGOUT } = fixtures.positive;

      await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: VALID_LOGOUT.input.headers,
      });

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: VALID_LOGOUT.input.headers,
      });

      assert.strictEqual(response.statusCode, 401);
    });
  });
});
