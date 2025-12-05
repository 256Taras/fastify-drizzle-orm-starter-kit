import { APP_CONFIG } from "#configs/index.js";
import { STORAGE_CONFIG } from "#configs/storage.config.js";

/**
 *
 * @param {string} filePath
 */
export function toServerPath(filePath) {
  return `${STORAGE_CONFIG.uploadServerPath}/${filePath}`;
}

/**
 *
 * @param {string} filePath
 */
export function toUiPath(filePath) {
  return `${STORAGE_CONFIG.uploadUiPath}/${filePath}`;
}

/**
 *
 * @param {string} filePath
 */
export function toUrl(filePath) {
  return filePath ? `${APP_CONFIG.applicationUrl}/${toUiPath(filePath)}` : null;
}
