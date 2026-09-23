// Feedback messages shown after a server action redirects with ?notice=key.
// Shared by server pages (to validate the key) and the client <Notice>.
export const NOTICES = {
  cancelled: ["success", "Booking cancelled. The time slot is free again."],
  restored: ["success", "Booking restored."],
  "restore-conflict": ["error", "Couldn't restore: that time has since been booked by someone else."],
  "service-hidden": ["success", "Service hidden. Customers can no longer book it."],
  "service-shown": ["success", "Service is visible and bookable again."],
  "logged-out": ["success", "You've been logged out."],
  "not-found": ["error", "We couldn't find a booking with that reference. Check it and try again."],
} as const;

export type NoticeKey = keyof typeof NOTICES;

export function isNoticeKey(value: unknown): value is NoticeKey {
  return typeof value === "string" && Object.hasOwn(NOTICES, value);
}
