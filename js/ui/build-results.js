// Results for the "Build a plan" page: budget, buildings, students, and a comparison with the
// district's plans. The panel is rebuilt on every change; the controls are not.

import { BUDGET, MODULAR, PATH_A_CUTS, PATH_B_SAVINGS } from "../../data/budget.js";
import { ATTENDING } from "../../data/enrollment.js";
import { FACILITIES, SCHOOLS, TOWNS } from "../../data/schools.js";
import { ref } from "../../data/sources.js";
import { EXCLUSION_PER_PUPIL, PK_PLAN, PLAN_A, PLAN_TODAY, PUPILS, TARGET, budget, encodePlan, evaluate, matchNamed, modelLoads, pathB, receivingSchool, townSchool } from "../model/index.js";
import { h, listJoin, money, moneyShort, num, plural, store } from "./dom.js";
import { cite, note, schoolName, schoolShort, status, tag, term } from "./kit.js";
import { heatGrid } from "./heat.js";
import { namedLabel, pairLabel, topWords, townName } from "./build-controls.js";

const sum = (o) => Object.values(o ?? {}).reduce((a, b) => a + b, 0);
const pc = (x) => `${Math.max(0, Math.min(100, x * 100)).toFixed(2)}%`;
const fte = (n) => (Number.isInteger(n) ? num(n) : num(n, 1));
const sr = (text) => h("span", { class: "wonk-sr" }, text);
const TODAY_SCHOOLS = 3; // every child attends three K-12 schools today
const ATT = ATTENDING[2026];
const CBMS78 = ATT.CBMS[7] + ATT.CBMS[8];
const CBMS_NOW = sum(ATT.CBMS);
const HU_NOW = sum(ATT.HU);
// "No change" is the district's level-service budget (slide 10)
const LEVEL_SERVICE = BUDGET.scenarios.find((x) => x.id === "level-service");
const STATE_LAW = () => cite(ref("vsa4001", "§ 4001(6)(B)"), "State law");
// Pre-K in our own estimates: the planning numbers in the district's capacity tables
const PK_WORDS = `${PK_PLAN.FES} at each valley school that stays open (${PK_PLAN.WRN} at Warren) and ${PK_PLAN.BPS} at Brookside`;

const lowerTarget = (b) => b.basis === "exclusion";
const targetWord = (b) => (lowerTarget(b) ? "the lower target" : "the target");

// The sentence the screen-reader live region reads after a change: the budget verdict only.
export function verdictSentence(r) {
  const b = r.budget;
  const head = `This plan saves ${money(b.savings)} a year.`;
  if (b.gap < 0) return `${head} It meets ${targetWord(b)} with ${money(-b.gap)} to spare.`;
  if (b.gap === 0) return `${head} It meets ${targetWord(b)} exactly.`;
  return `${head} It is ${money(b.gap)} short of ${targetWord(b)}.`;
}

const verdictWords = (b) =>
  b.gap < 0 ? `Meets ${targetWord(b)} with ${money(-b.gap)} to spare` : b.gap === 0 ? `Meets ${targetWord(b)} exactly` : `Short of ${targetWord(b)} by ${money(b.gap)}`;

function kpi(label, value, sub) {
  return h("div", { class: "bp-kpi" }, h("span", { class: "wonk-label" }, label), h("span", { class: "wonk-num bp-kpi-val" }, value), sub ? h("span", { class: "bp-kpi-sub" }, sub) : null);
}

const moreThanToday = (n) => (n > TODAY_SCHOOLS ? `${n - TODAY_SCHOOLS} more than today` : n === TODAY_SCHOOLS ? "same as today" : `${TODAY_SCHOOLS - n} fewer than today`);

// onShowBasis: moves focus to the savings target choice in the controls
export function resultsPanel({ onShowBasis } = {}) {
  const folds = new Map(); // fold key -> open, so folds stay put while the panel redraws
  const keptFold = (key, summary, ...children) => {
    const d = h("details", { class: "wonk-fold", open: folds.get(key) ? true : null }, h("summary", {}, summary), h("div", { class: "body" }, ...children));
    d.addEventListener("toggle", () => folds.set(key, d.open));
    return d;
  };

  const title = h("h2", { class: "bp-col-title", id: "bp-results-title", tabindex: "-1" }, "What this plan does");
  const matched = h("p", { class: "bp-results-match" });
  const strip = h("div", { class: "bp-strip" });
  const body = h("div", { class: "bp-results-body" });
  const share = shareBlock();
  const el = h("section", { class: "bp-results", id: "bp-results", "aria-labelledby": "bp-results-title" }, h("header", { class: "bp-results-head" }, title, matched, strip), body, share);

  // the compact summary that sticks to the bottom of the screen on phones while the controls scroll
  const barFill = h("span", { class: "bp-bar-fill" });
  const barSave = h("strong", { class: "wonk-num bp-bar-val" });
  const barSaveSub = h("span", { class: "bp-bar-sub" });
  const barSchools = h("strong", { class: "wonk-num bp-bar-val" });
  const barBtn = h("button", { type: "button", class: "wonk-btn bp-bar-btn" }, "Results");
  barBtn.addEventListener("click", () => {
    el.scrollIntoView({ block: "start" });
    title.focus({ preventScroll: true });
  });
  const bar = h(
    "div",
    { class: "bp-bar", role: "group", "aria-label": "Plan summary" },
    h("span", { class: "bp-bar-meter", "aria-hidden": "true" }, barFill),
    h("p", { class: "bp-bar-line bp-bar-save" }, h("span", { class: "wonk-sr" }, "Savings: "), barSave, h("span", { class: "bp-bar-unit" }, " a year "), barSaveSub),
    h("p", { class: "bp-bar-line bp-bar-kids" }, "Most schools per child: ", barSchools, h("span", { class: "bp-bar-unit" }, ` (${TODAY_SCHOOLS} today)`)),
    barBtn
  );

  // cs: the four class-size inputs ({ PK, K2, G34, G56 }); classSize: the same, per grade, as evaluate() takes
  function update(plan, r, { cs, classSize }) {
    const b = r.budget;
    const meets = b.gap <= 0;
    const named = matchNamed(plan);

    matched.replaceChildren(
      named?.id === "today"
        ? "No change: every school open and no cuts."
        : named
          ? h("span", {}, "Matches ", h("strong", {}, namedLabel(named)), ".")
          : "Your own combination of choices."
    );
    strip.replaceChildren(
      kpi("Yearly savings", moneyShort(b.savings), status(meets, "Meets target", `Short ${moneyShort(b.gap)}`)),
      kpi("Buildings in use", `${r.buildingsOpen} of 7`),
      kpi("Most schools per child", String(r.maxYoung.all), moreThanToday(r.maxYoung.all)),
      kpi("Changing schools", num(r.moved.k12), "K-12 students, fall 2027")
    );

    barFill.style.width = pc(b.savings / b.target);
    barSave.textContent = moneyShort(b.savings);
    barSaveSub.replaceChildren(status(meets, "Meets target", `Short ${moneyShort(b.gap)}`));
    barSchools.textContent = String(r.maxYoung.all);

    body.replaceChildren(
      budgetSection(plan, r, named, keptFold, onShowBasis),
      buildingsSection(plan, r, cs, keptFold),
      studentsSection(plan, r, keptFold),
      compareSection(plan, r, classSize)
    );
    window.wonk?.init(el);
  }

  return { el, bar, update };
}

// ---------------------------------------------------------------- budget
function savingsMeter(b) {
  const max = Math.max(b.target * 1.5, b.savings * 1.08);
  const at = (v) => pc(v / max);
  const targetPos = b.target / max;
  const label = lowerTarget(b) ? "Lower target" : "Target";
  return h(
    "div",
    { class: "bp-meter", role: "img", "aria-label": `Savings of ${money(b.savings)} a year, against ${targetWord(b)} of ${money(b.target)}.` },
    h("div", { class: "meter" }, h("span", { class: "fill", style: `width:${at(b.savings)}` }), h("span", { class: "mark", style: `left:${at(b.target)}` })),
    h(
      "div",
      { class: "bp-meter-scale", "aria-hidden": "true" },
      h("span", { class: "bp-meter-zero" }, "$0"),
      h("span", { class: `bp-meter-target${targetPos > 0.75 ? " is-end" : ""}`, style: `left:${at(b.target)}` }, `${label} ${moneyShort(b.target)}`)
    )
  );
}

function itemSource(it) {
  if (it.id === "middle") return PATH_B_SAVINGS.middle.src;
  if (it.id === "valley") return PATH_B_SAVINGS.valley.src;
  return PATH_A_CUTS.src;
}

function budgetSection(plan, r, named, keptFold, onShowBasis) {
  const b = r.budget;
  const meets = b.gap <= 0;
  const closed = r.closed.length;
  const lower = lowerTarget(b);
  // no change on the same basis: the district's level-service budget (slide 10)
  const noChange = budget(PLAN_TODAY, { basis: b.basis });

  // where the total comes from: printed (a district plan), our sum of printed items, or with our estimate
  const totalKind = b.hasEstimate ? "estimate" : named?.kind === "district" || b.items.length <= 1 ? "district" : "derived";
  const totalCite = named?.id === "A" ? PATH_A_CUTS.src : named?.kind === "district" ? ref("deck", "slide 19") : b.items.length === 1 ? itemSource(b.items[0]) : null;

  const targetLine = lower
    ? h(
        "p",
        {},
        "Saves ",
        h("strong", { class: "wonk-num" }, money(b.savings)),
        ` a year. Using the lower target, ${money(b.target)}: the cut needed if payments on bonds voters approved before July 1, 2026 are left out of the FY28 test, as state law provides. The district's own target is ${money(TARGET)}. `,
        STATE_LAW(),
        " ",
        tag("derived")
      )
    : h(
        "p",
        {},
        "Saves ",
        h("strong", { class: "wonk-num" }, money(b.savings)),
        ` a year. The district's target is ${money(b.target)}, the amount that keeps next year's budget level with this year's. `,
        cite(BUDGET.src)
      );

  const pp = Math.round(Math.abs(b.vsThreshold));
  const thresholdTerm = term("threshold", "excess spending threshold");
  // a plan that saves nothing is the district's level-service budget, which slide 10 also prices
  const slide10 =
    b.savings === 0
      ? lower
        ? [`Slide 10 prints the same figures for this budget: ${money(LEVEL_SERVICE.perPupilVsThreshold)} per pupil and ${money(LEVEL_SERVICE.penalty)}. `, cite(BUDGET.src)]
        : [
            `Slide 10 prints ${money(LEVEL_SERVICE.perPupilVsThreshold)} per pupil and ${money(LEVEL_SERVICE.penalty)} for this same budget, before the district's own debt-exclusion correction; see How the budget numbers work below. `,
            cite(BUDGET.src),
          ]
      : null;
  let perPupil;
  if (b.vsThreshold > 0) {
    perPupil = h(
      "p",
      {},
      `Spending per pupil would be about ${money(pp)} over the `,
      thresholdTerm,
      ", so HUUSD taxpayers would pay an ",
      term("penalty", "excess spending penalty"),
      ` of about ${moneyShort(b.penalty)} a year. `,
      tag("derived")
    );
  } else if (meets) {
    perPupil = h("p", {}, `Spending per pupil would be about ${money(pp)} under the `, thresholdTerm, ", so there would be no excess spending penalty. ", tag("derived"));
  } else {
    perPupil = h(
      "p",
      {},
      `Spending per pupil would still be about ${money(pp)} under the `,
      thresholdTerm,
      ", so there would be no excess spending penalty, but less margin than the target leaves. ",
      tag("derived")
    );
  }

  const items = b.items.length
    ? h(
        "ul",
        { class: "bp-items" },
        b.items.map((it) =>
          h(
            "li",
            {},
            h("span", { class: "bp-item-name" }, it.label),
            h("span", { class: "bp-item-amt" }, money(it.amount)),
            h(
              "span",
              { class: "bp-item-meta" },
              tag(it.kind),
              cite(itemSource(it)),
              it.fte ? h("span", {}, `${fte(it.fte)} staff positions`) : null,
              it.kind === "estimate"
                ? h("span", { class: "bp-item-note" }, `The district costed closing exactly two schools (${money(PATH_B_SAVINGS.valley.amount)}). We use half of that, ${money(PATH_B_SAVINGS.valley.amount / 2)}, for each school closed.`)
                : null
            )
          )
        ),
        h(
          "li",
          { class: "bp-total" },
          h("span", { class: "bp-item-name" }, "Total a year"),
          h("span", { class: "bp-item-amt" }, money(b.savings)),
          h("span", { class: "bp-item-meta" }, tag(totalKind), totalCite ? cite(totalCite) : null)
        )
      )
    : h("p", { class: "bp-empty" }, "Nothing is saved yet. Close schools, move Crossett Brook's 7th and 8th graders, or choose program cuts.");

  // positions: the district counted them for the two consolidations only, not for the Path A cuts
  const cutsNote = plan.cuts.length ? "The district did not say how many positions the program cuts remove." : null;
  let staff = null;
  if (b.fte > 0) {
    staff = h(
      "p",
      {},
      `Staff positions reduced${plan.cuts.length ? " by the consolidations" : ""}: `,
      h("strong", { class: "wonk-num" }, fte(b.fte)),
      " ",
      term("fte", "FTE"),
      ". ",
      tag(b.items.some((i) => i.fte && i.kind === "estimate") ? "estimate" : "district"),
      cutsNote ? h("span", { class: "bp-muted" }, ` ${cutsNote}`) : null
    );
  } else if (cutsNote) {
    staff = h("p", { class: "bp-muted" }, `Staff positions: ${cutsNote}`);
  }

  const oneTime = [];
  if (b.oneTime.portables) {
    const p = b.oneTime.portables;
    oneTime.push(
      h(
        "li",
        {},
        h("span", { class: "bp-item-name" }, `Portable classrooms: ${plural(p.units, "unit")}, ${plural(p.units * 2, "classroom")}`),
        h("span", { class: "bp-item-amt" }, `${moneyShort(p.low)} to ${moneyShort(p.high)}`),
        h("span", { class: "bp-item-meta" }, tag("derived"), cite(MODULAR.src), h("span", {}, `From the district's estimate of ${money(MODULAR.low)} to ${money(MODULAR.high)} for two units.`))
      )
    );
  }
  if (plan.septicWES && plan.open.includes("WES")) {
    oneTime.push(
      h(
        "li",
        {},
        h("span", { class: "bp-item-name" }, "Raise Waitsfield's wastewater limit to 300"),
        h("span", { class: "bp-item-amt bp-unknown" }, "Not published"),
        h("span", { class: "bp-item-meta" }, cite(FACILITIES.WES.src), h("span", {}, "The district lists Waitsfield as “amenable to 300” but gives no cost."))
      )
    );
  }

  // the per-pupil amount slide 10 moved its level-funded figure by when it removed the debt exclusion
  const correction = money(EXCLUSION_PER_PUPIL);
  return h(
    "section",
    { class: "bp-sec", "aria-labelledby": "bp-budget-h" },
    h("h3", { id: "bp-budget-h" }, "Budget"),
    h("p", { class: "bp-verdict" }, status(meets, verdictWords(b), verdictWords(b))),
    savingsMeter(b),
    targetLine,
    lower && onShowBasis ? h("p", { class: "bp-note" }, h("button", { type: "button", class: "bp-textbtn", onclick: onShowBasis }, "Change the target")) : null,
    perPupil,
    slide10 && b.vsThreshold > 0 ? h("p", { class: "bp-note" }, slide10) : null,
    h("h4", {}, "Where the savings come from"),
    items,
    staff,
    oneTime.length
      ? h(
          "div",
          { class: "bp-onetime" },
          h("h4", {}, "One-time costs"),
          h("p", { class: "bp-muted" }, "Paid once, not every year. They are not part of the yearly savings above."),
          h("ul", { class: "bp-items" }, oneTime)
        )
      : null,
    keptFold(
      "budget",
      "How the budget numbers work",
      h(
        "ul",
        {},
        lower
          ? h(
              "li",
              {},
              `The lower target, ${money(b.target)}, is the district's ${money(TARGET)} less ${money(TARGET - b.target)}: ${correction} per pupil, the amount slide 10 added to its level-funded figure when it removed the debt exclusion. State law leaves payments on bonds voters approved before July 1, 2026 out of the FY28 test; payments on a new bond would count. `,
              STATE_LAW(),
              " ",
              cite(BUDGET.src)
            )
          : h(
              "li",
              {},
              `The target, ${money(b.target)}, is the cut the district says holds the FY28 budget level with this year's, which keeps spending per pupil just under the state threshold. `,
              cite(BUDGET.src),
              ` If payments on bonds voters approved before July 1, 2026 are left out of the test, as state law provides, the cut needed is about $500,000 smaller. You can switch to that target under Advanced. `,
              STATE_LAW()
            ),
        h(
          "li",
          {},
          "Savings for each lever are the district's figures. ",
          closed && closed !== 2
            ? `The district costed closing exactly two valley schools. For ${closed === 1 ? "one" : closed === 3 ? "three" : "four"}, we scale its figure by the number of buildings closed. Real savings would depend on which schools close and how staff are reassigned. `
            : "The district costed closing exactly two valley schools; for any other number we scale its figure by the number of buildings closed and label it an estimate. ",
          cite(PATH_B_SAVINGS.valley.src)
        ),
        h(
          "li",
          {},
          `Spending per pupil and the penalty are calculated on this site. The district's level-funded and Path B figures fall on a straight line: every ${money(Math.round(PUPILS))} saved lowers spending per pupil by $1. The penalty is the amount over the threshold times about ${num(Math.round(PUPILS))} pupils. `,
          cite(ref("deck", "slides 10 and 20"))
        ),
        lower
          ? h(
              "li",
              {},
              `For no change, this gives about ${money(Math.round(noChange.vsThreshold))} per pupil over the threshold and a penalty of about ${moneyShort(noChange.penalty)}, the figures slide 10 prints for the same budget (${money(LEVEL_SERVICE.perPupilVsThreshold)} and ${money(LEVEL_SERVICE.penalty)}). `,
              cite(BUDGET.src)
            )
          : h(
              "li",
              {},
              `For no change, this gives about ${money(Math.round(noChange.vsThreshold))} per pupil over the threshold and a penalty of about ${moneyShort(noChange.penalty)}. Slide 10 prints ${money(LEVEL_SERVICE.perPupilVsThreshold)} and ${money(LEVEL_SERVICE.penalty)} for the same budget. The slide notes that its level-funded figure was corrected by ${correction} per pupil to remove the debt exclusion; we apply the same correction to every plan, which accounts for the difference. `,
              cite(BUDGET.src)
            ),
        h("li", {}, "Staff positions are the district's counts for the two consolidations. It did not publish positions for the Path A cuts.")
      )
    )
  );
}

// ---------------------------------------------------------------- buildings
// "20 to 24" (or "22" when every K-6 limit is the same)
function sizeRange(cs) {
  const v = [cs.K2, cs.G34, cs.G56];
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  return lo === hi ? String(lo) : `${lo} to ${hi}`;
}

function capBar(value, limit, over) {
  const scale = Math.max(value, limit, 1) * 1.12;
  return h(
    "div",
    { class: "cap-bar", "aria-hidden": "true" },
    h("span", { class: `fill${over ? " is-over" : ""}`, style: `width:${pc(value / scale)}` }),
    h("span", { class: "limit", style: `left:${pc(limit / scale)}` })
  );
}

// One school: students against its limit, and classrooms needed against classrooms it has.
// Each row reads as text ("Students: 227, wastewater limit 237. Under limit."); the bar is a picture of it.
function schoolCap(s, receives) {
  const limitWord = s.limitKind === "occupancy" ? "occupancy" : "wastewater";
  const row = (name, nums, value, limit, over, okText, badText) =>
    h(
      "div",
      { class: "cap-row" },
      h("span", { class: "name" }, name, sr(":")),
      capBar(value, limit, over),
      h("span", { class: "nums" }, nums),
      h("span", { class: "bp-cap-status" }, sr(". "), status(!over, okText, badText))
    );
  return h(
    "div",
    { class: "bp-cap-school" },
    h(
      "h4",
      {},
      schoolName(s.id),
      receives.length ? h("span", { class: "bp-receives" }, `Also takes ${listJoin(receives)} children`) : null,
      s.portables ? h("span", { class: "bp-receives" }, `${plural(s.portables, "portable unit")} added`) : null
    ),
    h(
      "div",
      { class: "cap" },
      s.countsStaff
        ? row(
            "Students and staff",
            [`${num(s.total)} + about ${num(Math.round(s.staff))} staff, `, sr(`${limitWord} `), `limit ${num(s.limit)}`],
            s.counted,
            s.limit,
            s.overPeople,
            "Under limit",
            `${num(Math.round(s.counted - s.limit))} over`
          )
        : row("Students", [`${num(s.total)}, `, sr(`${limitWord} `), `limit ${num(s.limit)}`], s.total, s.limit, s.overPeople, "Under limit", `${num(s.total - s.limit)} over`),
      row("Classroom space", `${num(s.total)}, room for ${num(s.consultantCapacity)}`, s.total, s.consultantCapacity, s.overConsultant, "Enough", `${num(s.total - s.consultantCapacity)} over`),
      row("Classes at your class sizes", `${num(s.roomsNeeded)} needed, has ${num(s.roomsHave)}`, s.roomsNeeded, s.roomsHave, s.overRooms, "Enough", `${num(s.roomsNeeded - s.roomsHave)} short`)
    )
  );
}

function buildingsSection(plan, r, cs, keptFold) {
  const cap = r.capacity;
  const receivers = {};
  for (const id of r.closed) {
    const town = SCHOOLS[id].town;
    (receivers[receivingSchool(plan, town)] ??= []).push(townName(town));
  }
  const overP = cap.schools.filter((s) => s.overPeople);
  const overR = cap.schools.filter((s) => s.overConsultant);

  // Crossett Brook and the Harwood campus: counts with this year's students; no published limits
  const cbms = sum(modelLoads(plan).CBMS) + (plan.msMerge ? 0 : CBMS78);
  const hu = HU_NOW + (plan.msMerge ? CBMS78 : 0);
  const middleChanges = cbms !== CBMS_NOW || hu !== HU_NOW;

  const summary = [];
  const readingWords = cap.reading === "permits" ? "as the state permits read" : "as the slides apply them";
  summary.push(
    overP.length
      ? `${listJoin(overP.map((s) => schoolShort(s.id)))} would be over ${overP.length === 1 ? "its" : "their"} wastewater or occupancy limit, ${readingWords}.`
      : `Every school in use would be under its wastewater or occupancy limit, ${readingWords}.`
  );
  summary.push(
    overR.length
      ? `${listJoin(overR.map((s) => schoolShort(s.id)))} would hold more students than the district's consultant counted classroom space for.`
      : "Every school would be within the classroom space the district's consultant counted."
  );

  let source;
  if (cap.source === "district") {
    source = h("p", { class: "bp-source" }, "Student counts for the elementary schools: the district's table for this pairing. ", tag("district"), cite(cap.table.src));
  } else if (plan.open.length === 4 && plan.valleyTop === 6) {
    source = h("p", { class: "bp-source" }, "Student counts: this year's enrollment on October 1, including Pre-K. ", tag("district"), cite(ATTENDING.src, "Oct 1 report"));
  } else if (plan.open.length === 4) {
    source = h(
      "p",
      { class: "bp-source" },
      "Student counts are our estimate: this year's students, including Pre-K, with valley 5th and 6th graders counted at Crossett Brook. ",
      tag("estimate"),
      cite(ATTENDING.src, "Oct 1 report")
    );
  } else {
    source = h(
      "p",
      { class: "bp-source" },
      `The district did not publish a table for this combination, so the counts are our estimate: this year's students move with their school to the school that receives them, and Pre-K follows the district's planning numbers, ${PK_WORDS}. `,
      tag("estimate"),
      cite(ATTENDING.src, "Oct 1 report"),
      " ",
      cite(ref("deck", "slides 27-32"))
    );
  }

  return h(
    "section",
    { class: "bp-sec", "aria-labelledby": "bp-build-h" },
    h("h3", { id: "bp-build-h" }, "Buildings"),
    h(
      "p",
      { class: "bp-lead" },
      h("strong", {}, `${r.buildingsOpen} of 7 school buildings in use. `),
      r.closed.length ? `${listJoin(r.closed.map(schoolShort))} ${r.closed.length === 1 ? "closes" : "close"}.` : "None close."
    ),
    h("p", {}, summary.join(" ")),
    source,
    cap.mismatches.length
      ? note(
          "info",
          "The district's printed totals on this slide do not match its own grade rows: ",
          cap.mismatches.map((m) => `${schoolShort(m.school)} ${num(m.printed)} printed, ${num(m.rows)} in the rows`).join("; "),
          ". We use the rows. ",
          cite(cap.table.src)
        )
      : null,
    h(
      "p",
      { class: "bp-source" },
      `Classrooms needed: our estimate, one class per grade for every ${sizeRange(cs)} students. The district did not publish this check. `,
      tag("estimate")
    ),
    h(
      "p",
      { class: "bp-legend", "aria-hidden": "true" },
      h("span", { class: "bp-legend-bar" }, h("span", { class: "bp-legend-fill" }), h("span", { class: "bp-legend-line" })),
      "Bar: students, or classrooms needed. Line: the limit, or the classrooms the building has."
    ),
    h("div", { class: "bp-caps" }, cap.schools.map((s) => schoolCap(s, receivers[s.id] ?? []))),
    middleChanges
      ? h(
          "p",
          { class: "bp-muted" },
          `With this year's students, Crossett Brook would have ${num(cbms)} students (${num(CBMS_NOW)} now) and the Harwood campus ${num(hu)} (${num(HU_NOW)} now). The district did not publish capacity limits for these two buildings, so they are not checked here. `,
          tag("estimate")
        )
      : null,
    keptFold(
      "buildings",
      "How capacity is checked",
      h(
        "ul",
        {},
        h(
          "li",
          {},
          "Wastewater, as the slides apply it: each building's students, including Pre-K, against 230 (Waitsfield), 250 (Fayston), 235 (Moretown), and 237 (Warren). Brookside's limit is its maximum occupancy of 480. ",
          cite(ref("deck", "slides 21-25"))
        ),
        h(
          "li",
          {},
          "Wastewater, as the state permits read: Waitsfield 300 students (its 1991 permit); Fayston 235 and Warren 237 students and staff; Moretown 2,820 gallons a day, counted as 235 people; Brookside 480 counting everyone. Staff numbers are our estimate. Choose the reading under Advanced. ",
          cite(ref("permitWES", "condition 1.2"), "Waitsfield permit")
        ),
        h(
          "li",
          {},
          "Classroom space: the capacities the district's planning consultant, TruexCullins, calculated in March 2025, using the State Board's maximums of 20 students per K-4 classroom and 25 per grade 5-8 classroom. Each portable unit adds room for 40. ",
          cite(ref("truexCap", "Capacities"))
        ),
        h(
          "li",
          {},
          `Classes at your class sizes is our estimate: one class per grade for every ${cs.K2} students in kindergarten to grade 2 (${cs.G34} in grades 3-4, ${cs.G56} in grades 5-6, ${cs.PK} in Pre-K), against the classrooms on the district's facility slides. Schools also use rooms for special education, art, music, and offices. Change the class sizes under Advanced.`
        ),
        h(
          "li",
          {},
          `When exactly two valley schools stay open, the counts come from the district's capacity table for that pairing, which includes its Pre-K planning numbers. With all four open, they are this year's students (October 1, 2026), including Pre-K. Otherwise we place this year's students where this plan would send them, and Pre-K follows the district's planning numbers from its capacity tables: ${PK_WORDS}. `,
          cite(ref("deck", "slides 27-32"))
        ),
        h("li", {}, "A portable unit adds 2 classrooms but does not change the wastewater limit. Using Waitsfield's permitted 300 changes only its limit.")
      )
    )
  );
}

// ---------------------------------------------------------------- students
function studentsSection(plan, r, keptFold) {
  const m = r.moved;
  const preKClosure = m.preK - m.byReason.prek;
  const k12Closure = m.byReason.closure - preKClosure;
  const reasons = [
    [k12Closure, "because their school closes"],
    [m.byReason.grades56, "because valley grades 5 and 6 move to Crossett Brook"],
    [m.byReason.middle, "because Crossett Brook's 7th and 8th graders move to Harwood"],
    [m.byReason.other, "for other reasons"],
  ].filter(([n]) => n > 0);

  let moves;
  if (m.k12) {
    moves = h(
      "div",
      { class: "bp-moves" },
      h("p", {}, h("strong", { class: "wonk-num" }, num(m.k12)), " of this year's K-12 students would start fall 2027 in a different school than they would with no change:"),
      h("ul", {}, reasons.map(([n, why]) => h("li", {}, h("strong", { class: "wonk-num" }, num(n)), ` ${why}`)))
    );
  } else {
    moves = h("p", {}, "No K-12 student would change schools next fall beyond the usual moves, like 6th graders going on to Harwood.");
  }
  const preK =
    m.preK > 0
      ? h(
          "p",
          {},
          `Also ${plural(m.preK, "child", "children")} now in Pre-K would change programs: `,
          listJoin(
            [
              preKClosure ? `${num(preKClosure)} because their school closes` : null,
              m.byReason.prek ? `${num(m.byReason.prek)} because district Pre-K classes end and families use private programs` : null,
            ].filter(Boolean)
          ),
          ". ",
          tag("derived")
        )
      : null;

  // the Your child's path page shows the saved plan as "Your plan"; save it on the way there
  const childLink = h("a", { class: "wonk-btn", href: "#/your-child" }, "See your child's path under this plan");
  childLink.addEventListener("click", () => store.set("plan", encodePlan(plan)));

  return h(
    "section",
    { class: "bp-sec", "aria-labelledby": "bp-kids-h" },
    h("h3", { id: "bp-kids-h" }, "Students"),
    h(
      "div",
      { class: "bp-stats" },
      kpiCard("Most K-12 schools", String(r.maxYoung.all), `for a child now in Pre-K to grade 2; ${moreThanToday(r.maxYoung.all)}`),
      kpiCard("Changing schools", num(m.k12), "K-12 students next fall, beyond the usual moves"),
      kpiCard("5 or more schools", num(r.fivePlus.total), "students now in Pre-K to grade 8 who would attend that many")
    ),
    h("p", { class: "bp-muted" }, "All three are calculated from the district's October 1 enrollment. ", tag("derived"), cite(ATTENDING.src, "Oct 1 report")),
    h("h4", {}, "Most schools for a child now in Pre-K to grade 2, by town"),
    h(
      "ul",
      { class: "bp-towns" },
      TOWNS.map((t) => {
        const n = r.maxYoung[t.id];
        return h(
          "li",
          { class: n > TODAY_SCHOOLS ? "is-more" : null },
          h("span", { class: "bp-town" }, t.name),
          h("span", { class: "bp-town-n" }, h("strong", { class: "wonk-num" }, String(n)), n > TODAY_SCHOOLS ? h("small", {}, ` +${n - TODAY_SCHOOLS}`) : null)
        );
      })
    ),
    h("h4", {}, "Who changes schools next fall"),
    moves,
    preK,
    r.fivePlus.total
      ? h(
          "p",
          {},
          h("strong", { class: "wonk-num" }, num(r.fivePlus.total)),
          ` of this year's students in Pre-K to grade 8 would attend 5 or more K-12 schools: `,
          listJoin(
            Object.entries(r.fivePlus.byTown)
              .sort((a, b) => b[1] - a[1])
              .map(([town, n]) => `${num(n)} now at ${town === "waterbury" ? "Brookside or Crossett Brook" : schoolShort(townSchool(town))}`)
          ),
          "."
        )
      : null,
    keptFold(
      "grid",
      "Every town and grade",
      h("p", {}, `Number of different K-12 schools for a child in each town and grade this year, at their town's usual school. Today every cell is ${TODAY_SCHOOLS}.`),
      heatGrid(plan),
      h("p", {}, "We count different schools from kindergarten through grade 12. Harwood Union Middle School and Harwood Union High School count as two schools in one building. Plans take effect in fall 2027.")
    ),
    h("p", {}, childLink)
  );
}

function kpiCard(label, value, sub) {
  return h(
    "div",
    { class: "wonk-stat stat bp-stat" },
    h("span", { class: "wonk-label bp-stat-label" }, label),
    h("span", { class: "wonk-num bp-stat-num" }, value),
    h("small", { class: "stat-sub bp-stat-sub" }, sub)
  );
}

// ---------------------------------------------------------------- comparison
function compareSection(plan, r, classSize) {
  const basis = r.budget.basis;
  const pairB = plan.open.length === 2;
  const planB = pairB ? pathB(plan.open, plan.valleyTop) : pathB(["MES", "WRN"], 4);
  const reading = r.capacity.reading;
  const a = evaluate(PLAN_A, { classSize, basis, reading });
  const bb = evaluate(planB, { classSize, basis, reading });
  const cols = [
    ["Your plan", r],
    ["Path A", a],
    ["Path B", bb],
  ];
  const rows = [
    ["Savings a year", (x) => moneyShort(x.budget.savings)],
    [lowerTarget(r.budget) ? "Meets the lower target" : "Meets the target", (x) => status(x.budget.gap <= 0, "Yes", "No")],
    ["Buildings in use", (x) => `${x.buildingsOpen} of 7`],
    ["Most K-12 schools for a child", (x) => String(x.maxYoung.all)],
    ["Changing schools next fall", (x) => num(x.moved.k12)],
    ["At 5 or more schools", (x) => num(x.fivePlus.total)],
  ];
  const bName = `${pairLabel(planB.open)} open, ${topWords(planB.valleyTop)}`;
  return h(
    "section",
    { class: "bp-sec", "aria-labelledby": "bp-cmp-h" },
    h("h3", { id: "bp-cmp-h" }, "Compared with the district's plans"),
    h(
      "div",
      { class: "table-scroll bp-cmp-scroll", tabindex: "0", role: "region", "aria-label": "Comparison with the district's plans" },
      h(
        "table",
        { class: "wonk-table bp-cmp" },
        h("caption", { class: "wonk-sr" }, `Your plan compared with Path A and Path B (${bName})`),
        h("thead", {}, h("tr", {}, h("th", { scope: "col" }, sr("Measure")), cols.map(([name]) => h("th", { scope: "col", class: "num" }, name)))),
        h("tbody", {}, rows.map(([label, f]) => h("tr", {}, h("th", { scope: "row" }, label), cols.map(([, x]) => h("td", { class: "num" }, f(x))))))
      )
    ),
    h(
      "p",
      { class: "bp-muted" },
      `Path B here: ${bName}${pairB ? ", the same schools as your plan" : ", one of twelve versions"}. “Most K-12 schools” is for a child now in Pre-K to grade 2; “changing schools” counts K-12 students. Savings for Path A and Path B are the district's figures; the rest is calculated${lowerTarget(r.budget) ? `, against the lower target of ${moneyShort(r.budget.target)}` : ""}. `,
      h("a", { href: "#/compare" }, "Compare all the plans")
    )
  );
}

// ---------------------------------------------------------------- share
function shareBlock() {
  const input = h("input", { class: "wonk-input", id: "bp-share-url", readonly: true, type: "text" });
  const fallback = h(
    "div",
    { class: "wonk-field bp-share-fallback", hidden: true },
    h("label", { class: "wonk-label", for: "bp-share-url" }, "Link to this plan"),
    input,
    h("span", { class: "wonk-help" }, "The link is selected. Copy it with Ctrl+C, or Command+C on a Mac.")
  );
  const btn = h("button", { type: "button", class: "wonk-btn wonk-btn--primary" }, "Copy link to this plan");
  btn.addEventListener("click", async () => {
    const url = location.href;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(url);
      window.wonk?.toast("Link copied", "ok");
    } catch {
      input.value = url;
      fallback.hidden = false;
      input.focus();
      input.select();
      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
      if (copied) window.wonk?.toast("Link copied", "ok");
    }
  });
  return h(
    "section",
    { class: "bp-sec bp-share", "aria-labelledby": "bp-share-h" },
    h("h3", { id: "bp-share-h" }, "Share this plan"),
    h("p", {}, "The link opens this page with the same choices, so others can see exactly what you see."),
    h("div", { class: "btn-row" }, btn),
    fallback
  );
}
