// Loads every page in headless Chromium, fails on any console error or uncaught exception,
// checks each page has one h1 and no horizontal overflow, and optionally saves screenshots.
// Then runs a few things a reader does on a phone: opening the child forms, the menu, and section links.
//   node scripts/browser-check.mjs [--shots <dir>] [--only route,route] [--axe-mobile]
// --only also takes the step names below (phone-widths, drawer, at-links); a step also runs when its page does.
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
  ["build-k6-portables", "#/build?o=FR&t=6&m=1&p=FES2.BPS1"],
  ["build-close-one", "#/build?o=MWR&t=6&m=1"],
  ["build-hybrid", "#/build?o=FMWR&t=6&m=1&c=special.prek.athletics"],
  ["build-grade5", "#/build?o=MWR&t=5&m=1&c=prek"],
  ["build-prek-center", "#/build?o=WR&t=6&m=1&k=MES.all&sp=fayston~WRN~33.moretown~BPS~33"],
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

function watchErrors(page) {
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}

for (const [vpName, viewport] of VIEWPORTS) {
  const page = await browser.newPage({ viewport });
  const errors = watchErrors(page);
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

// ---- interaction steps, on a phone ----
// Each step gets a fresh 390px page and returns a list of problems.

async function open(page, hash) {
  await page.goto(`${base}${hash}`);
  await page.waitForSelector('#view[aria-busy="false"]', { timeout: 15000 });
  await page.waitForTimeout(300);
}

const sideways = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// The child forms, the top bar, and long source links must not widen the page on a phone, down to 320px.
async function phoneWidths(page) {
  const problems = [];
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await open(page, "#/your-child?c=waitsfield.0.WES~waitsfield.2.WES");
    await page.getByRole("button", { name: "Change", exact: true }).first().click();
    await page.getByRole("button", { name: "Add another child" }).click();
    await page.waitForTimeout(200);
    let over = await sideways(page);
    if (over > 1) problems.push(`at ${width}px, opening Change and Add another child on Your child's path scrolls the page sideways by ${over}px`);
    for (const [label, hash] of [["Start here", "#/"], ["Sources", "#/sources"]]) {
      await open(page, hash);
      over = await sideways(page);
      if (over > 1) problems.push(`at ${width}px, ${label} scrolls sideways by ${over}px`);
    }
    // goto() with only a new hash keeps the document; start the next width fresh
    await page.goto("about:blank");
  }
  return problems;
}

// The menu drawer: focus moves into it, Tab runs through the links to Menu, the page behind is inert,
// and Escape closes it with focus back on Menu.
async function drawer(page) {
  const problems = [];
  await open(page, "#/");
  const BEHIND = ["#main", ".site-foot", ".topbar-title", ".skip-link"];
  const state = () =>
    page.evaluate((behind) => {
      const a = document.activeElement;
      return {
        open: document.getElementById("app-nav").classList.contains("is-open"),
        inNav: Boolean(a?.closest("#app-nav")),
        onMenu: Boolean(a?.matches("[data-wonk-drawer]")),
        focused: a ? `${a.localName}${a.id ? `#${a.id}` : ""} "${a.textContent.trim().slice(0, 30)}"` : "nothing",
        inert: behind.filter((sel) => document.querySelector(sel)?.inert),
      };
    }, BEHIND);

  await page.locator("[data-wonk-drawer]").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(450); // the slide-in
  let s = await state();
  if (!s.open) return ["Menu did not open the drawer"];
  if (!s.inNav) problems.push(`opening the menu left focus on ${s.focused}`);
  if (s.inert.length !== BEHIND.length) problems.push(`behind the open drawer, these are not inert: ${BEHIND.filter((x) => !s.inert.includes(x)).join(", ")}`);
  const layout = await page.evaluate(() => {
    const menu = document.querySelector("[data-wonk-drawer]").getBoundingClientRect();
    const hit = document.elementFromPoint(menu.x + menu.width / 2, menu.y + menu.height / 2);
    return {
      menuShows: Boolean(hit?.closest("[data-wonk-drawer]")),
      tucked: document.querySelector("#app-nav .brand").getBoundingClientRect().top < document.querySelector(".wonk-topbar").getBoundingClientRect().bottom - 1,
    };
  });
  if (!layout.menuShows) problems.push("the open drawer covers the Menu button");
  if (layout.tucked) problems.push("the top bar hides the top of the open drawer");

  let reached = false;
  for (let i = 0; i < 15 && !reached; i++) {
    await page.keyboard.press("Tab");
    s = await state();
    if (s.onMenu) reached = true;
    else if (!s.inNav) {
      problems.push(`Tab left the open drawer for ${s.focused}`);
      break;
    }
  }
  if (!reached) problems.push("Tab never reached the Menu button");
  await page.keyboard.press("Shift+Tab");
  s = await state();
  if (!s.inNav) problems.push(`Shift+Tab from Menu went to ${s.focused}, not back to the links`);

  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  s = await state();
  if (s.open) problems.push("Escape did not close the drawer");
  if (!s.onMenu) problems.push(`Escape left focus on ${s.focused}, not Menu`);
  if (s.inert.length) problems.push(`still inert after the drawer closed: ${s.inert.join(", ")}`);
  return problems;
}

// ?at= links land on their section, below the sticky top bar, with focus on its heading: from another page,
// when only the query changes, and when the link's address is the one already showing. A plain page change
// starts at the top with focus on the h1.
async function atLinks(page) {
  const problems = [];
  const landed = async (what, headingId) => {
    const ok = await page.waitForFunction((id) => document.activeElement?.id === id, headingId, { timeout: 5000 }).then(() => true, () => false);
    if (!ok) {
      const focused = await page.evaluate(() => document.activeElement?.id || document.activeElement?.localName);
      problems.push(`${what}: focus is on ${focused}, not #${headingId}`);
      return;
    }
    await page.waitForTimeout(150);
    const pos = await page.evaluate(
      (id) => ({ top: document.getElementById(id).getBoundingClientRect().top, bar: document.querySelector(".wonk-topbar").getBoundingClientRect().bottom }),
      headingId
    );
    if (pos.top < pos.bar) problems.push(`${what}: the heading is under the top bar (${Math.round(pos.top)} < ${Math.round(pos.bar)})`);
    else if (pos.top > pos.bar + 80) problems.push(`${what}: the heading is ${Math.round(pos.top - pos.bar)}px below the top bar`);
  };

  await open(page, "#/budget?at=path-a");
  await landed("Opening #/budget?at=path-a", "path-a-title");
  await page.waitForTimeout(1500); // the chart loads late; the section should stay put
  await landed("#/budget?at=path-a after the chart loads", "path-a-title");

  await open(page, "#/findings");
  await page.evaluate(() => (location.hash = "#/findings?at=questions"));
  await landed("Changing only the query to ?at=questions", "questions-title");

  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const a = Object.assign(document.createElement("a"), { href: location.hash, id: "same-hash-test", textContent: "Questions" });
    document.getElementById("view").prepend(a);
  });
  await page.click("#same-hash-test");
  await landed("A link to the address already showing", "questions-title");

  // start well down the page, and read the scroll position in the frame focus lands, so a smooth scroll
  // still under way counts as a miss
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 4000);
    document.documentElement.style.scrollBehavior = "";
    location.hash = "#/schools";
  });
  const y = await page
    .waitForFunction(() => (document.activeElement?.id === "page-title" ? { y: window.scrollY } : false), null, { timeout: 5000 })
    .then((handle) => handle.jsonValue().then((v) => v.y), () => null);
  if (y == null) problems.push("A plain page change did not move focus to the h1");
  else if (y !== 0) problems.push(`A plain page change was ${Math.round(y)}px from the top when focus reached the h1`);
  return problems;
}

const STEPS = [
  ["phone-widths", ["journey", "overview", "sources"], phoneWidths],
  ["drawer", ["overview"], drawer],
  ["at-links", ["budget", "findings"], atLinks],
].filter(([name, pages]) => !only || only.includes(name) || pages.some((p) => only.includes(p)));

for (const [name, , run] of STEPS) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = watchErrors(page);
  let problems;
  try {
    problems = await run(page);
  } catch (err) {
    problems = [String(err).split("\n")[0]];
  }
  problems.push(...errors);
  const ok = problems.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"} ${"mobile".padEnd(7)} ${name}${ok ? "" : `\n  - ${problems.join("\n  - ")}`}`);
  await page.close();
}

await browser.close();
server.close();
process.exit(failed ? 1 : 0);
