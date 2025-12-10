import { and, eq, isNull } from "drizzle-orm";
import { partial } from "rambda";

import { NON_PASSWORD_COLUMNS, users } from "#modules/users/users.model.js";

/** @type {(deps: Dependencies, id: string) => Promise<User | undefined>} */
const findById = async ({ db }, id) => {
  const [maybeUser] = await db
    .select(NON_PASSWORD_COLUMNS)
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)));

  return maybeUser;
};

/** @type {(deps: Dependencies, email: string) => Promise<User | undefined>} */
const findByEmail = async ({ db }, email) => {
  const [maybeUser] = await db
    .select(NON_PASSWORD_COLUMNS)
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)));

  return maybeUser;
};

/** @type {(deps: Dependencies, data: UserInsert) => Promise<User>} */
const create = async ({ db }, data) => {
  const [newUser] = await db.insert(users).values(data).returning(NON_PASSWORD_COLUMNS);

  return newUser;
};

/** @type {(deps: Dependencies, id: string, data: Partial<UserInsert>) => Promise<User | undefined>} */
const update = async ({ db }, id, data) => {
  const [updatedUser] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning(NON_PASSWORD_COLUMNS);

  return updatedUser;
};

/** @type {(deps: Dependencies, id: string) => Promise<User | undefined>} */
const softDelete = async ({ db }, id) => {
  const [deletedUser] = await db
    .update(users)
    .set({ deletedAt: new Date().toISOString() })
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .returning(NON_PASSWORD_COLUMNS);

  return deletedUser;
};

/** @type {(deps: Dependencies) => UsersRepository} */
export default function usersRepository(deps) {
  return {
    create: partial(create, [deps]),
    findByEmail: partial(findByEmail, [deps]),
    findById: partial(findById, [deps]),
    softDelete: partial(softDelete, [deps]),
    update: partial(update, [deps]),
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @typedef {import("./users.contracts.js").User} User */
/** @typedef {import("./users.contracts.js").UserInsert} UserInsert */
/** @typedef {{ findById: (id: string) => Promise<User | undefined>, findByEmail: (email: string) => Promise<User | undefined>, create: (data: UserInsert) => Promise<User>, update: (id: string, data: Partial<UserInsert>) => Promise<User | undefined>, softDelete: (id: string) => Promise<User | undefined> }} UsersRepository */
