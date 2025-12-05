// @ts-nocheck
// @typescript-eslint/no-var-requires
const { join } = require("node:path");
require("dotenv-safe").config({
  allowEmptyValues: true,
  path: join(__dirname, "..", "..", "..", "configs", ".env"),
  sample: join(__dirname, "..", "..", "..", "configs", ".env.example"),
});

process.exit(0);
