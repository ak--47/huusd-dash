// The board's November 4 scores and straw poll, added up. Pure functions over data/decision.js and the board's
// vote weights (js/model/vote.js), so the decision page and the tests share one set of numbers.

import { CRITERIA, SCORES, SCORE_PAIRS, STRAW_POLL, VOTES_1118 } from "../../data/decision.js";
import { RULES, SEATS, TOTAL, meets } from "./vote.js";

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

// The November 18 roll calls. For each motion: one row per seat (in SEATS order) with the answer heard ("yes", "no",
// null for not heard, "chair" for the chair, who was not called), and the weighted totals in hundredths. "passes"
// is the attorney's rule, a majority of the weighted votes cast, checked even if every member not heard had voted
// No, so it does not depend on them. twoThirds* compare the same totals with the January 6 closure rule.
export function rollCall(id) {
  const m = VOTES_1118.motions.find((x) => x.id === id);
  const rows = SEATS.map((s) => ({ ...s, vote: s.name === VOTES_1118.chair ? "chair" : m.votes[s.name] ?? null }));
  const pts = (v) => rows.filter((r) => r.vote === v).reduce((a, r) => a + r.weight, 0);
  const n = (v) => rows.filter((r) => r.vote === v).length;
  const yes = pts("yes");
  const no = pts("no");
  const notHeard = pts(null);
  const chair = pts("chair");
  return {
    motion: m,
    rows,
    yes,
    no,
    notHeard,
    chair,
    count: { yes: n("yes"), no: n("no"), notHeard: n(null) },
    passes: meets(yes, yes + no + notHeard, RULES.majority),
    passesAsHeard: meets(yes, yes + no, RULES.majority),
    twoThirdsBoard: meets(yes, TOTAL, RULES.closure),
    twoThirdsCast: meets(yes, yes + no, RULES.closure),
  };
}
