import { chromium } from "playwright-core";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3601";
const ROOT = process.env.ROOT ?? "/home/user/marketing";

const SCREENS = [
  { id: "home", route: "/", label: "Home", state: "done" },
  { id: "categories", route: "/categories", label: "Categories", state: "done" },
  { id: "account", route: "/account", label: "Account", state: "done" },
  { id: "category", route: "/c/food", label: "Food & Shabbos", state: "pending" },
  { id: "org", route: "/org/ezras-shabbos-network", label: "Organization", state: "pending" },
  { id: "giving", route: "/giving-list", label: "Giving list", state: "pending" },
];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

let css = "";
const out = [];

for (const screen of SCREENS) {
  await page.goto(BASE + screen.route, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const { body, sheets } = await page.evaluate(() => {
    const collected = [];
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) collected.push(rule.cssText);
      } catch {
        /* cross-origin sheet, skip */
      }
    }
    return { body: document.body.innerHTML, sheets: collected.join("\n") };
  });

  if (!css) css = sheets;

  // Next's own <script> and preload <link> tags reference /_next/*, which the
  // artifact CSP blocks and which do nothing in a static capture anyway. Strip
  // them so the preview loads without a console full of failed requests.
  const html = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, "");

  out.push({ ...screen, html });
  console.log(`captured ${screen.id} (${(body.length / 1024).toFixed(0)}kb)`);
}

await browser.close();

// Fonts are served from /_next/static/media as same-origin URLs the artifact
// CSP will not allow. Inline each one as a data URI so the page carries its own
// typefaces rather than silently falling back to system sans.
const fontUrls = [...new Set([...css.matchAll(/url\((\/_next\/static\/media\/[^)]+\.woff2?)\)/g)].map((m) => m[1]))];
for (const url of fontUrls) {
  const file = join(ROOT, ".next", url.replace("/_next/", ""));
  try {
    const b64 = readFileSync(file).toString("base64");
    css = css.split(`url(${url})`).join(`url(data:font/woff2;base64,${b64})`);
  } catch {
    console.warn("  missing font", url);
  }
}
console.log(`inlined ${fontUrls.length} fonts, css ${(css.length / 1024).toFixed(0)}kb`);

writeFileSync(join(process.env.OUT, "capture.json"), JSON.stringify({ css, screens: out }));
console.log("wrote capture.json");
