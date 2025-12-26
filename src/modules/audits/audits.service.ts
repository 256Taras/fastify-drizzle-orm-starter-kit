import type { Cradle } from "@fastify/awilix";

import type { AuditLogRow } from "./audits.model.ts";
import type { AuditAction, AuditLogCreateInput, EntityType } from "./audits.types.d.ts";

interface AuditContext {
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

interface LogAuditParams {
  action: AuditAction;
  entityId?: string;
  entityType: EntityType;
  metadata?: Record<string, unknown>;
}

const log = async (
  { auditsRepository, logger }: Cradle,
  context: AuditContext,
  params: LogAuditParams,
): Promise<AuditLogRow> => {
  const input: AuditLogCreateInput = {
    userId: context.userId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: params.metadata,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  };

  logger.debug(`[AuditsService] Logging: ${params.action} on ${params.entityType}`, {
    entityId: params.entityId,
    userId: context.userId,
  });

  return auditsRepository.createOne(input);
};

export default function auditsService(deps: Cradle) {
  return {
    log: (context: AuditContext, params: LogAuditParams) => log(deps, context, params),

    logUserAction: (
      userId: string,
      action: AuditAction,
      entityType: EntityType,
      entityId?: string,
      metadata?: Record<string, unknown>,
    ) => log(deps, { userId }, { action, entityType, entityId, metadata }),

    logAnonymousAction: (
      action: AuditAction,
      entityType: EntityType,
      ipAddress?: string,
      userAgent?: string,
      metadata?: Record<string, unknown>,
    ) => log(deps, { ipAddress, userAgent }, { action, entityType, metadata }),
  };
}
