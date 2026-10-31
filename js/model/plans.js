// A plan describes the district's schools from fall 2027 (FY28) on.
//   open        valley elementary buildings that stay open (subset of FES, MES, WES, WRN)
//   valleyTop   highest grade in the valley elementary schools: 6 (K-6, today) or 4 (PK-4; grades 5-6 go to Crossett Brook)
//   msMerge     Crossett Brook's grades 7-8 move to Harwood Union Middle School; Crossett Brook keeps 5-6
//   bpsTop      highest grade Brookside teaches: 4 (today) or 6 (Crossett Brook's 5th and 6th graders move there,
//               leaving Crossett Brook with no classes); 6 only with the merger and K-6 valley schools
//   cuts        Path A reductions applied (ids from PATH_A_CUTS)
//   septicWES   use 300 for Waitsfield (its 1991 permit) instead of the slides' 230
//   portables   two-classroom portable units added, by school id
//   receiving   for a town whose school closes, the school its children go to (overrides the nearest-school default)
//   roadmap     the district's draft roadmap (Oct 14, 2026): from fall `fall`, every valley elementary student
//               attends one new central valley school for grades Pre-K to `top`; grades above `top` go to Crossett Brook

import { PAIRS } from "../../data/district-scenarios.js";
import { PATH_A_CUTS } from "../../data/budget.js";
import { SCHOOLS, VALLEY } from "../../data/schools.js";

export const CURRENT_YEAR = 2026; // fall of this school year (2026-27, FY27)
export const START_YEAR = 2027; // fall the plan takes effect (2027-28, FY28)

export const schoolYear = (fall) => `${fall}-${String((fall + 1) % 100).padStart(2, "0")}`;

const CUT_IDS = PATH_A_CUTS.items.map((c) => c.id);


export function makePlan(p = {}) {
  const open = VALLEY.filter((id) => (p.open ?? VALLEY).includes(id));
  const cuts = CUT_IDS.filter((id) => (p.cuts ?? []).includes(id));
  const center = p.prekCenter?.school;
  const valleyTop = [4, 5, 6].includes(Number(p.valleyTop)) ? Number(p.valleyTop) : 6;
  return {
    id: p.id ?? "custom",
    name: p.name ?? "Your plan",
    short: p.short ?? p.name ?? "Your plan",
    kind: p.kind ?? "custom",
    open,
    // the highest grade valley schools teach: 6 as today, 5 (6th graders to Crossett Brook), or 4 (5th and 6th)
    valleyTop,
    msMerge: Boolean(p.msMerge),
    // with the merger Crossett Brook keeps only grades 5-6; Brookside can take them so the building empties
    bpsTop: Number(p.bpsTop) === 6 && p.msMerge && valleyTop === 6 ? 6 : 4,
    cuts,
    septicWES: Boolean(p.septicWES),
    portables: Object.fromEntries(
      Object.entries(p.portables ?? {}).filter(([id, n]) => SCHOOLS[id] && n > 0).map(([id, n]) => [id, Math.min(6, Math.round(n))])
    ),
    // valley towns and real school ids only: a link like r=constructor~FES would otherwise reach lookups
    // by town or school id, where inherited names such as "constructor" and "toString" resolve
    receiving: Object.fromEntries(
      Object.entries(p.receiving ?? {}).filter(
        ([town, id]) => VALLEY.some((v) => SCHOOLS[v].town === town) && Object.prototype.hasOwnProperty.call(SCHOOLS, id)
      )
    ),
    roadmap: p.roadmap ? { fall: Number(p.roadmap.fall) || ROADMAP_FALL, top: [4, 5, 6].includes(Number(p.roadmap.top)) ? Number(p.roadmap.top) : 4 } : null,
    // A closed valley building kept open for Pre-K only, for valley families or for the whole district.
    // Not with the Pre-K tuition cut, which ends district Pre-K classes.
    prekCenter:
      center && VALLEY.includes(center) && !open.includes(center) && !cuts.includes("prek")
        ? { school: center, scope: p.prekCenter.scope === "all" ? "all" : "valley" }
        : null,
    // Part of a closed town's K-6 children going to other schools (families closer to them):
    // { town: { school: share } }, shares in whole percents adding to at most 1; the rest go to the town's
    // receiving school. {} sends them all there, instead of the district's shares (placement.js).
    split: normSplit(p.split, open),
  };
}

// Split shares in a fixed order, so equal plans encode the same. Accepts the older { school, share } form.
const SPLIT_SCHOOLS = ["BPS", ...VALLEY];
function normSplit(split, open) {
  const out = {};
  for (const id of VALLEY) {
    const town = SCHOOLS[id].town;
    const v = split && Object.prototype.hasOwnProperty.call(split, town) ? split[town] : null;
    if (!v || typeof v !== "object" || open.includes(id)) continue;
    const given = typeof v.school === "string" ? { [v.school]: v.share } : v;
    let left = 100;
    const shares = {};
    for (const s of SPLIT_SCHOOLS) {
      if (!Object.prototype.hasOwnProperty.call(given, s) || s === id || (s !== "BPS" && !open.includes(s))) continue;
      const pct = Math.min(left, Math.max(0, Math.round(Number(given[s]) * 100) || 0));
      if (pct > 0) shares[s] = pct / 100;
      left -= pct;
    }
    out[town] = shares;
  }
  return out;
}

// Draft roadmap, Phase 2 (FY30 = fall 2029): "2 Valley elementary move into new elementary facility;
// advancing 4th graders remain -> Valley Elementary reconfigures to preK-5" (Oct 14, 2026 deck).
export const ROADMAP_FALL = 2029;

// At the October 28 meeting the roadmap's author said she would keep 5th and 6th graders at Crossett Brook,
// though her example moved a Waitsfield 2nd grader to the new building after grade 4. Pre-K to 4 matches
// Phase 3 and is the default; readers can choose 5 or 6.
export const ROADMAP_TOP_DEFAULT = 4;
export const withRoadmap = (plan, top = ROADMAP_TOP_DEFAULT) =>
  makePlan({ ...plan, id: `${plan.id}+roadmap`, name: `${plan.name}, then the draft roadmap`, short: `${plan.short} + roadmap`, roadmap: { fall: ROADMAP_FALL, top } });

// The plan in effect in a given school year (fall). Before the plan starts: today. After the
// roadmap's move: one new valley school for every valley town.
export function planAt(plan, fall) {
  if (fall < START_YEAR) return PLAN_TODAY;
  if (plan.roadmap && fall >= plan.roadmap.fall) {
    return { ...plan, open: ["NEW"], valleyTop: plan.roadmap.top, bpsTop: 4, roadmap: null, prekCenter: null, split: {}, phase: 2 };
  }
  return plan;
}

export const PLAN_TODAY = makePlan({
  id: "today",
  name: "No change",
  short: "No change",
  kind: "today",
});

export const PLAN_A = makePlan({
  id: "A",
  name: "Path A: keep all 7 buildings, cut programs",
  short: "Path A",
  kind: "district",
  cuts: CUT_IDS,
});

const pairName = (pair) => pair.map((id) => SCHOOLS[id].short).join(" + ");

export function pathB(pair, valleyTop) {
  const cfg = valleyTop === 4 ? "PK4" : "K6";
  return makePlan({
    id: `B:${[...pair].sort().join("+")}:${cfg}`,
    name: `Path B: ${pairName(pair)} stay open, ${valleyTop === 4 ? "Pre-K to 4" : "K-6"}`,
    short: `B: ${pairName(pair)} (${valleyTop === 4 ? "PK-4" : "K-6"})`,
    kind: "district",
    open: pair,
    valleyTop,
    msMerge: true,
  });
}

export const PATH_B_PLANS = PAIRS.flatMap((pair) => [pathB(pair, 4), pathB(pair, 6)]);

export const NAMED_PLANS = [PLAN_TODAY, PLAN_A, ...PATH_B_PLANS];

export const closedSchools = (plan) => VALLEY.filter((id) => !plan.open.includes(id));

export const isPathB = (plan) => plan.msMerge && plan.open.length === 2 && plan.cuts.length === 0;

// ---- share links: a plan round-trips through a short query string ----
const LETTER = { FES: "F", MES: "M", WES: "W", WRN: "R" };
const FROM_LETTER = Object.fromEntries(Object.entries(LETTER).map(([k, v]) => [v, k]));

export function encodePlan(plan) {
  const q = new URLSearchParams();
  q.set("o", plan.open.map((id) => LETTER[id]).join("") || "-");
  q.set("t", String(plan.valleyTop));
  if (plan.msMerge) q.set("m", "1");
  if (plan.bpsTop === 6) q.set("b", "6");
  if (plan.cuts.length) q.set("c", plan.cuts.join("."));
  if (plan.septicWES) q.set("s", "1");
  const port = Object.entries(plan.portables).map(([id, n]) => `${id}${n}`).join(".");
  if (port) q.set("p", port);
  const recv = Object.entries(plan.receiving).map(([town, id]) => `${town}~${id}`).join(".");
  if (recv) q.set("r", recv);
  if (plan.roadmap) q.set("n", `${plan.roadmap.fall}.${plan.roadmap.top}`);
  if (plan.prekCenter) q.set("k", `${plan.prekCenter.school}.${plan.prekCenter.scope}`);
  // sp=fayston~WRN~33.moretown~BPS~14~WRN~5; a town alone sends all its children to its receiving school
  const split = Object.entries(plan.split ?? {}).map(([town, v]) => [town, ...Object.entries(v).map(([s, x]) => `${s}~${Math.round(x * 100)}`)].join("~")).join(".");
  if (split) q.set("sp", split);
  return q.toString();
}

export function decodePlan(str) {
  const q = new URLSearchParams(str);
  if (!q.has("o")) return null;
  const o = q.get("o");
  if (o !== "-" && !/^[FMWR]{1,4}$/.test(o)) return null;
  const portables = {};
  for (const part of (q.get("p") ?? "").split(".").filter(Boolean)) {
    const m = /^([A-Z]+)(\d+)$/.exec(part);
    if (m) portables[m[1]] = Number(m[2]);
  }
  const receiving = {};
  for (const part of (q.get("r") ?? "").split(".").filter(Boolean)) {
    const [town, id] = part.split("~");
    if (town && SCHOOLS[id]) receiving[town] = id;
  }
  // n=<fall>.<top>: the roadmap always starts in ROADMAP_FALL, which the controls show, whatever year a link carries
  const [rf, rt] = (q.get("n") ?? "").split(".").map(Number);
  const [kSchool, kScope] = (q.get("k") ?? "").split(".");
  const split = {};
  for (const part of (q.get("sp") ?? "").split(".").filter(Boolean)) {
    const [town, ...rest] = part.split("~");
    split[town] = {};
    for (let i = 0; i + 1 < rest.length; i += 2) split[town][rest[i]] = Number(rest[i + 1]) / 100;
  }
  return makePlan({
    prekCenter: kSchool ? { school: kSchool, scope: kScope } : null,
    split,
    roadmap: rf ? { fall: ROADMAP_FALL, top: rt } : null,
    open: o === "-" ? [] : [...o].map((c) => FROM_LETTER[c]).filter(Boolean),
    valleyTop: Number(q.get("t")),
    msMerge: q.get("m") === "1",
    bpsTop: Number(q.get("b")),
    cuts: (q.get("c") ?? "").split(".").filter(Boolean),
    septicWES: q.get("s") === "1",
    portables,
    receiving,
  });
}

// Matches a plan to a named one when the settings are the same, so a built plan that equals
// Path A or a Path B pairing is labeled as such.
export function matchNamed(plan) {
  const same = (a, b) => encodePlan(a) === encodePlan(b);
  return NAMED_PLANS.find((n) => same(n, { ...plan, receiving: {} })) ?? null;
}
