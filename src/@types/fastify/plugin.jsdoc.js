/** @file Fastify plugin types */

/**
 * Custom Fastify plugin type that uses FastifyInstanceExtended
 *
 * @template [TOptions=unknown] - Plugin options type (optional, defaults to unknown). Default is `unknown`
 * @typedef {(app: import("./instance.jsdoc.js").FastifyInstanceExtended, opts?: TOptions) => Promise<void> | void} FastifyPluginAsyncExtended
 */

/**
 * Custom Fastify plugin type for TypeBox with extended instance Same as FastifyPluginAsyncExtended but named for TypeBox
 * compatibility
 *
 * @template [TOptions=unknown] - Plugin options type (optional, defaults to unknown). Default is `unknown`
 * @typedef {FastifyPluginAsyncExtended<TOptions>} FastifyPluginAsyncTypeboxExtended
 */

export {};
