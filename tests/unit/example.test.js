/**
 * @file Example unit test
 * This is a template for unit tests using Node.js built-in test runner
 */

import assert from "node:assert";
import { test } from "node:test";

test("should pass a simple test", () => {
  assert.strictEqual(1 + 1, 2);
});

test("should handle async operations", async () => {
  const result = await Promise.resolve(42);
  assert.strictEqual(result, 42);
});
