// The board's November 4 scores and straw poll, added up. Pure functions over data/decision.js and the board's
// vote weights (js/model/vote.js), so the decision page and the tests share one set of numbers.

import { CRITERIA, SCORES, SCORE_PAIRS, STRAW_POLL } from "../../data/decision.js";
import { SEATS, TOTAL } from "./vote.js";

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
export const seatOf = (name) => SEATS.find((s) => s.name === name);

// A member's total for a pair (5 to 25).
export const memberTotal = (name, pair) => sum(SCORES.members[name][pair]);

// Each pair's total across all members, by criterion and overall, recounted from the members' scores.
export function pairTotals() {
  const names = Object.keys(SCORES.members);
  return SCORE_PAIRS.map((pair) => {
    const byCriterion = CRITERIA.map((_, i) => sum(names.map((n) => SCORES.members[n][pair][i])));
    const total = sum(byCriterion);
    return { pair, byCriterion, total, average: total / names.length, published: SCORES.published[pair], members: names.length };
  }).sort((a, b) => b.total - a.total);
}

// Which of two pairs a member's own sheet scores higher: the pair, or "tie".
export function sheetPick(name, [a, b] = STRAW_POLL.choices) {
  const ta = memberTotal(name, a);
  const tb = memberTotal(name, b);
  return ta === tb ? "tie" : ta > tb ? a : b;
}

// One row per member: town and vote weight, their totals for the two pairs in the poll, the pair their sheet favors,
// and how they answered. weight is in hundredths of a point, as in vote.js.
export function memberRows() {
  const [a, b] = STRAW_POLL.choices;
  return STRAW_POLL.votes.map((v) => {
    const seat = seatOf(v.name);
    const pick = sheetPick(v.name);
    return {
      ...v,
      town: seat.town,
      weight: seat.weight,
      scores: { [a]: memberTotal(v.name, a), [b]: memberTotal(v.name, b) },
      pick,
      matches: v.vote == null ? null : pick === "tie" ? null : v.vote === pick,
    };
  });
}

// Members and weighted points for each answer, two ways: as answered, and as each member's own sheet ranks the two
// pairs (with or without the chair, who did not vote).
export function pollTally() {
  const rows = memberRows();
  const count = (list, key) => {
    const out = Object.fromEntries(STRAW_POLL.choices.map((c) => [c, { members: 0, points: 0, names: [] }]));
    for (const r of list) {
      const c = r[key];
      if (!out[c]) continue;
      out[c].members++;
      out[c].points += r.weight;
      out[c].names.push(r.name);
    }
    return out;
  };
  const voters = rows.filter((r) => r.vote != null);
  const chair = rows.find((r) => r.vote == null);
  return {
    asVoted: count(voters, "vote"),
    bySheets: count(voters, "pick"),
    bySheetsWithChair: count(rows, "pick"),
    chair,
    against: voters.filter((r) => r.matches === false),
    total: TOTAL,
  };
}
