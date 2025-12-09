/** @file FastifyInstance with authentication methods */

/**
 * FastifyInstance with authentication methods Extends base FastifyInstance with custom auth decorators
 *
 * @typedef {import("./base.jsdoc.js").FastifyInstanceBase & {
 *   verifyApiKey: import("./auth-types.jsdoc.js").FastifyAuthFunction;
 *   verifyJwt: import("./auth-types.jsdoc.js").FastifyAuthFunction;
 *   verifyJwtRefreshToken: import("./auth-types.jsdoc.js").FastifyAuthFunction;
 * }} FastifyInstanceWithAuth
 */

export {};
