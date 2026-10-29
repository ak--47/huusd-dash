// The main comparison: one row per version, sortable by every numeric measure.
// Three widths, by the space the table actually has (container queries in compare.css):
//   wide    every column fits; sort buttons in the headers
//   middle  the same table scrolls sideways, with the version column pinned
//   phone   the version plus one measure at a time, picked with the "Show" buttons
// The "Sort by" menu works at every width; sorting by a measure also shows it on a phone.

import { ref } from "../../data/sources.js";
import { h, listJoin, moneyShort, num } from "./dom.js";
import { cite, schoolShort, status, tag } from "./kit.js";
import {
  BUILD_TEXT,
  CHILD_TEXT,
  MEASURES,
  buildHref,
  childHref,
  closureGroups,
  closures,
  fiveByTownText,
  fullName,
  goesText,
  lowerFirst,
  maxTownsText,
  millions,
  placeName,
} from "./compare-versions.js";

const TIPS = {
  savings:
    "Yearly savings in the district's presentation, against the $3,339,273 it says the FY28 budget needs. Every Path B version saves the same $3,929,469.",
  buildings: "School buildings in use, out of 7. For Path B: where children from the towns whose schools close would go, the nearest open school.",
  fits: "Whether every open school stays within its wastewater limit (Brookside: its occupancy of 480), counting Pre-K, as in the district's tables or as the state permits read, whichever you choose above. The last line compares students with the classroom capacity the district's consultant calculated.",
  moved: "This year's K-12 students who would start fall 2027 in a different school than they would with no change.",
  schools: "The most different K-12 schools a child now in Pre-K to grade 2 would attend, and the towns where that happens. Today it is 3 everywhere.",
  five: "This year's students in Pre-K to grade 8 who would attend 5 or more different K-12 schools.",
  repairs: "The district's deferred maintenance figures, added up for the elementary buildings that stay open and for those that close.",
};

// Short names for the phone's "Show" buttons.
const SHORT = {
  savings: "Savings",
  buildings: "Buildings",
  fits: "Fits the buildings?",
  moved: "Changing schools",
  schools: "Most schools",
  five: "5+ schools",
  repairs: "Repairs",
};

// Citations side by side, with a space between them.
export const cites = (...refs) => refs.flatMap((r, i) => (i ? [" ", cite(r)] : [cite(r)]));

// ---- cell contents (shared with the other combinations) ----

const numLine = (...children) => h("span", { class: "cmp-num" }, ...children);
const sub = (...children) => h("span", { class: "cmp-sub" }, ...children);
const subAs = (cls, ...children) => h("span", { class: `cmp-sub ${cls}` }, ...children);

export function savingsCell(v) {
  const b = v.r.budget;
  return [
    numLine(moneyShort(b.savings)),
    sub(b.gap > 0 ? `${moneyShort(b.gap)} short of target` : b.gap < 0 ? `${moneyShort(-b.gap)} above target` : "Meets the target"),
  ];
}

// "Waitsfield and Warren close; their children go to Fayston."
export function closeText(plan) {
  const closed = closures(plan);
  if (!closed.length) return "None close";
  const names = listJoin(closed.map((c) => schoolShort(c.id)));
  const groups = closureGroups(plan);
  if (groups.length === 1) return `${names} close; their children go to ${placeName(groups[0].to)}`;
  return `${names} close. ${groups.map((g) => `${listJoin(g.towns)} children go to ${placeName(g.to)}`).join("; ")}`;
}

// The version's name already says which schools close, so this says where their children go.
function buildingsCell(v) {
  const goes = goesText(v.plan);
  return [numLine(String(v.r.buildingsOpen)), sub(goes || "None close")];
}

// "Waitsfield and Warren close"
export const closesLine = (plan) => {
  const closed = closures(plan);
  return closed.length ? `${listJoin(closed.map((c) => schoolShort(c.id)))} close` : "";
};

// The district's measure (students against each building's limit) first; the consultant's classroom capacity last.
export function fitsCell(v, { rooms = true } = {}) {
  const c = v.r.capacity;
  const over = c.schools.filter((s) => s.overPeople);
  const mismatch = c.mismatches.length > 0;
  const out = [
    h(
      "span",
      { class: "cmp-status" },
      status(!over.length, mismatch ? "All fit, by the grade rows" : "All fit", `${listJoin(over.map((s) => schoolShort(s.id)))} over`)
    ),
  ];
  const who = (s) => (s.countsStaff ? `${num(s.total)} students + about ${num(Math.round(s.staff))} staff` : `${num(s.total)} students`);
  if (over.length === 1) out.push(sub(`${who(over[0])}, limit ${num(over[0].limit)}`));
  else for (const s of over) out.push(sub(`${schoolShort(s.id)}: ${who(s)}, limit ${num(s.limit)}`));
  if (mismatch) {
    // the note under the table spells this out: the slide's Brookside total is 513; its rows add to 439
    out.push(subAs("cmp-flag", h("span", { class: "cmp-flag-mark", "aria-hidden": "true" }, "!"), " District table total does not add up ", cite(c.table.src)));
  }
  if (c.source === "model" && v.plan.open.length < 4) out.push(sub("Students per school: our estimate"));
  if (rooms) {
    const short = c.schools.filter((s) => s.overConsultant);
    out.push(subAs("cmp-rooms", short.length ? `Classroom space: ${listJoin(short.map((s) => schoolShort(s.id)))} over the consultant's capacity` : "Classroom space: within the consultant's capacity"));
  }
  return out;
}

export function movedCell(v) {
  const m = v.r.moved;
  const pk = m.preK ? (v.plan.cuts.includes("prek") ? `plus ${num(m.preK)} Pre-K to private programs` : `plus ${num(m.preK)} in Pre-K`) : null;
  return [numLine(num(m.k12)), pk ? sub(pk) : null];
}

export function schoolsCell(v) {
  return [numLine(String(v.r.maxYoung.all)), sub(maxTownsText(v.r))];
}

function fiveCell(v) {
  const t = v.r.fivePlus.total;
  return [numLine(num(t)), t ? sub(fiveByTownText(v.r)) : null];
}

function repairsCell(v) {
  const closed = v.r.deferredClosed;
  return [
    numLine(millions(v.r.deferredKept)),
    sub("in buildings that stay open"),
    sub(closed ? [h("span", { class: "cmp-mono" }, millions(closed)), " in buildings that close"] : "No buildings close"),
  ];
}

// The version's name says which schools stay open and the next line which close, so a phone
// reader who sees only this column and one measure still knows which is which.
function versionCell(v) {
  const letter = v.kind === "A" ? "A" : v.kind === "B" ? "B" : null;
  const isB = v.kind === "B";
  return h(
    "div",
    { class: "cmp-v" },
    letter
      ? h("span", { class: `letter letter--${letter.toLowerCase()}`, "aria-hidden": "true" }, letter)
      : h("span", { class: "cmp-v-ref", "aria-hidden": "true" }),
    h("span", { class: "cmp-v-name" }, isB ? [h("span", { class: "wonk-sr" }, "Path B: "), `${v.name} open`] : v.name),
    isB ? h("span", { class: "cmp-v-sub cmp-v-closes" }, closesLine(v.plan)) : null,
    h("span", { class: "cmp-v-sub" }, v.sub),
    v.kind === "today"
      ? null
      : h(
          "span",
          { class: "cmp-v-links" },
          h("a", { href: childHref(v), "aria-label": `${CHILD_TEXT}: ${fullName(v)}` }, CHILD_TEXT),
          h("a", { href: buildHref(v.plan), "aria-label": `${BUILD_TEXT}: ${fullName(v)}` }, BUILD_TEXT)
        )
  );
}

const COLUMNS = [
  { key: "savings", label: "Saves each year", cell: savingsCell },
  { key: "buildings", label: "Buildings in use", cell: buildingsCell },
  { key: "fits", label: "Fits the buildings?", cell: (v) => fitsCell(v) },
  { key: "moved", label: "Changing schools next fall", cell: movedCell },
  { key: "schools", label: "Most schools for one child", cell: schoolsCell },
  { key: "five", label: "Students at 5+ schools", cell: fiveCell },
  { key: "repairs", label: "Deferred repairs, elementary buildings", cell: repairsCell },
];

// One labeled cell. The label shows only where a table stacks into labeled rows.
export function labeledCell(key, label, content, extra = "") {
  const empty = content == null || (Array.isArray(content) && content.every((c) => c == null));
  return h(
    "td",
    { role: "cell", class: `cmp-cell cmp-cell--${key}${empty ? " is-empty" : ""}${extra ? ` ${extra}` : ""}` },
    h("span", { class: "wonk-label cmp-cell-label" }, label),
    h("div", { class: "cmp-cell-value" }, content)
  );
}

export function comparisonTable(versions, { sort = null, onSort, onExplain } = {}) {
  const pinned = versions.filter((v) => v.kind === "today");
  const rest = versions.filter((v) => v.kind !== "today");
  let current = sort && MEASURES.some((m) => m.key === sort.key) ? { key: sort.key, dir: sort.dir === "desc" ? "desc" : "asc" } : null;
  let shown = current?.key ?? "fits";

  const heads = new Map();
  const headCell = (col) => {
    const arrow = h("span", { class: "wonk-sort-arrow", "aria-hidden": "true" });
    const btn = h("button", { type: "button", class: "wonk-sort", onclick: () => toggle(col.key) }, col.label, arrow);
    const th = h("th", { scope: "col", role: "columnheader", class: `cmp-h cmp-h--${col.key}`, "data-tip": TIPS[col.key], "data-tip-focus": "off" }, btn);
    heads.set(col.key, { th, arrow });
    return th;
  };

  const row = (v) =>
    h(
      "tr",
      { role: "row", class: `cmp-row cmp-row--${v.kind}${v.kind === "B" && v.top === 4 ? " cmp-pair-start" : ""}`, "data-id": v.id },
      h("th", { scope: "row", role: "rowheader", class: "cmp-version" }, versionCell(v)),
      COLUMNS.map((col) => labeledCell(col.key, col.label, col.cell(v)))
    );

  const body = h("tbody", { role: "rowgroup", class: "cmp-rows" });
  const table = h(
    "table",
    { class: "wonk-table cmp-stack cmp-main", role: "table", "data-show": shown },
    h("caption", { class: "wonk-sr" }, "Path A and the twelve Path B versions on the same measures. No change is listed first, for reference."),
    h(
      "thead",
      { role: "rowgroup" },
      h(
        "tr",
        { role: "row" },
        h("th", { scope: "col", role: "columnheader", class: "cmp-h cmp-h--version" }, "Version (schools that stay open)"),
        COLUMNS.map(headCell)
      )
    ),
    h("tbody", { role: "rowgroup", class: "cmp-ref" }, pinned.map(row)),
    body
  );

  const select = h(
    "select",
    { class: "wonk-select", id: "cmp-sort" },
    h("option", { value: "" }, "The district's order"),
    MEASURES.flatMap((m) => [h("option", { value: `${m.key}:asc` }, `${m.label}: ${m.low}`), h("option", { value: `${m.key}:desc` }, `${m.label}: ${m.high}`)])
  );
  select.addEventListener("change", () => {
    const [key, dir] = select.value.split(":");
    apply(key ? { key, dir } : null);
  });

  // phone only: which measure column to show next to the version
  const showButtons = new Map();
  const showBar = h(
    "div",
    { class: "cmp-show", role: "group", "aria-labelledby": "cmp-show-label" },
    h("span", { class: "wonk-label", id: "cmp-show-label" }, "Show"),
    COLUMNS.map((col) => {
      const b = h("button", { type: "button", class: "cmp-chip", "aria-pressed": "false", onclick: () => show(col.key, true) }, SHORT[col.key]);
      showButtons.set(col.key, b);
      return b;
    })
  );
  const said = h("p", { class: "wonk-sr", role: "status" });

  function show(key, announce = false) {
    shown = key;
    table.dataset.show = key;
    for (const [k, b] of showButtons) b.setAttribute("aria-pressed", String(k === key));
    if (announce) said.textContent = `Showing: ${COLUMNS.find((c) => c.key === key).label}`;
  }

  function toggle(key) {
    apply(current?.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  }

  function ordered() {
    if (!current) return rest;
    const m = MEASURES.find((x) => x.key === current.key);
    const sign = current.dir === "desc" ? -1 : 1;
    return rest
      .map((v, i) => ({ v, i, x: m.value(v) }))
      .sort((a, b) => (a.x - b.x) * sign || a.i - b.i)
      .map((o) => o.v);
  }

  function apply(next, { quiet = false } = {}) {
    current = next;
    body.replaceChildren(...ordered().map(row));
    body.classList.toggle("is-grouped", !current);
    for (const [key, { th, arrow }] of heads) {
      const on = current?.key === key;
      if (on) th.setAttribute("aria-sort", current.dir === "asc" ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
      arrow.textContent = on ? (current.dir === "asc" ? "↑" : "↓") : "";
    }
    select.value = current ? `${current.key}:${current.dir}` : "";
    if (current) show(current.key);
    if (!quiet) {
      const m = current && MEASURES.find((x) => x.key === current.key);
      said.textContent = m
        ? `Sorted by ${lowerFirst(m.label)}, ${current.dir === "asc" ? m.low : m.high}. No change stays first, for reference.`
        : "Shown in the district's order.";
      onSort?.(current);
    }
  }
  show(shown);
  apply(current, { quiet: true });

  const scroll = h("div", { class: "table-scroll cmp-scroll", role: "region", "aria-label": "Comparison of every version" }, table);
  // The region only needs to be a tab stop when it actually scrolls sideways.
  const fit = () => {
    if (scroll.scrollWidth > scroll.clientWidth + 1) scroll.setAttribute("tabindex", "0");
    else scroll.removeAttribute("tabindex");
  };
  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(fit) : null;
  observer?.observe(scroll);

  const key = h(
    "div",
    { class: "cmp-key" },
    h("span", { class: "wonk-label" }, "Where the numbers come from"),
    h(
      "span",
      {},
      tag("district"),
      " Savings ",
      ...cites(ref("deck", "slide 13"), ref("deck", "slide 19")),
      "; buildings, students, and limits ",
      cite(ref("deck", "slides 21-32")),
      "; classroom capacities ",
      cite(ref("truexCap", "Capacities"), "Consultant")
    ),
    h(
      "span",
      {},
      tag("derived"),
      " Students changing schools, schools per child, 5+ schools, repair totals, from the ",
      cite(ref("enroll", "p. 1"), "Oct 1 report"),
      " and the slides"
    ),
    h("span", {}, tag("estimate"), " Staff numbers, when the state permits reading counts staff")
  );

  const tools = h(
    "div",
    { class: "cmp-tools" },
    h("div", { class: "wonk-field cmp-sort" }, h("label", { class: "wonk-label", for: "cmp-sort" }, "Sort by"), select),
    onExplain ? h("button", { type: "button", class: "wonk-btn cmp-explain", onclick: onExplain }, "What each measure means") : null
  );

  const block = h(
    "div",
    { class: "cmp-compare" },
    key,
    showBar,
    tools,
    h("p", { class: "cmp-swipe" }, "Scroll the table sideways to see every measure; the version column stays put."),
    scroll,
    said
  );
  block.cleanup = () => observer?.disconnect();
  return block;
}
