import fs from "node:fs/promises";

import fp from "fastify-plugin";

import { STORAGE_CONFIG } from "#configs/storage.config.js";
import { BAD_REQUEST_400, UNSUPPORTED_MEDIA_TYPE_415 } from "#libs/errors/http.errors.js";
import { ensureDirectoryExists } from "#libs/utils/files.js";
import { toServerPath } from "#libs/utils/upload.js";

/**
 * Handles file operations like moving and optionally renaming files.
 * @param {string} originalPath - The original path of the file.
 * @param {string} newPath - The intended new path for the file.
 * @param {boolean} [isRename] - Indicates if the file should be renamed as part of the operation.
 * @returns {Promise<string>} - The new path of the file after the operation.
 */
async function handleFileOperation(originalPath, newPath, isRename = true) {
  const adjustedPath = newPath.replace(/\/$/, "");

  // Validate paths to prevent path traversal attacks
  if (!isValidFilePath(originalPath) || !isValidFilePath(adjustedPath)) {
    throw new BAD_REQUEST_400("Invalid file path");
  }

  await ensureDirectoryExists(adjustedPath);
  if (isRename) {
    // Paths are validated above via isValidFilePath() - prevents path traversal
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.rename(originalPath, adjustedPath);
  }
  return adjustedPath.replace(`${STORAGE_CONFIG.uploadServerPath}/`, "");
}

/**
 * Validates file path to prevent path traversal attacks
 * @param {string} path - File path to validate
 * @returns {boolean} - True if path is safe
 */
function isValidFilePath(path) {
  // Prevent path traversal (../, ..\, etc.)
  if (path.includes("..")) return false;
  // Ensure path is within allowed storage directories
  const allowedPaths = [STORAGE_CONFIG.storagePath, STORAGE_CONFIG.tempStoragePath, STORAGE_CONFIG.uploadServerPath];
  return allowedPaths.some((allowed) => path.startsWith(allowed));
}

/**
 * Validates a specific part of the request against its defined schema.
 * @param {import('fastify').FastifyRequest} req - The Fastify request object.
 * @param {string} part - The part of the request to validate (e.g., 'body', 'query', 'headers').
 * @returns {boolean} - Returns true if validation is successful.
 * @throws {BadRequestException} - Throws if validation fails.
 */
function validateRequestPart(req, part) {
  // Use switch to avoid object injection warning - part is controlled from fixed array
  let schema;
  switch (part) {
    case "body": {
      schema = req.routeOptions?.schema?.body;
      break;
    }
    case "headers": {
      schema = req.routeOptions?.schema?.headers;
      break;
    }
    case "query": {
      schema = req.routeOptions?.schema?.query;
      break;
    }
    default: {
      return true;
    }
  }

  if (!schema) return true;

  const validate = req.compileValidationSchema(schema);

  // Use switch to avoid object injection warning - part is controlled from fixed array
  let requestPart;
  switch (part) {
    case "body": {
      requestPart = req.body;
      break;
    }
    case "headers": {
      requestPart = req.headers;
      break;
    }
    case "query": {
      requestPart = req.query;
      break;
    }
    default: {
      return true;
    }
  }

  if (validate(requestPart)) return true;

  const error = new BAD_REQUEST_400(`Validation error`);

  error.validation = validate.errors;
  error.validationContext = part;
  throw error;
}

/**
 * Fastify plugin for handling file uploads and multipart form data
 * @type {(app: import("#@types/index.jsdoc.js").FastifyInstance, option?: { parseMultipartFields?: (req: import('fastify').FastifyRequest) => void; removeUploadIfExists?: (filePath: string) => Promise<void>; uploadToStorage?: (uploadedFile: object, folder: string) => Promise<string>; upload?: (uploadedFile: object) => Promise<string> }) => Promise<void>}
 */
const uploadPlugin = async (app, option) => {
  /**
   * Removes an uploaded file if it exists on the server.
   * @param {string} filePath - The path of the file to be removed.
   * @returns {Promise<void>} - A promise that resolves when the file is successfully removed.
   * @throws {Error} - Throws if the file does not exist or cannot be accessed.
   */
  const removeUploadIfExists = async (filePath) => {
    const serverPath = toServerPath(filePath);
    await fs.access(serverPath);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.unlink(serverPath);
  };

  /**
   * Uploads a file to a specified storage folder.
   * @param {object} uploadedFile - The file object to be uploaded.
   * @param {string} folder - The folder within the storage to which the file will be uploaded.
   * @returns {Promise<string>} - The new path of the uploaded file after the operation.
   */
  const uploadToStorage = async (uploadedFile, folder) => {
    const path = `${STORAGE_CONFIG.storagePath}/${folder}`;
    return await handleFileOperation(uploadedFile.path, uploadedFile.path.replace(STORAGE_CONFIG.tempStoragePath, path));
  };

  /**
   * Uploads a file to the server's default upload path.
   * @param {object} uploadedFile - The file object to be uploaded.
   * @returns {Promise<string>} - The new path of the uploaded file after the operation.
   */
  const upload = async (uploadedFile) => {
    const path = `${STORAGE_CONFIG.uploadServerPath}/`;
    return await handleFileOperation(uploadedFile.path, uploadedFile.path.replace(STORAGE_CONFIG.tempStoragePath, path));
  };

  /**
   * Parses multipart fields from the request, validates them, and normalizes the request body.
   * @param {import('fastify').FastifyRequest | object} req - The request object to parse.
   * @throws {UNSUPPORTED_MEDIA_TYPE_415} - Throws if the 'Content-Type' is not supported.
   */
  const parseMultipartFields = (req) => {
    const contentType = req.headers?.["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data"))
      throw new UNSUPPORTED_MEDIA_TYPE_415("Only 'multipart/form-data' is accepted");

    for (const [key, item] of Object.entries(req.body)) {
      // eslint-disable-next-line security/detect-object-injection
      req.body[key] = item.type === "field" ? item.value : item;
    }

    for (const part of ["body", "query", "headers"]) validateRequestPart(req, part);
  };

  app.decorate("parseMultipartFields", option?.parseMultipartFields ?? parseMultipartFields);
  app.decorate("removeUploadIfExists", option?.removeUploadIfExists ?? removeUploadIfExists);
  app.decorate("uploadToStorage", option?.uploadToStorage ?? uploadToStorage);
  app.decorate("upload", option?.upload ?? upload);
};

// @ts-expect-error - FastifyInstanceExtended is used for JSDoc documentation, but fp() expects base FastifyInstance type. At runtime, the instance will have all extended properties.
export default fp(uploadPlugin);
