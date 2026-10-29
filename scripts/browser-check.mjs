// Loads every page in headless Chromium, fails on any console error or uncaught exception,
// checks each page has one h1 and no horizontal overflow, and optionally saves screenshots.
//   node scripts/browser-check.mjs [--shots <dir>] [--only route,route]
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { startServer } from "./serve.mjs";

const require = createRequire(import.meta.url);
const AXE = require.resolve("axe-core/axe.min.js");

const args = process.argv.slice(2);
const shots = args.includes("--shots") ? args[args.indexOf("--shots") + 1] : null;
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : null;

const ROUTES = [
  ["overview", "#/"],
  ["journey", "#/your-child?c=waitsfield.0.WES~waitsfield.2.WES"],
  ["compare", "#/compare"],
  ["options", "#/options"],
  ["build", "#/build"],
  ["budget", "#/budget"],
  ["schools", "#/schools"],
  ["findings", "#/findings"],
  ["sources", "#/sources"],
  // the other readings and settings each page offers
  ["compare-permits", "#/compare?w=permits&sort=fits"],
  ["options-permits", "#/options?w=permits&x=1"],
  ["build-permits", "#/build?w=permits&x=1"],
  ["journey-roadmap", "#/your-child?c=fayston.0.FES~warren.1.WRN&pair=MES+WES&rt=6"],
].filter(([name]) => !only || only.includes(name));

const VIEWPORTS = [
  ["desktop", { width: 1280, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];

const server = await startServer(0);
const base = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await chromium.launch();
let failed = 0;
if (shots) fs.mkdirSync(shots, { recursive: true });

for (const [vpName, viewport] of VIEWPORTS) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const [name, hash] of ROUTES) {
    errors.length = 0;
    await page.goto(`${base}${hash}`);
    await page.waitForSelector('#view[aria-busy="false"]', { timeout: 15000 }).catch(() => errors.push("view never finished rendering"));
    await page.waitForTimeout(400);
    const h1s = await page.locator("#view h1").count();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const problems = [...errors];
    if (h1s !== 1) problems.push(`expected one h1, found ${h1s}`);
    if (overflow > 1) problems.push(`page scrolls sideways by ${overflow}px`);
    if (vpName === "desktop" || args.includes("--axe-mobile")) {
      await page.addScriptTag({ path: AXE });
      const axe = await page.evaluate(async () => {
        const r = await window.axe.run(document.querySelector("#view"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } });
        return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, target: v.nodes[0]?.target?.join(" ") }));
      });
      for (const v of axe) {
        const line = `a11y ${v.impact}: ${v.id} (${v.n}) ${v.help} e.g. ${v.target}`;
        if (v.impact === "serious" || v.impact === "critical") problems.push(line);
        else console.log(`  note ${name}: ${line}`);
      }
    }
    const ok = problems.length === 0;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"} ${vpName.padEnd(7)} ${name}${ok ? "" : `\n  - ${problems.join("\n  - ")}`}`);
    if (shots) await page.screenshot({ path: path.join(shots, `${name}-${vpName}.png`), fullPage: true });
  }
  await page.close();
}

await browser.close();
server.close();
process.exit(failed ? 1 : 0);
