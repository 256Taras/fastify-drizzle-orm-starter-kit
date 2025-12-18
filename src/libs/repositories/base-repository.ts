import { and, eq, inArray, type InferInsertModel, type InferSelectModel, isNull, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable, SelectedFields, SelectedFieldsFlat } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm/sql";
import type { Logger } from "pino";

/**
 * Base repository interface with CRUD operations
 *
 * @template TEntity - The entity type returned by select operations
 * @template TInsert - The type for insert operations
 */
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

/**
 * Options for creating a base repository
 *
 * @template TTable - The Drizzle table type (must have an 'id' column)
 */
interface BaseRepositoryOptions<TTable extends TableWithIdColumn> {
  /** Drizzle database instance */
  db: PostgresJsDatabase<Record<string, unknown>>;
  /** Optional subset of columns to select by default (use getTableColumns and omit) */
  defaultSelectColumns?: SelectedFieldsFlat;
  /** Logger instance */
  logger: Logger;
  /** Column name for soft delete (e.g., 'deletedAt') */
  softDeleteColumn?: string;
  /** The Drizzle table definition */
  table: TTable;
}

/**
 * Constraint for tables that have an 'id' column
 */
type TableWithIdColumn = { id: PgColumn } & PgTable;

/**
 * Creates a base repository with common CRUD operations
 *
 * @template TTable - The Drizzle table type (must have an 'id' column)
 * @template TEntity - The entity type returned by select operations (defaults to InferSelectModel)
 * @template TInsert - The type for insert operations (defaults to InferInsertModel)
 *
 * @example
 * ```typescript
 * // With explicit types for custom select columns
 * const userRepo = createBaseRepository<typeof users, User, UserInsert>({
 *   table: users,
 *   db: deps.db,
 *   logger: deps.logger,
 *   defaultSelectColumns: NON_PASSWORD_COLUMNS,
 *   softDeleteColumn: 'deletedAt',
 * });
 *
 * // With default types (full table)
 * const tokenRepo = createBaseRepository({
 *   table: authTokens,
 *   db: deps.db,
 *   logger: deps.logger,
 * });
 * ```
 */
export function createBaseRepository<
  TTable extends TableWithIdColumn,
  TEntity = InferSelectModel<TTable>,
  TInsert = InferInsertModel<TTable>,
>(options: BaseRepositoryOptions<TTable>): BaseRepository<TEntity, TInsert> {
  const { table, logger, db, defaultSelectColumns, softDeleteColumn } = options;

  // Use defaultSelectColumns if provided, otherwise use full table
  const selectColumns = defaultSelectColumns ?? (table as unknown as SelectedFieldsFlat);

  /**
   * Gets the soft delete column from the table
   */
  const getSoftDeleteColumn = (): PgColumn => {
    if (!softDeleteColumn) {
      throw new Error("Soft delete column not configured");
    }
    // eslint-disable-next-line security/detect-object-injection
    return (table as unknown as Record<string, PgColumn>)[softDeleteColumn];
  };

  /**
   * Builds WHERE clause with optional soft delete filter
   */
  const buildWhere = (additionalWhere: SQL): SQL => {
    if (!softDeleteColumn) {
      return additionalWhere;
    }

    const softDeleteCol = getSoftDeleteColumn();
    const softDeleteFilter = isNull(softDeleteCol);

    return and(softDeleteFilter, additionalWhere) as SQL;
  };

  /**
   * Creates a single entity
   */
  const createOne = async (data: TInsert): Promise<TEntity> => {
    logger.debug("[BaseRepository] Creating entity");

    const [created] = await db
      .insert(table)
      .values(data as never)
      .returning(selectColumns);

    return created as TEntity;
  };

  /**
   * Creates multiple entities
   */
  const createMany = async (dataArray: TInsert[]): Promise<TEntity[]> => {
    if (dataArray.length === 0) return [];
    logger.debug(`[BaseRepository] Creating ${dataArray.length} entities`);

    const created = await db
      .insert(table)
      .values(dataArray as never)
      .returning(selectColumns);

    return created as TEntity[];
  };

  /**
   * Finds a single entity by ID
   */
  const findOneById = async (id: string): Promise<TEntity | undefined> => {
    logger.debug(`[BaseRepository] Finding entity by ID: ${id}`);

    const whereClause = buildWhere(eq(table.id, id));

    const [entity] = await db
      .select(selectColumns as SelectedFields)
      .from(table as PgTable)
      .where(whereClause);

    return entity as TEntity | undefined;
  };

  /**
   * Finds multiple entities by IDs
   */
  const findManyByIds = async (ids: string[]): Promise<TEntity[]> => {
    if (ids.length === 0) return [];
    logger.debug(`[BaseRepository] Finding ${ids.length} entities by IDs`);

    const whereClause = buildWhere(inArray(table.id, ids));

    const entities = await db
      .select(selectColumns as SelectedFields)
      .from(table as PgTable)
      .where(whereClause);

    return entities as TEntity[];
  };

  /**
   * Soft deletes a single entity by ID
   * @throws Error if softDeleteColumn is not configured
   */
  const softDeleteOneById = async (id: string): Promise<TEntity | undefined> => {
    const softDeleteCol = getSoftDeleteColumn();
    logger.debug(`[BaseRepository] Soft deleting entity: ${id}`);

    const deletedAt = sql`now()`;

    const [deleted] = await db
      .update(table)
      .set({ [softDeleteColumn as string]: deletedAt } as never)
      .where(and(eq(table.id, id), isNull(softDeleteCol)))
      .returning(selectColumns);

    return deleted as TEntity | undefined;
  };

  /**
   * Soft deletes multiple entities by IDs
   * @throws Error if softDeleteColumn is not configured
   */
  const softDeleteManyByIds = async (ids: string[]): Promise<TEntity[]> => {
    const softDeleteCol = getSoftDeleteColumn();
    if (ids.length === 0) return [];
    logger.debug(`[BaseRepository] Soft deleting ${ids.length} entities by IDs`);

    const deletedAt = sql`now()`;

    const deleted = await db
      .update(table)
      .set({ [softDeleteColumn as string]: deletedAt } as never)
      .where(and(inArray(table.id, ids), isNull(softDeleteCol)))
      .returning(selectColumns);

    return deleted as TEntity[];
  };

  /**
   * Hard deletes a single entity by ID
   */
  const deleteOneById = async (id: string): Promise<void> => {
    logger.debug(`[BaseRepository] Hard deleting entity: ${id}`);
    await db.delete(table).where(eq(table.id, id));
  };

  /**
   * Hard deletes multiple entities by IDs
   */
  const deleteManyByIds = async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return;
    logger.debug(`[BaseRepository] Hard deleting ${ids.length} entities by IDs`);
    await db.delete(table).where(inArray(table.id, ids));
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
