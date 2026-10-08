import { prisma } from "@/lib/prisma";
import type { ChargeBookingInput } from "@/features/payment/payment-schema";
import { createStripeCharge, type ChargeResult } from "@/lib/stripe";

export const chargeBookingOnce = async (
  input: ChargeBookingInput,
): Promise<ChargeResult> => {
  const idempotencyKey = `charge:booking:${input.bookingId}`;

  const existing = await prisma.idempotencyRecord.findUnique({
    where: { key: idempotencyKey },
  });
  if (existing) {
    return existing.result as ChargeResult;
  }

  const charge = await createStripeCharge(
    {
      amountInCents: input.amountInCents,
      currency: input.currency,
      customerId: input.customerId,
    },
    idempotencyKey,
  );

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.idempotencyRecord.createMany({
      data: { key: idempotencyKey, result: charge },
      skipDuplicates: true,
    });
    if (claimed.count === 0) {
      return charge;
    }
    await tx.booking.update({
      where: { id: input.bookingId },
      data: { status: "PAID" },
    });
    return charge;
  });
}
