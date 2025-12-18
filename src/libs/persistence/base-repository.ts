import { and, eq, inArray, type InferInsertModel, type InferSelectModel, isNull, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable, SelectedFields, SelectedFieldsFlat } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm/sql";
import type { Logger } from "pino";

import { getTransactionContext } from "./transaction-context.ts";

export interface BaseRepository<TEntity, TInsert> {
  createMany: (dataArray: TInsert[]) => Promise<TEntity[]>;
  createOne: (data: TInsert) => Promise<TEntity>;
  deleteManyByIds: (ids: string[]) => Promise<void>;
  deleteOneById: (id: string) => Promise<void>;
  findManyByIds: (ids: string[]) => Promise<TEntity[]>;
  findOneById: (id: string) => Promise<TEntity | undefined>;
  softDeleteManyByIds: (ids: string[]) => Promise<TEntity[]>;
  softDeleteOneById: (id: string) => Promise<TEntity | undefined>;
}

interface BaseRepositoryOptions<TTable extends TableWithIdColumn> {
  db: PostgresJsDatabase<Record<string, unknown>>;
  defaultSelectColumns?: SelectedFieldsFlat;
  logger: Logger;
  softDeleteColumn?: string;
  table: TTable;
}

type TableWithIdColumn = { id: PgColumn } & PgTable;

export function createBaseRepository<
  TTable extends TableWithIdColumn,
  TEntity = InferSelectModel<TTable>,
  TInsert = InferInsertModel<TTable>,
>(options: BaseRepositoryOptions<TTable>): BaseRepository<TEntity, TInsert> {
  const { table, logger, db, defaultSelectColumns, softDeleteColumn } = options;

  const selectColumns = defaultSelectColumns ?? (table as unknown as SelectedFieldsFlat);

  const getDb = (): PostgresJsDatabase<Record<string, unknown>> => getTransactionContext() ?? db;

  const getSoftDeleteColumn = (): PgColumn => {
    if (!softDeleteColumn) {
      throw new Error("Soft delete column not configured");
    }
    // eslint-disable-next-line security/detect-object-injection
    return (table as unknown as Record<string, PgColumn>)[softDeleteColumn];
  };

  const buildWhere = (additionalWhere: SQL): SQL => {
    if (!softDeleteColumn) {
      return additionalWhere;
    }

    const softDeleteCol = getSoftDeleteColumn();
    const softDeleteFilter = isNull(softDeleteCol);

    return and(softDeleteFilter, additionalWhere) as SQL;
  };

  const createOne = async (data: TInsert): Promise<TEntity> => {
    logger.debug("[BaseRepository] Creating entity");

    const [created] = await getDb()
      .insert(table)
      .values(data as never)
      .returning(selectColumns);

    return created as TEntity;
  };

  const createMany = async (dataArray: TInsert[]): Promise<TEntity[]> => {
    if (dataArray.length === 0) return [];
    logger.debug(`[BaseRepository] Creating ${dataArray.length} entities`);

    const created = await getDb()
      .insert(table)
      .values(dataArray as never)
      .returning(selectColumns);

    return created as TEntity[];
  };

  const findOneById = async (id: string): Promise<TEntity | undefined> => {
    logger.debug(`[BaseRepository] Finding entity by ID: ${id}`);

    const whereClause = buildWhere(eq(table.id, id));

    const [entity] = await getDb()
      .select(selectColumns as SelectedFields)
      .from(table as PgTable)
      .where(whereClause);

    return entity as TEntity | undefined;
  };

  const findManyByIds = async (ids: string[]): Promise<TEntity[]> => {
    if (ids.length === 0) return [];
    logger.debug(`[BaseRepository] Finding ${ids.length} entities by IDs`);

    const whereClause = buildWhere(inArray(table.id, ids));

    const entities = await getDb()
      .select(selectColumns as SelectedFields)
      .from(table as PgTable)
      .where(whereClause);

    return entities as TEntity[];
  };

  const softDeleteOneById = async (id: string): Promise<TEntity | undefined> => {
    const softDeleteCol = getSoftDeleteColumn();
    logger.debug(`[BaseRepository] Soft deleting entity: ${id}`);

    const deletedAt = sql`now()`;

    const [deleted] = await getDb()
      .update(table)
      .set({ [softDeleteColumn as string]: deletedAt } as never)
      .where(and(eq(table.id, id), isNull(softDeleteCol)))
      .returning(selectColumns);

    return deleted as TEntity | undefined;
  };

  const softDeleteManyByIds = async (ids: string[]): Promise<TEntity[]> => {
    const softDeleteCol = getSoftDeleteColumn();
    if (ids.length === 0) return [];
    logger.debug(`[BaseRepository] Soft deleting ${ids.length} entities by IDs`);

    const deletedAt = sql`now()`;

    const deleted = await getDb()
      .update(table)
      .set({ [softDeleteColumn as string]: deletedAt } as never)
      .where(and(inArray(table.id, ids), isNull(softDeleteCol)))
      .returning(selectColumns);

    return deleted as TEntity[];
  };

  const deleteOneById = async (id: string): Promise<void> => {
    logger.debug(`[BaseRepository] Hard deleting entity: ${id}`);
    await getDb().delete(table).where(eq(table.id, id));
  };

  const deleteManyByIds = async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return;
    logger.debug(`[BaseRepository] Hard deleting ${ids.length} entities by IDs`);
    await getDb().delete(table).where(inArray(table.id, ids));
  };

  return {
    createMany,
    createOne,
    deleteManyByIds,
    deleteOneById,
    findManyByIds,
    findOneById,
    softDeleteManyByIds,
    softDeleteOneById,
  };
}
