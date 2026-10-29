// Controls for the "Build a plan" page. They are built once; sync() sets their values in place,
// so a keyboard user never loses their place while the results redraw.

import { PATH_A_CUTS, PATH_B_SAVINGS, MODULAR } from "../../data/budget.js";
import { PAIRS } from "../../data/district-scenarios.js";
import { ATTENDING } from "../../data/enrollment.js";
import { FACILITIES, SCHOOLS, TOWNS, VALLEY } from "../../data/schools.js";
import { ref } from "../../data/sources.js";
import { CLASS_SIZE_DEFAULT, TARGET, TARGET_WITH_EXCLUSION, encodePlan, makePlan, matchNamed, pathB, receivingOptions, receivingSchool } from "../model/index.js";
import { h, listJoin, money, num } from "./dom.js";
import { cite, note, schoolShort, term } from "./kit.js";

export const pairId = (pair) => [...pair].sort().join("+");
export const pairLabel = (pair) => pair.map(schoolShort).join(" + ");
export const townName = (id) => TOWNS.find((t) => t.id === id)?.name ?? id;
const sum = (o) => Object.values(o ?? {}).reduce((a, b) => a + b, 0);
const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v))));

// Each valley school's wastewater limit in step 2, in the words of the reading chosen under Advanced.
const PERMIT_WORDS = {
  FES: "Permit: 235 students and staff",
  MES: "Permit: 2,820 gallons a day, about 235 people",
  WES: "Permit: 300 students (1991)",
  WRN: "Permit: 237 students and staff",
};
const slidesLimit = (f) => `Wastewater limit ${f.wastewater} on the slides${f.wastewaterExpandable ? ` (“amenable to ${f.wastewaterExpandable}”)` : ""}`;

// Where valley 5th and 6th graders go, in words (no hyphens, so a line never breaks inside "K-6").
export const topWords = (top) => (top === 4 ? "grades 5 and 6 at Crossett Brook" : top === 5 ? "grade 6 at Crossett Brook" : "grades 5 and 6 in the valley");

// Two starting points beyond the district's plans. "one": Path B's middle-school move with one valley school
// closing instead of two (the district has not costed it). "hybrid": the fewest closures that meets the target on
// paper: the middle-school move, every valley school open, and three of the smaller Path A cuts.
export const HYBRID_CUTS = ["special", "prek", "athletics"];
export const onePlan = (closed) => makePlan({ open: VALLEY.filter((id) => id !== closed), valleyTop: 6, msMerge: true });
export const hybridPlan = () => makePlan({ open: VALLEY, valleyTop: 6, msMerge: true, cuts: HYBRID_CUTS });

// Which starting point a plan is, if any: "today", "A", "B", "one", "hybrid", or null.
export function presetOf(plan) {
  const kind = presetKind(matchNamed(plan));
  if (kind) return kind;
  const same = (a) => encodePlan(a) === encodePlan({ ...plan, receiving: {} });
  if (plan.open.length === 3 && same(onePlan(VALLEY.find((id) => !plan.open.includes(id))))) return "one";
  return same(hybridPlan()) ? "hybrid" : null;
}

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

// How a plan relates to the district's plans:
//   { named }          it is one of them
//   { base, extras }   it is one of them plus portable units or Waitsfield at 300 ("5 portable units")
//   { nearB }          it keeps two valley schools open but not the middle-school move: one step from that Path B
//   {}                 none of these
export function relation(plan) {
  const named = matchNamed(plan);
  if (named) return { named };
  const base = matchNamed({ ...plan, portables: {}, septicWES: false });
  if (base) {
    const units = sum(plan.portables);
    return { base, extras: [units ? `${units} portable unit${units === 1 ? "" : "s"}` : null, plan.septicWES ? "300 for Waitsfield" : null].filter(Boolean) };
  }
  if (plan.open.length === 2 && !plan.msMerge && !plan.cuts.length && !plan.roadmap) return { nearB: pathB(plan.open, plan.valleyTop) };
  return {};
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
    ["one", "Close one school"],
    ["hybrid", "Merger + smaller cuts"],
  ].map(([kind, label]) => h("button", { type: "button", class: "wonk-btn bp-preset", "aria-pressed": "false", "data-kind": kind }, label));

  // Each starts on an empty choice unless exactly two valley schools are open, so the box never disagrees
  // with steps 2 and 3. Path B with an empty choice loads Moretown + Warren with grades 5-6 at Crossett Brook.
  const pairSel = h(
    "select",
    { class: "wonk-select", id: "bp-pair", "aria-describedby": "bp-bversion-hint" },
    h("option", { value: "", disabled: true }, "Pick two schools"),
    PAIRS.map((p) => h("option", { value: pairId(p) }, pairLabel(p)))
  );
  // same words and order as step 3
  const topSel = h(
    "select",
    { class: "wonk-select", id: "bp-btop", "aria-describedby": "bp-bversion-hint" },
    h("option", { value: "", disabled: true }, "Pick one"),
    h("option", { value: "6" }, "Stay in valley schools"),
    h("option", { value: "4" }, "Move to Crossett Brook")
  );
  const startPlan = state.plan;
  pairSel.value = startPlan.open.length === 2 ? pairId(startPlan.open) : "";
  topSel.value = startPlan.open.length === 2 ? String(startPlan.valleyTop) : "";
  // the one school that closes in "Close one school"
  const oneSel = h(
    "select",
    { class: "wonk-select", id: "bp-one", "aria-describedby": "bp-one-hint" },
    h("option", { value: "", disabled: true }, "Pick one"),
    VALLEY.map((id) => h("option", { value: id }, SCHOOLS[id].short))
  );
  oneSel.value = startPlan.open.length === 3 ? VALLEY.find((id) => !startPlan.open.includes(id)) : "";
  const chosen = () => ({
    pair: PAIRS.find((p) => pairId(p) === pairSel.value) ?? PAIRS[2],
    top: Number(topSel.value) === 6 ? 6 : 4,
    closed: VALLEY.includes(oneSel.value) ? oneSel.value : "FES",
  });
  for (const b of presetBtns) b.addEventListener("click", () => onPreset(b.dataset.kind, chosen()));
  pairSel.addEventListener("change", () => onPreset("B", chosen()));
  topSel.addEventListener("change", () => onPreset("B", chosen()));
  oneSel.addEventListener("change", () => onPreset("one", chosen()));

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
    "Load no change, one of the district's plans, or one of two other starting points, then change anything below.",
    h("div", { class: "bp-presets" }, presetBtns),
    h(
      "div",
      { class: "bp-bversion" },
      h("p", { class: "bp-sub" }, "Path B version"),
      h("p", { class: "bp-bversion-hint", id: "bp-bversion-hint" }, "Changing either one loads that version of Path B."),
      h("div", { class: "wonk-field" }, h("label", { class: "wonk-label", for: "bp-pair" }, h("span", { class: "wonk-sr" }, "Path B: "), "Schools that stay open"), pairSel),
      h("div", { class: "wonk-field" }, h("label", { class: "wonk-label", for: "bp-btop" }, h("span", { class: "wonk-sr" }, "Path B: "), "Where grades 5 and 6 go"), topSel)
    ),
    h(
      "div",
      { class: "bp-bversion" },
      h("p", { class: "bp-sub" }, "Close one school"),
      h(
        "p",
        { class: "bp-bversion-hint", id: "bp-one-hint" },
        "Path B's middle-school move with one valley school closing instead of two. The district has not costed closing one; the savings are our estimate, half its figure for two."
      ),
      h("div", { class: "wonk-field" }, h("label", { class: "wonk-label", for: "bp-one" }, "School that closes"), oneSel)
    ),
    h(
      "p",
      { class: "bp-bversion-hint" },
      h("strong", {}, "Merger + smaller cuts: "),
      "every valley school stays open; the middle schools merge; and three of Path A's smaller cuts (special programming, the Pre-K tuition model, and 70% of athletics and activities) fill the rest. It meets the target on paper only if the merger saves nearly the district's full figure with grades 5-6 in the valley."
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
    // the slides' limit, or the permit's words when the state permits reading is on (sync)
    const limitEl = h("span", {}, slidesLimit(f));
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
          limitEl
        ),
        status
      )
    );
    return { id, cb, status, label, limitEl };
  });
  const allClosed = h("div", { class: "bp-allclosed", "aria-live": "polite" });

  const g2 = group(
    2,
    "Valley elementary schools that stay open",
    [
      h(
        "span",
        { class: "bp-hint-line" },
        `Uncheck one school to close one, or two to close two; their children go to the nearest open school. The district puts the savings from closing two at ${money(PATH_B_SAVINGS.valley.amount)} a year; for one, we use half, an estimate. `,
        cite(PATH_B_SAVINGS.valley.src)
      ),
      // the definition sits outside the school cards, so tapping it never opens or closes a school
      h(
        "span",
        { class: "bp-hint-line bp-def" },
        term("wastewater", "Wastewater limit"),
        ": the most people a building's septic permit allows. The slides compare it to students, including Pre-K; read the state permits' way (under Advanced), staff count too, except at Waitsfield."
      ),
    ],
    h("div", { class: "bp-schools" }, schoolCards.map((c) => c.label)),
    allClosed,
    h("p", { class: "bp-src" }, "Students: ", cite(ATTENDING.src, "Oct 1 report"), " · Classrooms and limits: ", cite(ref("deck", "slides 21-24")))
  );

  // ---- 3. grades 5 and 6 ----
  const topRadios = [
    [6, "Through grade 6, as today", "k6config"],
    [5, "Through grade 5: 6th graders go to Crossett Brook", null],
    [4, "Through grade 4: 5th and 6th graders go to Crossett Brook", "pk4config"],
  ].map(([v, text, key]) => {
    const input = h("input", { type: "radio", name: "bp-top", value: String(v) });
    input.addEventListener("change", () => {
      if (input.checked) onPlan((p) => ({ ...p, valleyTop: v }));
    });
    return { v, input, label: h("label", key ? { "data-term": key } : {}, input, h("span", { class: key ? "wonk-term" : "" }, text)) };
  });
  // Pre-K classes in district schools: the same setting as the Pre-K tuition model in step 5
  const preKBox = h("input", { type: "checkbox", id: "bp-prek", "aria-describedby": "bp-prek-d" });
  preKBox.addEventListener("change", () => {
    const keep = preKBox.checked;
    onPlan((p) => ({ ...p, cuts: keep ? p.cuts.filter((c) => c !== "prek") : [...p.cuts, "prek"] }));
  });
  const topOff = h("p", { class: "bp-off", id: "bp-top-off", hidden: true }, "No valley school is open, so valley 5th and 6th graders go to Crossett Brook.");
  const spanSaid = h("p", { class: "bp-sub", "aria-live": "polite" });
  const g3 = group(
    3,
    "Valley school grades",
    "The highest grade the valley schools teach, and whether district schools keep Pre-K classes. The district's Path B savings assume every valley 5th and 6th grader moves to Crossett Brook; on October 28 an administrator said keeping them in the valley would save less.",
    h("div", { class: "choice bp-choice-stack" }, topRadios.map((r) => r.label)),
    h(
      "label",
      { class: "wonk-check bp-prek" },
      preKBox,
      h("span", {}, "District schools keep Pre-K classes (uncheck for K-only schools)")
    ),
    h(
      "p",
      { class: "bp-fix-note", id: "bp-prek-d" },
      "Unchecked is the district's Pre-K tuition model: district Pre-K classes end everywhere, including Brookside, and families get public tuition for private programs (step 5). The district costed it for the whole district only. ",
      cite(PATH_A_CUTS.src)
    ),
    spanSaid,
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

  // ---- 6. building changes ----
  // a note on why the Waitsfield choice does nothing joins its description while Waitsfield is closed, or while
  // the state permits reading (already 300) is on (sync)
  const septic = h("input", { type: "checkbox", id: "bp-septic", "aria-describedby": "bp-septic-d" });
  septic.addEventListener("change", () => {
    const on = septic.checked;
    onPlan((p) => ({ ...p, septicWES: on }));
  });
  const septicOff = h("span", { class: "bp-fix-off", id: "bp-septic-off", hidden: true }, "Waitsfield closes in this plan, so this does not apply.");
  const septicPermits = h("span", { class: "bp-fix-off", id: "bp-septic-permits", hidden: true }, "The state permits reading already uses 300 for Waitsfield.");
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
    septicOff,
    septicPermits
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
    "Building changes not in the district's capacity tables",
    "These change how many students a building can hold. Portable classrooms also cost money; see Budget in the results.",
    septicRow,
    h(
      "div",
      { class: "bp-portables" },
      h("p", { class: "bp-sub" }, "Portable classrooms"),
      h(
        "p",
        { class: "bp-fix-note" },
        `Each unit has 2 classrooms. The district's best preliminary quote is ${money(MODULAR.low)} to ${money(MODULAR.high)} for two units for a two-year period, mostly site preparation, so about ${money(perUnitLo)} to ${money(perUnitHi)} per unit for those two years. `,
        cite(MODULAR.src),
        " ",
        cite(ref("meeting1028", "portable classrooms"))
      ),
      h("div", { class: "bp-ports" }, ports.map((p) => p.row))
    )
  );

  // ---- 7. advanced ----
  // the savings target: the district's, or the lower one if older bond payments are left out (the Options page's choice)
  const basisRadios = [
    ["district", `${money(TARGET)}: the district's target`, "As presented on October 14 and 28."],
    [
      "exclusion",
      `${money(TARGET_WITH_EXCLUSION)}: if older bond payments are left out`,
      "State law leaves payments on bonds voters approved before July 1, 2026 out of the FY28 test. The district's figures appear to count them; it has not said why.",
    ],
  ].map(([v, title, sub]) => {
    const input = h("input", { type: "radio", name: "bp-basis", value: v });
    input.addEventListener("change", () => {
      if (input.checked) onBasis(v);
    });
    return { v, input, label: h("label", {}, input, h("span", {}, h("span", { class: "bp-choice-title" }, title), h("span", { class: "bp-choice-sub" }, sub))) };
  });

  // the wastewater limits: as the slides apply them, or as each state permit is written
  const readingRadios = [
    [
      "slides",
      "As on the slides",
      "Students only, against 230 (Waitsfield), 250 (Fayston), 235 (Moretown), 237 (Warren), and Brookside's occupancy of 480, as the district compared them.",
    ],
    [
      "permits",
      "As the state permits read",
      "Waitsfield: 300 students, as its 1991 permit words it. Elsewhere staff count too, and Fayston's limit is 235. Staff numbers are our estimate.",
    ],
  ].map(([v, title, sub]) => {
    const input = h("input", { type: "radio", name: "bp-reading", value: v });
    input.addEventListener("change", () => {
      if (input.checked) onReading(v);
    });
    return { v, input, label: h("label", {}, input, h("span", {}, h("span", { class: "bp-choice-title" }, title), h("span", { class: "bp-choice-sub" }, sub))) };
  });

  // the district's draft roadmap: one new valley building in fall 2029
  const roadmapBox = h("input", { type: "checkbox", id: "bp-roadmap", "aria-describedby": "bp-roadmap-d" });
  const roadmapTop = h("select", { class: "wonk-select", id: "bp-roadmap-top" }, [4, 5, 6].map((n) => h("option", { value: n }, `Pre-K to ${n}${n === 4 ? " (author's preference)" : n === 5 ? " (the draft's Phase 2)" : " (feasibility study)"}`)));
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
    // tabindex: the results' "Back to your choices" buttons move focus here
    h("h2", { class: "bp-col-title", id: "bp-controls-title", tabindex: "-1" }, "Your choices"),
    g1,
    g2,
    g3,
    g4,
    g5,
    g6,
    advanced
  );

  // A plan that keeps two valley schools open but not the middle-school move: add the move in one step, and put
  // focus on the step 4 choice it sets (this paragraph, and the button, are redrawn).
  function addMove() {
    onPlan((p) => ({ ...p, msMerge: true }));
    msRadios.find((m) => m.v).input.focus();
  }

  function sync(plan, r) {
    const rel = relation(plan);
    const named = rel.named ?? null;
    const kind = presetKind(named);
    const preset = presetOf(plan);
    for (const b of presetBtns) b.setAttribute("aria-pressed", String(b.dataset.kind === preset));
    oneSel.value = preset === "one" ? VALLEY.find((id) => !plan.open.includes(id)) : "";
    if (plan.open.length === 2) {
      pairSel.value = pairId(plan.open);
      topSel.value = String(plan.valleyTop);
    } else {
      pairSel.value = "";
      topSel.value = "";
    }
    matched.replaceChildren(
      kind === "today"
        ? h("span", {}, "Right now this is ", h("strong", {}, "no change"), ": every school open and no cuts.")
        : named
          ? h("span", {}, "Your plan matches ", h("strong", {}, namedLabel(named)), ".")
          : rel.base
            ? h("span", {}, "Your plan is ", h("strong", {}, rel.base.id === "today" ? "no change" : namedLabel(rel.base)), `, plus ${listJoin(rel.extras)}.`)
            : rel.nearB
              ? h(
                  "span",
                  {},
                  "One step from ",
                  h("strong", {}, namedLabel(rel.nearB)),
                  `: Path B also moves Crossett Brook's 7th and 8th graders to Harwood (step 4), which the district says saves ${money(PATH_B_SAVINGS.middle.amount)} a year${
                    plan.valleyTop > 4 ? ", though it said keeping valley 5th and 6th graders out of Crossett Brook would save less" : ""
                  }. `,
                  h("button", { type: "button", class: "bp-textbtn", onclick: addMove }, "Add that move")
                )
              : preset === "one"
                ? h("span", {}, "Path B's middle-school move with ", h("strong", {}, `${SCHOOLS[VALLEY.find((id) => !plan.open.includes(id))].short} closing`), " instead of two schools. Not costed by the district.")
                : preset === "hybrid"
                  ? h("span", {}, "The middle-school move with ", h("strong", {}, "every valley school open"), " and three of Path A's smaller cuts. Not one of the district's plans.")
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
    const permitsOn = r.capacity.reading === "permits";
    for (const c of schoolCards) {
      const open = plan.open.includes(c.id);
      c.cb.checked = open;
      c.label.classList.toggle("is-closed", !open);
      const town = SCHOOLS[c.id].town;
      c.status.textContent = open ? "Stays open" : `Closes. ${townName(town)} children go to ${schoolShort(receivingSchool(plan, town))}.`;
      c.limitEl.textContent = permitsOn ? PERMIT_WORDS[c.id] : slidesLimit(FACILITIES[c.id]);
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
    preKBox.checked = !plan.cuts.includes("prek");
    const span = `${plan.cuts.includes("prek") ? "Kindergarten" : "Pre-K"} through grade ${plan.valleyTop}`;
    spanSaid.textContent = noValley ? "" : `Valley schools: ${span}.`;
    topOff.hidden = !noValley;
    g3.classList.toggle("is-off", noValley);
    describedBy(g3, noValley ? ["bp-hint-3", "bp-top-off"] : ["bp-hint-3"]);

    // middle schools, cuts
    for (const m of msRadios) m.input.checked = plan.msMerge === m.v;
    for (const c of cutBoxes) c.cb.checked = plan.cuts.includes(c.id);

    // building changes: using 300 for Waitsfield does nothing while it is closed, or under the state permits
    // reading, which already uses 300
    const wesOpen = plan.open.includes("WES");
    septic.checked = plan.septicWES;
    septic.disabled = !wesOpen || permitsOn;
    septicRow.classList.toggle("is-off", !wesOpen || permitsOn);
    septicOff.hidden = wesOpen;
    septicPermits.hidden = !wesOpen || !permitsOn;
    describedBy(septic, ["bp-septic-d", ...(!wesOpen ? ["bp-septic-off"] : permitsOn ? ["bp-septic-permits"] : [])]);
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
