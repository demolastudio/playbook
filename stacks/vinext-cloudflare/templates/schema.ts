import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { ChargeResult } from "@/lib/stripe";

export const services = pgTable("services", {
  id: uuid("id").primaryKey().default(sql`uuidv7()`),
  name: text("name").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  currency: text("currency").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().default(sql`uuidv7()`),
    customerId: text("customer_id").notNull(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    status: text("status", { enum: ["PENDING", "PAID", "CANCELLED"] })
      .notNull()
      .default("PENDING"),
    amountInCents: integer("amount_in_cents").notNull(),
    currency: text("currency").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("bookings_amount_non_negative", sql`${table.amountInCents} >= 0`),
    index("bookings_service_id_idx").on(table.serviceId),
    index("bookings_customer_recent_idx").on(
      table.customerId,
      table.createdAt.desc().nullsFirst(),
    ),
  ],
);

export const idempotencyRecords = pgTable("idempotency_records", {
  key: text("key").primaryKey(),
  result: jsonb("result").$type<ChargeResult>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
