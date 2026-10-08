import { eq } from "drizzle-orm";
import { bookings, idempotencyRecords } from "@/db/schema";
import type { Db } from "@/lib/db";
import type { ChargeBookingInput } from "@/features/payment/payment-schema";
import { createStripeCharge, type ChargeResult } from "@/lib/stripe";

export const chargeBookingOnce = async (
  db: Db,
  input: ChargeBookingInput,
): Promise<ChargeResult> => {
  const idempotencyKey = `charge:booking:${input.bookingId}`;

  const existing = await db.query.idempotencyRecords.findFirst({
    where: { key: idempotencyKey },
  });
  if (existing) {
    return existing.result;
  }

  const charge = await createStripeCharge(
    {
      amountInCents: input.amountInCents,
      currency: input.currency,
      customerId: input.customerId,
    },
    idempotencyKey,
  );

  return db.transaction(async (tx) => {
    const claimed = await tx
      .insert(idempotencyRecords)
      .values({ key: idempotencyKey, result: charge })
      .onConflictDoNothing()
      .returning({ key: idempotencyRecords.key });
    if (claimed.length === 0) {
      return charge;
    }
    await tx
      .update(bookings)
      .set({ status: "PAID" })
      .where(eq(bookings.id, input.bookingId));
    return charge;
  });
};
