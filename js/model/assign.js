// Which school a child attends, by home town, grade, and school year, under a plan.

import { SCHOOLS, TODAY, VALLEY } from "../../data/schools.js";
import { CURRENT_YEAR, START_YEAR, planAt } from "./plans.js";

const WATERBURY_TRACK = new Set(["waterbury", "duxbury"]);
export const onWaterburyTrack = (town) => WATERBURY_TRACK.has(town);
export const townSchool = (town) => (WATERBURY_TRACK.has(town) ? "BPS" : TODAY[town]?.elem);

// When a town's elementary school closes, its children go to the nearest open school.
// These orders reproduce where the district's own capacity tables send each town (deck slides 27-32).
export const NEAREST = {
  waitsfield: ["WES", "FES", "WRN", "MES", "BPS"],
  fayston: ["FES", "WES", "WRN", "MES", "BPS"],
  warren: ["WRN", "WES", "FES", "MES", "BPS"],
  moretown: ["MES", "WES", "BPS", "FES", "WRN"],
};

const isOpenElem = (plan, id) => id === "BPS" || plan.open.includes(id);

export function receivingSchool(plan, town) {
  if (plan.open.includes("NEW") && NEAREST[town]) return "NEW";
  const own = townSchool(town);
  if (isOpenElem(plan, own)) return own;
  const chosen = plan.receiving?.[town];
  if (chosen && isOpenElem(plan, chosen)) return chosen;
  return NEAREST[town].find((id) => isOpenElem(plan, id)) ?? "BPS";
}

// Schools a family in a town whose school closed could be placed in (home address decides).
export function receivingOptions(plan, town) {
  if (!NEAREST[town] || isOpenElem(plan, townSchool(town))) return [];
  return NEAREST[town].filter((id) => isOpenElem(plan, id));
}

// Pre-K today is at Brookside, Moretown, and Warren. The district's consolidation tables plan
// Pre-K in every valley school that stays open.
export function offersPreK(plan, school) {
  // a Pre-K center: the only valley Pre-K site, and Brookside's too when it serves the whole district
  if (plan.prekCenter) {
    if (school === plan.prekCenter.school) return true;
    return school === "BPS" && plan.prekCenter.scope !== "all";
  }
  if (school === "BPS") return true;
  if (school === "NEW") return plan.open.includes("NEW");
  if (!VALLEY.includes(school) || !plan.open.includes(school)) return false;
  if (plan.open.length === VALLEY.length) return school === "MES" || school === "WRN";
  return true;
}

// Does `school` teach `grade` (0 = K, negative = Pre-K) under `plan`?
export function serves(plan, school, grade) {
  if (grade < 0) return offersPreK(plan, school);
  switch (school) {
    case "BPS": return grade <= (plan.bpsTop ?? 4);
    case "CBMS": return plan.bpsTop !== 6 && grade >= 5 && grade <= (plan.msMerge ? 6 : 8);
    case "HUMS": return grade === 7 || grade === 8;
    case "HUHS": return grade >= 9;
    default: return (VALLEY.includes(school) || school === "NEW") && plan.open.includes(school) && grade <= plan.valleyTop;
  }
}

// Default school for a town and grade (K-12) under a plan.
export function defaultSchool(plan, town, grade) {
  if (grade >= 9) return "HUHS";
  if (grade >= 7) return WATERBURY_TRACK.has(town) && !plan.msMerge ? "CBMS" : "HUMS";
  const elem = receivingSchool(plan, town);
  if (elem === "BPS") return grade <= (plan.bpsTop ?? 4) ? "BPS" : "CBMS";
  if (grade > plan.valleyTop) return "CBMS";
  return elem;
}

// Pre-K site. "PRIVATE" = a private program paid with public tuition (Act 166), "OTHER" = elsewhere.
function preKSite(plan, child, fall) {
  if (fall >= START_YEAR && plan.cuts.includes("prek")) return "PRIVATE";
  const known = child.grade < 0 ? child.school : child.pk;
  if (fall <= CURRENT_YEAR) return known || TODAY[child.town]?.pk || null;
  if (known === "PRIVATE" || known === "OTHER") return known;
  if (known && serves(plan, known, -1)) return known;
  if (plan.prekCenter && (plan.prekCenter.scope === "all" || !onWaterburyTrack(child.town))) return plan.prekCenter.school;
  const elem = receivingSchool(plan, child.town);
  return serves(plan, elem, -1) ? elem : null;
}

// The school a child attends in the school year that starts in the fall of `fall`.
//   child = { town, grade (grade index in 2026-27: -2 = Pre-K 3, 0 = K), school (2026-27 school), pk (optional Pre-K site) }
// Returns a school id, "PRIVATE", "OTHER", or null (not in school that year / not in the district).
export function schoolFor(plan, child, fall) {
  const p = planAt(plan, fall);
  const grade = child.grade + (fall - CURRENT_YEAR);
  if (grade > 12 || grade < -2) return null;
  if (grade < 0) return preKSite(p, child, fall);
  // A child stays at this year's school while it is open and still teaches the grade
  // (this keeps intradistrict-choice families where they are). In past years we assume the
  // child was at this year's school for every grade it teaches.
  const cur = child.school;
  if (cur && SCHOOLS[cur] && serves(p, cur, grade)) return cur;
  return defaultSchool(p, child.town, grade);
}
