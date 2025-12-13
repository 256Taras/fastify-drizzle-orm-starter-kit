import { and, eq, inArray, isNull } from "drizzle-orm";
import { sql } from "drizzle-orm/sql";

/**
 * @typedef {import("drizzle-orm").SQL} SQL
 * @typedef {import("drizzle-orm").Column} Column
 * @typedef {import("drizzle-orm/postgres-js").PostgresJsDatabase} PostgresJsDatabase
 * @typedef {import("pino").Logger} Logger
 */

/** @param {{ table: any; logger: Logger; db: PostgresJsDatabase; defaultSelectColumns?: any; softDeleteColumn?: string }} deps */
export function createBaseRepository({ table, logger, db, defaultSelectColumns, softDeleteColumn }) {
  const selectColumns = defaultSelectColumns || table;

  /** @type {(additionalWhere: SQL) => SQL} */
  const buildWhere = (additionalWhere) => {
    if (!softDeleteColumn) {
      return additionalWhere;
    }

    // eslint-disable-next-line security/detect-object-injection
    const softDeleteCol = table[softDeleteColumn];
    const softDeleteFilter = isNull(softDeleteCol);

    // @ts-ignore
    return and(softDeleteFilter, additionalWhere);
  };

  /** @type {(data: Record<string, any>) => Promise<any>} */
  const createOne = async (data) => {
    logger.debug(`[BaseRepository] Creating entity with data: ${JSON.stringify(data)}`);
    const [created] = await db.insert(table).values(data).returning(selectColumns);
    return created;
  };

  /** @type {(dataArray: Record<string, any>[]) => Promise<any[]>} */
  const createMany = async (dataArray) => {
    if (dataArray.length === 0) return [];
    logger.debug(`[BaseRepository] Creating ${dataArray.length} entities`);
    return db.insert(table).values(dataArray).returning(selectColumns);
  };

  /** @type {(id: string) => Promise<any | undefined>} */
  const findOneById = async (id) => {
    logger.debug(`[BaseRepository] Finding entity by ID: ${id}`);
    const whereClause = buildWhere(eq(table.id, id));
    const [entity] = await db.select(selectColumns).from(table).where(whereClause);
    return entity;
  };

  /** @type {(ids: string[]) => Promise<any[]>} */
  const findManyByIds = async (ids) => {
    if (ids.length === 0) return [];
    logger.debug(`[BaseRepository] Finding ${ids.length} entities by IDs`);
    const whereClause = buildWhere(inArray(table.id, ids));
    return db.select(selectColumns).from(table).where(whereClause);
  };

  /** @type {(id: string) => Promise<any | undefined>} */
  const softDeleteOneById = async (id) => {
    if (!softDeleteColumn) {
      throw new Error("Soft delete column not configured");
    }
    logger.debug(`[BaseRepository] Soft deleting entity: ${id}`);

    // eslint-disable-next-line security/detect-object-injection
    const softDeleteCol = table[softDeleteColumn];
    const deletedAt = sql`now()`;

    const [deleted] = await db
      .update(table)
      .set({ [softDeleteColumn]: deletedAt })
      .where(and(eq(table.id, id), isNull(softDeleteCol)))
      .returning(selectColumns);

    return deleted;
  };

  /** @type {(ids: string[]) => Promise<any[]>} */
  const softDeleteManyByIds = async (ids) => {
    if (!softDeleteColumn) {
      throw new Error("Soft delete column not configured");
    }
    if (ids.length === 0) return [];
    logger.debug(`[BaseRepository] Soft deleting ${ids.length} entities by IDs`);

    // eslint-disable-next-line security/detect-object-injection
    const softDeleteCol = table[softDeleteColumn];
    const deletedAt = sql`now()`;

    return db
      .update(table)
      .set({ [softDeleteColumn]: deletedAt })
      .where(and(inArray(table.id, ids), isNull(softDeleteCol)))
      .returning(selectColumns);
  };

  /** @type {(id: string) => Promise<void>} */
  const deleteOneById = async (id) => {
    logger.debug(`[BaseRepository] Hard deleting entity: ${id}`);
    await db.delete(table).where(eq(table.id, id));
  };

  /** @type {(ids: string[]) => Promise<void>} */
  const deleteManyByIds = async (ids) => {
    if (ids.length === 0) return;
    logger.debug(`[BaseRepository] Hard deleting ${ids.length} entities by IDs`);
    await db.delete(table).where(inArray(table.id, ids));
  };

  return {
    createOne,
    createMany,
    findOneById,
    findManyByIds,
    softDeleteOneById,
    softDeleteManyByIds,
    deleteOneById,
    deleteManyByIds,
  };
}
