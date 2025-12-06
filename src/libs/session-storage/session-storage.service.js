import { requestContext } from "@fastify/request-context";

import { TOKENS } from "#libs/constants/common.constants.js";

/**
 * @returns {{ userId: string, refreshTokenId: string } | undefined}
 */
const getUser = () => {
  // @ts-ignore - requestContext.get has generic type issues
  const user = requestContext.get(TOKENS.userJwtData);
  return user;
};

/**
 * @param {{ userId: string, refreshTokenId: string }} data
 */
const setUser = (data) => {
  // @ts-ignore - requestContext.set has generic type issues
  requestContext.set(TOKENS.userJwtData, data);
};

/**
 * @returns {{ userId: string, ppid: string, refreshTokenId: string } | undefined}
 */
const getUserCredentials = () => {
  // @ts-ignore - requestContext.get has generic type issues
  const credentials = requestContext.get(TOKENS.userCredentials);
  return credentials;
};

/**
 * @param {{ userId: string, ppid: string, refreshTokenId: string }} credentials
 */
const setUserCredentials = (credentials) => {
  // @ts-ignore - requestContext.set has generic type issues
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
