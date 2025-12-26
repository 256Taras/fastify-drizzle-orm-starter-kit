import type { Column } from "drizzle-orm";

export type DrizzleColumn = Column;

export type QueryParams = Record<string, string | string[] | undefined>;

export type TableColumns = Record<string, DrizzleColumn>;
