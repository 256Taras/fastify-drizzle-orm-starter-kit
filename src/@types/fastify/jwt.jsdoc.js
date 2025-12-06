/**
 * @file
 * FastifyInstance with JWT token management
 */

/**
 * FastifyInstance with JWT token management
 * @typedef {import("./auth.jsdoc.js").FastifyInstanceWithAuth & {
 *   jwt: {
 *     accessToken: {
 *       sign: (payload: { id: number; name: string }) => string;
 *       verify: (token: string | string[]) => Promise<{ id: number; name: string }>;
 *     };
 *     refreshToken: {
 *       sign: (payload: { id: number; refreshTokenId: string }) => string;
 *       verify: (token: string | string[]) => Promise<{ id: number; refreshTokenId: string }>;
 *     };
 *   };
 * }} FastifyInstanceWithJWT
 */

export {};

