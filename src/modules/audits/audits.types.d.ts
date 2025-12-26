import type { Static } from "@sinclair/typebox";

import type {
  AUDIT_ACTION,
  AUDIT_LOG_CREATE_INPUT,
  AUDIT_LOG_OUTPUT_CONTRACT,
  AUDIT_LOG_OUTPUT_LIST,
  ENTITY_TYPE,
} from "./audits.contracts.ts";
import type auditsRepository from "./audits.repository.ts";
import type auditsService from "./audits.service.ts";

export type AuditAction = keyof typeof AUDIT_ACTION;
export type AuditLog = Static<typeof AUDIT_LOG_OUTPUT_CONTRACT>;
export type AuditLogCreateInput = Static<typeof AUDIT_LOG_CREATE_INPUT>;
export type AuditLogsListResponse = Static<typeof AUDIT_LOG_OUTPUT_LIST>;
export type EntityType = keyof typeof ENTITY_TYPE;

declare module "@fastify/awilix" {
  interface Cradle {
    auditsRepository: ReturnType<typeof auditsRepository>;
    auditsService: ReturnType<typeof auditsService>;
  }
}
