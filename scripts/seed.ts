// Seeds demo services and opening hours. Run with: npm run db:seed
// Add --with-bookings to also create sample bookings for the next open day.
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { bookings, businessHours, services } from "../src/db/schema";
import { addDays, dayOfWeek, nowInBusinessTz } from "../src/lib/time";

const db = drizzle(
  createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  }),
);

const demoServices = [
  { name: "Silk Press", description: "Wash, deep condition and a sleek, bouncy silk press finish.", durationMin: 90, priceKobo: 25_000_00 },
  { name: "Knotless Braids (Medium)", description: "Lightweight, tension-free knotless braids, mid-back length.", durationMin: 240, priceKobo: 45_000_00 },
  { name: "Wash & Blow-dry", description: "Gentle cleanse, treatment and a smooth blow-dry.", durationMin: 60, priceKobo: 12_000_00 },
  { name: "Men's Cut & Line-up", description: "Precision clipper cut, beard shape-up and hot towel finish.", durationMin: 45, priceKobo: 8_000_00 },
  { name: "Gel Manicure", description: "Cuticle care, shaping and long-lasting gel polish.", durationMin: 60, priceKobo: 10_000_00 },
  { name: "Consultation", description: "15-minute chat to plan your look and get a quote.", durationMin: 15, priceKobo: 0 },
];

// Sunday closed, Mon–Fri 9am–6pm, Saturday 10am–4pm.
const hours = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  dayOfWeek: day,
  openMin: day === 6 ? 10 * 60 : 9 * 60,
  closeMin: day === 6 ? 16 * 60 : 18 * 60,
  closed: day === 0,
}));

async function main() {
  await db.delete(bookings);
  await db.delete(services);
  await db.delete(businessHours);
  const inserted = await db.insert(services).values(demoServices).returning();
  await db.insert(businessHours).values(hours);
  console.log(`Seeded ${inserted.length} services and weekly opening hours.`);

  if (process.argv.includes("--with-bookings")) {
    const count = await seedBookings(inserted);
    console.log(`Added ${count} sample bookings.`);
  }
}

async function seedBookings(svc: { id: number; durationMin: number }[]) {
  let date = addDays(nowInBusinessTz().date, 1);
  while (hours[dayOfWeek(date)].closed) date = addDays(date, 1);

  // [service index, start hour, start minute, name, status]
  const sample = [
    [3, 9, 0, "Tunde Bakare", "confirmed"],
    [0, 10, 0, "Amaka Obi", "confirmed"],
    [4, 11, 30, "Zainab Yusuf", "cancelled"],
    [1, 12, 0, "Chioma Eze", "confirmed"],
    [5, 16, 30, "David Okon", "confirmed"],
  ] as const;

  await db.insert(bookings).values(
    sample.map(([i, h, m, name, status], n) => {
      const startMin = h * 60 + m;
      return {
        reference: `SL-DEMO${n + 1}${"ABCDE"[n]}`,
        serviceId: svc[i].id,
        customerName: name,
        customerEmail: `${name.split(" ")[0].toLowerCase()}@example.com`,
        customerPhone: `+234 80${n} 555 01${n}${n}`,
        notes: n === 1 ? "First time, shoulder-length natural hair" : null,
        date,
        startMin,
        endMin: startMin + svc[i].durationMin,
        status,
      };
    }),
  );
  return sample.length;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
