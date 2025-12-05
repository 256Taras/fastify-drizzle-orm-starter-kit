import crypto, { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";

import { ENCRYPTION_CONFIG } from "#configs/index.js";

// Ensure encryption key is properly formatted (32 bytes for AES-256)
/**
 *
 */
const getEncryptionKey = () => {
  const key = ENCRYPTION_CONFIG.key;
  if (!key || key.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters long");
  }
  // For AES-256, we need exactly 32 bytes. Hash the key if it's longer, or pad if shorter
  if (key.length === 32) {
    return Buffer.from(key, "utf8");
  }
  // Hash to get exactly 32 bytes
  return createHash("sha256").update(key).digest();
};

const cryptoConfig = {
  algorithm: ENCRYPTION_CONFIG.algorithm,
  key: getEncryptionKey(),
  keyLength: ENCRYPTION_CONFIG.keyLength,
  saltRounds: ENCRYPTION_CONFIG.saltRounds,
};

/**
 * Generates random bytes.
 * @param {number} [length] - The length of the random bytes.
 * @param {BufferEncoding} [encoding] - The encoding of the output.
 * @returns {string} The generated random bytes in the specified encoding.
 */
const generateRandomBytes = (length = 16, encoding = "hex") => randomBytes(length).toString(encoding);

/**
 * Generates a UUID.
 * @param {boolean} [clean] - Whether to remove hyphens.
 * @returns {string} The generated UUID, optionally without hyphens.
 */
const generateUUID = (clean = false) => {
  const uuid = randomUUID();
  return clean ? uuid.replaceAll("-", "") : uuid;
};

/**
 * Generates a hash from a password.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} A Promise that resolves to the salt and hash, concatenated by a colon.
 */
const getHash = async (password) => {
  const salt = generateRandomBytes(cryptoConfig.saltRounds, "hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, cryptoConfig.keyLength, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
};

/**
 * Compares a password with a hash to see if they match.
 * @param {string} password - The plaintext password.
 * @param {string} hash - The hash to compare against.
 * @returns {Promise<boolean>} A Promise that resolves to a boolean indicating the match result.
 */
const compareHash = async (password, hash) => {
  const [salt, storedKey] = hash.split(":");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, cryptoConfig.keyLength, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(storedKey === derivedKey.toString("hex"));
    });
  });
};

/**
 * Encrypts data.
 * @param {string} rawData - The data to encrypt.
 * @returns {string} The encrypted data, including the IV.
 */
const encryptData = (rawData) => {
  const iv = randomBytes(16);
  const cipher = createCipheriv(cryptoConfig.algorithm, cryptoConfig.key, iv);
  let encrypted = cipher.update(rawData, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

/**
 * @param {string} encryptedData
 * @returns {string}
 */
const decryptData = (encryptedData) => {
  const [ivHex, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(cryptoConfig.algorithm, cryptoConfig.key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

/**
 * Encodes data to base64 format.
 * @param {string} data - The data to encode.
 * @returns {string} The base64-encoded data.
 */
const base64Encode = (data) => Buffer.from(data).toString("base64");

/**
 * Decodes data from base64 format.
 * @param {string} data - The base64-encoded data.
 * @returns {string} The decoded data.
 */
const base64Decode = (data) => Buffer.from(data, "base64").toString();

/**
 * Creates a service providing cryptographic utilities.
 * @returns {object} An object containing cryptographic utility functions.
 */
const createEncrypterService = () => ({
  base64Decode,
  base64Encode,
  compareHash,
  decryptData,
  encryptData,
  generateUUID,
  getHash,
  randomBytes: generateRandomBytes,
});

export default createEncrypterService;
