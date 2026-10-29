// The versions the Compare page lines up (no change, Path A, the twelve Path B versions), the
// measures it compares them on, and the small text helpers its sections share. Every number comes
// from evaluate() in the model; nothing here is new arithmetic.

import { PAIRS } from "../../data/district-scenarios.js";
import { SCHOOLS, TOWNS } from "../../data/schools.js";
import { PLAN_A, PLAN_TODAY, closedSchools, encodePlan, evaluate, pathB, receivingOptions, receivingSchool } from "../model/index.js";
import { h, listJoin, num, store } from "./dom.js";
import { schoolShort } from "./kit.js";

export const SETUPS = [4, 6];

export const pairId = (pair) => [...pair].sort().join("+");
export const pairLabel = (pair) => pair.map(schoolShort).join(" + ");
export const townName = (id) => TOWNS.find((t) => t.id === id)?.name ?? id;
export const setupLabel = (top) => (top === 4 ? "Grades 5-6 at Crossett Brook" : "Grades 5-6 stay in the valley");
// Brookside is the one receiving school outside the valley, so it always carries its town.
export const placeName = (id) => (id === "BPS" ? "Brookside in Waterbury" : schoolShort(id));

// "Grades 5-6 at Crossett Brook" -> "grades 5-6 at Crossett Brook" (proper nouns keep their capitals)
export const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

// $29.0M, $8.9M: one decimal so a column of millions lines up.
export const millions = (n) => (n ? `$${(n / 1e6).toFixed(1)}M` : "$0");

// For each valley school a plan closes: its town, the nearest open school its children go to (the
// rule the district used for its capacity tables, deck slides 27-32), and the other open schools a
// family there could be placed in, depending on home address.
export function closures(plan) {
  return closedSchools(plan).map((id) => {
    const town = SCHOOLS[id].town;
    const to = receivingSchool(plan, town);
    return { id, town, to, others: receivingOptions(plan, town).filter((s) => s !== to) };
  });
}

// Closed towns grouped by where their children go: [{ to: "FES", towns: ["Waitsfield", "Warren"] }].
export function closureGroups(plan) {
  const by = new Map();
  for (const c of closures(plan)) by.set(c.to, [...(by.get(c.to) ?? []), townName(c.town)]);
  return [...by].map(([to, towns]) => ({ to, towns }));
}

// "Waitsfield and Warren children go to Fayston." / "Moretown children go to Brookside in Waterbury;
// Waitsfield children go to Fayston."
export function goesText(plan) {
  const groups = closureGroups(plan);
  if (!groups.length) return "";
  return `${groups.map((g) => `${listJoin(g.towns)} children go to ${placeName(g.to)}`).join("; ")}.`;
}

// The wastewater reading the page shows: "slides" (students against the slides' limits) or "permits"
// (each state permit's wording, staff counted where the permit counts them).
let READING = "slides";
export const setReading = (r) => {
  READING = r === "permits" ? "permits" : "slides";
};
export const getReading = () => READING;

const version = (v) => ({ ...v, r: evaluate(v.plan, { reading: READING }) });

export function pathBVersion(pair, top, plan = pathB(pair, top)) {
  return version({ id: `${pairId(pair)}:${top}`, kind: "B", pair, top, name: pairLabel(pair), sub: setupLabel(top), plan });
}

export function versionList() {
  return [
    version({ id: "today", kind: "today", name: "No change", sub: "For reference: spends over the state's per-pupil limit", plan: PLAN_TODAY }),
    // Path B's line names the schools that close; Path A's names what it cuts (deck slide 13, as on the Overview)
    version({
      id: "A",
      kind: "A",
      name: "Path A",
      sub: "Keep all 7 buildings; cut bus routes, district Pre-K classes, intervention teachers and aides, 70% of athletics and activities, and more",
      plan: PLAN_A,
    }),
    ...PAIRS.flatMap((pair) => SETUPS.map((top) => pathBVersion(pair, top))),
  ];
}

// A version's name with its grade 5-6 setup, for sentences that list versions:
// "Moretown + Waitsfield (grades 5-6 at Crossett Brook)".
export const nameWithSetup = (v) => `${v.name} (${lowerFirst(v.sub)})`;

// Scroll to a part of the page and move focus there too, so keyboard and screen reader users land in the
// same place. (A #fragment link would be read by the hash router as a route.)
export function jumpTo(target, focus = target?.querySelector("h2, h3") ?? target) {
  if (!target) return;
  target.scrollIntoView({ block: "start" });
  if (!focus) return;
  if (!focus.matches("a[href], button, input, select, textarea, summary, [tabindex]")) focus.setAttribute("tabindex", "-1");
  focus.focus({ preventScroll: true });
}

// A version's name for screen readers and link labels.
export function fullName(v) {
  if (v.kind === "B") return `Path B with ${v.name} open, ${lowerFirst(v.sub)}`;
  return v.name;
}

// The measures the main table sorts by. `value` is what sorts; the words describe each direction.
export const MEASURES = [
  { key: "savings", label: "Saves each year", value: (v) => v.r.budget.savings, low: "least first", high: "most first" },
  { key: "buildings", label: "Buildings in use", value: (v) => v.r.buildingsOpen, low: "fewest first", high: "most first" },
  {
    key: "fits",
    label: "Fits the buildings",
    // The district's measure only: schools over a wastewater or occupancy limit. Ties keep the
    // district's order; our classroom estimate never decides the order.
    value: (v) => v.r.capacity.overPeople.length,
    low: "fewest over a limit first",
    high: "most over a limit first",
  },
  { key: "moved", label: "Changing schools next fall", value: (v) => v.r.moved.k12, low: "fewest first", high: "most first" },
  { key: "schools", label: "Most schools for any child", value: (v) => v.r.maxYoung.all, low: "fewest first", high: "most first" },
  { key: "five", label: "Students at 5 or more schools", value: (v) => v.r.fivePlus.total, low: "fewest first", high: "most first" },
  { key: "repairs", label: "Deferred repairs in elementary buildings kept open", value: (v) => v.r.deferredKept, low: "least first", high: "most first" },
];

// Towns where a child now in Pre-K to grade 2 would attend the most schools.
export function maxTowns(r) {
  const max = r.maxYoung.all;
  return TOWNS.filter((t) => r.maxYoung[t.id] === max).map((t) => t.name);
}

export function maxTownsText(r) {
  const towns = maxTowns(r);
  if (towns.length === TOWNS.length) return r.maxYoung.all === 3 ? "Every town, as today" : "Every town";
  return listJoin(towns);
}

export function fiveByTownText(r) {
  return TOWNS.filter((t) => r.fivePlus.byTown[t.id])
    .map((t) => `${t.name} ${num(r.fivePlus.byTown[t.id])}`)
    .join(", ");
}

// ---- links to the other pages ----

// "Your child under this version": the journey page with this pairing and setup, keeping the
// children the viewer already described there.
export function childHref(v) {
  const q = new URLSearchParams();
  const kids = store.get("kids");
  if (typeof kids === "string" && kids) q.set("c", kids);
  if (v.kind === "B") {
    q.set("pair", pairId(v.pair));
    q.set("top", String(v.top));
  }
  const s = q.toString();
  return `#/your-child${s ? `?${s}` : ""}`;
}

export const buildHref = (plan) => `#/build?${encodePlan(plan)}${READING === "permits" ? "&w=permits" : ""}`;

// Accessible names start with the visible words, so voice control ("click Open in Build a plan")
// and screen readers agree: "Open in Build a plan: the middle school merger on its own".
export const BUILD_TEXT = "Open in Build a plan";
export const CHILD_TEXT = "Your child's path";

export function buildLink(plan, what, cls = "wonk-btn") {
  return h("a", { class: cls, href: buildHref(plan), "aria-label": `${BUILD_TEXT}: ${what}` }, BUILD_TEXT);
}
