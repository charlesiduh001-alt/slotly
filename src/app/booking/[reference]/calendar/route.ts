import type { NextRequest } from "next/server";
import { business } from "@/lib/business";
import { buildIcs } from "@/lib/calendar";
import { getBookingByReference } from "@/lib/queries";

/** Downloadable .ics file so customers can add the appointment to any calendar app. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/booking/[reference]/calendar">) {
  const { reference } = await ctx.params;
  const result = await getBookingByReference(reference);
  if (!result || result.booking.status !== "confirmed") {
    return new Response("Booking not found", { status: 404 });
  }

  const { booking, service } = result;
  const ics = buildIcs({
    uid: booking.reference,
    title: `${service.name} at ${business.name}`,
    description: `Booking reference: ${booking.reference}`,
    location: business.address,
    date: booking.date,
    startMin: booking.startMin,
    endMin: booking.endMin,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${booking.reference}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
