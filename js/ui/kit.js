// Shared pieces every page uses: source citations, number provenance tags, stat tiles, folds.

import { SOURCES } from "../../data/sources.js";
import { SCHOOLS } from "../../data/schools.js";
import { h } from "./dom.js";

// Where a number came from. Every figure on the site is one of these three.
export const KINDS = {
  district: { label: "District figure", tip: "Printed in the district's documents. Shown as published." },
  derived: { label: "Calculated", tip: "Arithmetic on the district's own numbers. The method page shows the formula." },
  estimate: { label: "Estimate", tip: "Our estimate where the district has not published a number. The assumption is stated next to it." },
};

export function tag(kind) {
  const k = KINDS[kind] ?? KINDS.derived;
  return h("span", { class: `prov prov--${kind}`, "data-tip": k.tip, tabindex: "0" }, k.label);
}

// An inline citation: "Slide 21" that links to the source and explains it on hover.
export function cite(ref, label) {
  if (!ref) return null;
  const s = SOURCES[ref.id];
  if (!s) return null;
  const text = label ?? shortLoc(ref);
  const tip = `${s.title}${ref.loc ? `, ${ref.loc}` : ""}. ${s.by}, ${s.date}.`;
  const external = /^https?:/.test(s.url);
  return h(
    "a",
    {
      class: "cite",
      href: s.url,
      target: external ? "_blank" : null,
      rel: external ? "noopener" : null,
      "data-tip": tip,
      // Starts with the visible text, so voice control ("click Oct 28 meeting") finds the link (WCAG 2.5.3).
      "aria-label": `${text}. Source: ${tip}`,
    },
    text
  );
}

// Several citations with break opportunities between them.
export function cites(refs) {
  const out = [];
  refs.filter(Boolean).forEach((r, i) => {
    if (i) out.push(" ");
    out.push(cite(r));
  });
  return out;
}

const SHORT_LABEL = {
  oct14: "Oct 14 deck",
  meeting1028: "Oct 28 meeting",
  enroll: "Oct 1 report",
  supt: "Supt. report",
  aoa: "Articles",
  aoaDeck: "Articles deck",
  minutes1014: "Oct 14 minutes",
  agenda: "Agenda",
  boardPage: "huusd.org",
  act169: "Act 169",
  act170: "Act 170",
  vsa4001: "State law",
  vsa5401: "State law",
  vsa165: "State law",
  aoeFact: "AOE",
  aoeTransform: "AOE",
  taxFaq: "Tax Dept.",
  jfo: "JFO data",
  rfp: "District RFP",
  qdoc: "Board Q&A",
  busRoutes: "Bus routes",
  nces: "NCES",
  osrm: "OSRM",
  census2020: "Census",
  derived: "Method",
  permitWES: "Waitsfield permit 1991",
  permitWES1990: "Waitsfield permit 1990",
  permitWES1996: "Waitsfield 1996 letter",
  permitFES: "Fayston permit",
  permitWRN: "Warren permit",
  permitMES: "Moretown permit",
  truexCap: "Consultant capacities",
  truexReport: "Consultant report",
  truexUpdate: "Consultant update",
  wwRules: "State rules",
};

function shortLoc(ref) {
  if (ref.id === "deck" && ref.loc && /^slides? \d/.test(ref.loc)) return ref.loc.replace(/^s/, "S").replace(/ \(.*\)$/, "");
  return SHORT_LABEL[ref.id] ?? (SOURCES[ref.id].kind === "state" ? "State law" : "Source");
}

export const schoolShort = (id) =>
  id === "PRIVATE" ? "Private Pre-K" : id === "OTHER" ? "Other Pre-K" : SCHOOLS[id]?.short ?? "—";
export const schoolName = (id) =>
  id === "PRIVATE" ? "A private Pre-K program (public tuition)" : id === "OTHER" ? "Another Pre-K program" : SCHOOLS[id]?.name ?? "—";

export function stat({ label, value, sub, kind, tip, cls }) {
  return h(
    "div",
    { class: `wonk-stat stat ${cls ?? ""}` },
    h("span", { class: "wonk-label", "data-tip": tip ?? null }, label),
    h("span", { class: "wonk-num" }, value),
    sub ? h("small", { class: "stat-sub" }, sub) : null,
    kind ? tag(kind) : null
  );
}

export function fold(summary, ...body) {
  return h("details", { class: "wonk-fold" }, h("summary", {}, summary), h("div", { class: "body" }, ...body));
}

export function note(kind, ...children) {
  const ico = { info: "i", warn: "!", err: "×", ok: "✓" }[kind] ?? "i";
  return h("div", { class: `wonk-alert wonk-alert--${kind}`, role: kind === "err" ? "alert" : null }, h("span", { class: "ico", "aria-hidden": "true" }, ico), h("div", {}, ...children));
}

export function pageHead({ kicker, title, lede }) {
  return h(
    "header",
    { class: "page-head" },
    kicker ? h("p", { class: "wonk-label kicker" }, kicker) : null,
    h("h1", { id: "page-title", tabindex: "-1" }, title),
    lede ? h("p", { class: "lede" }, lede) : null
  );
}

export function section({ id, title, intro }, ...children) {
  const hid = id ? `${id}-title` : null;
  return h(
    "section",
    { class: "wonk-section", id, "aria-labelledby": hid },
    h("h2", { id: hid }, title),
    intro ? h("p", { class: "section-intro" }, intro) : null,
    ...children
  );
}

export function term(key, text) {
  return h("span", { class: "wonk-term", "data-term": key }, text);
}

// Status words always carry a symbol, never color alone.
export function status(ok, okText, badText) {
  return h("span", { class: `status ${ok ? "status--ok" : "status--bad"}` }, h("span", { "aria-hidden": "true" }, ok ? "✓ " : "✕ "), ok ? okText : badText);
}
