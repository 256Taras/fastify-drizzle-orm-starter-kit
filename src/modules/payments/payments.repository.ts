import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { eq, type InferInsertModel } from "drizzle-orm";
import { partial } from "rambda";

import type { Payment, PaymentInsert } from "./payments.types.d.ts";

import { createBaseRepository } from "#libs/persistence/base-repository.ts";
import { PAYMENT_PUBLIC_COLUMNS, payments } from "#modules/payments/payments.model.ts";

type PaymentInsertDrizzle = InferInsertModel<typeof payments>;

const findOneByBookingId = async ({ db }: Cradle, bookingId: UUID): Promise<Payment | undefined> => {
  const [payment] = await db.select(PAYMENT_PUBLIC_COLUMNS).from(payments).where(eq(payments.bookingId, bookingId));

  return payment;
};

const updateOneById = async (
  { db }: Cradle,
  id: UUID,
  data: Partial<Omit<PaymentInsertDrizzle, "createdAt" | "id">>,
): Promise<Payment | undefined> => {
  const [updated] = await db.update(payments).set(data).where(eq(payments.id, id)).returning(PAYMENT_PUBLIC_COLUMNS);

  return updated;
};

export default function paymentsRepository(deps: Cradle) {
  const baseRepo = createBaseRepository<typeof payments, Payment, PaymentInsert>({
    table: payments,
    logger: deps.logger,
    db: deps.db,
    defaultSelectColumns: PAYMENT_PUBLIC_COLUMNS,
  });

  return {
    createOne: baseRepo.createOne,
    findOneById: baseRepo.findOneById,
    findOneByBookingId: partial(findOneByBookingId, [deps]),
    updateOneById: partial(updateOneById, [deps]),
  };
}
