/**
 * Plop.js Code Generator
 *
 * Usage:
 *   pnpm generate              - Interactive menu
 *   pnpm generate module       - Generate full module
 *   pnpm generate repository   - Generate repository only
 *   pnpm generate queries      - Generate queries only
 *   pnpm generate mutations    - Generate mutations only
 *   pnpm generate events       - Generate events + event-handlers
 *   pnpm generate router       - Generate router only
 *   pnpm generate schemas      - Generate schemas only
 *   pnpm generate contracts    - Generate contracts only
 *   pnpm generate model        - Generate model only
 */

import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const generatorsPath = join(__dirname, "tools/plop/generators");

export default async function plopConfig(plop) {
  // Register custom helpers
  registerHelpers(plop);

  // Load all generators from tools/plop/generators
  const generatorFiles = readdirSync(generatorsPath).filter((f) => f.endsWith(".js"));

  for (const file of generatorFiles) {
    const generatorModule = await import(join(generatorsPath, file));
    generatorModule.default(plop);
  }
}

function registerHelpers(plop) {
  // Case conversions
  plop.setHelper("pascalCase", (text) => toPascalCase(text));
  plop.setHelper("camelCase", (text) => toCamelCase(text));
  plop.setHelper("snakeCase", (text) => toSnakeCase(text));
  plop.setHelper("kebabCase", (text) => toKebabCase(text));
  plop.setHelper("upperSnakeCase", (text) => toSnakeCase(text).toUpperCase());
  plop.setHelper("singular", (text) => toSingular(text));
  plop.setHelper("plural", (text) => toPlural(text));

  // Conditional helpers
  plop.setHelper("eq", (a, b) => a === b);
  plop.setHelper("or", (...args) => args.slice(0, -1).some(Boolean));
  plop.setHelper("and", (...args) => args.slice(0, -1).every(Boolean));

  // Drizzle type mapping
  plop.setHelper("drizzleType", (type, options) => {
    const typeMap = {
      string:
        options.length > 0 ? `varchar("{{snakeCase name}}", { length: ${options.length} })` : 'text("{{snakeCase name}}")',
      text: 'text("{{snakeCase name}}")',
      number: 'integer("{{snakeCase name}}")',
      integer: 'integer("{{snakeCase name}}")',
      float: 'real("{{snakeCase name}}")',
      boolean: 'boolean("{{snakeCase name}}")',
      date: 'timestamp("{{snakeCase name}}", { mode: "string" })',
      timestamp: 'timestamp("{{snakeCase name}}", { mode: "string" })',
      uuid: 'uuid("{{snakeCase name}}")',
      json: 'jsonb("{{snakeCase name}}")',
    };
    return typeMap[type] || 'text("{{snakeCase name}}")';
  });

  // TypeBox type mapping
  plop.setHelper("typeboxType", (type) => {
    const typeMap = {
      string: "Type.String()",
      text: "Type.String()",
      number: "Type.Number()",
      integer: "Type.Integer()",
      float: "Type.Number()",
      boolean: "Type.Boolean()",
      date: "Type.String({ format: 'date-time' })",
      timestamp: "Type.String({ format: 'date-time' })",
      uuid: "Type.String({ format: 'uuid' })",
      json: "Type.Any()",
    };
    return typeMap[type] || "Type.String()";
  });
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(str) {
  return toSnakeCase(str).replaceAll("_", "-");
}

// Utility functions
function toPascalCase(str) {
  return str.replaceAll(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^(.)/, (c) => c.toUpperCase());
}

function toPlural(str) {
  if (str.endsWith("y") && !["ay", "ey", "oy", "uy"].some((s) => str.endsWith(s))) {
    return str.slice(0, -1) + "ies";
  }
  if (str.endsWith("s") || str.endsWith("x") || str.endsWith("ch") || str.endsWith("sh")) {
    return str + "es";
  }
  return str + "s";
}

function toSingular(str) {
  if (str.endsWith("ies")) return str.slice(0, -3) + "y";
  if (str.endsWith("es") && !str.endsWith("ses")) return str.slice(0, -2);
  if (str.endsWith("s") && !str.endsWith("ss")) return str.slice(0, -1);
  return str;
}

function toSnakeCase(str) {
  return str
    .replaceAll(/([A-Z])/g, "_$1")
    .toLowerCase()
    .replace(/^_/, "")
    .replaceAll(/[-\s]+/g, "_");
}
