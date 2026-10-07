import { defineRelations } from "drizzle-orm";
import * as schema from "@/db/schema";

export const relations = defineRelations(schema, (r) => ({
  bookings: {
    service: r.one.services({
      from: r.bookings.serviceId,
      to: r.services.id,
      optional: false,
    }),
  },
  services: {
    bookings: r.many.bookings(),
  },
}));
