import { requestContext } from "@fastify/request-context";

import { TOKENS } from "#libs/common.constants.js";

/**
 * @returns {{ userId: string, refreshTokenId: string } | undefined}
 */
const getUser = () => {
  const user = requestContext.get(TOKENS.userJwtData);
  return user;
};

/**
 * @param {{ userId: string, refreshTokenId: string }} data
 */
const setUser = (data) => {
  requestContext.set(TOKENS.userJwtData, data);
};

/**
 * @returns {{ userId: string, ppid: string, refreshTokenId: string } | undefined}
 */
const getUserCredentials = () => {
  const credentials = requestContext.get(TOKENS.userCredentials);
  return credentials;
};

/**
 * @param {{ userId: string, ppid: string, refreshTokenId: string }} credentials
 */
const setUserCredentials = (credentials) => {
  requestContext.set(TOKENS.userCredentials, credentials);
};

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
