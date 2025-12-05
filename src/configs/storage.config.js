import path from "node:path";

export const STORAGE_CONFIG = {
  storagePath: path.resolve("storage"),
  tempStoragePath: path.resolve("storage/temp"),
  uploadServerPath: path.resolve(`public/uploads`),
  uploadUiPath: "uploads",
};
