import type { Cradle } from "@fastify/awilix";
import { desc, eq } from "drizzle-orm";
import { partial } from "rambda";

import { AUDIT_LOG_COLUMNS, type AuditLogRow, auditLogs } from "./audits.model.ts";
import type { AuditLogCreateInput } from "./audits.types.d.ts";

const createOne = async ({ db }: Cradle, data: AuditLogCreateInput): Promise<AuditLogRow> => {
  const [created] = await db.insert(auditLogs).values(data).returning(AUDIT_LOG_COLUMNS);
  return created;
};

const findManyByUserId = async ({ db }: Cradle, userId: string, limit = 50): Promise<AuditLogRow[]> => {
  return db
    .select(AUDIT_LOG_COLUMNS)
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
};

const findManyByEntityId = async ({ db }: Cradle, entityId: string, limit = 50): Promise<AuditLogRow[]> => {
  return db
    .select(AUDIT_LOG_COLUMNS)
    .from(auditLogs)
    .where(eq(auditLogs.entityId, entityId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
};

export default function auditsRepository(deps: Cradle) {
  return {
    createOne: partial(createOne, [deps]),
    findManyByUserId: partial(findManyByUserId, [deps]),
    findManyByEntityId: partial(findManyByEntityId, [deps]),
  };
}
