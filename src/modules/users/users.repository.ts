import type { Cradle } from "@fastify/awilix";
import { and, eq, isNull } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { partial } from "rambda";

import { createBaseRepository } from "#libs/persistence/base-repository.ts";
import { NON_PASSWORD_COLUMNS, users } from "#modules/users/users.model.ts";

import type { User, UserInsert } from "./users.contracts.ts";

type UserWithPassword = InferSelectModel<typeof users>;

const findOneByEmail = async ({ db }: Cradle, email: string): Promise<undefined | User> => {
  const [maybeUser] = await db
    .select(NON_PASSWORD_COLUMNS)
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)));

  return maybeUser as undefined | User;
};

const findOneByEmailWithPassword = async ({ db }: Cradle, email: string): Promise<undefined | UserWithPassword> => {
  const [maybeUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)));

  return maybeUser as undefined | UserWithPassword;
};

const findOneByIdWithPassword = async ({ db }: Cradle, id: string): Promise<undefined | UserWithPassword> => {
  const [maybeUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)));

  return maybeUser as undefined | UserWithPassword;
};

const updateOnePasswordById = async ({ db }: Cradle, id: string, password: string): Promise<undefined | User> => {
  const [updatedUser] = await db
    .update(users)
    .set({ password, updatedAt: new Date().toISOString() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning(NON_PASSWORD_COLUMNS);

  return updatedUser as undefined | User;
};

const updateOneById = async ({ db }: Cradle, id: string, data: Partial<UserInsert>): Promise<undefined | User> => {
  const [updatedUser] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning(NON_PASSWORD_COLUMNS);

  return updatedUser as undefined | User;
};

export default function usersRepository(deps: Cradle) {
  const baseRepo = createBaseRepository({
    table: users,
    logger: deps.logger,
    db: deps.db,
    defaultSelectColumns: NON_PASSWORD_COLUMNS,
    softDeleteColumn: "deletedAt",
  });

  return {
    createOne: baseRepo.createOne,
    findOneById: baseRepo.findOneById,
    softDeleteOneById: baseRepo.softDeleteOneById,
    findOneByEmail: partial(findOneByEmail, [deps]),
    findOneByEmailWithPassword: partial(findOneByEmailWithPassword, [deps]),
    findOneByIdWithPassword: partial(findOneByIdWithPassword, [deps]),
    updateOneById: partial(updateOneById, [deps]),
    updateOnePasswordById: partial(updateOnePasswordById, [deps]),
  };
}
