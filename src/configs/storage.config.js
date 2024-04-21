import path from "node:path";

export const STORAGE_CONFIG = {
  uploadUiPath: "uploads",
  uploadServerPath: path.resolve(`public/uploads`),
  tempStoragePath: path.resolve("storage/temp"),
  storagePath: path.resolve("storage"),
};
