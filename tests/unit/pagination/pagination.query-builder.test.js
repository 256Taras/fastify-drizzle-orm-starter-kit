/**
 * @file Unit tests for pagination query builder
 */

import assert from "node:assert";
import { after, before, test } from "node:test";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { BadRequestException } from "#libs/errors/domain.errors.js";
import { FILTER_OPERATORS } from "#libs/pagination/pagination.contracts.js";
import { PaginationQueryBuilder } from "#libs/pagination/pagination.query-builder.js";
import { users } from "#modules/users/users.model.js";
import { USERS_PAGINATION_CONFIG } from "#modules/users/users.pagination.config.js";

let db;
let client;

before(async () => {
  // Create test database connection
  // In real tests, use a test database URL
  if (process.env.DATABASE_URL_TEST) {
    client = postgres(process.env.DATABASE_URL_TEST, { max: 1 });
    db = drizzle(client);
  }
});

after(async () => {
  if (client) {
    await client.end();
  }
});

test("PaginationQueryBuilder should throw error for non-filterable column", () => {
  if (!db) {
    // Skip if no test database
    return;
  }

  const builder = new PaginationQueryBuilder(db, users, USERS_PAGINATION_CONFIG);

  assert.throws(
    () => builder.applyFilters({ invalidColumn: "value" }),
    (error) => {
      return error instanceof BadRequestException && error.message.includes("is not filterable");
    },
    "should throw BadRequestException for non-filterable column",
  );
});

test("PaginationQueryBuilder should throw error for disallowed operator", () => {
  if (!db) {
    return;
  }

  const builder = new PaginationQueryBuilder(db, users, USERS_PAGINATION_CONFIG);

  // role doesn't support ilike
  assert.throws(
    () => builder.applyFilters({ role: "$ilike:admin" }),
    (error) => {
      return error instanceof BadRequestException && error.message.includes("is not allowed");
    },
    "should throw BadRequestException for disallowed operator",
  );
});

test("PaginationQueryBuilder should accept allowed operators", () => {
  if (!db) {
    return;
  }

  const builder = new PaginationQueryBuilder(db, users, USERS_PAGINATION_CONFIG);

  // email supports eq, ilike, in
  assert.doesNotThrow(() => {
    builder.applyFilters({ email: FILTER_OPERATORS.eq + ":test@example.com" });
  });

  assert.doesNotThrow(() => {
    builder.applyFilters({ email: FILTER_OPERATORS.ilike + ":test" });
  });

  assert.doesNotThrow(() => {
    builder.applyFilters({ email: FILTER_OPERATORS.in + ":test1,test2" });
  });
});

test("PaginationQueryBuilder should handle array of filter values", () => {
  if (!db) {
    return;
  }

  const builder = new PaginationQueryBuilder(db, users, USERS_PAGINATION_CONFIG);

  assert.doesNotThrow(() => {
    builder.applyFilters({
      email: ["$eq:test1@example.com", "$eq:test2@example.com"],
    });
  });
});

test("PaginationQueryBuilder should handle empty filters", () => {
  if (!db) {
    return;
  }

  const builder = new PaginationQueryBuilder(db, users, USERS_PAGINATION_CONFIG);
  const result = builder.applyFilters({});

  assert.strictEqual(result, builder, "should return builder instance");
});

test("PaginationQueryBuilder should handle null/undefined filters", () => {
  if (!db) {
    return;
  }

  const builder = new PaginationQueryBuilder(db, users, USERS_PAGINATION_CONFIG);

  assert.doesNotThrow(() => {
    builder.applyFilters();
  });

  assert.doesNotThrow(() => {
    builder.applyFilters();
  });
});
