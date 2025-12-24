import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { changePasswordFixtures as fixtures } from "./change-password.fixtures.ts";

import type { StatusOutput } from "#modules/auth/auth.contracts.ts";
import type { TestContext } from "#tests/helpers/types/test-context.types.ts";
import { createEndpoint } from "#tests/helpers/utils/endpoint.utils.ts";
import { createTestContext } from "#tests/helpers/utils/testing-app.utils.ts";

const TESTING_METHOD = "POST";
const endpoint = createEndpoint("/v1/auth/change-password");
const signInEndpoint = createEndpoint("/v1/auth/sign-in");

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
    it("[200] should change password with valid credentials", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { VALID_CHANGE } = fixtures.positive;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: VALID_CHANGE.input.headers,
        body: VALID_CHANGE.input.body,
      });

      const data = response.json<StatusOutput>();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(data.status, VALID_CHANGE.expected.body.status);
    });

    it("[200] should allow login with new password", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { VALID_CHANGE } = fixtures.positive;

      await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: VALID_CHANGE.input.headers,
        body: VALID_CHANGE.input.body,
      });

      const loginResponse = await ctx.app.inject({
        method: "POST",
        path: signInEndpoint(),
        body: {
          email: VALID_CHANGE.credentials.email,
          password: VALID_CHANGE.credentials.newPassword,
        },
      });

      assert.strictEqual(loginResponse.statusCode, 200);
    });

    it("[200] should reject old password after change", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { VALID_CHANGE } = fixtures.positive;

      await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: VALID_CHANGE.input.headers,
        body: VALID_CHANGE.input.body,
      });

      const loginResponse = await ctx.app.inject({
        method: "POST",
        path: signInEndpoint(),
        body: {
          email: VALID_CHANGE.credentials.email,
          password: VALID_CHANGE.credentials.oldPassword,
        },
      });

      assert.strictEqual(loginResponse.statusCode, 401);
    });
  });

  describe("Error Cases - Authentication", () => {
    it("[401] should reject wrong old password", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { WRONG_OLD_PASSWORD } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: WRONG_OLD_PASSWORD.input.headers,
        body: WRONG_OLD_PASSWORD.input.body,
      });

      assert.strictEqual(response.statusCode, 401);
    });

    it("[401] should reject missing authorization", async () => {
      const { MISSING_AUTH } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: MISSING_AUTH.input.headers,
        body: MISSING_AUTH.input.body,
      });

      assert.strictEqual(response.statusCode, 401);
    });

    it("[401] should reject invalid token", async () => {
      const { INVALID_TOKEN } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: INVALID_TOKEN.input.headers,
        body: INVALID_TOKEN.input.body,
      });

      assert.strictEqual(response.statusCode, 401);
    });
  });

  describe("Error Cases - Validation", () => {
    it("[400] should reject same password as old", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { SAME_PASSWORD } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: SAME_PASSWORD.input.headers,
        body: SAME_PASSWORD.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject new password without number", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { PASSWORD_NO_NUMBER } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: PASSWORD_NO_NUMBER.input.headers,
        body: PASSWORD_NO_NUMBER.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject new password without letter", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { PASSWORD_NO_LETTER } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: PASSWORD_NO_LETTER.input.headers,
        body: PASSWORD_NO_LETTER.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject short new password", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { PASSWORD_TOO_SHORT } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: PASSWORD_TOO_SHORT.input.headers,
        body: PASSWORD_TOO_SHORT.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject missing oldPassword", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { MISSING_OLD_PASSWORD } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: MISSING_OLD_PASSWORD.input.headers,
        body: MISSING_OLD_PASSWORD.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject missing newPassword", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.AUTH_TOKEN]);
      const { MISSING_NEW_PASSWORD } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        headers: MISSING_NEW_PASSWORD.input.headers,
        body: MISSING_NEW_PASSWORD.input.body,
      });

      assert.strictEqual(response.statusCode, 400);
    });
  });
});
