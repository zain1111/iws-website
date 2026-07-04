import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "src", "assets", "portfolio");
mkdirSync(OUT, { recursive: true });

const SITES = [
  ["ricekids", "https://ricekids.org/"],
  ["bionicvo", "https://staging-app.bionicvo.us/"],
  ["humanistai", "https://thehumanistai.com/"],
  ["garberbros", "https://garberbrosinc.com/"],
  ["amotrial", "https://rsslawoffice.com/"],
  ["yachtlens", "https://yachtlens.com/"],
  ["lifescivoice", "https://lifescivoice.com/"],
  ["healthcarechief", "https://healthcarechief.com/"],
  ["amaterasu", "https://amaterasu.ai/"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
});

for (const [slug, url] of SITES) {
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3500);
    await page.screenshot({
      path: join(OUT, `${slug}.jpg`),
      type: "jpeg",
      quality: 78,
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    console.log("OK   ", slug);
  } catch (e) {
    console.log("FAIL ", slug, "-", e.message.split("\n")[0]);
    try {
      await page.screenshot({
        path: join(OUT, `${slug}.jpg`),
        type: "jpeg",
        quality: 78,
        clip: { x: 0, y: 0, width: 1440, height: 900 },
      });
      console.log("PARTIAL", slug);
    } catch {}
  } finally {
    await page.close();
  }
}

await browser.close();
console.log("DONE");
