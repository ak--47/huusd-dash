// Where a closed town's K-6 children go: the share of them at each open school.
//
// The district's capacity tables place children "based on home location to nearest school" (deck slides 27-32),
// so each table implies shares, though it does not say which town each child lives in. We read them off the
// K-6 table for each pair (our calculation): every school's gain over this year's own K-6 students is credited
// to the closed towns. A school that is a closed town's nearest open school takes that town's remaining children.
// A school that is no closed town's nearest is credited to the towns for which it is next nearest, by town size.
// Brookside's gain includes the Crossett Brook 5th and 6th graders the table adds. A school that loses students
// in the table (Fayston, in the Waitsfield + Fayston table) is left as it is: we keep children at a school that
// stays open.

import { DISTRICT_TABLES, PAIRS } from "../../data/district-scenarios.js";
import { ATTENDING } from "../../data/enrollment.js";
import { SCHOOLS, VALLEY } from "../../data/schools.js";
import { NEAREST, receivingSchool } from "./assign.js";

const ATT = ATTENDING[2026];
const K6 = ["K", "1", "2", "3", "4", "5", "6"];
const K4 = ["K", "1", "2", "3", "4"];
const sum = (byGrade, grades) => grades.reduce((a, g) => a + (byGrade?.[g] ?? 0), 0);
const pairKey = (pair) => [...pair].sort().join("+");

// This year's K-6 students at each valley school, the children a closed town sends elsewhere.
export const townK6 = (town) => sum(ATT[VALLEY.find((id) => SCHOOLS[id].town === town)], K6);

function sharesFrom(t) {
  const col = (id, grades) => sum(Object.fromEntries(Object.entries(t.rows).map(([g, v]) => [g, v[t.cols.indexOf(id)]])), grades);
  const towns = VALLEY.filter((id) => !t.pair.includes(id)).map((id) => SCHOOLS[id].town);
  const stops = [...t.pair, "BPS"];
  const order = (town) => NEAREST[town].filter((id) => stops.includes(id));
  const gain = Object.fromEntries(t.pair.map((id) => [id, col(id, K6) - sum(ATT[id], K6)]));
  gain.BPS = col("BPS", K4) - sum(ATT.BPS, K4) + (col("CBMS", ["5", "6"]) - sum(ATT.CBMS, ["5", "6"]));
  const nearest = new Set(towns.map((town) => order(town)[0]));
  const out = Object.fromEntries(towns.map((town) => [town, {}]));
  for (const [school, n] of Object.entries(gain)) {
    if (n <= 0 || nearest.has(school)) continue;
    const takers = towns.filter((town) => order(town)[1] === school);
    // shared by size, so each taking town sends the same share
    const size = takers.reduce((a, town) => a + townK6(town), 0);
    for (const town of takers) out[town][school] = Math.min(1, Math.round((100 * n) / size) / 100);
  }
  return out;
}

// { "MES+WRN": { fayston: { MES: 0.07 }, waitsfield: { MES: 0.07 } }, ... }: for each pair, the share of each
// closed town's K-6 children the district's table places somewhere other than the town's nearest open school.
export const DISTRICT_SHARES = Object.fromEntries(
  PAIRS.map((pair) => [pairKey(pair), sharesFrom(DISTRICT_TABLES.find((t) => t.config === "K6" && t.pair.every((id) => pair.includes(id))))])
);

export const districtShares = (open) => (open.length === 2 ? (DISTRICT_SHARES[pairKey(open)] ?? null) : null);

// The shares a plan uses for each closed town: the plan's own (plan.split), or, with two valley schools open and
// no other school chosen for the town, the district's; otherwise every child goes to the town's receiving school.
// Shares to that receiving school, or to a school that is not open, are dropped (it takes the rest anyway).
export function effectiveSplit(plan) {
  const base = districtShares(plan.open);
  const out = {};
  for (const id of VALLEY) {
    if (plan.open.includes(id)) continue;
    const town = SCHOOLS[id].town;
    const dest = receivingSchool(plan, town);
    const shares = plan.split?.[town] ?? (base && !plan.receiving?.[town] ? base[town] : null) ?? {};
    out[town] = Object.fromEntries(Object.entries(shares).filter(([s, v]) => v > 0 && s !== dest && (s === "BPS" || plan.open.includes(s))));
  }
  return out;
}

// Where the shares for a town come from: "plan" (set in the plan), "district" (the district's table), or "nearest".
export function splitSource(plan, town) {
  if (plan.split?.[town]) return "plan";
  const base = districtShares(plan.open);
  return base && !plan.receiving?.[town] && Object.keys(base[town] ?? {}).length ? "district" : "nearest";
}
