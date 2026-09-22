import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  durationMin: integer("duration_min").notNull(),
  // Stored in kobo (1 NGN = 100 kobo) to avoid floating-point money bugs.
  priceKobo: integer("price_kobo").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

// One row per weekday (0 = Sunday). Times are minutes after midnight in the
// business's local timezone.
export const businessHours = sqliteTable("business_hours", {
  dayOfWeek: integer("day_of_week").primaryKey(),
  openMin: integer("open_min").notNull(),
  closeMin: integer("close_min").notNull(),
  closed: integer("closed", { mode: "boolean" }).notNull().default(false),
});

export const bookings = sqliteTable(
  "bookings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    reference: text("reference").notNull().unique(),
    serviceId: integer("service_id")
      .notNull()
      .references(() => services.id),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    notes: text("notes"),
    // Local business date (YYYY-MM-DD) plus start/end in minutes after midnight.
    date: text("date").notNull(),
    startMin: integer("start_min").notNull(),
    endMin: integer("end_min").notNull(),
    status: text("status", { enum: ["confirmed", "cancelled"] })
      .notNull()
      .default("confirmed"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (t) => [index("bookings_date_idx").on(t.date, t.status)],
);

export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type BusinessHours = typeof businessHours.$inferSelect;
