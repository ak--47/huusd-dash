// One call that answers everything the site shows about a plan.

import { budget } from "./budget.js";
import { capacity } from "./capacity.js";
import { maxSchoolsYoung, movedNextFall, studentsAtLeast } from "./impact.js";
import { closedSchools } from "./plans.js";
import { FACILITIES } from "../../data/schools.js";

export * from "./plans.js";
export * from "./assign.js";
export * from "./journey.js";
export * from "./capacity.js";
export * from "./budget.js";
export * from "./impact.js";
export * from "./options.js";

const cache = new Map();

export function evaluate(plan, { classSize, basis = "district", reading = "slides" } = {}) {
  const key = JSON.stringify([plan, classSize ?? null, basis, reading]);
  if (cache.has(key)) return cache.get(key);
  // a Pre-K center's building stays in use, though no K-12 grade is taught there
  const center = plan.prekCenter?.school;
  const closed = closedSchools(plan).filter((id) => id !== center);
  const keptBuildings = ["BPS", ...plan.open, ...(center ? [center] : [])];
  const result = {
    plan,
    closed,
    // Crossett Brook's building holds no classes when Brookside teaches its 5th and 6th graders
    buildingsOpen: 7 - closed.length - (plan.bpsTop === 6 ? 1 : 0),
    budget: budget(plan, { basis }),
    capacity: capacity(plan, { ...(classSize ? { classSize } : {}), reading }),
    moved: movedNextFall(plan),
    maxYoung: maxSchoolsYoung(plan),
    fivePlus: studentsAtLeast(plan, 5),
    deferredKept: keptBuildings.reduce((a, id) => a + FACILITIES[id].deferredMaintenance, 0),
    deferredClosed: closed.reduce((a, id) => a + FACILITIES[id].deferredMaintenance, 0),
  };
  if (cache.size > 200) cache.clear();
  cache.set(key, result);
  return result;
}
