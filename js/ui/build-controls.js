// Controls for the "Build a plan" page. They are built once; sync() sets their values in place,
// so a keyboard user never loses their place while the results redraw.

import { PATH_A_CUTS, PATH_B_SAVINGS, MODULAR } from "../../data/budget.js";
import { PAIRS } from "../../data/district-scenarios.js";
import { ATTENDING } from "../../data/enrollment.js";
import { FACILITIES, SCHOOLS, TOWNS, VALLEY } from "../../data/schools.js";
import { ref } from "../../data/sources.js";
import { CLASS_SIZE_DEFAULT, TARGET, TARGET_WITH_EXCLUSION, matchNamed, receivingOptions, receivingSchool } from "../model/index.js";
import { h, money, num } from "./dom.js";
import { cite, note, schoolShort, term } from "./kit.js";

export const pairId = (pair) => [...pair].sort().join("+");
export const pairLabel = (pair) => pair.map(schoolShort).join(" + ");
export const townName = (id) => TOWNS.find((t) => t.id === id)?.name ?? id;
const sum = (o) => Object.values(o ?? {}).reduce((a, b) => a + b, 0);
const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v))));

// Where valley 5th and 6th graders go, in words (no hyphens, so a line never breaks inside "K-6").
export const topWords = (top) => (top === 4 ? "grades 5 and 6 at Crossett Brook" : "grades 5 and 6 in the valley");

// A named plan in words: "No change", "Path A", "Path B with Moretown + Warren open, grades 5 and 6 at Crossett Brook".
export function namedLabel(named) {
  if (!named) return null;
  if (named.id === "today") return "No change";
  if (named.id === "A") return "Path A";
  return `Path B with ${pairLabel(named.open)} open, ${topWords(named.valleyTop)}`;
}

export function presetKind(named) {
  if (!named) return null;
  return named.id === "today" ? "today" : named.id === "A" ? "A" : "B";
}

// Set aria-describedby to `ids`, keeping the token wonk.js adds while a tip is showing for the control.
function describedBy(el, ids) {
  const keep = (el.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((t) => t === "wonk-hint-sr");
  const next = [...ids, ...keep].join(" ");
  if (el.getAttribute("aria-describedby") !== next) el.setAttribute("aria-describedby", next);
}

// ---- class sizes: four inputs fill the model's per-grade limits ----
export const CS_FIELDS = [
  { key: "PK", label: "Pre-K", grades: ["PK"], min: 8, max: 20 },
  { key: "K2", label: "K to grade 2", grades: ["K", "1", "2"], min: 10, max: 30 },
  { key: "G34", label: "Grades 3-4", grades: ["3", "4"], min: 10, max: 30 },
  { key: "G56", label: "Grades 5-6", grades: ["5", "6"], min: 10, max: 30 },
];
export const CS_DEFAULT = Object.fromEntries(CS_FIELDS.map((f) => [f.key, CLASS_SIZE_DEFAULT[f.grades[0]]]));
export const csExpand = (cs) => Object.fromEntries(CS_FIELDS.flatMap((f) => f.grades.map((g) => [g, cs[f.key]])));
export const csToString = (cs) => CS_FIELDS.map((f) => cs[f.key]).join(".");
export const csIsDefault = (cs) => CS_FIELDS.every((f) => cs[f.key] === CS_DEFAULT[f.key]);
export function csFromString(s) {
  if (typeof s !== "string" || !s) return null;
  const parts = s.split(".").map(Number);
  if (parts.length !== CS_FIELDS.length) return null;
  if (!CS_FIELDS.every((f, i) => Number.isInteger(parts[i]) && parts[i] >= f.min && parts[i] <= f.max)) return null;
  return Object.fromEntries(CS_FIELDS.map((f, i) => [f.key, parts[i]]));
}

// The model allows up to six portable units at a school (makePlan); the Options page uses four.
export const PORT_MAX = 6;
const PORT_SCHOOLS = ["BPS", ...VALLEY];

function group(n, title, hint, ...body) {
  const hid = `bp-hint-${n}`;
  return h(
    "fieldset",
    { class: "bp-group", id: `bp-group-${n}`, "aria-describedby": hint ? hid : null },
    h("legend", {}, h("span", { class: "bp-step", "aria-hidden": "true" }, String(n)), h("span", {}, title)),
    hint ? h("p", { class: "hint bp-hint", id: hid }, hint) : null,
    ...body
  );
}

// A number input with large - and + buttons for touch. The input is the real control (arrow keys,
// typing, screen readers); the buttons are pointer helpers and stay out of the tab order.
function stepper({ id, min, max, get, onSet, describedby }) {
  const input = h("input", {
    type: "number",
    class: "wonk-input bp-num",
    id,
    min: String(min),
    max: String(max),
    step: "1",
    inputmode: "numeric",
    value: String(get()),
    "aria-describedby": describedby ?? null,
  });
  const set = (n) => {
    if (n !== get()) onSet(n);
  };
  input.addEventListener("input", () => {
    const n = Number(input.value);
    if (input.value.trim() !== "" && Number.isInteger(n) && n >= min && n <= max) set(n);
  });
  input.addEventListener("change", () => {
    const n = input.value.trim() === "" || !Number.isFinite(Number(input.value)) ? get() : clampInt(input.value, min, max);
    input.value = String(n);
    set(n);
  });
  // a wheel over a focused number field would change it while the page scrolls
  input.addEventListener("wheel", () => input.blur(), { passive: true });
  const bump = (d) => {
    const n = clampInt(get() + d, min, max);
    input.value = String(n);
    set(n);
  };
  const btn = (d, text) =>
    h("button", { type: "button", class: "bp-step-btn", tabindex: "-1", "aria-hidden": "true", onmousedown: (e) => e.preventDefault(), onclick: () => bump(d) }, text);
  return { input, el: h("span", { class: "bp-stepper" }, btn(-1, "−"), input, btn(1, "+")) };
}

export function buildControls({ state, onPlan, onPreset, onUndo, onClassSize, onBasis, onReading }) {
  // ---- 1. start from ----
  const presetBtns = [
    ["today", "No change"],
    ["A", "Path A"],
    ["B", "Path B"],
  ].map(([kind, label]) => h("button", { type: "button", class: "wonk-btn bp-preset", "aria-pressed": "false", "data-kind": kind }, label));

  const pairSel = h("select", { class: "wonk-select", id: "bp-pair", "aria-describedby": "bp-bversion-hint" }, PAIRS.map((p) => h("option", { value: pairId(p) }, pairLabel(p))));
  // same words and order as step 3
  const topSel = h(
    "select",
    { class: "wonk-select", id: "bp-btop", "aria-describedby": "bp-bversion-hint" },
    h("option", { value: "6" }, "Stay in valley schools"),
    h("option", { value: "4" }, "Move to Crossett Brook")
  );
  const startPlan = state.plan;
  pairSel.value = startPlan.open.length === 2 ? pairId(startPlan.open) : "MES+WRN";
  topSel.value = startPlan.open.length === 2 ? String(startPlan.valleyTop) : "4";
  const chosenB = () => ({ pair: PAIRS.find((p) => pairId(p) === pairSel.value) ?? PAIRS[2], top: Number(topSel.value) === 6 ? 6 : 4 });
  for (const b of presetBtns) b.addEventListener("click", () => onPreset(b.dataset.kind, chosenB()));
  pairSel.addEventListener("change", () => onPreset("B", chosenB()));
  topSel.addEventListener("change", () => onPreset("B", chosenB()));

  const matched = h("p", { class: "bp-matched" });
  const undoText = h("span", {});
  const undoBtn = h("button", { type: "button", class: "wonk-btn wonk-btn--quiet bp-undo-btn" }, "Undo");
  undoBtn.addEventListener("click", () => {
    const kind = state.undo?.kind;
    onUndo();
    (presetBtns.find((b) => b.dataset.kind === kind) ?? presetBtns[0]).focus();
  });
  const undoRow = h("p", { class: "bp-undo", hidden: true }, undoText, undoBtn);

  const g1 = group(
    1,
    "Start from",
    "Load no change or one of the district's plans, then change anything below.",
    h("div", { class: "bp-presets" }, presetBtns),
    h(
      "div",
      { class: "bp-bversion" },
      h("p", { class: "bp-sub" }, "Path B version"),
      h("p", { class: "bp-bversion-hint", id: "bp-bversion-hint" }, "Changing either one loads that version of Path B."),
      h("div", { class: "wonk-field" }, h("label", { class: "wonk-label", for: "bp-pair" }, h("span", { class: "wonk-sr" }, "Path B: "), "Schools that stay open"), pairSel),
      h("div", { class: "wonk-field" }, h("label", { class: "wonk-label", for: "bp-btop" }, h("span", { class: "wonk-sr" }, "Path B: "), "Where grades 5 and 6 go"), topSel)
    ),
    matched,
    undoRow
  );

  // ---- 2. valley schools ----
  const schoolCards = VALLEY.map((id) => {
    const f = FACILITIES[id];
    const base = `bp-open-${id}`;
    const cb = h("input", { type: "checkbox", id: base, "aria-labelledby": `${base}-name`, "aria-describedby": `${base}-facts ${base}-status` });
    cb.addEventListener("change", () => {
      const on = cb.checked;
      onPlan((p) => ({ ...p, open: on ? [...p.open, id] : p.open.filter((x) => x !== id) }));
    });
    const status = h("span", { class: "bp-school-status", id: `${base}-status` });
    // facts sit on their own lines in the two-column grid and run together, dot-separated, on phones
    const sep = () => [h("span", { class: "wonk-sr" }, ", "), h("span", { class: "bp-dot", "aria-hidden": "true" }, " · ")];
    const label = h(
      "label",
      { class: "wonk-check bp-school", for: base },
      cb,
      h(
        "span",
        { class: "bp-school-text" },
        h("span", { class: "bp-school-name", id: `${base}-name` }, SCHOOLS[id].short),
        h(
          "span",
          { class: "bp-school-facts", id: `${base}-facts` },
          h("span", { class: "nowrap" }, `${num(sum(ATTENDING[2026][id]))} students in K-6`),
          sep(),
          h("span", {}, `${f.classrooms} classrooms`),
          sep(),
          h("span", {}, `Wastewater limit ${f.wastewater}${f.wastewaterExpandable ? ` (could be ${f.wastewaterExpandable})` : ""}`)
        ),
        status
      )
    );
    return { id, cb, status, label };
  });
  const allClosed = h("div", { class: "bp-allclosed", "aria-live": "polite" });

  const g2 = group(
    2,
    "Valley elementary schools that stay open",
    [
      h(
        "span",
        { class: "bp-hint-line" },
        `Uncheck a school to close it; its children go to the nearest open school. The district puts the savings from closing two at ${money(PATH_B_SAVINGS.valley.amount)} a year. `,
        cite(PATH_B_SAVINGS.valley.src)
      ),
      // the definition sits outside the school cards, so tapping it never opens or closes a school
      h(
        "span",
        { class: "bp-hint-line bp-def" },
        term("wastewater", "Wastewater limit"),
        ": the most people a building's septic permit allows. The district compares it to students, including Pre-K."
      ),
    ],
    h("div", { class: "bp-schools" }, schoolCards.map((c) => c.label)),
    allClosed,
    h("p", { class: "bp-src" }, "Students: ", cite(ATTENDING.src, "Oct 1 report"), " · Classrooms and limits: ", cite(ref("deck", "slides 21-24")))
  );

  // ---- 3. grades 5 and 6 ----
  const topRadios = [
    [6, "Stay in valley schools", "k6config"],
    [4, "Move to Crossett Brook", "pk4config"],
  ].map(([v, text, key]) => {
    const input = h("input", { type: "radio", name: "bp-top", value: String(v) });
    input.addEventListener("change", () => {
      if (input.checked) onPlan((p) => ({ ...p, valleyTop: v }));
    });
    return { v, input, label: h("label", { "data-term": key }, input, h("span", { class: "wonk-term" }, text)) };
  });
  const topOff = h("p", { class: "bp-off", id: "bp-top-off", hidden: true }, "No valley school is open, so valley 5th and 6th graders go to Crossett Brook.");
  const g3 = group(
    3,
    "Grades 5 and 6",
    "Where valley 5th and 6th graders go. The district did not publish separate savings for this choice.",
    h("div", { class: "choice bp-choice-stack" }, topRadios.map((r) => r.label)),
    topOff
  );

  // ---- 4. middle schools ----
  const msRadios = [
    [false, "Keep Crossett Brook as grades 5-8"],
    [true, "Move Crossett Brook's 7th and 8th graders to Harwood"],
  ].map(([v, text]) => {
    const input = h("input", { type: "radio", name: "bp-ms", value: v ? "merge" : "keep" });
    input.addEventListener("change", () => {
      if (input.checked) onPlan((p) => ({ ...p, msMerge: v }));
    });
    return { v, input, label: h("label", {}, input, h("span", {}, text)) };
  });
  const g4 = group(
    4,
    "Middle schools",
    h(
      "span",
      {},
      `The district puts the savings from the move at ${money(PATH_B_SAVINGS.middle.amount)} a year and ${num(PATH_B_SAVINGS.middle.fte, 1)} staff positions. `,
      cite(PATH_B_SAVINGS.middle.src)
    ),
    h("div", { class: "choice bp-choice-stack" }, msRadios.map((r) => r.label))
  );

  // ---- 5. program cuts ----
  const cutBoxes = PATH_A_CUTS.items.map((c) => {
    const base = `bp-cut-${c.id}`;
    const cb = h("input", { type: "checkbox", id: base, "aria-labelledby": `${base}-n ${base}-a`, "aria-describedby": `${base}-d` });
    cb.addEventListener("change", () => {
      const on = cb.checked;
      onPlan((p) => ({ ...p, cuts: on ? [...p.cuts, c.id] : p.cuts.filter((x) => x !== c.id) }));
    });
    const label = h(
      "label",
      { class: "wonk-check bp-cut", for: base },
      cb,
      h("span", { class: "bp-cut-text" }, h("span", { class: "bp-cut-name", id: `${base}-n` }, c.name), h("span", { class: "bp-cut-detail", id: `${base}-d` }, c.detail)),
      h("span", { class: "bp-cut-amt", id: `${base}-a` }, money(c.amount))
    );
    return { id: c.id, cb, label };
  });
  const g5 = group(
    5,
    "Program cuts (the Path A list)",
    h("span", {}, `The district's six Path A reductions. Together they equal the target, ${money(PATH_A_CUTS.total)}. `, cite(PATH_A_CUTS.src)),
    h("div", { class: "bp-cuts" }, cutBoxes.map((c) => c.label))
  );

  // ---- 6. building fixes ----
  // "does not apply" joins the description only while Waitsfield is closed (sync)
  const septic = h("input", { type: "checkbox", id: "bp-septic", "aria-describedby": "bp-septic-d" });
  septic.addEventListener("change", () => {
    const on = septic.checked;
    onPlan((p) => ({ ...p, septicWES: on }));
  });
  const septicOff = h("span", { class: "bp-fix-off", id: "bp-septic-off", hidden: true }, "Waitsfield closes in this plan, so this does not apply.");
  const septicRow = h(
    "div",
    { class: "bp-fix" },
    h(
      "label",
      { class: "wonk-check bp-fix-check", for: "bp-septic" },
      septic,
      h("span", { class: "bp-fix-name" }, "Use 300 for Waitsfield (its 1991 permit) instead of 230")
    ),
    h(
      "p",
      { class: "bp-fix-note", id: "bp-septic-d" },
      "Waitsfield's 1991 state permit sets an approved maximum student population of 300, but the design behind it counted students and staff, and a 1996 letter in the state's file says 230. The slides use 230 and list the school as “amenable to 300.” ",
      cite(ref("permitWES", "condition 1.2"), "Waitsfield permit 1991")
    ),
    septicOff
  );

  const ports = PORT_SCHOOLS.map((id) => {
    const base = `bp-port-${id}`;
    const s = stepper({
      id: base,
      min: 0,
      max: PORT_MAX,
      get: () => state.plan.portables[id] ?? 0,
      onSet: (n) => onPlan((p) => ({ ...p, portables: { ...p.portables, [id]: n } })),
      describedby: `${base}-d`,
    });
    const extra = h("span", { class: "bp-port-extra", "aria-hidden": "true" });
    const row = h(
      "div",
      { class: "bp-port" },
      h("label", { class: "bp-port-name", for: base }, h("span", { class: "wonk-sr" }, "Portable units at "), SCHOOLS[id].short),
      h("span", { class: "bp-port-have", id: `${base}-d` }, `${FACILITIES[id].classrooms} classrooms now`, h("span", { class: "wonk-sr" }, `. Each unit adds 2 classrooms. Up to ${PORT_MAX} units.`)),
      s.el,
      extra
    );
    return { id, row, input: s.input, extra };
  });
  const perUnitLo = MODULAR.low / MODULAR.units;
  const perUnitHi = MODULAR.high / MODULAR.units;

  const g6 = group(
    6,
    "Building fixes the district did not test",
    "These change how many students a building can hold, not the yearly budget.",
    septicRow,
    h(
      "div",
      { class: "bp-portables" },
      h("p", { class: "bp-sub" }, "Portable classrooms"),
      h(
        "p",
        { class: "bp-fix-note" },
        `Each unit has 2 classrooms. The district estimates ${money(MODULAR.low)} to ${money(MODULAR.high)} for two units, so about ${money(perUnitLo)} to ${money(perUnitHi)} per unit, one-time. `,
        cite(MODULAR.src)
      ),
      h("div", { class: "bp-ports" }, ports.map((p) => p.row))
    )
  );

  // ---- 7. advanced ----
  // the savings target: the district's, or the lower one if older bond payments are left out (the Options page's choice)
  const basisRadios = [
    ["district", `${money(TARGET)}: the district's target`, "As presented on October 14 and 28."],
    ["exclusion", `${money(TARGET_WITH_EXCLUSION)}: if older bond payments are left out`, "State law leaves payments on bonds voters approved before July 1, 2026 out of the FY28 test. The district's target counts them."],
  ].map(([v, title, sub]) => {
    const input = h("input", { type: "radio", name: "bp-basis", value: v });
    input.addEventListener("change", () => {
      if (input.checked) onBasis(v);
    });
    return { v, input, label: h("label", {}, input, h("span", {}, h("span", { class: "bp-choice-title" }, title), h("span", { class: "bp-choice-sub" }, sub))) };
  });

  // the wastewater limits: as the slides apply them, or as each state permit is written
  const readingRadios = [
    ["slides", "As on the slides", "Students only, against 230 (Waitsfield), 250 (Fayston), 235 (Moretown), and 237 (Warren), as the district compared them."],
    ["permits", "As the state permits read", "Waitsfield: 300 students, as its 1991 permit words it. Elsewhere staff count too, and Fayston's limit is 235. Staff numbers are our estimate."],
  ].map(([v, title, sub]) => {
    const input = h("input", { type: "radio", name: "bp-reading", value: v });
    input.addEventListener("change", () => {
      if (input.checked) onReading(v);
    });
    return { v, input, label: h("label", {}, input, h("span", {}, h("span", { class: "bp-choice-title" }, title), h("span", { class: "bp-choice-sub" }, sub))) };
  });

  // the district's draft roadmap: one new valley building in fall 2029
  const roadmapBox = h("input", { type: "checkbox", id: "bp-roadmap", "aria-describedby": "bp-roadmap-d" });
  const roadmapTop = h("select", { class: "wonk-select", id: "bp-roadmap-top" }, [4, 5, 6].map((n) => h("option", { value: n }, `Pre-K to ${n}${n === 4 ? " (Phase 3; author's stated preference)" : n === 5 ? " (Phase 2 text)" : " (feasibility study)"}`)));
  roadmapBox.addEventListener("change", () => onPlan((p) => ({ ...p, roadmap: roadmapBox.checked ? { fall: 2029, top: Number(roadmapTop.value) } : null })));
  roadmapTop.addEventListener("change", () => onPlan((p) => ({ ...p, roadmap: p.roadmap ? { ...p.roadmap, top: Number(roadmapTop.value) } : null })));

  const csSteppers = CS_FIELDS.map((f) => {
    const id = `bp-cs-${f.key}`;
    const s = stepper({ id, min: f.min, max: f.max, get: () => state.cs[f.key], onSet: (n) => onClassSize({ ...state.cs, [f.key]: n }), describedby: "bp-cs-hint" });
    return { f, input: s.input, field: h("div", { class: "wonk-field bp-cs-field" }, h("label", { class: "wonk-label", for: id }, f.label), s.el) };
  });
  const csReset = h("button", { type: "button", class: "wonk-btn wonk-btn--quiet" }, "Reset class sizes");
  csReset.addEventListener("click", () => onClassSize({ ...CS_DEFAULT }));

  const recvRows = VALLEY.map((sid) => {
    const town = SCHOOLS[sid].town;
    const id = `bp-recv-${town}`;
    const sel = h("select", { class: "wonk-select", id });
    sel.addEventListener("change", () => {
      const v = sel.value;
      onPlan((p) => ({ ...p, receiving: { ...p.receiving, [town]: v } }));
    });
    const field = h("div", { class: "wonk-field bp-recv-field" }, h("label", { class: "wonk-label", for: id }, `${townName(town)} children go to`), sel);
    const only = h("p", { class: "bp-recv-only" });
    const wrap = h("div", { class: "bp-recv", hidden: true }, field, only);
    return { sid, town, sel, field, only, wrap, sig: "" };
  });
  const recvNone = h("p", { class: "bp-recv-none" }, "Every valley school is open, so every town keeps its own school.");
  const recvDistrict = h(
    "p",
    { class: "bp-fix-note", hidden: true },
    "With exactly two valley schools open, the student counts come from the district's own table, which places children by home address. A choice here changes children's school paths, not those counts."
  );

  const advanced = h(
    "details",
    { class: "wonk-fold bp-advanced", id: "bp-advanced" },
    h("summary", {}, "Advanced: savings target, wastewater limits, draft roadmap, class sizes, and where children go"),
    h(
      "div",
      { class: "body" },
      h(
        "fieldset",
        { class: "bp-subgroup", "aria-describedby": "bp-basis-hint" },
        h("legend", {}, "Which savings target?"),
        h(
          "p",
          { class: "hint", id: "bp-basis-hint" },
          "Why there are two targets: ",
          h("a", { href: "#/findings" }, "What we checked"),
          ". ",
          cite(ref("vsa4001", "§ 4001(6)(B)"), "State law")
        ),
        h("div", { class: "choice bp-choice-stack" }, basisRadios.map((r) => r.label))
      ),
      h(
        "fieldset",
        { class: "bp-subgroup", "aria-describedby": "bp-reading-hint" },
        h("legend", {}, "Which wastewater limits?"),
        h("p", { class: "hint", id: "bp-reading-hint" }, "The slides and the state permits disagree. ", h("a", { href: "#/findings" }, "What we checked"), ". ", cite(ref("permitWES", "condition 1.2"), "Waitsfield permit")),
        h("div", { class: "choice bp-choice-stack" }, readingRadios.map((r) => r.label))
      ),
      h(
        "fieldset",
        { class: "bp-subgroup", "aria-describedby": "bp-roadmap-d" },
        h("legend", {}, "Later years: the district's draft roadmap"),
        h("label", { class: "wonk-check", for: "bp-roadmap" }, roadmapBox, " In fall 2029, move all valley students into one new building"),
        h("div", { class: "wonk-field" }, h("label", { class: "wonk-label", for: "bp-roadmap-top" }, "The new building teaches"), roadmapTop),
        h("p", { class: "hint", id: "bp-roadmap-d" }, "From the district's October 14 draft roadmap, which its author called a suggestion. It changes how many schools children attend, not this year's budget or buildings. ", cite(ref("oct14", "Draft Proposal for School Reconfiguration & Consolidation Roadmap"), "Oct 14 deck"))
      ),
      h(
        "fieldset",
        { class: "bp-subgroup", "aria-describedby": "bp-cs-hint" },
        h("legend", {}, "Largest class used to count classrooms"),
        h("p", { class: "hint", id: "bp-cs-hint" }, "One class per grade. A smaller limit means more classrooms needed."),
        h("div", { class: "bp-cs" }, csSteppers.map((s) => s.field)),
        csReset
      ),
      h(
        "fieldset",
        { class: "bp-subgroup" },
        h("legend", {}, "Where children go when their school closes"),
        h("p", { class: "hint" }, "The nearest open school is the default, the rule the district used. Families on a town's edge may live closer to another school."),
        recvNone,
        recvRows.map((r) => r.wrap),
        recvDistrict
      )
    )
  );
  // a link that arrives with the lower target opens this section, so the reader sees which target is in use
  if (state.basis === "exclusion" || state.reading === "permits" || state.plan.roadmap) advanced.open = true;

  const el = h(
    "div",
    { class: "bp-controls" },
    h("h2", { class: "bp-col-title", id: "bp-controls-title" }, "Your choices"),
    g1,
    g2,
    g3,
    g4,
    g5,
    g6,
    advanced
  );

  function sync(plan, r) {
    const named = matchNamed(plan);
    const kind = presetKind(named);
    for (const b of presetBtns) b.setAttribute("aria-pressed", String(b.dataset.kind === kind));
    if (kind === "B") {
      pairSel.value = pairId(named.open);
      topSel.value = String(named.valleyTop);
    }
    matched.replaceChildren(
      kind === "today"
        ? h("span", {}, "Right now this is ", h("strong", {}, "no change"), ": every school open and no cuts.")
        : named
          ? h("span", {}, "Your plan matches ", h("strong", {}, namedLabel(named)), ".")
          : h("span", {}, "Your own combination. It does not match one of the district's plans.")
    );
    undoRow.hidden = !state.undo;
    if (state.undo) {
      const before = matchNamed(state.undo.plan);
      const back = presetKind(before) === "today" ? "no change" : before ? namedLabel(before) : "your own plan";
      undoText.textContent = `Before this: ${back}.`;
      undoBtn.setAttribute("aria-label", `Undo: go back to ${back}`);
    }

    // valley schools
    for (const c of schoolCards) {
      const open = plan.open.includes(c.id);
      c.cb.checked = open;
      c.label.classList.toggle("is-closed", !open);
      const town = SCHOOLS[c.id].town;
      c.status.textContent = open ? "Stays open" : `Closes. ${townName(town)} children go to ${schoolShort(receivingSchool(plan, town))}.`;
    }
    // the warning sits in a polite live region: touch it only when its words change
    const bps = r.capacity.schools.find((s) => s.id === "BPS");
    const closedKey = plan.open.length === 0 ? `${bps.total}/${bps.limit}` : "";
    if (closedKey !== allClosed.dataset.key) {
      allClosed.dataset.key = closedKey;
      allClosed.replaceChildren(
        closedKey
          ? note(
              "warn",
              h("strong", {}, "All four valley elementary schools would close. "),
              `Valley children would go to Brookside in Waterbury through grade 4 and to Crossett Brook for grades 5 and 6. Brookside would have about ${num(bps.total)} students against its limit of ${num(bps.limit)}. The district did not study this option.`
            )
          : ""
      );
    }

    // grades 5-6: with no valley school open the choice has nothing to act on
    const noValley = plan.open.length === 0;
    for (const t of topRadios) {
      t.input.checked = plan.valleyTop === t.v;
      t.input.disabled = noValley;
    }
    topOff.hidden = !noValley;
    g3.classList.toggle("is-off", noValley);
    describedBy(g3, noValley ? ["bp-hint-3", "bp-top-off"] : ["bp-hint-3"]);

    // middle schools, cuts
    for (const m of msRadios) m.input.checked = plan.msMerge === m.v;
    for (const c of cutBoxes) c.cb.checked = plan.cuts.includes(c.id);

    // building fixes
    const wesOpen = plan.open.includes("WES");
    septic.checked = plan.septicWES;
    septic.disabled = !wesOpen;
    septicRow.classList.toggle("is-off", !wesOpen);
    septicOff.hidden = wesOpen;
    describedBy(septic, wesOpen ? ["bp-septic-d"] : ["bp-septic-d", "bp-septic-off"]);
    for (const p of ports) {
      const on = p.id === "BPS" || plan.open.includes(p.id);
      p.row.hidden = !on;
      const n = plan.portables[p.id] ?? 0;
      if (document.activeElement !== p.input) p.input.value = String(n);
      p.extra.textContent = n ? `+${n * 2} classrooms` : "";
    }

    // advanced: target, class sizes
    for (const b of basisRadios) b.input.checked = r.budget.basis === b.v;
    for (const b of readingRadios) b.input.checked = r.capacity.reading === b.v;
    roadmapBox.checked = Boolean(plan.roadmap);
    if (plan.roadmap) roadmapTop.value = String(plan.roadmap.top);
    roadmapTop.disabled = !plan.roadmap;
    for (const s of csSteppers) if (document.activeElement !== s.input) s.input.value = String(state.cs[s.f.key]);

    // advanced: receiving schools
    let anyClosed = false;
    for (const row of recvRows) {
      const opts = receivingOptions(plan, row.town);
      row.wrap.hidden = opts.length === 0;
      if (!opts.length) continue;
      anyClosed = true;
      row.field.hidden = opts.length < 2;
      row.only.hidden = opts.length >= 2;
      if (opts.length < 2) {
        row.only.textContent = `${townName(row.town)} children go to ${schoolShort(opts[0])}, the only open school for their grades.`;
        continue;
      }
      const sig = opts.join(",");
      if (sig !== row.sig) {
        row.sel.replaceChildren(...opts.map((sid, i) => h("option", { value: sid }, `${schoolShort(sid)}${sid === "BPS" ? " (Waterbury)" : ""}${i === 0 ? " (nearest)" : ""}`)));
        row.sig = sig;
      }
      row.sel.value = receivingSchool(plan, row.town);
    }
    recvNone.hidden = anyClosed;
    recvDistrict.hidden = !(anyClosed && r.capacity.source === "district");
  }

  // Open Advanced and put focus on the savings target choice (the results' "Change the target" button).
  function showBasis() {
    advanced.open = true;
    (basisRadios.find((b) => b.input.checked) ?? basisRadios[0]).input.focus();
  }

  return { el, sync, showBasis };
}
