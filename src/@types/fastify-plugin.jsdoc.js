/**
 * Extended FastifyInstance with all custom methods and properties
 * @typedef {import("#@types/fastify-instance.jsdoc.js").FastifyInstanceExtended} FastifyInstanceExtended
 */

/**
 * Custom Fastify plugin type that uses FastifyInstanceExtended
 * @typedef {(app: FastifyInstanceExtended, opts?: any) => Promise<void> | void} FastifyPluginAsyncExtended
 */

/**
 * Custom Fastify plugin type for TypeBox with extended instance
 * Same as FastifyPluginAsyncExtended but named for TypeBox compatibility
 * @typedef {FastifyPluginAsyncExtended} FastifyPluginAsyncTypeboxExtended
 */

// Export types for use in JSDoc
export {};
