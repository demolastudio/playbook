"use server";

import { revalidatePath } from "next/cache";
import { createBookingSchema } from "@/features/booking/booking-schema";
import { createBooking } from "@/features/booking/create-booking";
import { getDb } from "@/lib/db";
import { defineAction } from "@/lib/define-action";
import { perUserLimit } from "@/lib/rate-limit";

export const createBookingAction = defineAction({
  name: "booking.create",
  schema: createBookingSchema,
  limit: perUserLimit,
  run: async (input, session) => {
    const booking = await createBooking(getDb(), { ...input, customerId: session.user.id });
    revalidatePath("/bookings");
    return booking;
  },
});
