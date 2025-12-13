import { and, eq, isNull } from "drizzle-orm";
import { partial } from "rambda";

import { createBaseRepository } from "#libs/repositories/base-repository.js";
import { NON_PASSWORD_COLUMNS, users } from "#modules/users/users.model.js";

/** @type {(deps: Dependencies, email: string) => Promise<User | undefined>} */
const findOneByEmail = async ({ db }, email) => {
  const [maybeUser] = await db
    .select(NON_PASSWORD_COLUMNS)
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)));

  return /** @type {User | undefined} */ maybeUser;
};

/** @type {(deps: Dependencies, email: string) => Promise<UserWithPassword | undefined>} */
const findOneByEmailWithPassword = async ({ db }, email) => {
  const [maybeUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)));

  return /** @type {UserWithPassword | undefined} */ maybeUser;
};

/** @type {(deps: Dependencies, id: string) => Promise<UserWithPassword | undefined>} */
const findOneByIdWithPassword = async ({ db }, id) => {
  const [maybeUser] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)));

  return /** @type {UserWithPassword | undefined} */ maybeUser;
};

/** @type {(deps: Dependencies, id: string, password: string) => Promise<User | undefined>} */
const updateOnePasswordById = async ({ db }, id, password) => {
  const [updatedUser] = await db
    .update(users)
    .set({ password, updatedAt: new Date().toISOString() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning(NON_PASSWORD_COLUMNS);

  return /** @type {User | undefined} */ updatedUser;
};

/** @type {(deps: Dependencies, id: string, data: Partial<UserInsert>) => Promise<User | undefined>} */
const updateOneById = async ({ db }, id, data) => {
  const [updatedUser] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning(NON_PASSWORD_COLUMNS);

  return /** @type {User | undefined} */ updatedUser;
};

/** @param {Dependencies} deps */
export default function usersRepository(deps) {
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

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @typedef {import("./users.contracts.js").User} User */
/** @typedef {import("./users.contracts.js").UserInsert} UserInsert */
/** @typedef {import("drizzle-orm").InferSelectModel<typeof users>} UserWithPassword */
