import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { CRITERIA, MEETING_1104, SCORES, SCORE_PAIRS, STRAW_POLL } from "../data/decision.js";
import { BOARD } from "../data/schools.js";
import * as D from "../js/model/decision.js";
import * as M from "../js/model/index.js";

const norm = (s) => s.replace(/\s+/g, " ").trim();

test("every November 4 quote appears in the cached transcript, piece by piece", () => {
  const transcript = norm(readFileSync(new URL("../sources/2026-11-04-board-meeting/meeting-transcript.txt", import.meta.url), "utf8"));
  for (const g of MEETING_1104.groups) {
    for (const q of g.items) {
      for (const piece of q.text.split("...").map(norm).filter(Boolean)) {
        assert.ok(transcript.includes(piece), `not in the transcript (${q.who}): "${piece}"`);
      }
    }
  }
});

test("score sheets: every board member, every pair, five scores from 1 to 5", () => {
  const names = Object.values(BOARD.members).flat().sort();
  assert.deepEqual(Object.keys(SCORES.members).sort(), names);
  for (const [name, rows] of Object.entries(SCORES.members)) {
    assert.deepEqual(Object.keys(rows).sort(), [...SCORE_PAIRS].sort(), name);
    for (const s of Object.values(rows)) {
      assert.equal(s.length, CRITERIA.length);
      for (const x of s) assert.ok(Number.isInteger(x) && x >= 1 && x <= 5, name);
    }
  }
});

test("recounted totals match the district's dashboard, except the two cells its formula missed", () => {
  const t = Object.fromEntries(D.pairTotals().map((p) => [p.pair, p.total]));
  assert.deepEqual(t, { "WES+WRN": 248, "MES+WRN": 241, "MES+WES": 223, "FES+WRN": 180, "FES+WES": 176, "FES+MES": 166 });
  for (const p of SCORE_PAIRS) assert.ok(t[p] - SCORES.published[p] <= 1, p);
  // the two finalists: Waitsfield + Warren's lead is all in the kitchen column
  const [wes, mes] = ["WES+WRN", "MES+WRN"].map((id) => D.pairTotals().find((p) => p.pair === id).byCriterion);
  assert.deepEqual(wes, [45, 48, 64, 40, 51]);
  assert.deepEqual(mes, [53, 49, 35, 52, 52]);
});

test("straw poll: 9 to 4 as announced, 64.45 weighted points; by members' own sheets 7 to 6 the other way", () => {
  assert.equal(STRAW_POLL.votes.length, 14);
  const t = D.pollTally();
  assert.equal(t.asVoted["MES+WRN"].members, 9);
  assert.equal(t.asVoted["WES+WRN"].members, 4);
  assert.equal(t.asVoted["MES+WRN"].points, 6445);
  assert.equal(t.asVoted["WES+WRN"].points, 2835);
  assert.equal(t.chair.name, "Ashley Woods");
  assert.equal(t.chair.weight, 720);
  assert.equal(t.bySheets["WES+WRN"].members, 7);
  assert.equal(t.bySheets["MES+WRN"].members, 6);
  assert.equal(t.bySheets["WES+WRN"].points, 5505);
  assert.equal(t.bySheetsWithChair["WES+WRN"].points, 6225);
  assert.deepEqual(t.against.map((r) => r.name).sort(), ["Jillan Cantor-Sackett", "Macon Phillips", "Robert Dabrowski"]);
  // no member voted for Waitsfield + Warren against their own sheet
  assert.ok(t.against.every((r) => r.vote === "MES+WRN"));
  // two-thirds of the whole board is 66.67 points
  assert.ok(t.asVoted["MES+WRN"].points < 6667);
});

test("Pre-K to 4 tables: the K-4 shares each implies", () => {
  assert.deepEqual(M.DISTRICT_SHARES_K4["MES+WRN"], { fayston: { MES: 0.09 }, waitsfield: { MES: 0.09 } });
  assert.deepEqual(M.DISTRICT_SHARES_K4["WES+WRN"], { fayston: { WRN: 0.03 }, moretown: { BPS: 0.14 } });
  // the K-6 shares are unchanged
  assert.deepEqual(M.DISTRICT_SHARES["MES+WRN"], { fayston: { MES: 0.07 }, waitsfield: { MES: 0.07 } });
});

test("grades 5-6 center: savings, buildings, and where children go", () => {
  const want = { WES: [3733431, 457], WRN: [3745948, 470], MES: [3743601, 497] };
  for (const [c, [savings, moved]] of Object.entries(want)) {
    const open = ["MES", "WES", "WRN"].filter((x) => x !== c);
    const p = M.makePlan({ open, valleyTop: 4, msMerge: true, center56: c });
    assert.equal(p.center56, c);
    const r = M.evaluate(p);
    assert.equal(r.budget.savings, savings, c);
    assert.equal(r.budget.upperBound, false);
    assert.equal(r.buildingsOpen, 5);
    assert.deepEqual(r.closed, ["FES"]);
    assert.equal(r.moved.k12, moved, c);
    assert.equal(r.capacity.source, "model");
    assert.equal(r.capacity.schools.find((s) => s.id === c).total, 256);
    assert.equal(r.capacity.middle.find((m) => m.id === "CBMS").empty, true);
    // a Waterbury 4th grader goes to the center for grades 5 and 6, then Harwood
    assert.equal(M.schoolFor(p, { town: "waterbury", grade: 4, school: "BPS" }, 2027), c);
    assert.equal(M.schoolFor(p, { town: "waterbury", grade: 5, school: "CBMS" }, 2027), c);
    assert.equal(M.schoolFor(p, { town: "waterbury", grade: 5, school: "CBMS" }, 2028), "HUMS");
    assert.equal(M.decodePlan(M.encodePlan(p)).center56, c);
  }
  // only with Pre-K to 4 valley schools, the merger, and a closed valley building
  assert.equal(M.makePlan({ open: ["MES", "WRN"], valleyTop: 6, msMerge: true, center56: "WES" }).center56, null);
  assert.equal(M.makePlan({ open: ["MES", "WRN"], valleyTop: 4, center56: "WES" }).center56, null);
  assert.equal(M.makePlan({ open: ["MES", "WES", "WRN"], valleyTop: 4, msMerge: true, center56: "WES" }).center56, null);
  // the Options card's first version is Waitsfield's
  const o = M.OPTIONS.find((x) => x.id === "center56");
  assert.equal(M.encodePlan(o.plan), "o=MR&t=4&m=1&f=W");
  assert.deepEqual(o.versions.map((v) => v.center56), ["WES", "WRN", "MES"]);
});
