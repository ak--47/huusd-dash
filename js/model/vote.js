// Weighted board votes. Each member's vote counts for their town's weight (the board's 2021 weights, a
// share of 100 points; Articles of Agreement, Article 7). Points are kept in hundredths, as whole numbers,
// so two-thirds never rounds: every total is a multiple of 0.05 and never lands on 66.666...
//
// Two readings of what a vote needs, because the Articles say only "an affirmative vote of two-thirds of the
// Board of Directors" for a closure, and nothing for other motions:
//   board: Yes points against all 100 points (an absent or abstaining member counts like a No).
//   cast:  Yes points against the Yes and No points of members who vote.

import { BOARD } from "../../data/schools.js";

export const TOTAL = 10000;

// One row per member: largest weight first, then by town, then in the order of the minutes.
export const SEATS = BOARD.seats
  .slice()
  .sort((a, b) => b.weight - a.weight || a.town.localeCompare(b.town))
  .flatMap((s) =>
    BOARD.members[s.town].map((name, i) => ({ id: `${s.town.toLowerCase()}-${i + 1}`, town: s.town, name, weight: Math.round(s.weight * 100) }))
  );

// closure: at least two-thirds (Article 6(E)). majority: more than half (our assumption; a tie fails).
export const RULES = {
  closure: { id: "closure", num: 2, den: 3, strict: false },
  majority: { id: "majority", num: 1, den: 2, strict: true },
};

export const VOTES = ["yes", "no", "absent"];

export const meets = (yes, base, rule) => (rule.strict ? yes * rule.den > base * rule.num : yes * rule.den >= base * rule.num);

// The smallest Yes total that passes on the whole-board reading, in hundredths (6667 for two-thirds, 5001 for a majority).
export const boardNeed = (rule) => {
  const n = (TOTAL * rule.num) / rule.den;
  return rule.strict ? Math.floor(n) + 1 : Math.ceil(n);
};

export function tally(votes, seats = SEATS) {
  const t = { yes: 0, no: 0, absent: 0, unset: 0, count: { yes: 0, no: 0, absent: 0, unset: 0 } };
  for (const s of seats) {
    const v = VOTES.includes(votes[s.id]) ? votes[s.id] : "unset";
    t[v] += s.weight;
    t.count[v]++;
  }
  return t;
}

// "pass", "fail", or "open" (it depends on members whose vote is not set) under each reading.
export function outcome(t, rule) {
  const board = meets(t.yes, TOTAL, rule) ? "pass" : meets(t.yes + t.unset, TOTAL, rule) ? "open" : "fail";
  // Worst case for passing: every member not set votes No. Best case: every one votes Yes.
  const worst = t.yes > 0 && meets(t.yes, t.yes + t.no + t.unset, rule);
  const best = t.yes + t.unset > 0 && meets(t.yes + t.unset, t.yes + t.no + t.unset, rule);
  const cast = worst ? "pass" : best ? "open" : "fail";
  return { board, cast };
}

// On the whole-board reading: the fewest members whose Yes votes pass (largest weights first), the most members
// whose Yes votes still fall short (smallest first), and the fewest members whose No votes or absences stop it.
export function extremes(rule, seats = SEATS) {
  const desc = seats.slice().sort((a, b) => b.weight - a.weight);
  const asc = desc.slice().reverse();
  const pts = (list) => list.reduce((a, s) => a + s.weight, 0);
  const pass = [];
  for (const s of desc) {
    pass.push(s);
    if (meets(pts(pass), TOTAL, rule)) break;
  }
  const short = [];
  for (const s of asc) {
    if (meets(pts(short) + s.weight, TOTAL, rule)) break;
    short.push(s);
  }
  const block = [];
  for (const s of desc) {
    block.push(s);
    if (!meets(TOTAL - pts(block), TOTAL, rule)) break;
  }
  return {
    pass: { seats: pass, points: pts(pass) },
    short: { seats: short, points: pts(short) },
    block: { seats: block, points: pts(block) },
  };
}

// Votes in a link: one letter per seat in SEATS order (y, n, a; "-" for not set). "" when nothing is set.
const CODE = { yes: "y", no: "n", absent: "a" };
const DECODE = { y: "yes", n: "no", a: "absent" };

export function encodeVotes(votes, seats = SEATS) {
  const s = seats.map((x) => CODE[votes[x.id]] ?? "-").join("");
  return s.replace(/-+$/, "");
}

export function decodeVotes(str, seats = SEATS) {
  const out = {};
  [...(str ?? "")].slice(0, seats.length).forEach((c, i) => {
    if (DECODE[c]) out[seats[i].id] = DECODE[c];
  });
  return out;
}
