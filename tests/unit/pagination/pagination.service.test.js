/**
 * @file Unit tests for pagination service
 */

import assert from "node:assert";
import { test } from "node:test";

import { BadRequestException } from "#libs/errors/domain.errors.js";
import { PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.js";
import paginationService from "#libs/pagination/pagination.service.js";
import { USERS_PAGINATION_CONFIG } from "#modules/users/users.pagination.config.js";

import { BASIC_OFFSET_PARAMS, createMockDependencies } from "../../fixtures/pagination/index.js";

test("paginationService should create service with paginate method", () => {
  const deps = createMockDependencies();
  const service = paginationService(deps);

  assert.ok(service.paginate, "should have paginate method");
  assert.strictEqual(typeof service.paginate, "function", "paginate should be a function");
});

// Note: These tests require actual database connection or more complex mocking
// Skipping for now as they test integration behavior rather than unit behavior
test.skip("paginationService should throw error for unknown strategy", async () => {
  const deps = createMockDependencies();
  const service = paginationService(deps);

  const invalidConfig = {
    ...USERS_PAGINATION_CONFIG,
    strategy: "invalid-strategy",
  };

  const paginateFn = service.paginate(invalidConfig, BASIC_OFFSET_PARAMS);

  await assert.rejects(
    async () => {
      await paginateFn();
    },
    (error) => {
      return error instanceof BadRequestException && error.message.includes("Unknown pagination strategy");
    },
    "should throw BadRequestException for unknown strategy",
  );
});

test.skip("paginationService should use offset strategy by default", async () => {
  const deps = createMockDependencies();
  const service = paginationService(deps);

  const config = {
    ...USERS_PAGINATION_CONFIG,
    strategy: PAGINATION_STRATEGY.offset,
  };

  const paginateFn = service.paginate(config, BASIC_OFFSET_PARAMS);

  // This requires real database connection
  await assert.rejects(
    async () => {
      await paginateFn();
    },
    Error,
    "should attempt offset pagination",
  );
});
