// A child's path through school, year by year, and the counts the site leads with.

import { SCHOOLS } from "../../data/schools.js";
import { CURRENT_YEAR, PLAN_TODAY, schoolYear } from "./plans.js";
import { schoolFor } from "./assign.js";

export const buildingOf = (id) => (SCHOOLS[id] ? SCHOOLS[id].building : id);

// Every school year from the child's first Pre-K or kindergarten year through grade 12.
export function journey(plan, child) {
  const years = [];
  // from the fall of Pre-K 3 (grade -2) to the fall of grade 12
  for (let fall = CURRENT_YEAR - (child.grade + 2); fall <= CURRENT_YEAR + (12 - child.grade); fall++) {
    const grade = child.grade + (fall - CURRENT_YEAR);
    const school = schoolFor(plan, child, fall);
    years.push({
      fall,
      schoolYear: schoolYear(fall),
      grade,
      school,
      past: fall < CURRENT_YEAR,
      current: fall === CURRENT_YEAR,
    });
  }
  // mark the years where the child starts somewhere new
  let prev = null;
  for (const y of years) {
    y.newSchool = Boolean(y.school) && prev !== null && y.school !== prev;
    if (y.school) prev = y.school;
  }
  return years;
}

// Counts for a journey. K-12 is the headline; Pre-K only when the family asks for it.
export function journeyCounts(years, { includePreK = false } = {}) {
  const k12 = years.filter((y) => y.grade >= 0 && y.school);
  const pk = includePreK ? years.filter((y) => y.grade < 0 && y.school) : [];
  const all = [...pk, ...k12];
  const schools = new Set(all.map((y) => y.school));
  const buildings = new Set(all.map((y) => buildingOf(y.school)));
  let moves = 0;
  for (let i = 1; i < all.length; i++) if (all[i].school !== all[i - 1].school) moves++;
  return {
    schools: schools.size,
    buildings: buildings.size,
    moves,
    list: [...schools],
  };
}

// Compare a plan's path with "no change" for the same child.
export function compareJourney(plan, child, opts) {
  const years = journey(plan, child);
  const base = journey(PLAN_TODAY, child);
  const counts = journeyCounts(years, opts);
  const baseCounts = journeyCounts(base, opts);
  return {
    years,
    counts,
    baseCounts,
    extraSchools: counts.schools - baseCounts.schools,
    extraMoves: counts.moves - baseCounts.moves,
  };
}
