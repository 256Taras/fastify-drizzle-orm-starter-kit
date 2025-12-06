/**
 * @file
 * Extended FastifyInstance with all custom methods and properties
 *
 * This is the final type that combines all Fastify extensions.
 */

/**
 * Extended FastifyInstance with all custom methods and properties
 *
 * @description
 * This type extends the base FastifyInstance with:
 * - Application configs (configs)
 * - File upload methods (upload, uploadToStorage, parseMultipartFields)
 * - Authentication methods (verifyJwt, verifyJwtRefreshToken, verifyApiKey)
 * - JWT token management (jwt.accessToken, jwt.refreshToken)
 * - Dependency injection container (diContainer.cradle)
 *
 * @example
 * ```javascript
 * /** @type {import("#@types/index.jsdoc.js").FastifyInstance} *\/
 * const app = fastify();
 *
 * // Now all custom methods are available
 * app.configs.APP_CONFIG;
 * app.upload(file);
 * app.verifyJwt(request);
 * app.diContainer.cradle.authService;
 * ```
 *
 * @typedef {import("./jwt.jsdoc.js").FastifyInstanceWithJWT & {
 *   diContainer: {
 *     cradle: import("#@types/index.jsdoc.js").AwilixCradle;
 *   };
 * }} FastifyInstanceExtended
 */

export {};
