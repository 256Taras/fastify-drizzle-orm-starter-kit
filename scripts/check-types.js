#!/usr/bin/env node
/**
 * JSDoc Type Checking Script Validates type coverage, declarations, and imports across the codebase
 *
 * @file Automated type validation for JSDoc-based TypeScript project
 */
/* eslint-disable no-console */

import { execSync } from "node:child_process";
import { globSync, readFileSync } from "node:fs";

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  TYPES_DIR: "./src/@types",
  SRC_DIR: "./src",
  MIN_COVERAGE: 65,
  IGNORE_PATTERNS: ["**/node_modules/**", "**/*.test.js", "**/*.spec.js", "**/tools/**"],
  EXCLUDED_PATTERNS: [
    /schemas\.js$/, // TypeBox schemas - typed by library
    /\.contracts\.js$/, // TypeBox contracts - typed by library
    /\.model\.js$/, // Drizzle models - typed by ORM
    /db-schema\.js$/, // Schema exports - types inferred
    /configs\/.*\.js$/, // Config files - types inferred automatically by TypeScript
    /libs\/common\.constants\.js$/, // Constants - types inferred automatically
    /libs\/constants\/.*\.js$/, // Constants files - types inferred automatically
    /index\.js$/, // Index files - re-export files, types inferred from exports
    /^tools\//, // Development tools - no JSDoc needed
  ],
};

// ============================================================================
// Utilities
// ============================================================================

const colors = {
  reset: "\u001B[0m",
  green: "\u001B[32m",
  red: "\u001B[31m",
  yellow: "\u001B[33m",
  cyan: "\u001B[36m",
};

/**
 * Logs a colored message
 *
 * @param {string} icon - Emoji icon
 * @param {string} message - Message to log
 * @param {keyof typeof colors} [color] - Color name
 */
const log = (icon, message, color = "reset") => {
  // eslint-disable-next-line security/detect-object-injection
  console.log(`${colors[color]}${icon} ${message}${colors.reset}`);
};

/**
 * Prints a separator line
 *
 * @param {number} [length] - Length of separator
 */
const separator = (length = 50) => console.log("=".repeat(length));

/**
 * Checks if file should be excluded from coverage check
 *
 * @param {string} filePath - Path to check
 * @returns {boolean}
 */
const shouldExcludeFromCoverage = (filePath) => {
  return CONFIG.EXCLUDED_PATTERNS.some((pattern) => pattern.test(filePath));
};

/**
 * Extracts type imports from file content
 *
 * @param {string} content - File content
 * @returns {string[]}
 */
const extractTypeImports = (content) => {
  const imports = [];
  const importRegex = /import\(["']([^"']+)["']\)/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
};

/**
 * Checks if file has JSDoc annotations
 *
 * @param {string} filePath - Path to check
 * @returns {boolean}
 */
const hasJSDocTypes = (filePath) => {
  if (shouldExcludeFromCoverage(filePath)) {
    return true;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = readFileSync(filePath, "utf8");
  return /@typedef|@type|@param|@returns/.test(content);
};

// ============================================================================
// Check Functions
// ============================================================================

/**
 * Checks type coverage across JavaScript files
 *
 * @returns {boolean} Whether coverage meets minimum requirement
 */
function checkTypeCoverage() {
  log("📊", "Checking type coverage...", "cyan");
  console.log();

  const allJsFiles = globSync(`${CONFIG.SRC_DIR}/**/*.js`);
  const jsFiles = allJsFiles.filter((file) => {
    return !CONFIG.IGNORE_PATTERNS.some((pattern) => {
      // Convert glob pattern to regex
      const regexPattern = pattern
        .replaceAll("**", ".*")
        .replaceAll("*", "[^/]*")
        .replaceAll(".", String.raw`\.`);
      // eslint-disable-next-line security/detect-non-literal-regexp
      return new RegExp(regexPattern).test(file);
    });
  });

  let withTypes = 0;
  let withoutTypes = 0;
  const filesWithoutTypes = [];

  for (const file of jsFiles) {
    if (shouldExcludeFromCoverage(file)) {
      continue; // Skip excluded files
    }
    if (hasJSDocTypes(file)) {
      withTypes++;
    } else {
      withoutTypes++;
      filesWithoutTypes.push(file);
    }
  }

  const total = withTypes + withoutTypes;
  const coverage = ((withTypes / total) * 100).toFixed(1);
  const coverageNumber = Number.parseFloat(coverage);

  log("📈", `Type coverage: ${coverage}%`, coverageNumber >= CONFIG.MIN_COVERAGE ? "green" : "red");
  console.log(`   ✅ With types: ${withTypes}`);
  console.log(`   ❌ Without types: ${withoutTypes}`);

  if (filesWithoutTypes.length > 0) {
    console.log("\n   Files without types:");
    for (const file of filesWithoutTypes) console.log(`   - ${file}`);
  }

  console.log();

  return coverageNumber >= CONFIG.MIN_COVERAGE;
}

/**
 * Validates type declaration quality
 *
 * @returns {boolean} Whether all declarations are valid
 */
function checkTypeDeclarations() {
  log("🔍", "Checking type declarations...", "cyan");
  console.log();

  const typeFiles = globSync(`${CONFIG.TYPES_DIR}/**/*.jsdoc.js`);
  const issues = [];

  for (const file of typeFiles) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = readFileSync(file, "utf8");

    // Check for @fileoverview or @file
    if (!content.includes("@fileoverview") && !content.includes("@file")) {
      issues.push({ file, issue: "missing @fileoverview" });
    }

    // Check typedef descriptions
    const typedefs = content.match(/@typedef\s+\{[^}]+\}\s+(\w+)/g) || [];
    for (const typedef of typedefs) {
      const typeName = typedef.match(/\}\s+(\w+)/)?.[1];
      if (typeName) {
        // Find the comment block that contains this typedef
        const typedefIndex = content.indexOf(typedef);
        const beforeTypedef = content.slice(0, Math.max(0, typedefIndex));

        // Find the start of the comment block (/**)
        const commentStart = beforeTypedef.lastIndexOf("/**");
        if (commentStart === -1) {
          issues.push({
            file,
            issue: `type ${typeName} lacks description (no comment block)`,
          });
          continue;
        }

        // Extract the comment block
        const commentBlock = content.slice(commentStart, typedefIndex + typedef.length);

        // Check if there's a description (text between /** and @typedef)
        // Description should be non-empty text, not just tags
        const beforeTypedefTag = commentBlock.split("@typedef")[0];
        const descriptionText = beforeTypedefTag
          .replaceAll(/\/\*\*|\*\//g, "") // Remove comment markers
          .split("\n")
          .map((line) => line.replace(/^\s*\*\s?/, "").trim()) // Remove * and spaces
          .filter((line) => line && !line.startsWith("@")) // Keep non-empty, non-tag lines
          .join(" ")
          .trim();

        if (!descriptionText) {
          issues.push({
            file,
            issue: `type ${typeName} lacks description`,
          });
        }
      }
    }
  }

  if (issues.length === 0) {
    log("✅", "All type declarations are valid", "green");
  } else {
    for (const { file, issue } of issues) {
      log("⚠️", `${file}: ${issue}`, "yellow");
    }
  }

  console.log();

  return issues.length === 0;
}

/**
 * Validates type import paths
 *
 * @returns {boolean} Whether all imports are valid
 */
function checkTypeImports() {
  log("🔗", "Checking type imports...", "cyan");
  console.log();

  const allJsFiles = globSync(`${CONFIG.SRC_DIR}/**/*.js`);
  const jsFiles = allJsFiles.filter((file) => !file.includes("node_modules"));

  const invalidImports = [];

  for (const file of jsFiles) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = readFileSync(file, "utf8");
    const imports = extractTypeImports(content);

    for (const imp of imports) {
      if (!imp.startsWith("#@types")) continue;

      const typePath = imp.replace("#@types", "./src/@types");
      const fullPath = typePath.endsWith(".jsdoc.js") ? typePath : `${typePath}.jsdoc.js`;

      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        readFileSync(fullPath, "utf8");
      } catch {
        invalidImports.push({ file, import: imp, expected: fullPath });
      }
    }
  }

  if (invalidImports.length === 0) {
    log("✅", "All type imports are valid", "green");
  } else {
    log("❌", `Found ${invalidImports.length} invalid imports`, "red");
    for (const { file, import: imp } of invalidImports) {
      console.log(`   ${file}: ${imp}`);
    }
  }

  console.log();

  return invalidImports.length === 0;
}

/**
 * Runs TypeScript compiler check
 *
 * @returns {boolean} Whether TypeScript compilation succeeds
 */
function checkTypeScript() {
  log("🔧", "Running TypeScript check...", "cyan");
  console.log();

  try {
    execSync("npx tsc --noEmit --project tsconfig.json", {
      stdio: "inherit",
      encoding: "utf8",
    });

    console.log();
    log("✅", "TypeScript check passed", "green");
    console.log();

    return true;
  } catch {
    console.log();
    log("❌", "TypeScript check failed", "red");
    console.log();

    return false;
  }
}

// ============================================================================
// Main
// ============================================================================

/** Main execution function */
function main() {
  console.log();
  log("🚀", "JSDoc Type Checking", "cyan");
  console.log();
  separator();
  console.log();

  const results = {
    declarations: checkTypeDeclarations(),
    coverage: checkTypeCoverage(),
    imports: checkTypeImports(),
    typescript: checkTypeScript(),
  };

  separator();
  console.log();
  log("📋", "Summary:", "cyan");
  console.log();

  // Print summary
  const resultLabels = {
    declarations: "Type declarations",
    coverage: "Type coverage",
    imports: "Type imports",
    typescript: "TypeScript check",
  };

  for (const [key, passed] of Object.entries(results)) {
    // @ts-expect-error - Dynamic key from Object.entries
    const label = resultLabels[key];
    const icon = passed ? "✅" : "❌";
    const color = passed ? "green" : "red";
    log(icon, label, color);
  }

  console.log();
  separator();
  console.log();

  // Final result
  const allPassed = Object.values(results).every(Boolean);

  if (allPassed) {
    log("🎉", "All checks passed successfully!", "green");
    process.exit(0);
  } else {
    log("💥", "Some checks failed", "red");
    process.exit(1);
  }
}

// Run script
main();
