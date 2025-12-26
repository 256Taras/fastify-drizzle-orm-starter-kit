import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { payments } from "./payments.model.ts";

export { PAYMENT_STATUS } from "./payments.constants.ts";

export const PAYMENT_ENTITY_CONTRACT = createSelectSchema(payments);
export const PAYMENT_INSERT_CONTRACT = createInsertSchema(payments);

export const PAYMENT_OUTPUT_CONTRACT = PAYMENT_ENTITY_CONTRACT;
