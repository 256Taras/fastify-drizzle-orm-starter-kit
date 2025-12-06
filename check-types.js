/**
 * Script for checking type definitions through JSDoc
 * Checks if types are properly declared and if type coverage is complete
 */
/* eslint-disable no-console */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

// eslint-disable-next-line n/no-extraneous-import
import { globSync } from "glob";

const TYPES_DIR = "./src/@types";
const SRC_DIR = "./src";

/**
 * Checks if all files have type coverage
 */
function checkTypeCoverage() {
  console.log("📊 Checking type coverage...\n");

  const jsFiles = globSync(`${SRC_DIR}/**/*.js`, {
    ignore: ["**/node_modules/**", "**/*.test.js", "**/*.spec.js"],
  });

  let withTypes = 0;
  let withoutTypes = 0;
  const filesWithoutTypes = [];

  for (const file of jsFiles) {
    if (hasJSDocTypes(file)) {
      withTypes++;
    } else {
      withoutTypes++;
      filesWithoutTypes.push(file);
    }
  }

  const coverage = ((withTypes / (withTypes + withoutTypes)) * 100).toFixed(1);

  console.log(`📈 Type coverage: ${coverage}%`);
  console.log(`   ✅ With types: ${withTypes}`);
  console.log(`   ❌ Without types: ${withoutTypes}`);

  if (filesWithoutTypes.length > 0) {
    console.log("\n   Files without types:");
    for (const file of filesWithoutTypes) {
      console.log(`   - ${file}`);
    }
  }

  console.log();
  return coverage >= 65;
}

/**
 * Checks if all types are properly declared
 */
function checkTypeDeclarations() {
  console.log("🔍 Checking type declarations...\n");

  const typeFiles = globSync(`${TYPES_DIR}/**/*.jsdoc.js`);
  let errors = 0;

  for (const file of typeFiles) {
    const content = readFileSync(file, "utf8");
    const typedefs = content.match(/@typedef\s+\{[^}]+\}\s+(\w+)/g) || [];

    // Check if types have descriptions
    for (const typedef of typedefs) {
      const typeName = typedef.match(/\}\s+(\w+)/)?.[1];
      if (typeName && !content.includes(`@typedef {`)) {
        console.log(`⚠️  ${file}: type ${typeName} without description`);
      }
    }

    // Check if @fileoverview exists
    if (!content.includes("@fileoverview") && !content.includes("@file")) {
      console.log(`⚠️  ${file}: missing @fileoverview`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log("✅ All types are properly declared\n");
  } else {
    console.log(`❌ Found ${errors} issues\n`);
  }

  return errors === 0;
}

/**
 * Checks if all type imports are valid
 */
function checkTypeImports() {
  console.log("🔗 Checking type imports...\n");

  const jsFiles = globSync(`${SRC_DIR}/**/*.js`, {
    ignore: ["**/node_modules/**"],
  });

  let errors = 0;
  const invalidImports = [];

  for (const file of jsFiles) {
    const imports = findTypeImports(file);
    for (const imp of imports) {
      // Check if import points to existing file
      if (imp.startsWith("#@types")) {
        const path = imp.replace("#@types", "./src/@types");
        const fullPath = path.endsWith(".jsdoc.js") ? path : `${path}.jsdoc.js`;
        try {
          readFileSync(fullPath);
        } catch {
          invalidImports.push({ file, import: imp });
          errors++;
        }
      }
    }
  }

  if (errors === 0) {
    console.log("✅ All type imports are valid\n");
  } else {
    console.log(`❌ Found ${errors} invalid imports:\n`);
    for (const { file, import: imp } of invalidImports) {
      console.log(`   ${file}: ${imp}`);
    }
    console.log();
  }

  return errors === 0;
}

/**
 * Checks if file has type imports
 * @param {string} filePath
 * @returns {string[]}
 */
function findTypeImports(filePath) {
  const content = readFileSync(filePath, "utf8");
  const imports = [];
  const importRegex = /import\(["']([^"']+)["']\)/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

/**
 * Files that are already typed through libraries/frameworks and don't need JSDoc
 * - TypeBox schemas: already typed through TypeBox
 * - Drizzle models: already typed through Drizzle ORM
 * - Schema exports: types inferred from models
 * - Config index: types come from individual configs via Configs type
 */
const EXCLUDED_PATTERNS = [
  /schemas\.js$/, // TypeBox schemas
  /\.model\.js$/, // Drizzle models
  /db-schema\.js$/, // Schema exports (types inferred)
  /configs\/index\.js$/, // Config re-exports (types via Configs)
];

/**
 * Checks if file should be excluded from type coverage check
 * @param {string} filePath
 * @returns {boolean}
 */
function shouldExcludeFromCheck(filePath) {
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(filePath));
}

/**
 * Checks if file has JSDoc types
 * @param {string} filePath
 * @returns {boolean}
 */
function hasJSDocTypes(filePath) {
  // Skip files that are already typed through libraries
  if (shouldExcludeFromCheck(filePath)) {
    return true; // Consider them as "with types"
  }
  const content = readFileSync(filePath, "utf8");
  return /@typedef|@type|@param|@returns/.test(content);
}

// Main function
/**
 *
 */
function main() {
  console.log("🚀 JSDoc type checking\n");
  console.log("=".repeat(50) + "\n");

  const results = {
    declarations: checkTypeDeclarations(),
    coverage: checkTypeCoverage(),
    imports: checkTypeImports(),
    typescript: runTypeScriptCheck(),
  };

  console.log("=".repeat(50));
  console.log("\n📋 Summary:\n");

  const allPassed = Object.values(results).every(Boolean);

  if (allPassed) {
    console.log("✅ All checks passed successfully!");
    process.exit(0);
  } else {
    console.log("❌ Some checks failed");
    process.exit(1);
  }
}

/**
 * Runs TypeScript type checking
 */
function runTypeScriptCheck() {
  console.log("🔧 Running TypeScript check...\n");

  try {
    execSync("npx tsc --noEmit --project tsconfig.json", {
      stdio: "inherit",
      encoding: "utf8",
    });
    console.log("\n✅ TypeScript check passed successfully\n");
    return true;
  } catch {
    console.log("\n❌ TypeScript check found errors\n");
    return false;
  }
}

main();
