/**
 * @file
 * FastifyInstance with file upload methods
 */

/**
 * FastifyInstance with file upload methods
 * @typedef {import("./config.jsdoc.js").FastifyInstanceWithConfigs & {
 *   parseMultipartFields: (req: import('fastify').FastifyRequest, rep: import('fastify').FastifyReply) => Promise<void>;
 *   removeUploadIfExists: (filePath: string) => Promise<void>;
 *   upload: (uploadedFile: Record<string, any>) => Promise<string>;
 *   uploadToStorage: (uploadedFile: Record<string, any>, folder: string) => Promise<string>;
 * }} FastifyInstanceWithUpload
 */

export {};

