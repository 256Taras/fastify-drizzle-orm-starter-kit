/**
 * @file Unit tests for pagination configuration
 */

import assert from "node:assert";
import { test } from "node:test";

import { PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.js";
import { USERS_PAGINATION_CONFIG } from "#modules/users/users.pagination.config.js";

test("USERS_PAGINATION_CONFIG should have required properties", () => {
  assert.ok(USERS_PAGINATION_CONFIG.table, "table should be defined");
  assert.strictEqual(typeof USERS_PAGINATION_CONFIG.defaultLimit, "number", "defaultLimit should be a number");
  assert.ok(Array.isArray(USERS_PAGINATION_CONFIG.defaultSortBy), "defaultSortBy should be an array");
  assert.ok(Array.isArray(USERS_PAGINATION_CONFIG.sortableColumns), "sortableColumns should be an array");
});

test("USERS_PAGINATION_CONFIG should have correct default values", () => {
  assert.strictEqual(USERS_PAGINATION_CONFIG.defaultLimit, 10);
  assert.strictEqual(USERS_PAGINATION_CONFIG.maxLimit, 100);
  assert.strictEqual(USERS_PAGINATION_CONFIG.strategy, PAGINATION_STRATEGY.offset);
});

test("USERS_PAGINATION_CONFIG should have correct filterableColumns configuration", () => {
  const { filterableColumns } = USERS_PAGINATION_CONFIG;

  assert.ok(filterableColumns, "filterableColumns should be defined");

  // filterableColumns is an object with column names as keys
  if (typeof filterableColumns === "object" && !Array.isArray(filterableColumns)) {
    assert.ok(filterableColumns.email, "email should be filterable");
    assert.ok(filterableColumns.role, "role should be filterable");

    // Check email operators
    assert.ok(filterableColumns.email.includes("$eq"));
    assert.ok(filterableColumns.email.includes("$ilike"));
    assert.ok(filterableColumns.email.includes("$in"));

    // Check role operators
    assert.ok(filterableColumns.role.includes("$eq"));
    assert.ok(filterableColumns.role.includes("$in"));
    assert.ok(!filterableColumns.role.includes("$ilike"), "role should not support ilike");
  }
});

test("USERS_PAGINATION_CONFIG should exclude password column", () => {
  assert.ok(USERS_PAGINATION_CONFIG.excludeColumns);
  assert.ok(USERS_PAGINATION_CONFIG.excludeColumns.includes("password"));
});

test("USERS_PAGINATION_CONFIG should have correct sortable columns", () => {
  const { sortableColumns } = USERS_PAGINATION_CONFIG;

  assert.ok(sortableColumns.includes("email"));
  assert.ok(sortableColumns.includes("firstName"));
  assert.ok(sortableColumns.includes("lastName"));
  assert.ok(sortableColumns.includes("createdAt"));
  assert.ok(sortableColumns.includes("updatedAt"));
});
