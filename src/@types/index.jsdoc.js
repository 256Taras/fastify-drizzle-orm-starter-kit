/**
 * @file
 * Main types file with short aliases
 *
 * All types are available through short names without long paths.
 * Instead of `import("#@types/fastify/instance.jsdoc.js").FastifyInstanceExtended`
 * you can use simply `FastifyInstance`.
 *
 * @example
 * ```javascript
 * // Short import using type aliases
 * // Instead of: import("#@types/fastify/instance.jsdoc.js").FastifyInstanceExtended
 * // Use: import("#@types/index.jsdoc.js").FastifyInstance
 * const app = fastify();
 * const db = kysely;
 * ```
 */

// ============================================================================
// Fastify types
// ============================================================================

/**
 * Extended Fastify instance with all custom decorators
 * @typedef {import("./fastify/instance.jsdoc.js").FastifyInstanceExtended} FastifyInstance
 */

/**
 * Fastify plugin type
 * @typedef {import("./fastify/plugin.jsdoc.js").FastifyPluginAsyncExtended} FastifyPlugin
 */

/**
 * Fastify plugin type for TypeBox
 * @typedef {import("./fastify/plugin.jsdoc.js").FastifyPluginAsyncTypeboxExtended} FastifyPluginTypebox
 */

/**
 * Fastify request with typed querystring
 * @template {import('@sinclair/typebox').TSchema} TQuery
 * @typedef {import("./fastify/request.jsdoc.js").FastifyRequestWithQuery<TQuery>} FastifyRequestQuery
 */

/**
 * Fastify request with typed body
 * @template {import('@sinclair/typebox').TSchema} TBody
 * @typedef {import("./fastify/request.jsdoc.js").FastifyRequestWithBody<TBody>} FastifyRequestBody
 */

/**
 * Fastify request with typed querystring and body
 * @template {import('@sinclair/typebox').TSchema} TQuery
 * @template {import('@sinclair/typebox').TSchema} TBody
 * @typedef {import("./fastify/request.jsdoc.js").FastifyRequestWithQueryAndBody<TQuery, TBody>} FastifyRequestQueryBody
 */

/**
 * Extended FastifyRequest with pagination property
 * Automatically includes pagination in all route handlers when paginationPlugin is registered
 * @template {import('fastify').RouteGenericInterface} [TRouteGeneric=import('fastify').RouteGenericInterface]
 * @typedef {import("./fastify/request.jsdoc.js").FastifyRequestExtended<TRouteGeneric>} FastifyRequestExtended
 */

// ============================================================================
// Database types
// ============================================================================

/**
 * Kysely database instance
 * Types are automatically inferred from Drizzle schema using Kyselify
 * @typedef {import("./database/kysely.jsdoc.js").KyselyDatabase} Database
 */

// ============================================================================
// Config types
// ============================================================================

/**
 * All application configurations
 * @typedef {import("./config/common.jsdoc.js").Configs} Configs
 */

/**
 * Environment variables configuration
 * @typedef {import("./config/common.jsdoc.js").Env} Env
 */

// ============================================================================
// Server types
// ============================================================================

/**
 * RestApiServer constructor options
 * @typedef {import("./server/options.jsdoc.js").RestApiServerOptions} ServerOptions
 */

/**
 * Fastify plugin options
 * @typedef {import("./server/options.jsdoc.js").FastifyGlobalOptionConfig} PluginOptions
 */

// ============================================================================
// DI types
// ============================================================================

/**
 * Dependencies interface for dependency injection
 * @typedef {import("./di/container.jsdoc.js").Dependencies} Dependencies
 */

/**
 * Extended Awilix Cradle with all dependencies
 * @typedef {import("./di/cradle.jsdoc.js").AwilixCradleExtended} AwilixCradle
 */

export {};
