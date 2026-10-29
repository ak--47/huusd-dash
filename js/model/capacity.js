// How many students each building would hold under a plan, and whether that fits.
// Two limits:
//   people: the wastewater permit numbers (and Brookside's occupancy of 480) the district compares
//           student counts against, including Pre-K (deck slides 21-32)
//   rooms:  classrooms needed for single-grade classes at a chosen maximum class size, against the
//           classrooms each building has (deck slides 21-25). The district did not publish this check.

import { DISTRICT_TABLES } from "../../data/district-scenarios.js";
import { ATTENDING, PREK_2026 } from "../../data/enrollment.js";
import { CONSULTANT_CAPACITY, FACILITIES, SCHOOLS, VALLEY } from "../../data/schools.js";
import { receivingSchool } from "./assign.js";
import { closedSchools } from "./plans.js";
import { PATH_B_SAVINGS } from "../../data/budget.js";

export const ELEM_GRADES = ["PK", "K", "1", "2", "3", "4", "5", "6"];
export const CLASS_SIZE_DEFAULT = { PK: 18, K: 20, 1: 20, 2: 20, 3: 22, 4: 22, 5: 24, 6: 24 };

// Pre-K the district plans in each open school in its consolidation tables.
export const PK_PLAN = { FES: 30, MES: 30, WES: 30, WRN: 42, BPS: 60 };

const gradeNum = (g) => (g === "K" ? 0 : Number(g));

export function peopleLimit(plan, id) {
  if (id === "WES") return plan.septicWES ? FACILITIES.WES.wastewaterExpandable : FACILITIES.WES.wastewater;
  if (id === "BPS") return FACILITIES.BPS.occupancy;
  return FACILITIES[id]?.wastewater ?? null;
}

export function districtTableFor(plan) {
  if (plan.open.length !== 2) return null;
  const cfg = plan.valleyTop === 4 ? "PK4" : "K6";
  return DISTRICT_TABLES.find((t) => t.config === cfg && t.pair.every((id) => plan.open.includes(id))) ?? null;
}

// Students by school and grade from a district table, with totals computed from the rows.
export function tableLoads(t) {
  const loads = {};
  t.cols.forEach((id, i) => {
    loads[id] = {};
    for (const [g, vals] of Object.entries(t.rows)) if (vals[i] != null) loads[id][g] = vals[i];
  });
  return loads;
}

// Rows that do not add up to the printed "Total" row.
export function tableMismatches(t) {
  const loads = tableLoads(t);
  const out = [];
  for (const id of t.cols) {
    const sum = Object.values(loads[id]).reduce((a, b) => a + b, 0);
    if (t.printedTotal[id] !== sum) out.push({ school: id, printed: t.printedTotal[id], rows: sum });
  }
  return out;
}

const add = (loads, id, g, n) => {
  if (!n) return;
  loads[id] ??= {};
  loads[id][g] = (loads[id][g] ?? 0) + n;
};

// Our own estimate for combinations the district did not table: this year's students (October 1, 2026)
// move with their school to the receiving school; Pre-K follows the district's planning numbers.
export function modelLoads(plan) {
  const loads = {};
  const allOpen = plan.open.length === VALLEY.length;
  const att = ATTENDING[2026];
  // Pre-K
  if (allOpen) {
    for (const [id, pk] of Object.entries(PREK_2026.bySchool)) add(loads, id, "PK", pk.PK3 + pk.PK4);
  } else {
    add(loads, "BPS", "PK", PK_PLAN.BPS);
    for (const id of plan.open) add(loads, id, "PK", PK_PLAN[id]);
  }
  // Brookside and Crossett Brook's own students
  for (const g of ["K", "1", "2", "3", "4"]) add(loads, "BPS", g, att.BPS[g]);
  for (const g of ["5", "6"]) add(loads, "CBMS", g, att.CBMS[g]);
  // valley schools
  for (const id of VALLEY) {
    const town = SCHOOLS[id].town;
    const dest = plan.open.includes(id) ? id : receivingSchool(plan, town);
    for (const g of ["K", "1", "2", "3", "4", "5", "6"]) {
      const n = att[id][g];
      const top = dest === "BPS" ? 4 : plan.valleyTop;
      add(loads, gradeNum(g) <= top ? dest : "CBMS", g, n);
    }
  }
  return loads;
}

export function sectionsNeeded(byGrade, classSize = CLASS_SIZE_DEFAULT) {
  let rooms = 0;
  for (const [g, n] of Object.entries(byGrade)) if (n > 0) rooms += Math.ceil(n / (classSize[g] ?? 22));
  return rooms;
}

// Staff in a building, for permits that count staff. With all four valley schools open we use each
// building's staff today. Otherwise the valley staff that remain (today's total minus the positions
// the district says closing schools removes) are shared out by students, and Brookside's staff grow
// with its students. An estimate, labeled as one wherever it is shown.
const VALLEY_FTE = VALLEY.reduce((a, id) => a + FACILITIES[id].fte, 0);
const BPS_TODAY = 338; // Brookside students including Pre-K, October 2026
export function staffEstimate(plan, id, total, valleyTotal) {
  if (id === "BPS") return plan.open.length === VALLEY.length ? FACILITIES.BPS.fte : (FACILITIES.BPS.fte * total) / BPS_TODAY;
  if (plan.open.length === VALLEY.length) return FACILITIES[id].fte;
  const closed = closedSchools(plan).length;
  const cut = (PATH_B_SAVINGS.valley.fte / 2) * closed;
  return valleyTotal ? ((VALLEY_FTE - cut) * total) / valleyTotal : 0;
}

// Two readings of the wastewater limits:
//   "slides":  the district's comparison, students including Pre-K against 230 / 250 / 235 / 237 / 480
//   "permits": each state permit's own wording: Waitsfield 300 students (1991); Fayston 235 and Warren 237
//              students and staff; Moretown 2,820 gallons a day (235 people at 12 gallons); Brookside occupancy 480
export const READINGS = ["slides", "permits"];

export function capacity(plan, { classSize = CLASS_SIZE_DEFAULT, reading = "slides" } = {}) {
  const table = districtTableFor(plan);
  const loads = table ? tableLoads(table) : modelLoads(plan);
  const totals = Object.fromEntries(["BPS", ...plan.open].map((id) => [id, Object.values(loads[id] ?? {}).reduce((a, b) => a + b, 0)]));
  const valleyTotal = plan.open.reduce((a, id) => a + totals[id], 0);
  const schools = [];
  for (const id of ["BPS", ...plan.open]) {
    const byGrade = loads[id] ?? {};
    const total = totals[id];
    const f = FACILITIES[id];
    const staff = staffEstimate(plan, id, total, valleyTotal);
    const countsStaff = reading === "permits" && f.permit.counts !== "students";
    const limit = reading === "permits" ? f.permit.limit : peopleLimit(plan, id);
    const counted = total + (countsStaff ? staff : 0);
    const rooms = f.classrooms + 2 * (plan.portables[id] ?? 0);
    const needed = sectionsNeeded(byGrade, classSize);
    const cap = CONSULTANT_CAPACITY.schools[id] + 40 * (plan.portables[id] ?? 0);
    schools.push({
      id,
      byGrade,
      total,
      staff,
      counted,
      countsStaff,
      limit,
      limitKind: id === "BPS" ? "occupancy" : "wastewater",
      overPeople: limit != null && counted > limit,
      consultantCapacity: cap,
      overConsultant: total > cap,
      roomsHave: rooms,
      roomsNeeded: needed,
      overRooms: needed > rooms,
      portables: plan.portables[id] ?? 0,
    });
  }
  const cbms = loads.CBMS ? Object.values(loads.CBMS).reduce((a, b) => a + b, 0) : null; // null: the district's table leaves Crossett Brook out
  return {
    source: table ? "district" : "model",
    reading,
    table,
    mismatches: table ? tableMismatches(table) : [],
    schools,
    cbms56: cbms,
    overPeople: schools.filter((s) => s.overPeople).map((s) => s.id),
    overRooms: schools.filter((s) => s.overRooms).map((s) => s.id),
    overConsultant: schools.filter((s) => s.overConsultant).map((s) => s.id),
  };
}
