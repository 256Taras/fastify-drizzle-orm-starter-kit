import fs from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const getDirName = (importMetaUrl: string): string => dirname(fileURLToPath(importMetaUrl));

export const ensureDirectoryExists = async (path: string): Promise<void> => {
  try {
    await fs.access(path, fs.constants.F_OK);
  } catch {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(path, { recursive: true });
  }
};
