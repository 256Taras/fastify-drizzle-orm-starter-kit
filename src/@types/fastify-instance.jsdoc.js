import * as configs from "../configs/index.js";

/**
 * Base FastifyInstance type with TypeBox type provider support
 * TypeBox type provider is applied via withTypeProvider() at runtime
 * @typedef {import('fastify').FastifyInstance} FastifyInstanceBase
 */

/**
 * Extended FastifyInstance with custom methods and properties
 * Uses intersection to combine base FastifyInstance with all extensions
 * @typedef {FastifyInstanceBase & {
 *   configs: typeof configs;
 *   parseMultipartFields: (req: import('fastify').FastifyRequest, rep: import('fastify').FastifyReply) => Promise<void>;
 *   removeUploadIfExists: (filePath: string) => Promise<void>;
 *   upload: (uploadedFile: Record<string, any>) => Promise<string>;
 *   uploadToStorage: (uploadedFile: Record<string, any>, folder: string) => Promise<string>;
 *   verifyApiKey: import('@fastify/auth').FastifyAuthFunction;
 *   verifyJwt: import('@fastify/auth').FastifyAuthFunction;
 *   verifyJwtRefreshToken: import('@fastify/auth').FastifyAuthFunction;
 *   diContainer: {
 *     cradle: import("#@types/awilix-cradle.jsdoc.js").AwilixCradleExtended;
 *   };
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
 * }} FastifyInstanceExtended
 */

// Export types for use in JSDoc
export {};
