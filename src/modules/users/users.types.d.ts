import type usersMutations from "./users.mutations.ts";
import type usersQueries from "./users.queries.ts";
import type usersRepository from "./users.repository.ts";

declare module "@fastify/awilix" {
  interface Cradle {
    usersMutations: ReturnType<typeof usersMutations>;
    usersQueries: ReturnType<typeof usersQueries>;
    usersRepository: ReturnType<typeof usersRepository>;
  }
}
