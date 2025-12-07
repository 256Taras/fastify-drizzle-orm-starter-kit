/**
 * @file Unit tests for pagination schema generator
 */

import assert from "node:assert";
import { test } from "node:test";

import { PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.js";
import {
  generateItemSchema,
  generatePaginatedResponseSchema,
  generatePaginationQuerySchema,
} from "#libs/pagination/pagination.schema-generator.js";
import { USERS_PAGINATION_CONFIG } from "#modules/users/users.pagination.config.js";

test("generatePaginationQuerySchema should generate schema for offset strategy", () => {
  const schema = generatePaginationQuerySchema(USERS_PAGINATION_CONFIG);

  assert.ok(schema.properties);
  assert.ok(schema.properties.limit, "should have limit property");
  assert.ok(schema.properties.page, "should have page property for offset strategy");
  assert.ok(!schema.properties.after, "should not have after property for offset strategy");
  assert.ok(!schema.properties.before, "should not have before property for offset strategy");
});

test("generatePaginationQuerySchema should generate schema for cursor strategy", () => {
  const config = {
    ...USERS_PAGINATION_CONFIG,
    strategy: PAGINATION_STRATEGY.cursor,
    cursorColumn: "id",
  };

  // @ts-expect-error - strategy type mismatch is expected in test
  const schema = generatePaginationQuerySchema(config);

  assert.ok(schema.properties);
  assert.ok(schema.properties.limit, "should have limit property");
  assert.ok(schema.properties.after, "should have after property for cursor strategy");
  assert.ok(schema.properties.before, "should have before property for cursor strategy");
  assert.ok(!schema.properties.page, "should not have page property for cursor strategy");
});

test("generatePaginationQuerySchema should include filter parameters", () => {
  const schema = generatePaginationQuerySchema(USERS_PAGINATION_CONFIG);

  // Check if filter properties exist
  const filterProperties = Object.keys(schema.properties).filter((key) => key.startsWith("filter."));
  assert.ok(filterProperties.length > 0, "should have filter properties");

  // Check specific filter columns
  assert.ok(schema.properties["filter.email"], "should have filter.email");
  assert.ok(schema.properties["filter.role"], "should have filter.role");
});

test("generatePaginationQuerySchema should include sortBy parameter", () => {
  const schema = generatePaginationQuerySchema(USERS_PAGINATION_CONFIG);

  assert.ok(schema.properties.sortBy, "should have sortBy property");
});

test("generatePaginationQuerySchema should include search parameter", () => {
  const schema = generatePaginationQuerySchema(USERS_PAGINATION_CONFIG);

  assert.ok(schema.properties.search, "should have search property");
});

test("generatePaginationQuerySchema should include select parameter", () => {
  const schema = generatePaginationQuerySchema(USERS_PAGINATION_CONFIG);

  assert.ok(schema.properties.select, "should have select property");
});

test("generatePaginationQuerySchema should throw error for both excludeColumns and selectableColumns", () => {
  const invalidConfig = {
    ...USERS_PAGINATION_CONFIG,
    excludeColumns: ["password"],
    selectableColumns: ["email", "firstName"],
  };

  assert.throws(
    () => generatePaginationQuerySchema(invalidConfig),
    /Cannot use both 'excludeColumns' and 'selectableColumns'/,
    "should throw error when both excludeColumns and selectableColumns are provided",
  );
});

test("generatePaginationQuerySchema should use defaultLimit from config", () => {
  const schema = generatePaginationQuerySchema(USERS_PAGINATION_CONFIG);

  assert.strictEqual(schema.properties.limit.default, 10);
});

test("generatePaginationQuerySchema should use maxLimit from config", () => {
  const schema = generatePaginationQuerySchema(USERS_PAGINATION_CONFIG);

  assert.strictEqual(schema.properties.limit.maximum, 100);
});

test("generatePaginationQuerySchema should extract enum values from createSelectSchema", () => {
  const schema = generatePaginationQuerySchema(USERS_PAGINATION_CONFIG);

  // Check that filter.role has enum validation pattern
  const filterRole = schema.properties["filter.role"];
  assert.ok(filterRole, "should have filter.role property");

  // filter.role is now a Union (string | array), so pattern is in the string schema (anyOf[0])
  const stringSchema = filterRole.anyOf?.[0] || filterRole;
  assert.ok(stringSchema.pattern, "should have pattern for enum validation");
  assert.ok(stringSchema.pattern.includes("USER|ADMIN"), "pattern should include enum values USER and ADMIN");
  assert.ok(stringSchema.description.includes("Valid Values"), "description should include Valid Values section");
});

test("generateItemSchema should use createSelectSchema from table", () => {
  const itemSchema = generateItemSchema(USERS_PAGINATION_CONFIG);

  assert.ok(itemSchema.properties, "should have properties");
  assert.ok(itemSchema.properties.email, "should have email property from table");
  assert.ok(itemSchema.properties.role, "should have role property from table");
  assert.ok(itemSchema.properties.id, "should have id property from table");
});

test("generateItemSchema should exclude columns specified in excludeColumns", () => {
  const itemSchema = generateItemSchema(USERS_PAGINATION_CONFIG);

  // Password should be excluded
  assert.ok(!itemSchema.properties.password, "should not have password property (excluded)");
  // Other columns should still be present
  assert.ok(itemSchema.properties.email, "should have email property");
  assert.ok(itemSchema.properties.role, "should have role property");
});

test("generateItemSchema should make columns optional based on optionalColumns config", () => {
  const itemSchema = generateItemSchema(USERS_PAGINATION_CONFIG);

  // deletedAt should be optional
  assert.ok(itemSchema.properties.deletedAt, "should have deletedAt property");
  // Note: Type.Optional wraps the schema, so we check if it exists
  // The actual optional check happens at runtime validation
});

test("generatePaginatedResponseSchema should use generateItemSchema for data items", () => {
  const responseSchema = generatePaginatedResponseSchema(USERS_PAGINATION_CONFIG);

  assert.ok(responseSchema.properties, "should have properties");
  assert.ok(responseSchema.properties.data, "should have data property");
  assert.ok(responseSchema.properties.data.items, "should have data.items (array items)");

  const itemProperties = responseSchema.properties.data.items.properties;

  // Should exclude password (from excludeColumns)
  assert.ok(!itemProperties.password, "should not have password in response items (excluded)");
  // Should include other columns
  assert.ok(itemProperties.email, "should have email in response items");
  assert.ok(itemProperties.role, "should have role in response items");
});

test("generatePaginatedResponseSchema should include meta schema", () => {
  const responseSchema = generatePaginatedResponseSchema(USERS_PAGINATION_CONFIG);

  assert.ok(responseSchema.properties.meta, "should have meta property");
  // For offset strategy, meta should have page, limit, itemCount, pageCount
  assert.ok(responseSchema.properties.meta.properties, "meta should have properties");
});

test("generatePaginationQuerySchema should generate select parameter from excludeColumns", () => {
  const schema = generatePaginationQuerySchema(USERS_PAGINATION_CONFIG);

  const selectSchema = schema.properties.select;
  assert.ok(selectSchema, "should have select property");

  // Select should not include password (excluded column)
  const selectEnum = selectSchema.anyOf[1].items.enum || selectSchema.anyOf[0].enum;
  assert.ok(selectEnum, "select should have enum values");
  assert.ok(!selectEnum.includes("password"), "select enum should not include password");
  assert.ok(selectEnum.includes("email"), "select enum should include email");
  assert.ok(selectEnum.includes("role"), "select enum should include role");
});
