import { requestContext } from "@fastify/request-context";

import { TOKENS } from "#libs/constants/common.constants.ts";

type UserCredentials = {
  ppid: string;
  refreshTokenId: string;
  userId: string;
};

type UserJwtData = {
  refreshTokenId: string;
  userId: string;
};

const getUser = (): UserJwtData => {
  // @ts-expect-error - requestContext.get has generic type issues
  const user = requestContext.get(TOKENS.userJwtData) as undefined | UserJwtData;
  if (!user) throw new Error("User not found in session");
  return user;
};

const setUser = (data: UserJwtData): void => {
  // @ts-expect-error - requestContext.set has generic type issues
  requestContext.set(TOKENS.userJwtData, data);
};

const getUserCredentials = (): undefined | UserCredentials => {
  // @ts-expect-error - requestContext.get has generic type issues
  return requestContext.get(TOKENS.userCredentials) as undefined | UserCredentials;
};

const setUserCredentials = (credentials: UserCredentials): void => {
  // @ts-expect-error - requestContext.set has generic type issues
  requestContext.set(TOKENS.userCredentials, credentials);
};

/**
 * Creates a session storage service to manage user data and credentials.
 */
const sessionStorageService = () => ({
  getUser,
  getUserCredentials,
  setUser,
  setUserCredentials,
});

export default sessionStorageService;
