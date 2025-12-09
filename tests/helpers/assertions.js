import assert from "node:assert/strict";

/**
 * @param {object} meta
 * @param {object} [options]
 * @param {number} [options.minItemCount]
 * @param {number} [options.expectedPage]
 * @param {number} [options.expectedLimit]
 * @param {boolean} [options.requireCursors]
 */
export function assertHasValidPagination(meta, options = {}) {
  assert.ok(meta, "Pagination metadata should exist");
  assert.strictEqual(typeof meta.itemCount, "number", "itemCount should be a number");
  assert.strictEqual(typeof meta.limit, "number", "limit should be a number");
  assert.strictEqual(typeof meta.page, "number", "page should be a number");
  assert.strictEqual(typeof meta.pageCount, "number", "pageCount should be a number");
  assert.strictEqual(typeof meta.hasPreviousPage, "boolean", "hasPreviousPage should be a boolean");
  assert.strictEqual(typeof meta.hasNextPage, "boolean", "hasNextPage should be a boolean");

  if (options.minItemCount !== undefined) {
    assert.ok(meta.itemCount >= options.minItemCount, `itemCount should be at least ${options.minItemCount}`);
  }

  if (options.expectedPage !== undefined) {
    assert.strictEqual(meta.page, options.expectedPage, `page should be ${options.expectedPage}`);
  }

  if (options.expectedLimit !== undefined) {
    assert.strictEqual(meta.limit, options.expectedLimit, `limit should be ${options.expectedLimit}`);
  }

  if (options.requireCursors) {
    assert.ok(meta.startCursor, "startCursor should exist for cursor pagination");
    assert.ok(meta.endCursor, "endCursor should exist for cursor pagination");
  }
}

/**
 * @param {object} user
 * @param {object} [options]
 * @param {boolean} [options.includePassword]
 * @param {string[]} [options.requiredFields]
 * @param {string[]} [options.excludedFields]
 */
export function assertHasValidUser(user, options = {}) {
  assert.ok(user, "User should exist");
  assert.ok(user.id, "User should have an id");
  assert.ok(user.email, "User should have an email");
  assert.ok(user.firstName, "User should have a firstName");
  assert.ok(user.lastName, "User should have a lastName");
  assert.ok(user.role, "User should have a role");

  if (options.includePassword) {
    assert.ok(user.password, "User should have a password");
  } else {
    assert.ok(!user.password, "User should not have a password in response");
  }

  if (options.requiredFields) {
    for (const field of options.requiredFields) {
      assert.ok(field in user, `User should have field: ${field}`);
    }
  }

  if (options.excludedFields) {
    for (const field of options.excludedFields) {
      assert.ok(!(field in user), `User should NOT have field: ${field}`);
    }
  }
}

/**
 * @param {object} obj
 * @param {object} shape - { required: string[], optional?: string[] }
 */
export function assertMatchesShape(obj, shape) {
  const { required = [], optional = [] } = shape;
  const allAllowedFields = new Set([...optional, ...required]);
  const objectKeys = Object.keys(obj);

  for (const field of required) {
    assert.ok(field in obj, `Missing required field: ${field}`);
  }

  for (const key of objectKeys) {
    assert.ok(allAllowedFields.has(key), `Unexpected field: ${key}`);
  }
}

