import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

import { resetPasswordFixtures as fixtures } from "./reset-password.fixtures.ts";

import type { ForgotPasswordOutput, StatusOutput } from "#modules/auth/auth.contracts.ts";
import type { TestContext } from "#tests/helpers/types/test-context.types.ts";
import { createEndpoint } from "#tests/helpers/utils/endpoint.utils.ts";
import { createTestContext } from "#tests/helpers/utils/testing-app.utils.ts";

const TESTING_METHOD = "POST";
const endpoint = createEndpoint("/v1/auth/reset-password");
const forgotPasswordEndpoint = createEndpoint("/v1/auth/forgot-password");
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

  async function getResetToken(email: string): Promise<string> {
    const response = await ctx.app.inject({
      method: "POST",
      path: forgotPasswordEndpoint(),
      body: { email },
    });

    const data = response.json<ForgotPasswordOutput>();

    if (!data.resetToken) {
      throw new Error(`No reset token returned for email: ${email}`);
    }

    return data.resetToken;
  }

  describe("Success Cases", () => {
    it("[200] should reset password with valid token", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_RESET } = fixtures.positive;
      const resetToken = await getResetToken(VALID_RESET.credentials.email);

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: { token: resetToken, ...VALID_RESET.input.body },
      });

      const data = response.json<StatusOutput>();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(data.status, VALID_RESET.expected.body.status);
    });

    it("[200] should allow login with new password after reset", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_RESET } = fixtures.positive;
      const resetToken = await getResetToken(VALID_RESET.credentials.email);
      const newPassword = VALID_RESET.input.body.password;

      await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: { token: resetToken, password: newPassword },
      });

      const loginResponse = await ctx.app.inject({
        method: "POST",
        path: signInEndpoint(),
        body: { email: VALID_RESET.credentials.email, password: newPassword },
      });

      assert.strictEqual(loginResponse.statusCode, 200);
    });

    it("[200] should reject old password after reset", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_RESET } = fixtures.positive;
      const resetToken = await getResetToken(VALID_RESET.credentials.email);

      await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: { token: resetToken, ...VALID_RESET.input.body },
      });

      const loginResponse = await ctx.app.inject({
        method: "POST",
        path: signInEndpoint(),
        body: { email: VALID_RESET.credentials.email, password: VALID_RESET.credentials.oldPassword },
      });

      assert.strictEqual(loginResponse.statusCode, 401);
    });
  });

  describe("Error Cases - Token", () => {
    it("[401] should reject invalid token", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { INVALID_TOKEN } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: INVALID_TOKEN.input.body,
      });

      assert.strictEqual(response.statusCode, 401);
    });

    it("[401] should reject already used token", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_RESET } = fixtures.positive;
      const resetToken = await getResetToken(VALID_RESET.credentials.email);

      const firstResponse = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: { token: resetToken, ...VALID_RESET.input.body },
      });
      assert.strictEqual(firstResponse.statusCode, 200);

      const secondResponse = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: { token: resetToken, ...VALID_RESET.input.body },
      });
      assert.strictEqual(secondResponse.statusCode, 401);
    });

    it("[401] should reject expired token", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER, fixtures.seeds.EXPIRED_RESET_TOKEN]);
      const { EXPIRED_TOKEN } = fixtures.negative;

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: EXPIRED_TOKEN.input.body,
      });

      assert.strictEqual(response.statusCode, 401);
    });
  });

  describe("Error Cases - Validation", () => {
    it("[400] should reject password without number", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_RESET } = fixtures.positive;
      const resetToken = await getResetToken(VALID_RESET.credentials.email);

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: { token: resetToken, password: "PasswordOnly" },
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject password without letter", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_RESET } = fixtures.positive;
      const resetToken = await getResetToken(VALID_RESET.credentials.email);

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: { token: resetToken, password: "12345678" },
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject short password", async () => {
      await ctx.db.seedMany([fixtures.seeds.USER]);
      const { VALID_RESET } = fixtures.positive;
      const resetToken = await getResetToken(VALID_RESET.credentials.email);

      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: { token: resetToken, password: "Ab1" },
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject missing token", async () => {
      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: { password: "NewPassword789" },
      });

      assert.strictEqual(response.statusCode, 400);
    });

    it("[400] should reject missing password", async () => {
      const response = await ctx.app.inject({
        method: TESTING_METHOD,
        path: endpoint(),
        body: { token: "some-token" },
      });

      assert.strictEqual(response.statusCode, 400);
    });
  });
});
