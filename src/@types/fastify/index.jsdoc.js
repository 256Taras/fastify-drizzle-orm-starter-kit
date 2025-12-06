/**
 * @file
 * Fastify types namespace
 *
 * Exports all Fastify types for convenience
 */

/**
 * Extended Fastify instance
 * @typedef {import("./instance.jsdoc.js").FastifyInstanceExtended} Instance
 */

/**
 * Fastify plugin type
 * @typedef {import("./plugin.jsdoc.js").FastifyPluginAsyncExtended} Plugin
 */

/**
 * Fastify plugin type for TypeBox
 * @typedef {import("./plugin.jsdoc.js").FastifyPluginAsyncTypeboxExtended} PluginTypebox
 */

/**
 * Fastify request with typed querystring
 * @template {import('@sinclair/typebox').TSchema} TQuery
 * @typedef {import("./request.jsdoc.js").FastifyRequestWithQuery<TQuery>} RequestQuery
 */

/**
 * Fastify request with typed body
 * @template {import('@sinclair/typebox').TSchema} TBody
 * @typedef {import("./request.jsdoc.js").FastifyRequestWithBody<TBody>} RequestBody
 */

export {};
