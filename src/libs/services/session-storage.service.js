import { requestContext } from "@fastify/request-context";

import { TOKENS } from "#libs/common.constants.js";

/**
 * Retrieves user data from the request context.
 * @returns {{ userId: string, refreshTokenId: string }} Object containing user ID and refresh token ID.
 */
// @ts-ignore
const getUser = () => requestContext.get(TOKENS.userJwtData);

/**
 * Stores user data in the request context.
 * @param {{ userId: string, refreshTokenId: string }} data An object containing user ID and refresh token ID.
 */
// @ts-ignore
const setUser = (data) => requestContext.set(TOKENS.userJwtData, data);

/**
 * Retrieves user credentials from the request context.
 * @returns {{ userId: string, ppid: string, refreshTokenId: string }} Object containing user ID, partner ID (ppid), and refresh token ID.
 */
// @ts-ignore
const getUserCredentials = () => requestContext.get(TOKENS.userCredentials);

/**
 * Stores user credentials in the request context.
 * @param {{ userId: string, ppid: string, refreshTokenId: string }} credentials An object containing user ID, partner ID (ppid), and refresh token ID.
 * This function will compile correctly in TypeScript despite the TypeScript warnings.
 */
// @ts-ignore
const setUserCredentials = (credentials) => requestContext.set(TOKENS.userCredentials, credentials);

/**
 * Creates a session storage service to manage user data and credentials.
 * @returns {object} An object containing methods to manage user data and credentials.
 */
const sessionStorageService = () => ({
  getUser,
  getUserCredentials,
  setUser,
  setUserCredentials,
});

export default sessionStorageService;
