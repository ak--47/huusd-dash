import test from "node:test";
import assert from "node:assert/strict";

import { DISTRICT_TABLES, RECEIVING, PAIRS } from "../data/district-scenarios.js";
import { ATTENDING, RESIDENTS_2026, PREK_2026, ENROLLMENT_FACTS } from "../data/enrollment.js";
import { BUDGET, PATH_A_CUTS, PATH_B_SAVINGS } from "../data/budget.js";
import { BOARD } from "../data/schools.js";
import * as M from "../js/model/index.js";

const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);

test("enrollment rows add up to the report's printed totals", () => {
  for (const year of [2024, 2025, 2026]) {
    let all = 0;
    for (const [id, rows] of Object.entries(ATTENDING[year])) {
      assert.equal(sum(rows), ATTENDING.printedTotals[year][id], `${year} ${id}`);
      all += sum(rows);
    }
    assert.equal(all, ATTENDING.printedTotals[year].all, `${year} total`);
  }
  const valley = ["FES", "MES", "WES", "WRN"].reduce((a, id) => a + sum(ATTENDING[2026][id]), 0);
  assert.equal(valley, ENROLLMENT_FACTS.valleyK6_2026);
});

test("resident table columns are internally consistent", () => {
  for (const [id, rows] of Object.entries(RESIDENTS_2026)) {
    if (id === "src" || id === "columns") continue;
    for (const [g, [active, out, attendingRes, idcIn, tuition, total]] of Object.entries(rows)) {
      assert.equal(active - out, attendingRes, `${id} ${g} residents minus IDC out`);
      assert.equal(attendingRes + idcIn + tuition, total, `${id} ${g} total`);
      if (ATTENDING[2026][id]) assert.equal(total, ATTENDING[2026][id][g], `${id} ${g} matches attending`);
    }
  }
  assert.equal(sum(Object.fromEntries(Object.entries(PREK_2026.bySchool).map(([k, v]) => [k, v.PK3 + v.PK4]))), PREK_2026.inDistrict);
});

test("district tables: every table but Fayston + Warren adds up; that one's totals row does not", () => {
  for (const t of DISTRICT_TABLES) {
    const bad = M.tableMismatches(t);
    const isFW = t.pair.includes("FES") && t.pair.includes("WRN");
    if (isFW) {
      assert.deepEqual(bad.map((b) => b.school).sort(), ["BPS", "FES", "WRN"]);
      assert.equal(bad.find((b) => b.school === "BPS").rows, 439);
      assert.equal(bad.find((b) => b.school === "BPS").printed, 513);
    } else {
      assert.deepEqual(bad, [], t.id);
    }
    // grade totals in the printed grand total always match the rows
    const loads = M.tableLoads(t);
    const grand = Object.values(loads).reduce((a, s) => a + sum(s), 0);
    assert.equal(grand, t.printedTotal.all, `${t.id} grand total`);
  }
});

test("nearest-school rule reproduces where the district tables send each closed town", () => {
  for (const [key, towns] of Object.entries(RECEIVING)) {
    const plan = M.makePlan({ open: key.split("+"), valleyTop: 6, msMerge: true });
    for (const [town, school] of Object.entries(towns)) assert.equal(M.receivingSchool(plan, town), school, `${key} ${town}`);
  }
  assert.equal(PAIRS.length, 6);
});

test("Path A cuts and Path B savings add up to the printed totals", () => {
  assert.equal(PATH_A_CUTS.items.reduce((a, c) => a + c.amount, 0), PATH_A_CUTS.total);
  assert.equal(PATH_A_CUTS.total, BUDGET.requiredCut);
  assert.equal(PATH_B_SAVINGS.valley.amount + PATH_B_SAVINGS.middle.amount, PATH_B_SAVINGS.total);
  const ls = BUDGET.scenarios.find((s) => s.id === "level-service").budget;
  assert.equal(ls - BUDGET.requiredCut, BUDGET.fy27);
  assert.equal(ls - PATH_B_SAVINGS.total, BUDGET.scenarios.find((s) => s.id === "consolidation").budget);
});

test("per-pupil line reproduces the district's level-funded and Path B cards", () => {
  const a = M.budget(M.PLAN_A);
  assert.ok(Math.abs(a.vsThreshold - -25.67) < 0.01, `Path A ${a.vsThreshold}`);
  const b = M.budget(M.pathB(["MES", "WRN"], 4));
  assert.ok(Math.abs(b.perPupil - 16306.24) < 0.01, `Path B ${b.perPupil}`);
  assert.equal(b.penalty, 0);
  assert.equal(b.gap, -590196);
  const none = M.budget(M.PLAN_TODAY);
  assert.ok(none.vsThreshold > 1081, "no-change overage on the corrected basis is above the printed $1,081");
  assert.ok(Math.abs(M.PUPILS - BUDGET.scenarios[0].penalty / BUDGET.scenarios[0].perPupilVsThreshold) < 1, "pupil count matches the penalty card");
});

test("valley savings: district figure for two closures, scaled estimate otherwise", () => {
  assert.deepEqual(M.valleySavings(2), { amount: 1826527, fte: 16, kind: "district" });
  assert.equal(M.valleySavings(1).kind, "estimate");
  assert.equal(M.valleySavings(0).amount, 0);
});

test("journeys: today's paths have three K-12 schools", () => {
  for (const [town, school] of [["waitsfield", "WES"], ["waterbury", "BPS"], ["moretown", "MES"], ["warren", "WRN"], ["fayston", "FES"]]) {
    const c = M.journeyCounts(M.journey(M.PLAN_TODAY, { town, grade: 0, school }));
    assert.equal(c.schools, 3, town);
  }
});

test("journeys: a Waitsfield kindergartner whose school closes, Pre-K to 4 setup", () => {
  const plan = M.pathB(["MES", "WRN"], 4);
  const years = M.journey(plan, { town: "waitsfield", grade: 0, school: "WES" });
  const k12 = years.filter((y) => y.grade >= 0).map((y) => y.school);
  assert.deepEqual(k12, ["WES", "WRN", "WRN", "WRN", "WRN", "CBMS", "CBMS", "HUMS", "HUMS", "HUHS", "HUHS", "HUHS", "HUHS"]);
  const c = M.journeyCounts(years);
  assert.equal(c.schools, 5);
  assert.equal(c.buildings, 4);
  const withPk = M.journeyCounts(M.journey(plan, { town: "waitsfield", grade: 0, school: "WES", pk: "WRN" }), { includePreK: true });
  assert.equal(withPk.schools, 5, "Pre-K at Warren is the same school as grades 1-4");
  const withOther = M.journeyCounts(M.journey(plan, { town: "waitsfield", grade: 0, school: "WES", pk: "MES" }), { includePreK: true });
  assert.equal(withOther.schools, 6, "Pre-K elsewhere makes six");
});

test("journeys: the middle school merger adds Harwood Middle for Waterbury children", () => {
  const plan = M.pathB(["MES", "WRN"], 6);
  const c = M.journeyCounts(M.journey(plan, { town: "waterbury", grade: 2, school: "BPS" }));
  assert.equal(c.schools, 4);
  const eighth = M.journeyCounts(M.journey(plan, { town: "waterbury", grade: 8, school: "CBMS" }));
  assert.equal(eighth.schools, 3, "this year's 8th graders go straight to the high school");
});

test("journeys: an intradistrict-choice child stays at an open school", () => {
  const plan = M.pathB(["FES", "WRN"], 6);
  const years = M.journey(plan, { town: "waitsfield", grade: 2, school: "FES" });
  assert.ok(years.filter((y) => y.grade >= 0 && y.grade <= 6).every((y) => y.school === "FES"));
});

test("journeys: Moretown children go to Brookside when Moretown and Waitsfield both close", () => {
  const plan = M.pathB(["FES", "WRN"], 6);
  const k12 = M.journey(plan, { town: "moretown", grade: 1, school: "MES" }).filter((y) => y.grade >= 0).map((y) => y.school);
  assert.deepEqual(k12.slice(0, 7), ["MES", "MES", "BPS", "BPS", "BPS", "CBMS", "CBMS"]);
});

test("plans round-trip through share links", () => {
  const p = M.makePlan({ open: ["WES", "MES"], valleyTop: 4, msMerge: true, cuts: ["prek", "electives"], septicWES: true, portables: { WES: 2 }, receiving: { fayston: "WES" } });
  const q = M.decodePlan(M.encodePlan(p));
  assert.deepEqual(q.open, p.open);
  assert.equal(q.valleyTop, 4);
  assert.deepEqual(q.cuts, ["prek", "electives"]);
  assert.equal(q.septicWES, true);
  assert.deepEqual(q.portables, { WES: 2 });
  assert.deepEqual(q.receiving, { fayston: "WES" });
  assert.equal(M.matchNamed(M.pathB(["WRN", "MES"], 4))?.id, "B:MES+WRN:PK4");
});

test("capacity: the district's own wastewater verdicts, except Fayston + Warren", () => {
  const verdict = (pair, top) => M.capacity(M.pathB(pair, top)).overPeople;
  assert.deepEqual(verdict(["MES", "WRN"], 4), []);
  assert.deepEqual(verdict(["MES", "WES"], 4), []);
  assert.deepEqual(verdict(["MES", "FES"], 4), []);
  assert.deepEqual(verdict(["WES", "WRN"], 4), ["WES"]);
  assert.deepEqual(verdict(["WES", "FES"], 4), ["WES"]);
  assert.deepEqual(verdict(["MES", "WRN"], 6), ["WRN"]);
  assert.deepEqual(verdict(["MES", "WES"], 6), ["WES"]);
  assert.deepEqual(verdict(["MES", "FES"], 6), ["FES"]);
  // the slide says Brookside exceeds 480; its own rows add to 439
  assert.deepEqual(verdict(["FES", "WRN"], 4), []);
  assert.deepEqual(verdict(["FES", "WRN"], 6), []);
  // Waitsfield's permit at 300 clears the Pre-K-4 pairings and Waitsfield + Moretown K-6
  const septic = (pair, top) => M.capacity(M.makePlan({ ...M.pathB(pair, top), septicWES: true })).overPeople;
  assert.deepEqual(septic(["WES", "WRN"], 4), []);
  assert.deepEqual(septic(["WES", "FES"], 4), []);
  assert.deepEqual(septic(["MES", "WES"], 6), []);
  assert.deepEqual(septic(["WES", "WRN"], 6), ["WES"]);
});

test("next-fall moves: no change moves nobody; Path A moves only Pre-K", () => {
  assert.equal(M.movedNextFall(M.PLAN_TODAY).total, 0);
  const a = M.movedNextFall(M.PLAN_A);
  assert.equal(a.k12, 0);
  assert.equal(a.preK, PREK_2026.bySchool.BPS.PK3 + PREK_2026.bySchool.MES.PK3 + PREK_2026.bySchool.WRN.PK3);
  const b = M.movedNextFall(M.pathB(["MES", "WRN"], 6));
  assert.equal(b.byReason.middle, 67 + 63, "Crossett Brook's grade 6 and 7 move to Harwood");
});

test("board vote weights add to 100", () => {
  assert.equal(BOARD.seats.reduce((a, s) => a + s.members * s.weight, 0), 100);
});

test("draft roadmap: a new valley school in fall 2029 makes six schools for some of today's kindergartners", () => {
  const b = M.pathB(["MES", "WRN"], 4);
  const r = M.withRoadmap(b);
  const k12 = M.journey(r, { town: "waitsfield", grade: 0, school: "WES" }).filter((y) => y.grade >= 0).map((y) => y.school);
  assert.deepEqual(k12, ["WES", "WRN", "WRN", "NEW", "NEW", "CBMS", "CBMS", "HUMS", "HUMS", "HUHS", "HUHS", "HUHS", "HUHS"]);
  assert.equal(M.journeyCounts(M.journey(r, { town: "waitsfield", grade: 0, school: "WES" })).schools, 6);
  // the roadmap's author counted "four transitions" for a Waitsfield 2nd grader whose school closes,
  // and three if it stays open (October 28 meeting); the model agrees
  assert.equal(M.journeyCounts(M.journey(r, { town: "waitsfield", grade: 2, school: "WES" })).moves, 4);
  assert.equal(M.journeyCounts(M.journey(M.withRoadmap(M.pathB(["MES", "WES"], 4)), { town: "waitsfield", grade: 2, school: "WES" })).moves, 3);
  // a Moretown child whose school stays open in fall 2027 still moves in fall 2029
  assert.equal(M.journeyCounts(M.journey(r, { town: "moretown", grade: 0, school: "MES" })).schools, 5);
  // with the new school teaching Pre-K to 5 (Phase 2 text), a kindergartner whose school closes still attends six
  assert.equal(M.journeyCounts(M.journey(M.withRoadmap(b, 5), { town: "waitsfield", grade: 0, school: "WES" })).schools, 6);
  // with the new school teaching grades 5 and 6 too, the Crossett Brook year disappears
  assert.equal(M.journeyCounts(M.journey(M.withRoadmap(b, 6), { town: "waitsfield", grade: 0, school: "WES" })).schools, 5);
  // Waterbury children are unaffected by the valley move
  assert.equal(M.journeyCounts(M.journey(r, { town: "waterbury", grade: 0, school: "BPS" })).schools, 4);
  // the roadmap round-trips through share links
  assert.deepEqual(M.decodePlan(M.encodePlan(r)).roadmap, { fall: 2029, top: 4 });
  // the plan in fall 2027 is unchanged; fall 2029 is one valley school
  assert.deepEqual(M.planAt(r, 2027).open, ["MES", "WRN"]);
  assert.deepEqual(M.planAt(r, 2029).open, ["NEW"]);
});

test("bond-exclusion basis: the target falls by about $500,000", () => {
  assert.ok(Math.abs(M.TARGET_WITH_EXCLUSION - 2839080) < 500, `target ${M.TARGET_WITH_EXCLUSION}`);
  const a = M.budget(M.PLAN_A, { basis: "exclusion" });
  assert.ok(Math.abs(a.vsThreshold - -220.67) < 0.01, "Path A lands $220.67 under, the district's pre-correction figure");
  const none = M.budget(M.PLAN_TODAY, { basis: "exclusion" });
  assert.ok(Math.abs(none.vsThreshold - 1081.19) < 1, `no change is ~$1,081 over on this basis (${none.vsThreshold})`);
  const ms = M.budget(M.makePlan({ msMerge: true, open: ["FES", "MES", "WRN"] }), { basis: "exclusion" });
  assert.ok(ms.gap < 0, "merging the middle schools and closing one valley school meets the lower target (estimate)");
});

test("capacity, permit reading: each permit's own wording, staff counted where the permit counts them", () => {
  const permits = (pair, top) => M.capacity(M.pathB(pair, top), { reading: "permits" }).overPeople;
  // Warren's permit is 237 students AND staff: 227 students alone nearly fill it
  assert.deepEqual(permits(["MES", "WRN"], 4), ["WRN"]);
  // Waitsfield's 1991 permit allows a student population of 300
  assert.deepEqual(permits(["MES", "WES"], 4), []);
  assert.deepEqual(permits(["WES", "WRN"], 4), []);
  assert.deepEqual(permits(["MES", "WES"], 6), []);
  // the verdicts that depend on staff hold even at today's staff levels
  const wrn = M.capacity(M.pathB(["MES", "WRN"], 4), { reading: "permits" }).schools.find((s) => s.id === "WRN");
  assert.ok(wrn.total + 25.63 > 237, "Warren is over with today's staff, before any growth");
  // with all four schools open, staff are today's
  const today = M.capacity(M.PLAN_TODAY, { reading: "permits" });
  assert.equal(today.schools.find((s) => s.id === "FES").staff, 25.63);
  assert.deepEqual(today.overPeople, []);
});

test("capacity, consultant classrooms: every Path B version needs room at a receiving school", () => {
  for (const p of M.PATH_B_PLANS) assert.ok(M.capacity(p).overConsultant.length > 0, p.id);
  // today only Moretown is over, 169 including Pre-K against 165
  assert.deepEqual(M.capacity(M.PLAN_TODAY).overConsultant, ["MES"]);
  // a portable unit adds two classrooms of 20
  const plan = M.makePlan({ ...M.pathB(["MES", "WES"], 4), portables: { WES: 2 } });
  assert.deepEqual(M.capacity(plan).overConsultant, [], "Waitsfield 220 fits 174 + 80");
});

test("capacity: the Pre-K cut takes Pre-K out of the buildings", () => {
  // Path A ends district Pre-K classes, so Moretown's 32 Pre-K children no longer count: 137 fits 165
  assert.deepEqual(M.capacity(M.PLAN_A).overConsultant, []);
  assert.equal(M.capacity(M.PLAN_A).schools.find((s) => s.id === "MES").total, 137);
});

test("capacity, middle schools: the merger puts about 257 7th and 8th graders at Harwood", () => {
  const harwood = (p) => M.capacity(p).middle.find((m) => m.id === "HUMS");
  assert.equal(harwood(M.PLAN_TODAY).total, ATTENDING[2026].HU[7] + ATTENDING[2026].HU[8]);
  for (const p of M.PATH_B_PLANS) assert.deepEqual(M.capacity(p).overMiddle, ["HUMS"], p.id);
  assert.equal(harwood(M.pathB(["MES", "WES"], 4)).total, 257);
  // closing two valley schools without the merger fills Crossett Brook instead: 261 + 125 against 359
  const two = M.capacity(M.makePlan({ open: ["MES", "WRN"], valleyTop: 4 }));
  assert.deepEqual(two.overMiddle, ["CBMS"]);
  assert.equal(two.middle.find((m) => m.id === "CBMS").total, 386);
});

test("savings: keeping grades 5-6 in the valley makes the middle-school figure an upper limit", () => {
  // On October 28 the administration said those versions would not reach the full $3.9 million.
  for (const p of M.PATH_B_PLANS) {
    const b = M.budget(p);
    assert.equal(b.savings, PATH_B_SAVINGS.total, p.id);
    assert.equal(b.upperBound, p.valleyTop === 6, p.id);
    assert.equal(b.hasEstimate, p.valleyTop === 6, p.id);
  }
  assert.equal(M.budget(M.PLAN_A).upperBound, false);
});

test("valley schools through grade 5: 6th graders go to Crossett Brook", () => {
  const plan = M.makePlan({ open: ["MES", "WES", "WRN"], valleyTop: 5, msMerge: true });
  assert.equal(plan.valleyTop, 5);
  assert.equal(M.decodePlan(M.encodePlan(plan)).valleyTop, 5, "share links keep grade 5");
  assert.equal(M.makePlan({ valleyTop: 9 }).valleyTop, 6, "anything else falls back to 6");
  assert.equal(M.defaultSchool(plan, "moretown", 5), "MES");
  assert.equal(M.defaultSchool(plan, "moretown", 6), "CBMS");
  // no district table for this setup, so the counts are the model's own
  assert.equal(M.capacity(M.makePlan({ open: ["MES", "WRN"], valleyTop: 5, msMerge: true })).source, "model");
  // the district's savings assume every valley 5th and 6th grader moves, so this is an upper limit too
  assert.equal(M.budget(plan).upperBound, true);
  const cb = M.capacity(plan).middle.find((m) => m.id === "CBMS");
  assert.ok(cb.total > 131 && cb.total < 256, `Crossett Brook holds its own 5th-6th graders plus valley 6th graders (${cb.total})`);
});

test("closing one school: savings are half the two-school figure, as an estimate", () => {
  const one = M.budget(M.makePlan({ open: ["MES", "WES", "WRN"], msMerge: true }));
  const valley = one.items.find((i) => i.id === "valley");
  assert.equal(valley.amount, Math.round(PATH_B_SAVINGS.valley.amount / 2));
  assert.equal(valley.kind, "estimate");
});

test("merger with three smaller cuts: meets the target on paper with no closure, as an upper limit", () => {
  const o = M.OPTIONS.find((x) => x.id === "MS+cuts");
  const b = M.budget(o.plan);
  assert.equal(b.savings, 3516215);
  assert.equal(b.gap, -176942);
  assert.equal(b.upperBound, true, "the merger figure assumes valley 5th and 6th graders fill Crossett Brook");
  // break-even for the merger alone
  assert.equal(M.TARGET - (583516 + 517000 + 312757), 1926000);
  assert.equal(M.evaluate(o.plan).moved.k12, 130);
});

test("Pre-K center: a closed valley building kept for Pre-K, with its operating costs given back", () => {
  const plan = M.makePlan({ open: ["WES", "WRN"], msMerge: true, prekCenter: { school: "MES", scope: "all" }, split: { fayston: { school: "WRN", share: 0.5 } } });
  assert.deepEqual(plan.prekCenter, { school: "MES", scope: "all" });
  assert.equal(M.decodePlan(M.encodePlan(plan)).prekCenter.school, "MES", "share links keep the center");
  const r = M.evaluate(plan);
  assert.equal(r.buildingsOpen, 6, "Moretown's building stays in use");
  assert.equal(r.budget.savings, 2102942 + 1826527 - 185868);
  const mes = r.capacity.schools.find((s) => s.id === "MES");
  assert.equal(mes.total, PREK_2026.bySchool.BPS.PK3 + PREK_2026.bySchool.BPS.PK4 + 64, "all of this year's district Pre-K children");
  assert.equal(r.capacity.schools.find((s) => s.id === "WES").byGrade.PK, undefined, "no Pre-K classes in the K-6 schools");
  // a Waterbury 3-year-old goes to the center for Pre-K, then back to Brookside
  const years = M.journey(plan, { town: "waterbury", grade: -2, school: "BPS" }).map((y) => y.school);
  assert.ok(years.includes("MES") && years.includes("BPS"));
  // not with the Pre-K tuition cut, and not for a school that stays open
  assert.equal(M.makePlan({ open: ["WES", "WRN"], cuts: ["prek"], prekCenter: { school: "MES" } }).prekCenter, null);
  assert.equal(M.makePlan({ prekCenter: { school: "MES" } }).prekCenter, null);
});

test("split: part of a closed town's children go to a second school", () => {
  const all = M.capacity(M.makePlan({ open: ["WES", "WRN"], msMerge: true }));
  const half = M.capacity(M.makePlan({ open: ["WES", "WRN"], msMerge: true, split: { fayston: { school: "WRN", share: 0.5 } } }));
  assert.equal(all.source, "district");
  assert.equal(half.source, "adjusted", "a split adjusts the district's table");
  const wrnGain = half.schools.find((s) => s.id === "WRN").total - M.capacity(M.makePlan({ open: ["WES", "WRN"], msMerge: true, split: { fayston: { school: "WES", share: 0.5 } } })).schools.find((s) => s.id === "WRN").total;
  assert.ok(wrnGain > 0, "Warren takes some Fayston children");
  assert.deepEqual(M.makePlan({ split: { fayston: { school: "WRN", share: 0.5 } } }).split, {}, "no split while Fayston is open");
});

test("option: close Fayston, Moretown as a Pre-K center, K-6 at Waitsfield, Warren, and Brookside, merge the middle schools", () => {
  const o = M.OPTIONS.find((x) => x.id === "B-center");
  const r = M.evaluate(o.plan);
  assert.equal(r.budget.savings, 3743601);
  // counts start from the district's Waitsfield + Warren K-6 table (Waitsfield 306, Warren 91, Brookside 297, Crossett Brook 137)
  assert.equal(r.capacity.source, "adjusted");
  assert.equal(r.capacity.schools.find((s) => s.id === "WES").total, 231);
  assert.deepEqual(r.capacity.overPeople, ["WES"], "1 over the slides' 230");
  assert.equal(r.capacity.schools.find((s) => s.id === "WRN").total, 120);
  assert.equal(r.capacity.schools.find((s) => s.id === "BPS").total, 480, "at its occupancy of 480, counting students only");
  assert.equal(r.capacity.schools.find((s) => s.id === "MES").total, 118);
  assert.equal(r.buildingsOpen, 5, "Crossett Brook's building holds no classes");
  assert.deepEqual(o.plan.portables, {}, "no portable classrooms, as its suggester asked");
  assert.deepEqual([...r.capacity.overConsultant].sort(), ["BPS", "WES"], "so both are over the consultant's classroom space");
  assert.equal(M.encodePlan(o.plan).toString(), "o=WR&t=6&m=1&b=6&k=MES.all&sp=fayston%7EWRN%7E33.moretown%7EBPS%7E33");
  assert.equal(r.capacity.middle.find((m) => m.id === "CBMS").total, 0);
  assert.equal(r.maxYoung.waterbury, 3, "Brookside, Harwood Middle, Harwood High");
  assert.equal(r.moved.byReasonK12.brookside, 64, "this year's Crossett Brook 5th graders finish grade 6 at Brookside");
  // the fallback: Crossett Brook keeps its 5th and 6th graders
  const fall = M.evaluate(M.makePlan({ ...o.plan, bpsTop: 4 }));
  assert.equal(fall.capacity.schools.find((s) => s.id === "BPS").total, 328);
  assert.equal(fall.capacity.middle.find((m) => m.id === "CBMS").total, 152);
  assert.equal(r.moved.k12 - fall.moved.k12, 64);
});

test("adjusted counts keep the district's table where the plan changes nothing", () => {
  const t = M.capacity(M.makePlan({ open: ["WES", "WRN"], msMerge: true }));
  // a split of zero children and no center: the same as the table
  const center = M.capacity(M.makePlan({ open: ["WES", "WRN"], msMerge: true, prekCenter: { school: "MES", scope: "valley" } }));
  for (const id of ["WES", "WRN", "BPS"]) {
    const k6 = (c) => Object.entries(c.schools.find((s) => s.id === id).byGrade).filter(([g]) => g !== "PK").reduce((a, [, n]) => a + n, 0);
    assert.equal(k6(center), k6(t), `${id} K-6 unchanged by a Pre-K center`);
  }
  assert.equal(center.schools.find((s) => s.id === "BPS").byGrade.PK, 60, "a valley-only center leaves Brookside's Pre-K");
  assert.equal(center.schools.find((s) => s.id === "MES").total, 64, "this year's valley district Pre-K children");
});

test("Brookside through grade 6: only with the merger and K-6 valley schools; links keep it", () => {
  const plan = M.makePlan({ open: ["WES", "WRN"], msMerge: true, bpsTop: 6 });
  assert.equal(plan.bpsTop, 6);
  assert.equal(M.decodePlan(M.encodePlan(plan)).bpsTop, 6);
  assert.equal(M.makePlan({ open: ["WES", "WRN"], bpsTop: 6 }).bpsTop, 4, "not without the merger");
  assert.equal(M.makePlan({ open: ["WES", "WRN"], msMerge: true, valleyTop: 4, bpsTop: 6 }).bpsTop, 4, "not when valley 5th graders go to Crossett Brook");
  const cap = M.capacity(plan);
  assert.equal(cap.source, "adjusted", "the district did not table it");
  assert.equal(cap.schools.find((s) => s.id === "BPS").total, 60 + 297 + 137, "the table's Brookside Pre-K-4 and Crossett Brook 5-6");
  assert.equal(cap.middle.find((m) => m.id === "CBMS").total, 0);
  // a Waterbury 3rd grader stays at Brookside through grade 6, then Harwood
  const years = M.journey(plan, { town: "waterbury", grade: 3, school: "BPS" }).map((y) => y.school);
  assert.ok(!years.includes("CBMS"));
  // Brookside 4th graders staying at Brookside are not counted as changing schools
  assert.equal(M.evaluate(plan).moved.byReasonK12.other, 0);
});
