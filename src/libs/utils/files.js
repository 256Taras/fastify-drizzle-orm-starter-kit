import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import fs from "node:fs/promises";

export const getDirName = (importMetaUrl) => dirname(fileURLToPath(importMetaUrl));

export const ensureDirectoryExists = async (path) => {
  try {
    await fs.access(path, fs.constants.F_OK);
  } catch {
    await fs.mkdir(path, { recursive: true });
  }
};
