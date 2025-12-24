export interface AuthFactory {
  get accessToken(): string;
  get accessTokenHeader(): { authorization: string };
  get authTokenSeed(): { data: AuthTokenSeed[]; table: string };
  get refreshToken(): string;
  get refreshTokenHeader(): { "x-refresh-token": string };
}

export interface AuthTokenSeed extends Record<string, unknown> {
  id: string;
  ppid: string;
  userId: string;
}

export interface TestUser {
  email: string;
  id: string;
}
