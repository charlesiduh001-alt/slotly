import { toUtc } from "./time";

type CalendarEvent = {
  uid: string;
  title: string;
  description: string;
  location: string;
  date: string;
  startMin: number;
  endMin: number;
};

/** 20260924T090000Z */
function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escape text per RFC 5545 (backslash, comma, semicolon, newline). */
function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export function buildIcs(e: CalendarEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Slotly//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}@slotly`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(toUtc(e.date, e.startMin))}`,
    `DTEND:${stamp(toUtc(e.date, e.endMin))}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    `DESCRIPTION:${escapeIcs(e.description)}`,
    `LOCATION:${escapeIcs(e.location)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(e.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

export function googleCalendarUrl(e: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(toUtc(e.date, e.startMin))}/${stamp(toUtc(e.date, e.endMin))}`,
    details: e.description,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
