// What a plan saves against the district's FY28 target, and what that means per pupil.
//
// Per pupil: the district's own figures fit a straight line. The level-funded budget ($51,884,847)
// is $25.67 under the $16,562 threshold, and the Path B budget, $590,196 lower, is $255.76 under.
// $590,196 / ($255.76 - $25.67) = about 2,565 pupils, the same count the level-service card implies
// ($2,773,267 penalty / $1,081 per pupil). So each $2,565 saved lowers spending per pupil by $1.

import { BUDGET, HEALTH_UPDATE, MODULAR, ONE_CLOSURE, PATH_A_CUTS, PATH_B_SAVINGS } from "../../data/budget.js";
import { closedSchools } from "./plans.js";
import { FACILITIES, SCHOOLS } from "../../data/schools.js";

// 590,196 / 230.09: the pupil count that makes the district's level-funded and Path B cards agree.
export const PUPILS = 590196 / 230.09;
export const TARGET = BUDGET.requiredCut; // $3,339,273
const PER_PUPIL_AT_TARGET = BUDGET.threshold - 25.67; // level funded, as corrected on slide 10

// The district moved its level-funded figure from $220.67 under the threshold to $25.67 under by taking
// out a "debt exclusion": $195 per pupil. State law (16 V.S.A. 4001(6)(B)) leaves payments on bonds voters
// approved before July 1, 2026 out of the FY28 test. basis "exclusion" applies that reading.
export const EXCLUSION_PER_PUPIL = 220.67 - 25.67;
export const TARGET_WITH_EXCLUSION = Math.round(TARGET - EXCLUSION_PER_PUPIL * PUPILS);
// On November 2 the finance director said lower health insurance rates take about $300,000 off next year's
// level-service budget. The district has not published a restated target, so counting it is a choice (health: true)
// that lowers either target by that amount.
export const HEALTH_SAVING = HEALTH_UPDATE.amount;
export const targetFor = ({ basis = "district", health = false } = {}) => (basis === "exclusion" ? TARGET_WITH_EXCLUSION : TARGET) - (health ? HEALTH_SAVING : 0);
const PER_BUILDING_ESTIMATE = PATH_B_SAVINGS.valley.amount / 2;

// Savings from closing valley schools. The district costed only "4 into 2". For other counts we
// scale by buildings closed, and say so.
export function valleySavings(closedCount) {
  if (closedCount === 0) return { amount: 0, fte: 0, kind: "none" };
  if (closedCount === 2) return { amount: PATH_B_SAVINGS.valley.amount, fte: PATH_B_SAVINGS.valley.fte, kind: "district" };
  return {
    amount: Math.round(PER_BUILDING_ESTIMATE * closedCount),
    fte: (PATH_B_SAVINGS.valley.fte / 2) * closedCount,
    kind: "estimate",
  };
}

// The district's November 2 figure covers exactly this shape: one valley school closes, the middle schools merge, and
// valley 5th and 6th graders stay in the valley (Crossett Brook keeps only its own). Such plans use it in place of
// the merger figure and the one-closure estimate.
export const usesOneClosureFigure = (plan) => Boolean(plan.msMerge) && closedSchools(plan).length === 1 && plan.valleyTop === 6 && plan.bpsTop !== 6;

export function perPupil(savings) {
  return PER_PUPIL_AT_TARGET + (TARGET - savings) / PUPILS;
}

export function budget(plan, { basis = "district", health = false } = {}) {
  const adj = (basis === "exclusion" ? EXCLUSION_PER_PUPIL : 0) + (health ? HEALTH_SAVING / PUPILS : 0);
  const target = targetFor({ basis, health });
  const items = [];
  const oneFigure = usesOneClosureFigure(plan);
  // The district's savings assume valley 5th and 6th graders move into Crossett Brook. On October 28 an
  // administrator said that keeping them in the valley would leave about 126 students there and would not
  // reach the full $3.9 million. For those plans the middle-school figure is an upper limit, not a costing.
  // The district's own one-closure figure already reflects keeping them there, so it is not an upper limit.
  const upperBound = Boolean(plan.msMerge && plan.valleyTop > 4) && !oneFigure; // some valley 5th or 6th graders stay in the valley
  const closed = closedSchools(plan);
  if (oneFigure) {
    items.push({
      id: "oneClosure",
      label: "Close 1 valley school and merge the middle schools, with grades 5-6 in the valley",
      amount: ONE_CLOSURE.amount,
      fte: ONE_CLOSURE.fte,
      kind: "district",
    });
  } else if (plan.msMerge) {
    items.push({
      id: "middle",
      label: "Merge the middle schools",
      amount: PATH_B_SAVINGS.middle.amount,
      fte: PATH_B_SAVINGS.middle.fte,
      kind: upperBound ? "estimate" : "district",
      upperBound,
    });
  }
  const valley = valleySavings(closed.length);
  if (closed.length && !oneFigure) {
    items.push({
      id: "valley",
      label: `Close ${closed.length} valley elementary school${closed.length === 1 ? "" : "s"}`,
      amount: valley.amount,
      fte: valley.fte,
      kind: valley.kind,
    });
  }
  // Keeping a closed school's building open as a Pre-K center gives back part of the closure savings: at least
  // the building's annual operating costs on the district's facility slide (which leave out custodial staff).
  if (plan.prekCenter) {
    const id = plan.prekCenter.school;
    items.push({ id: "prekCenter", label: `Keep ${SCHOOLS[id].short} open as a Pre-K center`, amount: -FACILITIES[id].operatingCost, fte: null, kind: "estimate" });
  }
  // A grades 5-6 center keeps a closed school's building in use, so its operating costs are given back. The
  // staffing is the same as Path B's (Pre-K to 4 in two valley schools, every 5th and 6th grader in one building),
  // but Crossett Brook's building, not a valley one, holds no classes, and the district has published no operating
  // cost for it, so nothing is counted for emptying it.
  if (plan.center56) {
    const id = plan.center56;
    items.push({ id: "center56", label: `Keep ${SCHOOLS[id].short} open as the grades 5-6 center`, amount: -FACILITIES[id].operatingCost, fte: null, kind: "estimate" });
  }
  for (const id of plan.cuts) {
    const c = PATH_A_CUTS.items.find((x) => x.id === id);
    items.push({ id: `cut:${id}`, label: c.name, amount: c.amount, fte: null, kind: "district" });
  }
  const savings = items.reduce((a, b) => a + b.amount, 0);
  const pp = perPupil(savings) - adj;
  const over = pp - BUDGET.threshold;
  // one-time costs only for buildings that stay open
  const units = Object.entries(plan.portables)
    .filter(([id]) => id === "BPS" || plan.open.includes(id))
    .reduce((a, [, n]) => a + n, 0);
  return {
    items,
    savings,
    basis,
    health,
    target,
    gap: target - savings, // positive = still short
    perPupil: pp,
    vsThreshold: over, // positive = over the threshold
    penalty: over > 0 ? over * PUPILS : 0,
    fte: items.reduce((a, b) => a + (b.fte ?? 0), 0),
    hasEstimate: items.some((i) => i.kind === "estimate"),
    upperBound, // true: the district says this plan saves less than the figures used here
    oneTime: {
      portables: units ? { units, low: (MODULAR.low / MODULAR.units) * units, high: (MODULAR.high / MODULAR.units) * units } : null,
      septic: plan.septicWES && plan.open.includes("WES") ? { known: false } : null,
    },
  };
}
