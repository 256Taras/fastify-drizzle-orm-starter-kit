/**
 * @file
 * Extended FastifyInstance with all custom methods and properties
 *
 * This is the final type that combines all Fastify extensions.
 */

/**
 * Get pagination query from request
 * This helper ensures proper type inference for req.pagination
 * Works for both offset and cursor pagination strategies
 * @template {import('fastify').RouteGenericInterface} [TRouteGeneric=import('fastify').RouteGenericInterface]
 * @template {'offset' | 'cursor'} [TStrategy='offset'] - Pagination strategy (optional, for type inference)
 * @typedef {function(import('fastify').FastifyRequest<TRouteGeneric> & {
 *   pagination?: import('#libs/pagination/pagination.types.jsdoc.js').PaginationParams<TStrategy> | undefined
 * }): import('#libs/pagination/pagination.types.jsdoc.js').PaginationParams<TStrategy>} GetPaginationQueryFunction
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
 * - Transformers object with pagination helpers (transformers.getPaginationQuery)
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
 * const pagination = app.transformers.getPaginationQuery(req); // Returns pagination params
 * ```
 *
 * @typedef {import("./jwt.jsdoc.js").FastifyInstanceWithJWT & {
 *   diContainer: {
 *     cradle: import("#@types/index.jsdoc.js").AwilixCradle;
 *   };
 *   transformers: {
 *     getPaginationQuery: GetPaginationQueryFunction;
 *   };
 * }} FastifyInstanceExtended
 */

export {};
