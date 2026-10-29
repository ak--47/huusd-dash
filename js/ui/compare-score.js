// "Score the six pairings yourself": the homework sheet in the district's presentation (deck
// slide 34) with the data behind each of its criteria, plus two criteria this site adds. The reader
// scores 1-5; nothing is scored in advance. Scores stay in this browser (store key "scores").

import { BOARD_CRITERIA, PAIRS } from "../../data/district-scenarios.js";
import { ATTENDING } from "../../data/enrollment.js";
import { CONSULTANT_CAPACITY, FACILITIES, SCHOOLS, VALLEY } from "../../data/schools.js";
import { ref } from "../../data/sources.js";
import { evaluate, makePlan } from "../model/index.js";
import { h, listJoin, money, num, store } from "./dom.js";
import { cite, note, schoolShort, status, tag, term } from "./kit.js";
import {
  SETUPS,
  buildHref,
  childHref,
  closures,
  fiveByTownText,
  jumpTo,
  maxTownsText,
  pairId,
  pairLabel,
  pathBVersion,
  placeName,
  setupLabel,
  townName,
  getReading,
} from "./compare-versions.js";
import { cites, closeText, labeledCell } from "./compare-table.js";

const SCALE = [1, 2, 3, 4, 5];
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);

// Crossett Brook this year (October 1, 2026). The district's Pre-K to 4 tables leave Crossett Brook
// out, so with grades 5-6 there its count is calculated: its own 5th and 6th graders plus every
// valley 5th and 6th grader.
const ATT = ATTENDING[2026];
const CB_TODAY = sum(ATT.CBMS); // grades 5-8
const CB_OWN_56 = ATT.CBMS[5] + ATT.CBMS[6];
const VALLEY_56 = VALLEY.reduce((a, id) => a + ATT[id][5] + ATT[id][6], 0);
const CB_ALL_56 = CB_OWN_56 + VALLEY_56;
const CB_CAPACITY = CONSULTANT_CAPACITY.schools.CBMS;

// ---- what each pairing's data looks like ----

function pairData(pair) {
  const versions = Object.fromEntries(SETUPS.map((top) => [top, pathBVersion(pair, top)]));
  const res = Object.fromEntries(SETUPS.map((top) => [top, versions[top].r]));
  const reading = getReading();
  // Under the permits reading Waitsfield's limit is already 300, so there is no "if raised" variant.
  const septic =
    reading === "slides" && pair.includes("WES") ? Object.fromEntries(SETUPS.map((top) => [top, evaluate(makePlan({ ...versions[top].plan, septicWES: true }))])) : null;
  return { pair, id: pairId(pair), label: pairLabel(pair), versions, res, septic, reading, closed: closures(versions[4].plan) };
}

const schoolOf = (r, id) => r.capacity.schools.find((s) => s.id === id);
const keptIds = (d) => VALLEY.filter((id) => d.pair.includes(id)); // valley order: Fayston, Moretown, Waitsfield, Warren

// A small table that stacks into labeled rows in a narrow container. `widths` sets the first
// columns' widths where the even split does not suit (the wastewater table's short Limit column).
function miniTable(caption, head, rows, { widths = [] } = {}) {
  return h(
    "div",
    { class: "cmp-mini-wrap" },
    h(
      "table",
      { class: "wonk-table cmp-stack cmp-mini cmp-mini--even", role: "table" },
      h("caption", { class: "wonk-sr" }, caption),
      h(
        "thead",
        { role: "rowgroup" },
        h(
          "tr",
          { role: "row" },
          head.map((label, i) =>
            h(
              "th",
              { scope: "col", role: "columnheader", style: widths[i] ? { width: widths[i] } : null },
              i === 0 ? h("span", { class: "wonk-sr" }, label) : label
            )
          )
        )
      ),
      h(
        "tbody",
        { role: "rowgroup" },
        rows.map(([rowHead, ...cells]) =>
          h(
            "tr",
            { role: "row" },
            h("th", { scope: "row", role: "rowheader" }, rowHead),
            cells.map((c, i) => labeledCell(`c${i}`, head[i + 1], c))
          )
        )
      )
    )
  );
}

const sourceLine = (...children) => h("p", { class: "cmp-src" }, ...children);
const srcPart = (...children) => h("span", { class: "cmp-src-line" }, ...children);
const sub = (...children) => h("span", { class: "cmp-sub" }, ...children);
const rowHead = (name, note) => [h("span", { class: "cmp-row-name" }, name), note ? sub(note) : null];
// The space stays outside the no-wrap span, so a narrow cell can break before the mark.
const mark = (text) => [" ", h("span", { class: "cmp-short" }, `✕ ${text}`)];

// "plus about 21 staff", where the reading counts staff toward the limit.
const staffText = (s) => (s.countsStaff ? `plus about ${num(Math.round(s.staff))} staff` : null);

// Where the limits come from: the facility slides, or each open school's state permit.
const limitSources = (d) =>
  d.reading === "permits"
    ? ["; limits from the state permits ", ...keptIds(d).flatMap((id, i) => [i ? " " : "", cite(FACILITIES[id].permit.src, `${schoolShort(id)} permit`)])]
    : ["; limits from the facility slides ", cite(ref("deck", "slides 21-25"))];

// Towns whose children would go to Brookside, and so to Crossett Brook for grades 5-6 in either setup.
const toBrookside = (d) => d.closed.filter((c) => c.to === "BPS").map((c) => townName(c.town));

// ---- the criteria ----

function capacityBody(d) {
  const ids = [...keptIds(d), "BPS"];
  const viaBps = toBrookside(d);
  const cbK6 = d.res[6].capacity.cbms56;
  const rows = ids.map((id) => [
    rowHead(placeName(id), limitLine(d.res[4], id)),
    ...SETUPS.map((top) => {
      const s = schoolOf(d.res[top], id);
      return [
        h("span", { class: "cmp-num-inline" }, num(s.total)),
        " students",
        staffText(s) ? sub(staffText(s)) : null,
        s.overPeople ? h("span", { class: "cmp-sub cmp-over" }, `✕ ${num(Math.round(s.counted - s.limit))} over the limit${s.countsStaff ? ", counting staff" : ""}`) : null,
        sub(`Classroom space for ${num(s.consultantCapacity)}, by the district's consultant`, s.overConsultant ? mark("short") : null),
      ];
    }),
  ]);
  rows.push([
    rowHead("Crossett Brook, grades 5-6", `${num(CB_TODAY)} students in grades 5-8 this year`),
    [
      h("span", { class: "cmp-num-inline" }, `About ${num(CB_ALL_56)}`),
      " students",
      sub(`The ${num(CB_OWN_56)} there now plus the valley's ${num(VALLEY_56)}, by this year's numbers `, tag("derived")),
      sub(`Classroom space for ${num(CB_CAPACITY)}, by the district's consultant`, CB_ALL_56 > CB_CAPACITY ? mark("short") : null),
    ],
    [
      h("span", { class: "cmp-num-inline" }, num(cbK6)),
      " students",
      sub(`The district's count, ${viaBps.length ? `including ${listJoin(viaBps)}'s 5th and 6th graders` : "with no valley 5th or 6th graders"}`),
      sub(`Classroom space for ${num(CB_CAPACITY)}, by the district's consultant`, cbK6 > CB_CAPACITY ? mark("short") : null),
    ],
  ]);
  // Harwood Middle takes Crossett Brook's 7th and 8th graders in every Path B version, whichever setup
  const hums = d.res[4].capacity.middle.find((m) => m.id === "HUMS");
  if (hums) {
    rows.push([
      rowHead("Harwood Middle, grades 7-8", `${num(ATT.HU[7] + ATT.HU[8])} students this year`),
      ...SETUPS.map(() => [
        h("span", { class: "cmp-num-inline" }, `About ${num(hums.total)}`),
        " students",
        sub("Its own 7th and 8th graders plus Crossett Brook's, the same in every pairing ", tag("derived")),
        sub(`Classroom space for ${num(hums.capacity)}, by the district's consultant`, hums.over ? mark("short") : null),
      ]),
    ]);
  }
  return [
    miniTable(`Students and classrooms at each receiving school, ${d.label}`, ["School", setupLabel(4), setupLabel(6)], rows),
    sourceLine(
      srcPart(
        tag("district"),
        " Students, counting Pre-K, from the district's tables ",
        ...cites(d.res[4].capacity.table.src, d.res[6].capacity.table.src),
        ...limitSources(d),
        "; classroom space as calculated by the district's planning consultant, TruexCullins, in March 2025 ",
        cite(ref("truexCap", "Capacities"), "Consultant"),
        "."
      ),
      d.reading === "permits"
        ? srcPart(tag("estimate"), " Staff numbers: our estimate. The valley staff who remain after the positions the district says closing schools removes, shared out by students.")
        : null,
      srcPart(
        tag("derived"),
        " Crossett Brook with every valley 5th and 6th grader: this year's enrollment ",
        cite(ref("enroll", "p. 1"), "Oct 1 report"),
        ", because the district's Pre-K to 4 tables leave Crossett Brook out. Its wastewater and occupancy limits are not on the facility slides."
      )
    ),
  ];
}

function conditionBody(d) {
  const ids = keptIds(d);
  const F = FACILITIES;
  const extra = (id) => F[id].impendingNote.replace(/^Near-term critical repairs,?\s*/, "");
  const closedSum = d.closed.reduce((a, c) => a + F[c.id].deferredMaintenance, 0);
  return [
    miniTable(
      `Building condition of the two valley schools that stay open, ${d.label}`,
      ["Measure", ...ids.map(schoolShort)],
      [
        [h("span", {}, term("deferred", "Deferred maintenance")), ...ids.map((id) => h("span", { class: "cmp-num" }, money(F[id].deferredMaintenance)))],
        ["Priority 1, the most urgent", ...ids.map((id) => h("span", { class: "cmp-mono" }, money(F[id].priority1)))],
        ["Near-term critical repairs", ...ids.map((id) => [h("span", { class: "cmp-mono" }, money(F[id].impending)), extra(id) ? sub(extra(id)) : null])],
        ["Main items listed", ...ids.map((id) => (F[id].maintenance.length ? F[id].maintenance.join("; ") : "None listed"))],
      ]
    ),
    h(
      "p",
      { class: "small" },
      `Brookside, open in every version: ${money(F.BPS.deferredMaintenance)} in deferred maintenance, ${money(F.BPS.priority1)} of it priority 1. `,
      `The two buildings that close (${listJoin(d.closed.map((c) => schoolShort(c.id)))}): ${money(closedSum)}.`
    ),
    sourceLine(tag("district"), " As printed on each building's facility slide ", ...cites(...[...ids, "BPS"].map((id) => F[id].src)), "."),
  ];
}

function kitchenBody(d) {
  const ids = keptIds(d);
  const toBps = d.closed.some((c) => c.to === "BPS");
  const shown = toBps ? [...ids, "BPS"] : ids;
  // A closed school whose kitchen serves a school that stays open: the clause of its kitchen note
  // that names the open school ("also sends meals to Fayston").
  const feeds = d.closed.flatMap((c) => {
    const clause = FACILITIES[c.id].kitchen.split(/[;.]\s*/).find((part) => ids.some((id) => part.includes(SCHOOLS[id].short)));
    return clause ? [{ id: c.id, clause: clause.trim() }] : [];
  });
  return [
    h(
      "dl",
      { class: "facts cmp-facts" },
      shown.map((id) => [h("dt", {}, schoolShort(id)), h("dd", {}, `${FACILITIES[id].kitchen}. `, cite(FACILITIES[id].src))])
    ),
    feeds.map((f) =>
      h("p", { class: "small" }, `Today ${schoolShort(f.id)}'s kitchen ${f.clause}; ${schoolShort(f.id)} closes in this pairing. `, cite(FACILITIES[f.id].src))
    ),
    toBps ? h("p", { class: "small" }, "Brookside is listed because Moretown children would go there in this pairing.") : null,
  ];
}

function limitText(r, id) {
  const s = schoolOf(r, id);
  const staff = s.countsStaff ? ", students and staff" : "";
  if (id === "BPS") return `${num(s.limit)} occupancy${staff}`;
  if (r.capacity.reading === "permits") return `${num(s.limit)} permit${staff}`;
  // the slides' numbers are not all the permits' (Fayston's permit says 235 students and staff), so say whose they are
  if (id === "WES" && FACILITIES.WES.wastewaterNote) return `${num(s.limit)} on the slides (“amenable to 300”)`;
  return `${num(s.limit)} on the slides`;
}

// Under a school's name: "Wastewater limit 250 on the slides", "Occupancy limit 480".
function limitLine(r, id) {
  const s = schoolOf(r, id);
  const staff = s.countsStaff ? ", students and staff" : "";
  if (id === "BPS") return `Occupancy limit ${num(s.limit)}${staff}`;
  if (r.capacity.reading === "permits") return `Wastewater limit ${num(s.limit)}${staff} (state permit)`;
  return `Wastewater limit ${num(s.limit)} on the slides${id === "WES" && FACILITIES.WES.wastewaterNote ? " (“amenable to 300”)" : ""}`;
}

function verdict(r) {
  const over = r.capacity.schools.filter((s) => s.overPeople);
  if (!over.length) return status(true, "Every open school within its limit", "");
  return status(false, "", over.map((s) => `${schoolShort(s.id)} over its limit (${num(s.total)} students${s.countsStaff ? ` + about ${num(Math.round(s.staff))} staff` : ""}, limit ${num(s.limit)})`).join("; "));
}

// Printed "Total" rows in this pairing's two tables that do not match their grade rows (only
// Fayston + Warren, slides 29 and 32), school by school, and whether the difference changes a verdict.
function mismatchNote(d) {
  const by = new Map();
  for (const top of SETUPS) {
    for (const m of d.res[top].capacity.mismatches) {
      const e = by.get(m.school) ?? { id: m.school, printed: {}, rows: {} };
      e.printed[top] = m.printed;
      e.rows[top] = m.rows;
      by.set(m.school, e);
    }
  }
  if (!by.size) return null;
  const order = [...by.values()].sort((a, b) => (a.id === "BPS" ? -1 : b.id === "BPS" ? 1 : 0));
  const setupWith = (t) => (t === 4 ? "with grades 5-6 at Crossett Brook" : "with grades 5-6 in the valley");
  const inTables = (o) => {
    const tops = SETUPS.filter((t) => o[t] != null);
    if (tops.length === 2 && o[4] === o[6]) return `${num(o[4])} in both tables`;
    return listJoin(tops.map((t) => `${num(o[t])} ${setupWith(t)}`));
  };
  const item = (e) => {
    const tops = SETUPS.filter((t) => e.rows[t] != null);
    const s = schoolOf(d.res[tops[0]], e.id);
    const what = e.id === "BPS" ? "occupancy" : "wastewater limit";
    // the verdicts above add estimated staff where the reading counts them, so this comparison does too
    const at = (t) => {
      const x = schoolOf(d.res[t], e.id);
      const staff = x.countsStaff ? x.staff : 0;
      return { p: e.printed[t] + staff > x.limit, r: e.rows[t] + staff > x.limit };
    };
    const words = ({ p, r }) =>
      p === r
        ? `${r ? "over" : "within"} its ${what} of ${num(s.limit)} either way`
        : p
          ? `the printed total is over its ${what} of ${num(s.limit)}; the rows are not`
          : `the rows are over its ${what} of ${num(s.limit)}; the printed total is not`;
    const cap = (x) => x.charAt(0).toUpperCase() + x.slice(1);
    const v = tops.map(at);
    const counting = s.countsStaff ? "counting our staff estimate" : "";
    const effect = v.every((x) => x.p === v[0].p && x.r === v[0].r)
      ? `${cap(counting ? `${counting}, ${words(v[0])}` : words(v[0]))}.`
      : tops.map((t, i) => `${cap(setupWith(t))}${counting ? `, ${counting}` : ""}: ${words(v[i])}.`).join(" ");
    return h("li", {}, h("strong", {}, `${placeName(e.id)}: `), `printed ${inTables(e.printed)}; the grade rows add to ${inTables(e.rows)}. ${effect}`);
  };
  const box = note(
    "warn",
    h(
      "p",
      {},
      h("strong", {}, "District table totals do not add up. "),
      "The slides print a total for each school that does not match the grade rows above it. The verdicts here use the rows. ",
      ...cites(...SETUPS.map((t) => d.res[t].capacity.table.src))
    ),
    h("ul", { class: "cmp-mismatch" }, order.map(item))
  );
  box.classList.add("cmp-note");
  return box;
}

function wastewaterBody(d) {
  const ids = [...keptIds(d), "BPS"];
  return [
    h(
      "ul",
      { class: "cmp-verdicts" },
      SETUPS.map((top) => h("li", {}, h("span", { class: "cmp-verdict-label" }, `${setupLabel(top)}:`), " ", verdict(d.res[top])))
    ),
    miniTable(
      `Students against each open school's wastewater or occupancy limit, ${d.label}`,
      ["School", "Limit", setupLabel(4), setupLabel(6)],
      ids.map((id) => [
        placeName(id),
        limitText(d.res[4], id),
        ...SETUPS.map((top) => {
          const s = schoolOf(d.res[top], id);
          // the tables' Pre-K rows are the district's planning numbers, not this year's classes, and
          // sometimes they alone put a school over
          const pk = s.byGrade.PK ?? 0;
          const who = s.countsStaff ? `${num(s.total)} students + about ${num(Math.round(s.staff))} staff` : `${num(s.total)} students`;
          return [
            status(!s.overPeople, who, `${who}, ${num(Math.round(s.counted - s.limit))} over`),
            pk ? sub(`including ${num(pk)} Pre-K seats the district plans`) : null,
            s.overPeople && pk && s.counted - pk <= s.limit ? sub("Within the limit without the planned Pre-K seats") : null,
          ];
        }),
      ]),
      { widths: [null, "17%"] }
    ),
    mismatchNote(d),
    d.septic
      ? h(
          "div",
          { class: "cmp-septic" },
          h(
            "p",
            { class: "small" },
            h("strong", {}, "If Waitsfield's limit were 300. "),
            "Its 1991 state permit says 300 students; the slides use 230 and call the school “amenable to 300,” and a 1996 letter in the state's file says 230. The district has not said whether using 300 would need any work or cost. ",
            cite(ref("deck", "slide 23")),
            " ",
            // short labels: this box is about Waitsfield, and inside its padding the full "Waitsfield permit 1991"
            // (citations do not wrap) pushes the page sideways at large text sizes
            cite(FACILITIES.WES.permit.src, "1991 permit"),
            " ",
            cite(ref("permitWES1996", "PDF pp. 9-10"), "1996 letter")
          ),
          h(
            "ul",
            { class: "cmp-verdicts" },
            SETUPS.map((top) => h("li", {}, h("span", { class: "cmp-verdict-label" }, `${setupLabel(top)}:`), " ", septicLine(d, top)))
          )
        )
      : d.reading === "slides"
        ? h("p", { class: "small" }, "Waitsfield closes in this pairing, so a 300 limit for Waitsfield would not change anything here.")
        : d.pair.includes("WES")
          ? h(
              "p",
              { class: "small" },
              "Waitsfield's 1991 permit allows 300 students, so this reading uses 300 rather than the slides' 230. The design behind it counted students and staff, and a 1996 letter in the state's file says 230. ",
              cite(FACILITIES.WES.permit.src),
              " ",
              cite(ref("permitWES1996", "PDF pp. 9-10"))
            )
          : null,
    sourceLine(
      tag("district"),
      " Student counts from the district's tables ",
      ...cites(d.res[4].capacity.table.src, d.res[6].capacity.table.src),
      ...limitSources(d),
      ".",
      d.reading === "permits" ? [" ", tag("estimate"), " Staff numbers are our estimate."] : null
    ),
  ];
}

function septicLine(d, top) {
  const before = schoolOf(d.res[top], "WES");
  const after = schoolOf(d.septic[top], "WES");
  if (!before.overPeople) return h("span", {}, status(true, "Already within 230", ""), ` (${num(before.total)} students)`);
  if (!after.overPeople) return h("span", {}, status(true, "Would fit", ""), ` (${num(after.total)} students, limit 300)`);
  return h("span", {}, status(false, "", "Still over"), ` (${num(after.total)} students, limit 300)`);
}

function movesBody(d) {
  const r = d.res;
  return [
    miniTable(
      `Student moves, ${d.label}`,
      ["Measure", setupLabel(4), setupLabel(6)],
      [
        ["Students changing schools next fall (K-12)", ...SETUPS.map((top) => h("span", { class: "cmp-num" }, num(r[top].moved.k12)))],
        [
          "Most schools for any child now in Pre-K to grade 2",
          ...SETUPS.map((top) => [h("span", { class: "cmp-num" }, String(r[top].maxYoung.all)), sub(maxTownsText(r[top]))]),
        ],
        [
          "Students now in Pre-K to grade 8 who would attend 5 or more schools",
          ...SETUPS.map((top) => [h("span", { class: "cmp-num" }, num(r[top].fivePlus.total)), r[top].fivePlus.total ? sub(fiveByTownText(r[top])) : null]),
        ],
      ]
    ),
    sourceLine(
      tag("derived"),
      " Calculated from this year's enrollment ",
      cite(ref("enroll", "p. 1"), "Oct 1 report"),
      ". Today every child attends 3 K-12 schools."
    ),
  ];
}

function receivingBody(d) {
  // Brookside teaches through grade 4, so a town sent there goes on to Crossett Brook for grades 5-6 in both setups.
  const toBps = toBrookside(d);
  return [
    h(
      "ul",
      { class: "cmp-goes" },
      d.closed.map((c) =>
        h("li", {}, h("strong", {}, `${townName(c.town)} children: `), `${placeName(c.to)}, the nearest open school, as in the district's tables.`)
      ),
      h("li", {}, h("strong", {}, "With grades 5-6 at Crossett Brook: "), "every valley 5th and 6th grader goes to Crossett Brook in Duxbury."),
      toBps.length
        ? h(
            "li",
            {},
            h("strong", {}, "With grades 5-6 in the valley: "),
            `Brookside teaches up to grade 4, so ${listJoin(toBps)} 5th and 6th graders would still go to Crossett Brook.`
          )
        : null
    ),
    h(
      "p",
      { class: "small" },
      "Placement follows home address, so some families in a town could be closer to a different open school, and parents can ask for another school. ",
      cite(ref("deck", "slides 27-32")),
      " ",
      cite(ref("aoa", "Article 6(E)"), "Articles"),
      " Bus routes and ride times for each pairing have not been published. The board asked for them on October 14; on October 28 an administrator said routes would be modeled with the bus contractor once the board narrows the options, and estimated 5 to 10 more minutes for valley 5th and 6th graders riding to Crossett Brook. ",
      cite(ref("minutes1014", "Discussion: Budget"), "Oct 14 minutes"),
      " ",
      cite(ref("meeting1028", "transportation"))
    ),
  ];
}

// The sheet's fifth scored column (slide 34). It has a score box like the four criteria; the sheet says no more about it.
const rankingBody = () => [
  h(
    "p",
    { class: "small" },
    "The district's sheet has a “Score: ___” box in this column like the four criteria, on the same 1 to 5 scale: your overall judgment of this pairing. The sheet does not say which grade 5-6 setup to assume, so the data above shows both. ",
    cite(BOARD_CRITERIA.src)
  ),
];

// The sheet's five scored columns in its order, then the two this site adds. The ranking column comes last
// on the page, after all the data. Scores saved before it was added (the four criteria and the two added
// ones) still load; the ranking column is simply unscored.
const CRITERIA = [
  { key: "capacity", name: BOARD_CRITERIA.criteria[0], body: capacityBody },
  { key: "condition", name: BOARD_CRITERIA.criteria[1], body: conditionBody },
  { key: "kitchen", name: BOARD_CRITERIA.criteria[2], body: kitchenBody },
  { key: "wastewater", name: BOARD_CRITERIA.criteria[3], body: wastewaterBody },
  { key: "moves", name: "Student moves", added: true, body: movesBody },
  { key: "receiving", name: "Where closed towns' children go", added: true, body: receivingBody },
  { key: "ranking", name: BOARD_CRITERIA.criteria[4], badge: "On the district's sheet", body: rankingBody },
];
const DISTRICT_KEYS = CRITERIA.filter((c) => !c.added).map((c) => c.key);
const DMAX = DISTRICT_KEYS.length * 5; // the district's sheet: five scores, out of 25
const AMAX = CRITERIA.length * 5; // with the two this site adds, out of 35

// ---- the reader's scores ----

function loadScores() {
  const raw = store.get("scores", {});
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const pair of PAIRS) {
    const id = pairId(pair);
    for (const c of CRITERIA) {
      const n = Number(raw[id]?.[c.key]);
      if (Number.isInteger(n) && n >= 1 && n <= 5) (out[id] ??= {})[c.key] = n;
    }
  }
  return out;
}

function totals(s = {}) {
  const district = DISTRICT_KEYS.filter((k) => s[k]);
  const all = CRITERIA.filter((c) => s[c.key]).map((c) => c.key);
  return {
    district: district.reduce((a, k) => a + s[k], 0),
    districtScored: district.length,
    all: all.reduce((a, k) => a + s[k], 0),
    allScored: all.length,
  };
}

const outOf = (n, max, scored, of) => (scored ? `${n} of ${max}${scored < of ? ` (${scored} of ${of} scored)` : ""}` : "Not scored");

// The same total for a table cell: the number in mono, how much is scored on the line under it.
const outOfCell = (n, max, scored, of) =>
  scored ? [h("span", { class: "cmp-num-inline" }, `${n} of ${max}`), scored < of ? sub(`${scored} of ${of} scored`) : null] : "—";

// Labels for the two totals, the same in the cards, the "Rank by" menu, and the ranking table.
const SHEET_LABEL = "The district's sheet (five scores)";
const ADDED_LABEL = "With this site's two added";

export function scoreSection() {
  let scores = loadScores();
  const save = () => store.set("scores", scores);
  const pairs = PAIRS.map(pairData);
  const painters = new Map();

  function setScore(id, key, n) {
    (scores[id] ??= {})[key] = n;
    // a new score ends the offer to undo "Clear my scores", which would otherwise drop it
    clearSaid.textContent = "";
    save();
    painters.get(id)?.();
    paintRanking();
  }

  // ---- one card per pairing ----
  function pairCard(d) {
    const facts = h("span", { class: "facts" });
    const total = h("div", { class: "cmp-total", "aria-live": "polite" });
    const paint = () => {
      const t = totals(scores[d.id]);
      const nD = DISTRICT_KEYS.length;
      const yours = !t.allScored
        ? "Not scored yet"
        : t.districtScored === nD
          ? `Sheet total: ${t.district} of ${DMAX}`
          : `Scored ${t.allScored} of ${CRITERIA.length}`;
      facts.textContent = `${listJoin(d.closed.map((c) => schoolShort(c.id)))} close · ${yours}`;
      total.replaceChildren(
        h(
          "span",
          { class: "cmp-total-item" },
          h("span", { class: "wonk-label" }, SHEET_LABEL),
          h("span", { class: "wonk-num" }, outOf(t.district, DMAX, t.districtScored, nD))
        ),
        h(
          "span",
          { class: "cmp-total-item" },
          h("span", { class: "wonk-label" }, ADDED_LABEL),
          h("span", { class: "wonk-num" }, outOf(t.all, AMAX, t.allScored, CRITERIA.length))
        )
      );
    };
    painters.set(d.id, paint);

    const crit = (c) => {
      const hid = `cmp-${d.id.replace("+", "-")}-${c.key}`;
      const now = scores[d.id]?.[c.key] ?? 0;
      return h(
        "div",
        { class: "cmp-crit", role: "group", "aria-labelledby": hid },
        h(
          "div",
          { class: "cmp-crit-head" },
          h("h3", { id: hid }, c.name, h("span", { class: "wonk-sr" }, `, ${d.label}`)),
          c.added
            ? h("span", { class: "wonk-badge wonk-badge--accent" }, "Added on this site")
            : h("span", { class: "wonk-badge" }, c.badge ?? "District criterion")
        ),
        c.body(d),
        h(
          "fieldset",
          { class: "group cmp-score" },
          h("legend", { class: "wonk-label" }, "Your score", h("span", { class: "wonk-sr" }, ` for ${c.name}, ${d.label} open`)),
          h(
            "div",
            { class: "choice" },
            SCALE.map((n) =>
              h(
                "label",
                {},
                h("input", {
                  type: "radio",
                  name: `cmp-score-${d.id}-${c.key}`,
                  value: String(n),
                  checked: now === n,
                  "data-pair": d.id,
                  "data-crit": c.key,
                  onchange: () => setScore(d.id, c.key, n),
                }),
                h("span", { class: "cmp-score-n" }, String(n)),
                " ",
                BOARD_CRITERIA.scale[n]
              )
            )
          )
        )
      );
    };

    const card = h(
      "details",
      { class: "wonk-card wonk-card--fold cmp-pair", "data-fold-key": `cmp-pair-${d.id}` },
      h("summary", {}, h("span", { class: "headline" }, `${d.label} stay open`), facts),
      h(
        "div",
        { class: "body" },
        h("p", { class: "cmp-pair-lede" }, `${closeText(d.versions[4].plan)}.`),
        h(
          "p",
          { class: "cmp-pair-links" },
          "Your child under this pairing: ",
          h("a", { href: childHref(d.versions[4]) }, "grades 5-6 at Crossett Brook"),
          " or ",
          h("a", { href: childHref(d.versions[6]) }, "grades 5-6 in the valley"),
          ". Open it in Build a plan: ",
          h("a", { href: buildHref(d.versions[4].plan), "aria-label": `Open ${d.label}, grades 5-6 at Crossett Brook, in Build a plan` }, "at Crossett Brook"),
          " or ",
          h("a", { href: buildHref(d.versions[6].plan), "aria-label": `Open ${d.label}, grades 5-6 in the valley, in Build a plan` }, "in the valley"),
          "."
        ),
        CRITERIA.map(crit),
        total,
        // the ranking is several phone screens below the last card
        h(
          "p",
          { class: "no-print" },
          h("button", { type: "button", class: "wonk-btn wonk-btn--quiet", onclick: () => jumpTo(rankingCard) }, "See your ranking")
        )
      )
    );
    paint();
    return card;
  }

  // ---- the reader's ranking ----
  const rankBy = h(
    "select",
    { class: "wonk-select", id: "cmp-rank-by" },
    h("option", { value: "district" }, SHEET_LABEL),
    h("option", { value: "all" }, ADDED_LABEL)
  );
  rankBy.addEventListener("change", paintRanking);
  const rankBody = h("tbody", { role: "rowgroup" });
  const rankTable = h(
    "div",
    { class: "cmp-mini-wrap" },
    h(
      "table",
      { class: "wonk-table cmp-stack cmp-mini cmp-rank", role: "table" },
      h("caption", { class: "wonk-sr" }, "Your scores and ranking for the six pairings"),
      h(
        "thead",
        { role: "rowgroup" },
        h(
          "tr",
          { role: "row" },
          ["Pairing", "Your rank", "District's sheet", "With the two added"].map((label) => h("th", { scope: "col", role: "columnheader" }, label))
        )
      ),
      rankBody
    )
  );
  const rankEmpty = h("p", { class: "cmp-rank-empty" }, "Open a pairing above and score it; your ranking shows up here.");
  const clearBtn = h("button", { type: "button", class: "wonk-btn" }, "Clear my scores");
  const clearSaid = h("p", { class: "small cmp-cleared", role: "status" });

  function paintRanking() {
    const mode = rankBy.value;
    const rows = pairs.map((d, i) => {
      const t = totals(scores[d.id]);
      const value = mode === "all" ? t.all : t.district;
      const scored = mode === "all" ? t.allScored : t.districtScored;
      return { d, i, t, value, scored };
    });
    const ranked = rows.filter((x) => x.scored).sort((a, b) => b.value - a.value || a.i - b.i);
    ranked.forEach((x, i) => (x.rank = i && ranked[i - 1].value === x.value ? ranked[i - 1].rank : i + 1));
    const order = [...ranked, ...rows.filter((x) => !x.scored)];
    rankBody.replaceChildren(
      ...order.map((x) =>
        h(
          "tr",
          { role: "row" },
          h("th", { scope: "row", role: "rowheader" }, x.d.label),
          labeledCell("rank", "Your rank", x.rank ? h("span", { class: "cmp-num" }, String(x.rank)) : "—"),
          labeledCell("district", "District's sheet", outOfCell(x.t.district, DMAX, x.t.districtScored, DISTRICT_KEYS.length)),
          labeledCell("all", "With the two added", outOfCell(x.t.all, AMAX, x.t.allScored, CRITERIA.length))
        )
      )
    );
    const any = Object.values(scores).some((s) => s && Object.keys(s).length);
    clearBtn.disabled = !any;
    rankTable.hidden = !any;
    rankEmpty.hidden = any;
  }

  // Clearing disables the focused button and Undo removes itself, so focus moves on purpose each
  // time instead of falling back to the page.
  clearBtn.addEventListener("click", () => {
    const before = scores;
    scores = {};
    save();
    repaintAll();
    const undo = h(
      "button",
      {
        type: "button",
        class: "wonk-btn",
        onclick: () => {
          scores = before;
          save();
          repaintAll();
          clearBtn.focus();
          clearSaid.textContent = "Your scores are back.";
        },
      },
      "Undo"
    );
    clearSaid.replaceChildren("Your scores were cleared. ", undo);
    undo.focus();
  });

  const cards = h("div", { class: "cmp-pairs" }, pairs.map(pairCard));
  // each card's "See your ranking" button scrolls here and moves focus to the heading
  const rankingCard = h(
    "div",
    { class: "wonk-card cmp-ranking", id: "cmp-ranking" },
    h("h3", { id: "cmp-ranking-title" }, "Your ranking"),
    h("p", { class: "small" }, "Pairings you have scored, highest total first. Totals compare fairly once every pairing is fully scored."),
    h("div", { class: "wonk-field cmp-rank-field" }, h("label", { class: "wonk-label", for: "cmp-rank-by" }, "Rank by"), rankBy),
    rankEmpty,
    rankTable,
    h("div", { class: "btn-row" }, clearBtn, h("span", { class: "small muted" }, "Scores are saved only in this browser.")),
    clearSaid
  );

  function repaintAll() {
    for (const input of cards.querySelectorAll("input[type=radio]")) {
      input.checked = scores[input.dataset.pair]?.[input.dataset.crit] === Number(input.value);
    }
    for (const paint of painters.values()) paint();
    paintRanking();
  }
  paintRanking();

  // Crossett Brook's grades 5-6 in the district's K-6 tables (slides 27-29), by pairing. The district's
  // Pre-K to 4 tables (slides 30-32) leave Crossett Brook out; CB_ALL_56 is our count from this year's enrollment.
  const k6 = pairs.map((d) => ({ d, n: d.res[6].capacity.cbms56 }));
  const k6Lo = Math.min(...k6.map((x) => x.n));
  const k6Hi = Math.max(...k6.map((x) => x.n));
  const k6Top = k6.filter((x) => x.n === k6Hi);
  const k6Why = k6Top
    .map((x) => {
      const via = toBrookside(x.d);
      return `${num(k6Hi)} for ${x.d.label}${via.length ? `, where ${listJoin(via)}'s 5th and 6th graders would also go to Crossett Brook` : ""}`;
    })
    .join("; ");

  return [
    h(
      "blockquote",
      { class: "cmp-question" },
      h("p", {}, `“${BOARD_CRITERIA.question}”`),
      h("footer", { class: "small" }, "The question on the district's scoring sheet ", cite(BOARD_CRITERIA.src))
    ),
    h(
      "div",
      { class: "cmp-scale" },
      h("span", { class: "wonk-label" }, "The district's scale"),
      SCALE.map((n) => h("span", { class: "cmp-scale-item" }, h("span", { class: "cmp-score-n" }, String(n)), " ", BOARD_CRITERIA.scale[n]))
    ),
    h(
      "details",
      { class: "wonk-fold" },
      h("summary", {}, "About the criteria and this data"),
      h(
        "div",
        { class: "body" },
        h(
          "p",
          {},
          `The district's sheet has five scored columns, the four criteria and “${BOARD_CRITERIA.criteria[4]},” each 1 to 5, and a total. Your ranking at the end of this section comes only from your own scores.`
        ),
        h(
          "p",
          {},
          "Two criteria are added on this site and marked that way: student moves (how many students change schools and how many schools a child attends), and where closed towns' children would go. Your totals show the district's five scores on their own, and with the two added."
        ),
        h(
          "p",
          {},
          `The district's K-6 tables list Crossett Brook's grades 5-6: ${num(k6Lo)} to ${num(k6Hi)} students, depending on the pairing (${k6Why}). `,
          cite(ref("deck", "slides 27-29")),
          " The district's Pre-K to 4 tables leave Crossett Brook out. ",
          cite(ref("deck", "slides 30-32")),
          ` With this year's enrollment, adding every valley 5th and 6th grader would put about ${num(CB_ALL_56)} students in grades 5-6 there, against ${num(CB_TODAY)} in grades 5-8 today. `,
          tag("derived"),
          " ",
          cite(ref("enroll", "p. 1"), "Oct 1 report")
        )
      )
    ),
    cards,
    rankingCard,
  ];
}
