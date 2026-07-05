"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createBooking } from "@/lib/bookings/create-booking";
import { writeAuditLog } from "@/lib/audit/write-audit-log";
import { toUserMessage } from "@/lib/errors/to-user-message";
import { createBookingSchema } from "@/schemas/booking-schema";
import type { ActionResult } from "@/types/action-result";
import type { Booking } from "@/types/booking";

export const createBookingAction = async (
  input: unknown,
): Promise<ActionResult<Booking>> => {
  const session = await requireSession();

  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const booking = await createBooking({
      ...parsed.data,
      customerId: session.user.id,
    });

    await writeAuditLog({
      actorId: session.user.id,
      action: "booking.created",
      entityType: "booking",
      entityId: booking.id,
    });

    revalidatePath("/bookings");
    return { ok: true, data: booking };
  } catch (error) {
    return { ok: false, error: toUserMessage(error) };
  }
}
