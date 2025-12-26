import crypto, { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID, type UUID } from "node:crypto";

import { ENCRYPTION_CONFIG } from "#configs/index.ts";

/**
 * Ensures encryption key is properly formatted (32 bytes for AES-256)
 *
 * @throws {Error} If the encryption key is missing or too short
 */
const getEncryptionKey = (): Buffer => {
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
 */
const generateRandomBytes = (length = 16, encoding: BufferEncoding = "hex"): string =>
  randomBytes(length).toString(encoding);

/**
 * Generates a UUID.
 */
const generateUUID = (): UUID => randomUUID();

/**
 * Generates a hash from a password.
 */
const getHash = async (password: string): Promise<string> => {
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
 */
const compareHash = async (password: string, hash: string): Promise<boolean> => {
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
 */
const encryptData = (rawData: string): string => {
  const iv = randomBytes(16);
  const cipher = createCipheriv(cryptoConfig.algorithm, cryptoConfig.key, iv);
  let encrypted = cipher.update(rawData, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

const decryptData = (encryptedData: string): string => {
  const [ivHex, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(cryptoConfig.algorithm, cryptoConfig.key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

/**
 * Encodes data to base64 format.
 */
const base64Encode = (data: string): string => Buffer.from(data).toString("base64");

/**
 * Decodes data from base64 format.
 */
const base64Decode = (data: string): string => Buffer.from(data, "base64").toString();

/** Creates a service providing cryptographic utilities. */
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
