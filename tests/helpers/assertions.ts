import assert from "node:assert/strict";

interface PaginationAssertionOptions {
  expectedLimit?: number;
  expectedPage?: number;
  minItemCount?: number;
  requireCursors?: boolean;
}

interface ShapeAssertion {
  optional?: string[];
  required: string[];
}

interface UserAssertionOptions {
  excludedFields?: string[];
  includePassword?: boolean;
  requiredFields?: string[];
}

export function assertHasValidPagination(meta: Record<string, unknown>, options: PaginationAssertionOptions = {}): void {
  assert.ok(meta, "Pagination metadata should exist");
  assert.strictEqual(typeof meta.itemCount, "number", "itemCount should be a number");
  assert.strictEqual(typeof meta.limit, "number", "limit should be a number");
  assert.strictEqual(typeof meta.page, "number", "page should be a number");
  assert.strictEqual(typeof meta.pageCount, "number", "pageCount should be a number");
  assert.strictEqual(typeof meta.hasPreviousPage, "boolean", "hasPreviousPage should be a boolean");
  assert.strictEqual(typeof meta.hasNextPage, "boolean", "hasNextPage should be a boolean");

  if (options.minItemCount !== undefined) {
    assert.ok(Number(meta.itemCount) >= options.minItemCount, `itemCount should be at least ${options.minItemCount}`);
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

export function assertHasValidUser(user: Record<string, unknown>, options: UserAssertionOptions = {}): void {
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

export function assertMatchesShape(obj: Record<string, unknown>, shape: ShapeAssertion): void {
  // Extract values safely to avoid Proxy issues with fixtureFactory
  // Use hasOwnProperty check to avoid triggering Proxy errors
  const required = shape?.required || [];
  const optional = shape?.optional || [];
  const allAllowedFields = new Set([...optional, ...required]);
  const objectKeys = Object.keys(obj);

  for (const field of required) {
    assert.ok(field in obj, `Missing required field: ${field}`);
  }

  for (const key of objectKeys) {
    assert.ok(allAllowedFields.has(key), `Unexpected field: ${key}`);
  }
}
