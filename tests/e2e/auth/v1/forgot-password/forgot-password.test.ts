import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { forgotPasswordFixtures as fixtures } from "./forgot-password.fixtures.ts";

import type { ForgotPasswordOutput } from "#modules/auth/auth.contracts.ts";
import type { TestContext } from "#tests/helpers/types/test-context.types.ts";
import { createEndpoint } from "#tests/helpers/utils/endpoint.utils.ts";
import { createTestContext } from "#tests/helpers/utils/testing-app.utils.ts";

const TESTING_METHOD = "POST";
const endpoint = createEndpoint("/v1/auth/forgot-password");

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
    it("[200] should send reset email for existing user", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_REQUEST } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: VALID_REQUEST.input.body,
      });

      const data = response.json<ForgotPasswordOutput>();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(data.status, VALID_REQUEST.expected.body.status);
      assert.strictEqual(typeof data.resetToken, "string");
    });

    it("[200] should return success even for non-existent email (security)", async () => {
      const { NON_EXISTENT_EMAIL } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: NON_EXISTENT_EMAIL.input.body,
      });

      const data = response.json<ForgotPasswordOutput>();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(data.status, NON_EXISTENT_EMAIL.expected.body.status);
      assert.ok(!data.resetToken);
    });

    it("[200] should generate unique reset tokens", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_REQUEST } = fixtures.positive;

      const response1 = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: VALID_REQUEST.input.body,
      });

      const response2 = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: VALID_REQUEST.input.body,
      });

      const data1 = response1.json<ForgotPasswordOutput>();
      const data2 = response2.json<ForgotPasswordOutput>();

      assert.strictEqual(response1.statusCode, 200);
      assert.strictEqual(response2.statusCode, 200);
      assert.notStrictEqual(data1.resetToken, data2.resetToken);
    });
  });

  describe("Error Cases - Validation", () => {
    it("[400] should reject invalid email format", async () => {
      const { INVALID_EMAIL } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: INVALID_EMAIL.input.body,
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

    it("[400] should reject empty email", async () => {
      const { EMPTY_EMAIL } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: EMPTY_EMAIL.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });
  });
});
