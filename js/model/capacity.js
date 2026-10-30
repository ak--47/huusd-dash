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

// The district's table for the plan's two open schools and valley grades: it tabled two open schools with
// grades 5-6 at Crossett Brook (PK4) or in the valley (K6) only.
export function pairTable(plan) {
  if (plan.open.length !== 2 || ![4, 6].includes(plan.valleyTop)) return null;
  const cfg = plan.valleyTop === 4 ? "PK4" : "K6";
  return DISTRICT_TABLES.find((t) => t.config === cfg && t.pair.every((id) => plan.open.includes(id))) ?? null;
}

// The table, when the plan is exactly what the district tabled. A Pre-K center, a split town, or Brookside
// teaching grades 5-6 changes who goes where; those start from the table and adjust it (adjustedLoads).
export function districtTableFor(plan) {
  if (plan.prekCenter || Object.keys(plan.split ?? {}).length || plan.bpsTop === 6) return null;
  return pairTable(plan);
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
  if (plan.prekCenter) {
    // today's district Pre-K children move to the center (Brookside's too when it serves the whole district;
    // otherwise Brookside keeps the district's planning number, as in its tables)
    for (const [id, pk] of Object.entries(PREK_2026.bySchool)) {
      if (id === "BPS" && plan.prekCenter.scope !== "all") add(loads, "BPS", "PK", PK_PLAN.BPS);
      else add(loads, plan.prekCenter.school, "PK", pk.PK3 + pk.PK4);
    }
  } else if (allOpen) {
    for (const [id, pk] of Object.entries(PREK_2026.bySchool)) add(loads, id, "PK", pk.PK3 + pk.PK4);
  } else {
    add(loads, "BPS", "PK", PK_PLAN.BPS);
    for (const id of plan.open) add(loads, id, "PK", PK_PLAN[id]);
  }
  // Brookside and Crossett Brook's own students (Crossett Brook's 5-6 at Brookside when it teaches them)
  const bpsTop = plan.bpsTop ?? 4;
  for (const g of ["K", "1", "2", "3", "4"]) add(loads, "BPS", g, att.BPS[g]);
  for (const g of ["5", "6"]) add(loads, gradeNum(g) <= bpsTop ? "BPS" : "CBMS", g, att.CBMS[g]);
  // valley schools
  const place = (dest, g, n) => add(loads, gradeNum(g) <= (dest === "BPS" ? bpsTop : plan.valleyTop) ? dest : "CBMS", g, n);
  for (const id of VALLEY) {
    const town = SCHOOLS[id].town;
    const dest = plan.open.includes(id) ? id : receivingSchool(plan, town);
    // a share of a closed town's children going to a second school
    const sp = plan.open.includes(id) ? null : plan.split?.[town];
    const alt = sp && sp.school !== dest ? sp.school : null;
    for (const g of ["K", "1", "2", "3", "4", "5", "6"]) {
      const n = att[id][g];
      const moved = alt ? Math.round(n * sp.share) : 0;
      place(dest, g, n - moved);
      if (moved) place(alt, g, moved);
    }
  }
  return loads;
}

// A plan the district did not table, starting from the table for its two open schools: Brookside teaching
// grades 5-6 takes the table's Crossett Brook 5th and 6th graders, and a Pre-K center or a split town moves
// the children the model moves for it (this year's students), so the table's own counts stay where nothing
// changes.
export function adjustedLoads(plan, table) {
  const loads = tableLoads(table);
  if (plan.bpsTop === 6 && loads.CBMS) {
    for (const [g, n] of Object.entries(loads.CBMS)) add(loads, "BPS", g, n);
    loads.CBMS = {};
  }
  const now = modelLoads(plan);
  const before = modelLoads({ ...plan, prekCenter: null, split: {} });
  for (const id of new Set([...Object.keys(now), ...Object.keys(before)])) {
    for (const g of new Set([...Object.keys(now[id] ?? {}), ...Object.keys(before[id] ?? {})])) {
      const d = (now[id]?.[g] ?? 0) - (before[id]?.[g] ?? 0);
      if (!d) continue;
      loads[id] ??= {};
      const n = Math.max(0, (loads[id][g] ?? 0) + d);
      if (n) loads[id][g] = n;
      else delete loads[id][g];
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
  const exact = districtTableFor(plan);
  const table = exact ?? pairTable(plan);
  const loads = exact ? tableLoads(exact) : table ? adjustedLoads(plan, table) : modelLoads(plan);
  // The Pre-K cut (Path A) ends Pre-K classes in district buildings.
  if (plan.cuts.includes("prek")) for (const id of Object.keys(loads)) delete loads[id].PK;
  // the buildings in use for elementary grades, plus a Pre-K center if the plan keeps one
  const ids = ["BPS", ...plan.open, ...(plan.prekCenter ? [plan.prekCenter.school] : [])];
  const totals = Object.fromEntries(ids.map((id) => [id, Object.values(loads[id] ?? {}).reduce((a, b) => a + b, 0)]));
  const valleyTotal = ids.filter((id) => id !== "BPS").reduce((a, id) => a + totals[id], 0);
  const schools = [];
  for (const id of ids) {
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
      center: plan.prekCenter?.school === id, // kept open for Pre-K only
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
  const middle = middleSchools(plan, cbms);
  return {
    source: exact ? "district" : table ? "adjusted" : "model", // adjusted: the district's table with this plan's changes
    reading,
    table,
    mismatches: table ? tableMismatches(table) : [],
    schools,
    cbms56: cbms,
    overPeople: schools.filter((s) => s.overPeople).map((s) => s.id),
    overRooms: schools.filter((s) => s.overRooms).map((s) => s.id),
    overConsultant: schools.filter((s) => s.overConsultant).map((s) => s.id),
    middle,
    overMiddle: middle.filter((m) => m.over).map((m) => m.id),
  };
}

// Crossett Brook and Harwood Middle against the consultant's classroom capacities. Crossett Brook holds
// the plan's grades 5-6 (the district's count where its table has one) plus its own 7th and 8th graders
// unless the middle schools merge; Harwood Middle holds its own 7-8, plus Crossett Brook's if they merge.
// The consultant's 166 for Harwood Middle counts the rooms it uses now in a building it shares with the
// high school, whose capacity the consultant left "TBD".
const ATT = ATTENDING[2026];
const CB_78 = ATT.CBMS[7] + ATT.CBMS[8];
const HU_78 = ATT.HU[7] + ATT.HU[8];
function middleSchools(plan, cbmsFromTable) {
  const cb56 = cbmsFromTable ?? Object.values(modelLoads(plan).CBMS ?? {}).reduce((a, b) => a + b, 0);
  return [
    // empty: Brookside teaches Crossett Brook's 5th and 6th graders, and the building holds no classes
    { id: "CBMS", grades: plan.msMerge ? "5-6" : "5-8", total: cb56 + (plan.msMerge ? 0 : CB_78), capacity: CONSULTANT_CAPACITY.schools.CBMS, empty: plan.bpsTop === 6 },
    { id: "HUMS", grades: "7-8", total: HU_78 + (plan.msMerge ? CB_78 : 0), capacity: CONSULTANT_CAPACITY.schools.HUMS },
  ].map((m) => ({ ...m, over: m.total > m.capacity }));
}
