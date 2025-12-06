/**
 * @file
 * Fastify plugin types
 */

/**
 * Custom Fastify plugin type that uses FastifyInstanceExtended
 * @typedef {(app: import("./instance.jsdoc.js").FastifyInstanceExtended, opts?: any) => Promise<void> | void} FastifyPluginAsyncExtended
 */

/**
 * Custom Fastify plugin type for TypeBox with extended instance
 * Same as FastifyPluginAsyncExtended but named for TypeBox compatibility
 * @typedef {FastifyPluginAsyncExtended} FastifyPluginAsyncTypeboxExtended
 */

export {};

