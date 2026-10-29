// The vendored WONK files are copies of the design system, not forks.
import { readFileSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const SKILL = path.join(os.homedir(), "code/ak-web-design/assets");
const LOCAL = path.resolve("wonk");
const FILES = ["wonk-fonts.css", "wonk-tokens.css", "wonk.css", "wonk.js", "wonk-data.css", "wonk-data.js", "wonk-charts.js"];
const PINNED = "0.3.0";

test("vendored WONK files match the design system", { skip: !existsSync(SKILL) && `no checkout at ${SKILL}` }, () => {
  for (const f of FILES) {
    assert.ok(readFileSync(path.join(LOCAL, f)).equals(readFileSync(path.join(SKILL, f))), `${f} differs from ${SKILL}: re-copy it`);
  }
});

test("vendored WONK files carry the pinned version", () => {
  for (const f of FILES) {
    const head = readFileSync(path.join(LOCAL, f), "utf8").split("\n").slice(0, 2).join("\n");
    assert.ok(head.includes(`WONK v${PINNED} `), `${f} is not WONK v${PINNED}`);
  }
});

test("every url() in a vendored stylesheet exists", () => {
  for (const f of FILES.filter((n) => n.endsWith(".css"))) {
    const css = readFileSync(path.join(LOCAL, f), "utf8");
    for (const [, url] of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      if (/^(data:|https?:|#)/.test(url)) continue;
      assert.ok(existsSync(path.join(LOCAL, path.dirname(f), url)), `${f} points at a missing ${url}`);
    }
  }
});

test("index.html links only files that exist", () => {
  const html = readFileSync("index.html", "utf8");
  for (const [, href] of html.matchAll(/(?:href|src)="([^"#:]+)"/g)) {
    if (href.startsWith("data:")) continue;
    assert.ok(existsSync(path.resolve(href)), `index.html links a missing ${href}`);
  }
});
