import type { Provider } from "./providers.types.d.ts";

export const canUserManageProvider = (provider: Provider, userId: string): boolean => {
  return provider.userId === userId;
};
