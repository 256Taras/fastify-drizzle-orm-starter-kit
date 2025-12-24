import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { signInFixtures as fixtures } from "./sign-in.fixtures.ts";

import type { Credentials } from "#modules/auth/auth.contracts.ts";
import { assertHasValidUser } from "#tests/helpers/assertions/assertions.ts";
import type { TestContext } from "#tests/helpers/types/test-context.types.ts";
import { createEndpoint } from "#tests/helpers/utils/endpoint.utils.ts";
import { createTestContext } from "#tests/helpers/utils/testing-app.utils.ts";

const TESTING_METHOD = "POST";
const endpoint = createEndpoint("/v1/auth/sign-in");

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
    it("[200] should sign in with valid credentials", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_CREDENTIALS } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: VALID_CREDENTIALS.input.body,
      });

      const data = response.json<Credentials>();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(typeof data.accessToken, "string");
      assert.strictEqual(typeof data.refreshToken, "string");
      assert.strictEqual(data.user.email, VALID_CREDENTIALS.expected.user.email);
      assert.ok(!("password" in data.user));
    });

    it("[200] should return user data without sensitive fields", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_CREDENTIALS } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: VALID_CREDENTIALS.input.body,
      });

      const data = response.json<Credentials>();

      assert.strictEqual(response.statusCode, 200);
      assertHasValidUser(data.user);
    });
  });

  describe("Error Cases - Authentication", () => {
    it("[404] should reject non-existent email", async () => {
      const { NON_EXISTENT_EMAIL } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: NON_EXISTENT_EMAIL.input.body,
      });

      assert.strictEqual(response.statusCode, 404);
    });

    it("[401] should reject wrong password", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { WRONG_PASSWORD } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: WRONG_PASSWORD.input.body,
      });

      assert.strictEqual(response.statusCode, 401);
    });
  });

  describe("Error Cases - Validation", () => {
    it("[400] should reject invalid email format", async () => {
      const { INVALID_EMAIL_FORMAT } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: INVALID_EMAIL_FORMAT.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject missing email", async () => {
      const { MISSING_EMAIL } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: MISSING_EMAIL.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject missing password", async () => {
      const { MISSING_PASSWORD } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: MISSING_PASSWORD.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject empty body", async () => {
      const { EMPTY_BODY } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: EMPTY_BODY.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });
  });
});
