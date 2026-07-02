import { z } from "zod";

const supportedTimezones = new Set(Intl.supportedValuesOf("timeZone"));

export const createBookingSchema = z.object({
  serviceId: z.string().cuid(),
  startsAt: z.coerce.date().refine((date) => date.getTime() > Date.now(), {
    message: "Booking must start in the future",
  }),
  timezone: z
    .string()
    .refine((tz) => supportedTimezones.has(tz), { message: "Unknown timezone" }),
  guestCount: z.number().int().min(1).max(20),
  notes: z.string().trim().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
