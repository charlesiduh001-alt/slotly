// Site audit: crawls every internal page on phone and desktop widths and reports
// horizontal overflow, broken links, missing titles/descriptions, small tap
// targets and console errors. Usage: npm run dev, then npm run audit
import { createHmac } from "node:crypto";
import { chromium, type Page } from "playwright-core";

const BASE = process.env.AUDIT_URL ?? "http://localhost:3000";
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

function adminCookie() {
  const secret = process.env.SESSION_SECRET!;
  const payload = `admin.${Date.now() + 60 * 60 * 1000}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return { name: "slotly_admin", value: `${payload}.${sig}`, url: BASE };
}

type Finding = { page: string; issue: string };
const findings: Finding[] = [];
// Group by route (ignoring query strings) so repeated pages report once.
const report = (page: string, issue: string) => {
  const key = page.replace(/\?[^ ]*/, "?…");
  if (!findings.some((f) => f.page === key && f.issue === issue)) findings.push({ page: key, issue });
};

async function auditPage(page: Page, path: string, width: number) {
  const errors: string[] = [];
  page.removeAllListeners("console");
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 120)));
  const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const tag = `${path} @${width}px`;

  if (!res || res.status() >= 400) report(tag, `HTTP ${res?.status()}`);

  const info = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflowing = [...document.querySelectorAll("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (r.width === 0) return false;
        // Ignore content inside intentional horizontal scrollers.
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") return false;
        }
        return r.right > window.innerWidth + 1 || r.left < -1;
      })
      .slice(0, 3)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)}`);
    const small = [...document.querySelectorAll("a, button, input, select, textarea, summary")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        // Skip hidden and visually-hidden (sr-only) elements.
        if (r.width <= 1 || r.height <= 1 || s.visibility === "hidden") return false;
        // Inline text links inside paragraphs are exempt (WCAG 2.5.8).
        if (el.tagName === "A" && s.display === "inline") return false;
        return r.height < 24 || r.width < 24;
      })
      .map((el) => (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 30));
    const smallInputs = [...document.querySelectorAll("input:not([type=hidden]), textarea, select")]
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => el.getAttribute("name") ?? el.tagName);
    return {
      scrollWidth: doc.scrollWidth,
      innerWidth: window.innerWidth,
      overflowing,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      links: [...document.querySelectorAll("a[href]")].map((a) => (a as HTMLAnchorElement).href),
      small,
      smallInputs,
      h1: document.querySelectorAll("h1").length,
      imgsNoAlt: [...document.querySelectorAll("img:not([alt])")].length,
    };
  });

  if (info.scrollWidth > info.innerWidth) report(tag, `horizontal scroll: ${info.scrollWidth} > ${info.innerWidth} (${info.overflowing.join(", ")})`);
  if (!info.title) report(tag, "missing <title>");
  if (!info.description) report(tag, "missing meta description");
  if (info.h1 !== 1) report(tag, `${info.h1} <h1> elements`);
  if (info.imgsNoAlt) report(tag, `${info.imgsNoAlt} images without alt`);
  if (width < 500 && info.small.length) report(tag, `small tap targets: ${[...new Set(info.small)].join(" | ")}`);
  if (width < 500 && info.smallInputs.length) report(tag, `inputs <16px font (iOS zooms on focus): ${info.smallInputs.join(", ")}`);
  for (const e of errors) report(tag, `console error: ${e}`);

  return { title: info.title, description: info.description, links: info.links };
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_PATH ?? EDGE });
  const seen = new Map<string, { title: string; description: string }>();
  const allLinks = new Set<string>();

  for (const width of [375, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 800 } });
    await ctx.addCookies([adminCookie()]);
    const page = await ctx.newPage();
    const queue = ["/", "/admin", "/admin/services", "/does-not-exist"];
    const visited = new Set<string>();
    while (queue.length) {
      const path = queue.shift()!;
      if (visited.has(path) || visited.size > 40) continue;
      visited.add(path);
      const { title, description, links } = await auditPage(page, path, width);
      seen.set(path, { title, description });
      for (const href of links) {
        allLinks.add(href);
        const u = new URL(href);
        if (u.origin !== new URL(BASE).origin) continue;
        const p = u.pathname + u.search;
        // Don't follow mutating or file links; sample the booking flow.
        if (p.includes("/calendar") || p.startsWith("/admin/login")) continue;
        if (/\/book\?service=\d+&date=/.test(p) && [...visited].filter((v) => v.includes("&date=")).length > 2) continue;
        if (/\/book\/details/.test(p) && [...visited].some((v) => v.includes("/book/details"))) continue;
        if (p.startsWith("/admin?date=") && [...visited].some((v) => v.startsWith("/admin?date="))) continue;
        if (!visited.has(p)) queue.push(p);
      }
    }
    await ctx.close();
  }

  // Check every link found actually resolves.
  const ctx = await browser.newContext();
  await ctx.addCookies([adminCookie()]);
  for (const href of allLinks) {
    if (href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    const u = new URL(href);
    if (u.pathname === "/does-not-exist") continue;
    try {
      const r = await ctx.request.get(href.split("#")[0], { maxRedirects: 5, timeout: 20000 });
      if (r.status() >= 400) report(href, `broken link: HTTP ${r.status()}`);
    } catch (e) {
      report(href, `broken link: ${(e as Error).message.slice(0, 80)}`);
    }
  }

  await browser.close();

  console.log("\nPAGES");
  for (const [p, m] of seen) console.log(`  ${p}\n    title: ${m.title}\n    desc:  ${m.description.slice(0, 90)}`);
  console.log(`\nLINKS CHECKED: ${allLinks.size}`);
  console.log(`\nFINDINGS (${findings.length})`);
  for (const f of findings) console.log(`  - ${f.page}: ${f.issue}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
