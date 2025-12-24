import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { signUpFixtures as fixtures } from "./sign-up.fixtures.ts";

import type { Credentials } from "#modules/auth/auth.contracts.ts";
import type { TestContext } from "#tests/helpers/types/test-context.types.ts";
import { createEndpoint } from "#tests/helpers/utils/endpoint.utils.ts";
import { createTestContext } from "#tests/helpers/utils/testing-app.utils.ts";

const TESTING_METHOD = "POST";
const endpoint = createEndpoint("/v1/auth/sign-up");

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
    it("[200] should register new user and return tokens", async () => {
      const { VALID_USER } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: VALID_USER.input.body,
      });

      const data = response.json<Credentials>();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(typeof data.accessToken, "string");
      assert.strictEqual(typeof data.refreshToken, "string");
      assert.strictEqual(data.user.email, VALID_USER.expected.user.email);
      assert.strictEqual(data.user.firstName, VALID_USER.expected.user.firstName);
      assert.strictEqual(data.user.lastName, VALID_USER.expected.user.lastName);
      assert.strictEqual(data.user.role, VALID_USER.expected.user.role);
      assert.ok(!("password" in data.user));
    });
  });

  describe("Error Cases - Conflict", () => {
    it("[409] should reject duplicate email", async () => {
      await ctx.db.seedMany([fixtures.seeds.EXISTING_USER]);
      const { DUPLICATE_EMAIL } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: DUPLICATE_EMAIL.input.body,
      });

      assert.strictEqual(response.statusCode, 409);
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

    it("[400] should reject password without number", async () => {
      const { PASSWORD_NO_NUMBER } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: PASSWORD_NO_NUMBER.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject password without letter", async () => {
      const { PASSWORD_NO_LETTER } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: PASSWORD_NO_LETTER.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject password shorter than 6 characters", async () => {
      const { PASSWORD_TOO_SHORT } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: PASSWORD_TOO_SHORT.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject empty firstName", async () => {
      const { EMPTY_FIRST_NAME } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: EMPTY_FIRST_NAME.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject empty lastName", async () => {
      const { EMPTY_LAST_NAME } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: EMPTY_LAST_NAME.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject missing required fields", async () => {
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
