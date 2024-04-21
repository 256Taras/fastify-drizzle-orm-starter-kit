import crypto, { createCipheriv, createDecipheriv, randomBytes, randomUUID } from "node:crypto";

// Local cryptographic configuration
const cryptoConfig = {
  saltRounds: 10,
  keyLength: 64,
  key: "your-secret-key-here", // Replace with your actual secure key
  algorithm: "aes-256-cbc", // Example algorithm
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
  return clean ? uuid.replace(/-/g, "") : uuid;
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
  const cipher = createCipheriv(cryptoConfig.algorithm, Buffer.from(cryptoConfig.key), iv);
  let encrypted = cipher.update(rawData, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
};

/**
 * Decrypts data.
 * @param {string} encryptedData - The data to decrypt.
 * @returns {string} The decrypted data.
 */
const decryptData = (encryptedData) => {
  const [ivHex, encrypted] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(cryptoConfig.algorithm, Buffer.from(cryptoConfig.key), iv);
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
  randomBytes: generateRandomBytes,
  generateUUID,
  getHash,
  compareHash,
  encryptData,
  decryptData,
  base64Encode,
  base64Decode,
});

export default createEncrypterService;
