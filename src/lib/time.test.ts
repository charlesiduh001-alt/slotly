import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDays,
  dayOfWeek,
  formatMinutes,
  generateSlots,
  isValidDateString,
  nowInBusinessTz,
  overlaps,
  toUtc,
} from "./time.ts";

describe("generateSlots", () => {
  const base = { openMin: 9 * 60, closeMin: 12 * 60, durationMin: 60, booked: [] };

  it("returns every step that fits before closing", () => {
    assert.deepEqual(generateSlots(base), [540, 570, 600, 630, 660]);
  });

  it("never lets a service run past closing time", () => {
    const slots = generateSlots({ ...base, durationMin: 90 });
    assert.equal(Math.max(...slots) + 90 <= base.closeMin, true);
  });

  it("skips slots that clash with an existing booking", () => {
    const slots = generateSlots({ ...base, booked: [{ startMin: 600, endMin: 660 }] });
    assert.deepEqual(slots, [540, 660]);
  });

  it("allows a slot that starts exactly when a booking ends", () => {
    const slots = generateSlots({ ...base, booked: [{ startMin: 540, endMin: 600 }] });
    assert.equal(slots.includes(600), true);
  });

  it("respects the earliest allowed start (same-day lead time)", () => {
    assert.deepEqual(generateSlots({ ...base, earliestMin: 620 }), [630, 660]);
  });

  it("matches the worked example in DESIGN.md", () => {
    const slots = generateSlots({
      openMin: 9 * 60,
      closeMin: 18 * 60,
      durationMin: 90,
      booked: [
        { startMin: 540, endMin: 585 },
        { startMin: 600, endMin: 690 },
        { startMin: 720, endMin: 960 },
      ],
    });
    assert.deepEqual(slots.map(formatMinutes), ["4:00 PM", "4:30 PM"]);
  });

  it("returns nothing when the service is longer than opening hours", () => {
    assert.deepEqual(generateSlots({ ...base, durationMin: 240 }), []);
  });
});

describe("overlaps", () => {
  it("treats touching ranges as not overlapping", () => {
    assert.equal(overlaps({ startMin: 0, endMin: 60 }, { startMin: 60, endMin: 90 }), false);
  });
  it("detects containment", () => {
    assert.equal(overlaps({ startMin: 0, endMin: 120 }, { startMin: 30, endMin: 60 }), true);
  });
});

describe("date helpers", () => {
  it("validates real calendar dates only", () => {
    assert.equal(isValidDateString("2026-02-28"), true);
    assert.equal(isValidDateString("2026-02-30"), false);
    assert.equal(isValidDateString("26-2-1"), false);
  });

  it("adds days across month and year boundaries", () => {
    assert.equal(addDays("2026-12-31", 1), "2027-01-01");
    assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  });

  it("gets the weekday", () => {
    assert.equal(dayOfWeek("2026-09-22"), 2); // Tuesday
  });

  it("formats minutes as 12-hour time", () => {
    assert.equal(formatMinutes(0), "12:00 AM");
    assert.equal(formatMinutes(9 * 60 + 5), "9:05 AM");
    assert.equal(formatMinutes(12 * 60 + 30), "12:30 PM");
    assert.equal(formatMinutes(18 * 60), "6:00 PM");
  });

  it("converts a Lagos wall-clock time to UTC", () => {
    assert.equal(toUtc("2026-09-24", 10 * 60).toISOString(), "2026-09-24T09:00:00.000Z");
    assert.equal(toUtc("2026-12-31", 30).toISOString(), "2026-12-30T23:30:00.000Z");
  });

  it("reads the current time in the business timezone (Lagos is UTC+1)", () => {
    const result = nowInBusinessTz(new Date("2026-09-22T23:30:00Z"));
    assert.deepEqual(result, { date: "2026-09-23", minutes: 30 });
  });
});
