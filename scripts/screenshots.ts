// Captures README screenshots from a running dev server into docs/screenshots.
// Usage: npm run db:seed -- --with-bookings && npm run dev, then npm run screenshots
import { createHmac } from "node:crypto";
import { mkdirSync } from "node:fs";
import { chromium, type Page } from "playwright-core";
import { addDays, dayOfWeek, nowInBusinessTz } from "../src/lib/time";

const BASE = process.env.SCREENSHOT_URL ?? "http://localhost:3000";
const OUT = "docs/screenshots";
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

// Same format as src/lib/auth.ts, so the admin pages can be captured
// without typing a password.
function adminCookie() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET missing (run with --env-file=.env.local)");
  const payload = `admin.${Date.now() + 60 * 60 * 1000}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return { name: "slotly_admin", value: `${payload}.${sig}`, url: BASE };
}

function nextOpenDay(): string {
  let date = addDays(nowInBusinessTz().date, 1);
  while (dayOfWeek(date) === 0) date = addDays(date, 1);
  return date;
}

async function shot(page: Page, name: string, clipHeight?: number) {
  await page.waitForLoadState("networkidle");
  // Hide the Next.js dev-tools badge.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  const clip = clipHeight ? { x: 0, y: 0, width: page.viewportSize()!.width, height: clipHeight } : undefined;
  await page.screenshot({ path: `${OUT}/${name}.png`, clip });
  console.log(`  ✓ ${name}.png`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH ?? EDGE });
  const date = nextOpenDay();

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
  const page = await desktop.newPage();

  await page.goto(BASE);
  await shot(page, "home", 720);

  await page.goto(`${BASE}/book`);
  await page.getByRole("link", { name: /Silk Press/ }).click();
  await page.waitForURL(/service=/);
  await page.goto(`${page.url().split("&")[0]}&date=${addDays(date, 1)}`);
  await shot(page, "choose-time");

  await page.getByRole("link", { name: "2:00 PM", exact: true }).click();
  await page.waitForURL(/details/);
  await page.getByLabel("Full name").fill("Adaeze Nwosu");
  await page.getByLabel("Email").fill("adaeze@example.com");
  await page.getByLabel("Phone").fill("+234 803 555 0123");
  await page.getByLabel("Notes (optional)").fill("Please use heat protectant, thanks!");
  await shot(page, "details");

  await page.goto(`${BASE}/booking/SL-DEMO2B?new=1`);
  await shot(page, "confirmation");

  await desktop.addCookies([adminCookie()]);
  await page.goto(`${BASE}/admin?date=${date}`);
  await shot(page, "admin-dashboard");

  await page.goto(`${BASE}/admin/services`);
  await shot(page, "admin-services");

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const phone = await mobile.newPage();
  await phone.goto(BASE);
  await shot(phone, "mobile-home");
  await phone.goto(`${BASE}/book`);
  await phone.getByRole("link", { name: /Knotless Braids/ }).click();
  await phone.waitForURL(/service=/);
  await shot(phone, "mobile-booking");

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
