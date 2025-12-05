/**
 * FastifyJWT payload interface
 * @typedef {object} FastifyJWTPayload
 * @property {number} id
 */

/**
 * FastifyJWT user interface
 * @typedef {object} FastifyJWTUser
 * @property {number} age
 * @property {number} id
 * @property {string} name
 */

/**
 * JWT access token interface
 * @typedef {object} JWTAccessToken
 * @property {(payload: { id: number; name: string }) => string} sign
 * @property {(token: string | string[]) => Promise<{ id: number; name: string }>} verify
 */

/**
 * JWT refresh token interface
 * @typedef {object} JWTRefreshToken
 * @property {(payload: { id: number; refreshTokenId: string }) => string} sign
 * @property {(token: string | string[]) => Promise<{ id: number; refreshTokenId: string }>} verify
 */

/**
 * JWT interface
 * @typedef {object} JWTInterface
 * @property {JWTAccessToken} accessToken
 * @property {JWTRefreshToken} refreshToken
 */

// Export types for use in JSDoc
export {};
