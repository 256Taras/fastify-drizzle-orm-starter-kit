/**
 * @file Unit tests for pagination utilities
 */

import assert from "node:assert";
import { test } from "node:test";

import { calculatePaginationOffset, createPaginatedResponse } from "#libs/pagination/pagination.utils.js";

test("calculatePaginationOffset should calculate correct offset", () => {
  // First page
  assert.strictEqual(calculatePaginationOffset({ page: 1, limit: 10 }).offset, 0);
  assert.strictEqual(calculatePaginationOffset({ page: 2, limit: 10 }).offset, 10);
  assert.strictEqual(calculatePaginationOffset({ page: 3, limit: 20 }).offset, 40);
  assert.strictEqual(calculatePaginationOffset().offset, 0);
  assert.strictEqual(calculatePaginationOffset({}).offset, 0);
});

test("createPaginatedResponse should create correct response structure", async () => {
  const entities = [
    { id: 1, name: "Test" },
    { id: 2, name: "Test 2" },
  ];
  const itemCount = 25;
  const limit = 10;
  const offset = 0;

  const result = await createPaginatedResponse({ entities, itemCount, limit, offset });

  assert.ok(result.data);
  assert.ok(result.meta);
  assert.strictEqual(result.data.length, 2);
  assert.strictEqual(result.meta.itemCount, 25);
  assert.strictEqual(result.meta.limit, 10);
  assert.strictEqual(result.meta.page, 1);
  assert.strictEqual(result.meta.pageCount, 3);
  assert.strictEqual(result.meta.hasNextPage, true);
  assert.strictEqual(result.meta.hasPreviousPage, false);
});

test("createPaginatedResponse should handle last page correctly", async () => {
  const entities = [{ id: 21, name: "Test" }];
  const itemCount = 21;
  const limit = 10;
  const offset = 20; // Third page

  const result = await createPaginatedResponse({ entities, itemCount, limit, offset });

  assert.strictEqual(result.meta.page, 3);
  assert.strictEqual(result.meta.pageCount, 3);
  assert.strictEqual(result.meta.hasNextPage, false);
  assert.strictEqual(result.meta.hasPreviousPage, true);
});

test("createPaginatedResponse should handle empty results", async () => {
  const entities = [];
  const itemCount = 0;
  const limit = 10;
  const offset = 0;

  const result = await createPaginatedResponse({ entities, itemCount, limit, offset });

  assert.strictEqual(result.data.length, 0);
  assert.strictEqual(result.meta.itemCount, 0);
  assert.strictEqual(result.meta.pageCount, 0);
  assert.strictEqual(result.meta.hasNextPage, false);
  assert.strictEqual(result.meta.hasPreviousPage, false);
});

