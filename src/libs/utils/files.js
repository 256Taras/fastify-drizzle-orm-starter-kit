import fs from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {string} importMetaUrl
 * @returns {string}
 */
export const getDirName = (importMetaUrl) => dirname(fileURLToPath(importMetaUrl));

/**
 * @param {string} path
 * @returns {Promise<void>}
 */
export const ensureDirectoryExists = async (path) => {
  try {
    await fs.access(path, fs.constants.F_OK);
  } catch {
    await fs.mkdir(path, { recursive: true });
  }
};
