/**
 * Extracts parameter names from URL template string.
 * "/v1/users/:id" -> "id"
 * "/v1/users/:userId/posts/:postId" -> "userId" | "postId"
 */
type ExtractParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? ExtractParams<`/${Rest}`> | Param
  : T extends `${string}:${infer Param}`
    ? Param
    : never;

/**
 * Creates typed params object from extracted parameter names.
 * If no params found, returns void (no argument needed).
 */
type ParamsObject<T extends string> = ExtractParams<T> extends never ? void : Record<ExtractParams<T>, number | string>;

/**
 * Creates a type-safe endpoint builder function.
 *
 * @example
 * // No params - call without arguments
 * const endpoint = createEndpoint("/v1/auth/sign-in");
 * endpoint() // "/v1/auth/sign-in"
 *
 * @example
 * // With params - TypeScript enforces required params
 * const endpoint = createEndpoint("/v1/users/:id");
 * endpoint({ id: "123" }) // "/v1/users/123"
 * endpoint({ id: 456 })   // "/v1/users/456"
 * endpoint()              // TS Error: Expected 1 argument
 * endpoint({ foo: "x" })  // TS Error: Property 'id' is missing
 *
 * @example
 * // Multiple params
 * const endpoint = createEndpoint("/v1/users/:userId/posts/:postId");
 * endpoint({ userId: "1", postId: "2" }) // "/v1/users/1/posts/2"
 */
export function createEndpoint<T extends string>(template: T) {
  return (...args: ParamsObject<T> extends void ? [] : [params: ParamsObject<T>]): string => {
    const params = args[0];
    if (!params) return template;

    return Object.entries(params).reduce((path, [key, value]) => path.replace(`:${key}`, String(value)), template as string);
  };
}
