import fs from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 *
 * @param {string} importMetaUrl
 */
export const getDirName = (importMetaUrl) => dirname(fileURLToPath(importMetaUrl));

/**
 *
 * @param {string} path
 */
export const ensureDirectoryExists = async (path) => {
  try {
    await fs.access(path, fs.constants.F_OK);
  } catch {
    await fs.mkdir(path, { recursive: true });
  }
};
