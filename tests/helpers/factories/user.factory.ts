import { ROLES_NAMES } from "#libs/constants/common.constants.ts";
import encrypterService from "#libs/encryption/encrypter.service.ts";
import { TEST_PASSWORD } from "#tests/helpers/constants/test-credentials.ts";
import { TABLE_NAMES } from "#tests/helpers/utils/db.utils.ts";

export interface UserSeed extends Record<string, unknown> {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  password: string;
  role: string;
}

interface UserOverrides {
  email?: string;
  firstName?: string;
  id?: string;
  lastName?: string;
  password?: string;
  role?: string;
}

const hashedPassword = await encrypterService().getHash(TEST_PASSWORD);

function createManyUsers(count: number, overrides: UserOverrides = {}): UserSeed[] {
  return Array.from({ length: count }, (_, i) => ({
    ...createUser(overrides),
    email: `user${i + 1}-${crypto.randomUUID().slice(0, 8)}@example.com`,
    firstName: `User${i + 1}`,
    role: i % 3 === 0 ? ROLES_NAMES.admin : ROLES_NAMES.user,
  }));
}

function createManyUsersSeed(count: number, overrides: UserOverrides = {}) {
  return {
    table: TABLE_NAMES.users,
    data: createManyUsers(count, overrides),
  };
}

function createUser(overrides: UserOverrides = {}): UserSeed {
  return {
    id: crypto.randomUUID(),
    email: `user-${crypto.randomUUID().slice(0, 8)}@example.com`,
    firstName: "Test",
    lastName: "User",
    password: hashedPassword,
    role: ROLES_NAMES.user,
    ...overrides,
  };
}

function createUserSeed(userData: UserSeed) {
  return {
    table: TABLE_NAMES.users,
    data: [userData],
  };
}

export const userFactory = {
  create: createUser,
  createSeed: (overrides: UserOverrides = {}) => createUserSeed(createUser(overrides)),
  createMany: createManyUsers,
  createManySeed: createManyUsersSeed,
  hashedPassword,
};
