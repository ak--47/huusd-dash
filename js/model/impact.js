// Student-level effects of a plan, built from this year's real enrollment (October 1, 2026).

import { ATTENDING, PREK_2026, gradeKey } from "../../data/enrollment.js";
import { SCHOOLS, TOWNS, VALLEY } from "../../data/schools.js";
import { CURRENT_YEAR, PLAN_TODAY, START_YEAR } from "./plans.js";
import { defaultSchool, schoolFor } from "./assign.js";
import { journey, journeyCounts } from "./journey.js";

// Every group of students attending a school this year, as a child record the model understands.
// Valley students are counted in their school's town (a few attend by intradistrict choice).
// Brookside and Crossett Brook students are on the Waterbury-Duxbury track. Harwood students'
// paths do not change under any plan, so their town is only a placeholder.
const townOf = (id) => (id === "BPS" || id === "CBMS" ? "waterbury" : id === "HU" ? "waitsfield" : SCHOOLS[id].town);

export function studentGroups() {
  const groups = [];
  for (const [id, byGrade] of Object.entries(ATTENDING[CURRENT_YEAR])) {
    for (const [g, n] of Object.entries(byGrade)) {
      const grade = g === "K" ? 0 : Number(g);
      const school = id === "HU" ? (grade <= 8 ? "HUMS" : "HUHS") : id;
      groups.push({ school, grade, n, town: townOf(id) });
    }
  }
  for (const [id, pk] of Object.entries(PREK_2026.bySchool)) {
    if (pk.PK3) groups.push({ school: id, grade: -2, n: pk.PK3, town: townOf(id) });
    if (pk.PK4) groups.push({ school: id, grade: -1, n: pk.PK4, town: townOf(id) });
  }
  return groups;
}

function reasonFor(plan, before, grade) {
  if (VALLEY.includes(before) && !plan.open.includes(before)) return "closure";
  if (VALLEY.includes(before) && grade >= 5) return "grades56";
  if (before === "CBMS" && grade >= 7) return "middle";
  if (before === "CBMS" && plan.bpsTop === 6) return "brookside";
  if (grade < 0) return "prek";
  return "other";
}

// Students who would start fall 2027 in a different school than they would with no change.
export function movedNextFall(plan) {
  const byReason = { closure: 0, grades56: 0, middle: 0, brookside: 0, prek: 0, other: 0 };
  const byReasonK12 = { closure: 0, grades56: 0, middle: 0, brookside: 0, prek: 0, other: 0 };
  const bySchool = {};
  let k12 = 0;
  let preK = 0;
  for (const g of studentGroups()) {
    const child = { town: g.town, grade: g.grade, school: g.school };
    const before = schoolFor(PLAN_TODAY, child, START_YEAR);
    const after = schoolFor(plan, child, START_YEAR);
    if (!before || before === after) continue;
    // staying in this year's school is not a move (Brookside 4th graders when Brookside teaches grade 5)
    if (after === g.school) continue;
    const nextGrade = g.grade + 1;
    const reason = reasonFor(plan, before, nextGrade);
    byReason[reason] += g.n;
    bySchool[g.school] = (bySchool[g.school] ?? 0) + g.n;
    if (nextGrade >= 0) {
      k12 += g.n;
      byReasonK12[reason] += g.n;
    } else preK += g.n;
  }
  return { k12, preK, total: k12 + preK, byReason, byReasonK12, bySchool };
}

// For each town and this year's grade: how many different K-12 schools a child would attend.
export const GRID_GRADES = [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8];

export function schoolCountGrid(plan, { includePreK = false } = {}) {
  return TOWNS.map((t) => ({
    town: t.id,
    name: t.name,
    cells: GRID_GRADES.map((grade) => {
      const school = grade < 0 ? undefined : defaultSchool(PLAN_TODAY, t.id, grade);
      const child = { town: t.id, grade, school };
      const plain = journeyCounts(journey(plan, child), { includePreK });
      const base = journeyCounts(journey(PLAN_TODAY, child), { includePreK });
      return { grade, gradeKey: gradeKey(grade), schools: plain.schools, buildings: plain.buildings, base: base.schools, extra: plain.schools - base.schools };
    }),
  }));
}

// How many of this year's students (Pre-K to grade 8) would attend at least `n` K-12 schools.
export function studentsAtLeast(plan, n) {
  let total = 0;
  const byTown = {};
  for (const g of studentGroups()) {
    if (g.grade > 8) continue;
    const c = journeyCounts(journey(plan, { town: g.town, grade: g.grade, school: g.school }));
    if (c.schools >= n) {
      total += g.n;
      byTown[g.town] = (byTown[g.town] ?? 0) + g.n;
    }
  }
  return { total, byTown };
}

// The most schools any child in grades Pre-K to 2 this year would attend, per town.
export function maxSchoolsYoung(plan) {
  const grid = schoolCountGrid(plan);
  const out = {};
  for (const row of grid) out[row.town] = Math.max(...row.cells.filter((c) => c.grade <= 2).map((c) => c.schools));
  out.all = Math.max(...Object.values(out));
  return out;
}
