// Results for the "Build a plan" page: budget, buildings, students, and a comparison with the
// district's plans. The panel is rebuilt on every change; the controls are not.

import { BUDGET, MODULAR, PATH_A_CUTS, PATH_B_SAVINGS } from "../../data/budget.js";
import { ATTENDING } from "../../data/enrollment.js";
import { FACILITIES, SCHOOLS, TOWNS, VALLEY } from "../../data/schools.js";
import { ref } from "../../data/sources.js";
import { EXCLUSION_PER_PUPIL, PK_PLAN, PLAN_A, PLAN_TODAY, PUPILS, TARGET, budget, effectiveSplit, encodePlan, evaluate, pathB, receivingSchool, townSchool } from "../model/index.js";
import { h, listJoin, money, moneyShort, num, plural, store } from "./dom.js";
import { cite, note, schoolName, schoolShort, status, tag, term, unsure } from "./kit.js";
import { heatGrid } from "./heat.js";
import { track } from "./track.js";
import { namedLabel, optionOf, pairLabel, relation, topWords, townName } from "./build-controls.js";

const pc = (x) => `${Math.max(0, Math.min(100, x * 100)).toFixed(2)}%`;
const fte = (n) => (Number.isInteger(n) ? num(n) : num(n, 1));
const sr = (text) => h("span", { class: "wonk-sr" }, text);
const TODAY_SCHOOLS = 3; // every child attends three K-12 schools today
// "No change" is the district's level-service budget (slide 10)
const LEVEL_SERVICE = BUDGET.scenarios.find((x) => x.id === "level-service");
const STATE_LAW = () => cite(ref("vsa4001", "§ 4001(6)(B)"), "State law");
// Pre-K in our own estimates: the planning numbers in the district's capacity tables
const PK_WORDS = `${PK_PLAN.FES} at each valley school that stays open (${PK_PLAN.WRN} at Warren) and ${PK_PLAN.BPS} at Brookside`;

const lowerTarget = (b) => b.basis === "exclusion";
const targetWord = (b) => (lowerTarget(b) ? "the lower target" : "the target");

// What the plan would save if the portable classrooms' cost all came out of next year's budget, at the high
// and low ends of the district's quote ({ lo, hi }); null when the plan adds none.
const afterPortables = (b) => (b.oneTime.portables ? { lo: b.savings - b.oneTime.portables.high, hi: b.savings - b.oneTime.portables.low } : null);
// Portable classrooms that could use up the plan's margin over the target.
const portablesShort = (b) => Boolean(b.oneTime.portables) && afterPortables(b).lo < b.target;
// "would" when even the low end of the quote uses up the margin, "could" when only the high end does
const portWould = (b) => (afterPortables(b).hi < b.target ? "would" : "could");
// Savings that reach the target only on a figure that may not hold: the district's full figure where it said this
// version saves less, or savings before portable classrooms that could use up the margin. For these plans the
// verdict, the summary, the bar, spending per pupil, and the comparison all stop short of "meets the target".
const mayFallShort = (b) => b.gap <= 0 && (b.upperBound || portablesShort(b));
const spare = (b) => (b.gap === 0 ? "exactly" : `with ${money(-b.gap)} to spare`);

// The sentence the screen-reader live region reads after a change: the plan's main results, so a change that
// leaves the savings alone (a grade 5-6 choice, a reading, a portable unit, class sizes) is still spoken.
export function verdictSentence(r) {
  const b = r.budget;
  const cap = r.capacity;
  const names = (ids) => ids.map((id) => schoolShort(id));
  const over = names(cap.overPeople);
  const rooms = names([...cap.overConsultant, ...cap.overMiddle]);
  const classes = names(cap.overRooms);
  const vs =
    b.gap > 0
      ? `It is ${b.upperBound ? "at least " : ""}${money(b.gap)} short of ${targetWord(b)}.`
      : b.upperBound
        ? `It would meet ${targetWord(b)} only if the district's full figure holds.`
        : portablesShort(b)
          ? `It meets ${targetWord(b)} before portable classrooms, but ${portWould(b)} fall short if their cost all came out of next year's budget.`
          : `It meets ${targetWord(b)} ${spare(b)}.`;
  const port = b.oneTime.portables;
  return [
    `This plan saves ${b.upperBound ? "at most " : ""}${money(b.savings)} a year. ${vs}`,
    port ? `${plural(port.units, "portable unit")}, about ${moneyShort(port.low)} to ${moneyShort(port.high)} over two years, not counted in the savings.` : "",
    `${r.buildingsOpen} of 7 buildings in use.`,
    over.length ? `Over the wastewater or occupancy limit: ${listJoin(over)}.` : "Every school within its wastewater or occupancy limit.",
    rooms.length ? `Over the consultant's classroom space: ${listJoin(rooms)}.` : "",
    classes.length ? `Short of classrooms at your class sizes: ${listJoin(classes)}.` : "",
    `Most schools for any child: ${r.maxYoung.all}. ${num(r.moved.k12)} students change schools next fall.`,
  ]
    .filter(Boolean)
    .join(" ");
}

// The budget verdict: the headline, and for a plan that may fall short, the reason (set smaller under it).
function verdictWords(b) {
  if (b.gap > 0) return [`Short of ${targetWord(b)} by ${b.upperBound ? "at least " : ""}${money(b.gap)}`];
  if (b.upperBound) {
    return [
      `Meets ${targetWord(b)} only if the district's full figure holds (then ${b.gap === 0 ? "nothing" : money(-b.gap)} to spare${b.oneTime.portables ? ", before portable classrooms" : ""}).`,
      "The district said this version saves less and could mean a penalty.",
    ];
  }
  if (portablesShort(b))
    return [
      `Meets ${targetWord(b)} ${spare(b)} before portable classrooms.`,
      `If their cost all came out of next year's budget, it ${portWould(b)} fall short.`,
    ];
  return [`Meets ${targetWord(b)} ${spare(b)}`];
}

const shortText = (b) => `${lowerTarget(b) ? `Short of lower target by ${moneyShort(b.gap)}` : `Short ${moneyShort(b.gap)}`}${b.upperBound ? " or more" : ""}`;
// The savings status in the summary strip and (brief) the phone bar.
const budgetMark = (b, brief = false) =>
  mayFallShort(b)
    ? unsure(brief ? "May fall short" : `May fall short of ${targetWord(b)}`)
    : status(b.gap <= 0, lowerTarget(b) ? "Meets lower target" : "Meets target", shortText(b));

function kpi(label, value, sub) {
  return h("div", { class: "bp-kpi" }, h("span", { class: "wonk-label" }, label), h("span", { class: "wonk-num bp-kpi-val" }, value), sub ? h("span", { class: "bp-kpi-sub" }, sub) : null);
}

const moreThanToday = (n) => (n > TODAY_SCHOOLS ? `${n - TODAY_SCHOOLS} more than today` : n === TODAY_SCHOOLS ? "same as today" : `${TODAY_SCHOOLS - n} fewer than today`);

// onShowBasis: moves focus to the savings target choice in the controls
export function resultsPanel({ onShowBasis } = {}) {
  // fold key -> its <details>, reused so folds stay put while the panel redraws (a new <details open> would fire
  // a toggle event, which the site's analytics would count as the reader opening it)
  const folds = new Map();
  const keptFold = (key, summary, ...children) => {
    if (!folds.has(key)) folds.set(key, h("details", { class: "wonk-fold" }));
    const d = folds.get(key);
    d.replaceChildren(h("summary", {}, summary), h("div", { class: "body" }, ...children));
    return d;
  };

  const title = h("h2", { class: "bp-col-title", id: "bp-results-title", tabindex: "-1" }, "What this plan does");
  const matched = h("p", { class: "bp-results-match" });
  const strip = h("div", { class: "bp-strip" });
  const body = h("div", { class: "bp-results-body" });
  let shownPlan = null; // the plan on screen, for the share event
  const share = shareBlock(() => encodePlan(shownPlan));
  const head = h("header", { class: "bp-results-head" }, title, matched, backButton(), strip);
  const el = h("section", { class: "bp-results", id: "bp-results", "aria-labelledby": "bp-results-title" }, head, body, share);
  // On wide screens the panel scrolls under its sticky head, which grows and shrinks with the plan. Keep a control
  // that gets focus clear of it (WCAG 2.4.11); build.css has a fallback for browsers without ResizeObserver.
  const headSize =
    typeof ResizeObserver === "function" ? new ResizeObserver(() => el.style.setProperty("scroll-padding-top", `${head.offsetHeight + 16}px`)) : null;
  headSize?.observe(head);

  // the compact summary that sticks to the bottom of the screen on phones while the controls scroll
  const barFill = h("span", { class: "bp-bar-fill" });
  const barSave = h("strong", { class: "wonk-num bp-bar-val" });
  const barSaveSub = h("span", { class: "bp-bar-sub" });
  const barSchools = h("strong", { class: "wonk-num bp-bar-val" });
  const barFits = h("p", { class: "bp-bar-line bp-bar-fits" });
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
    h("p", { class: "bp-bar-line bp-bar-kids" }, "Most schools for any child: ", barSchools, h("span", { class: "bp-bar-unit" }, ` (${TODAY_SCHOOLS} today)`)),
    barFits,
    barBtn
  );

  // cs: the four class-size inputs ({ PK, K2, G34, G56 }); classSize: the same, per grade, as evaluate() takes
  function update(plan, r, { cs, classSize }) {
    const b = r.budget;
    const rel = relation(plan);
    shownPlan = plan;

    matched.replaceChildren(
      rel.named?.id === "today"
        ? "No change: every school open and no cuts."
        : rel.named
          ? h("span", {}, "Matches ", h("strong", {}, namedLabel(rel.named)), ".")
          : rel.base
            ? h("span", {}, h("strong", {}, namedLabel(rel.base)), `, plus ${listJoin(rel.extras)}.`)
            : rel.nearB
              ? h("span", {}, "One step from ", h("strong", {}, namedLabel(rel.nearB)), ": add the middle-school move in step 4.")
              : optionOf(plan)
                ? h("span", {}, "Matches ", h("strong", {}, optionOf(plan).name), ", from Options beyond A and B.")
                : "Your own combination of choices."
    );
    const saveText = b.upperBound ? `Up to ${moneyShort(b.savings)}` : moneyShort(b.savings);
    strip.replaceChildren(
      kpi("Yearly savings", saveText, budgetMark(b)),
      kpi("Buildings in use", `${r.buildingsOpen} of 7`),
      kpi("Most schools for any child", String(r.maxYoung.all), moreThanToday(r.maxYoung.all)),
      kpi("Changing schools", num(r.moved.k12), "K-12 students, fall 2027")
    );

    barFill.style.width = pc(b.savings / b.target);
    barSave.textContent = saveText;
    barSaveSub.replaceChildren(budgetMark(b, true));
    barSchools.textContent = String(r.maxYoung.all);
    const over = r.capacity.overPeople;
    barFits.replaceChildren(
      status(!over.length, "Every school within its limit", `${listJoin(over.map(schoolShort))} over ${over.length === 1 ? "its" : "their"} limit`)
    );

    body.replaceChildren(
      // a district plan plus portable units or Waitsfield at 300 still has that plan's savings and sources
      budgetSection(plan, r, rel.named ?? rel.base ?? null, keptFold, onShowBasis),
      buildingsSection(plan, r, cs, keptFold),
      studentsSection(plan, r, keptFold),
      compareSection(plan, r, classSize)
    );
    window.wonk?.init(el);
  }

  return { el, bar, update, destroy: () => headSize?.disconnect() };
}

// On phones the results sit below the controls; this takes the reader back up to them.
function backButton() {
  return h(
    "button",
    {
      type: "button",
      class: "wonk-btn wonk-btn--quiet bp-back",
      onclick: () => {
        const to = document.getElementById("bp-controls-title");
        to?.scrollIntoView({ block: "start" });
        to?.focus({ preventScroll: true });
      },
    },
    "Back to your choices"
  );
}

// ---------------------------------------------------------------- budget
function savingsMeter(b) {
  const max = Math.max(b.target * 1.5, b.savings * 1.08);
  const at = (v) => pc(v / max);
  const targetPos = b.target / max;
  const label = lowerTarget(b) ? "Lower target" : "Target";
  return h(
    "div",
    {
      class: "bp-meter",
      role: "img",
      "aria-label": `Savings of ${b.upperBound ? "at most " : ""}${money(b.savings)} a year, against ${targetWord(b)} of ${money(b.target)}.`,
    },
    h("div", { class: "meter" }, h("span", { class: "fill", style: `width:${at(b.savings)}` }), h("span", { class: "mark", style: `left:${at(b.target)}` })),
    h(
      "div",
      { class: "bp-meter-scale", "aria-hidden": "true" },
      h("span", { class: "bp-meter-zero" }, "$0"),
      h("span", { class: `bp-meter-target${targetPos > 0.75 ? " is-end" : ""}`, style: `left:${at(b.target)}` }, `${label} ${moneyShort(b.target)}`)
    )
  );
}

function itemSource(it, plan) {
  if (it.id === "prekCenter") return FACILITIES[plan.prekCenter.school].src;
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
  const totalCite = named?.id === "A" ? PATH_A_CUTS.src : named?.kind === "district" ? ref("deck", "slide 19") : b.items.length === 1 ? itemSource(b.items[0], plan) : null;

  const targetLine = lower
    ? h(
        "p",
        {},
        b.upperBound ? "Saves at most " : "Saves ",
        h("strong", { class: "wonk-num" }, money(b.savings)),
        ` a year. Using the lower target, ${money(b.target)}: the cut needed if payments on bonds voters approved before July 1, 2026 are left out of the FY28 test, as state law provides. The district's own target is ${money(TARGET)}. `,
        STATE_LAW(),
        " ",
        tag("derived")
      )
    : h(
        "p",
        {},
        b.upperBound ? "Saves at most " : "Saves ",
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
  // what portable classrooms would add to spending per pupil if their cost all came out of next year's budget
  const port = b.oneTime.portables;
  const portPP = port ? [port.low / PUPILS, port.high / PUPILS] : null;
  const portAdds = port
    ? `If the portable classrooms' cost all came out of next year's budget, it would add about ${money(Math.round(portPP[0]))} to ${money(Math.round(portPP[1]))} per pupil`
    : "";
  // from under the threshold: "would" when even the low end of the quote puts spending over it, "could" when the high end does
  const portOver = port && b.vsThreshold <= 0 ? (b.vsThreshold + portPP[0] > 0 ? "would" : b.vsThreshold + portPP[1] > 0 ? "could" : null) : null;
  let perPupil;
  if (b.vsThreshold > 0) {
    const more = b.upperBound ? " or more" : "";
    perPupil = h(
      "p",
      {},
      `Spending per pupil would be about ${money(pp)}${more} over the `,
      thresholdTerm,
      ", so HUUSD taxpayers would pay an ",
      term("penalty", "excess spending penalty"),
      ` of about ${moneyShort(b.penalty)}${more} a year. `,
      port ? `${portAdds}. ` : null,
      tag("derived")
    );
  } else if (b.upperBound) {
    // under the threshold only on the district's full figure, which it said this version would not reach
    perPupil = h(
      "p",
      {},
      `If the district's full figure held, spending per pupil would be about ${money(pp)} under the `,
      thresholdTerm,
      ". ",
      port ? `${portAdds}${portOver ? `, which ${portOver} put it over` : ""}. ` : null,
      "On October 28 an administrator said keeping grades 5-6 in the valley would save less and would have “an impact in terms of a penalty,” because staff would have to stay to serve about 126 students at Crossett Brook, or be shared between Brookside and Crossett Brook. The district has not said how much. ",
      cite(ref("meeting1028", "keeping grades 5-6 in the valley")),
      " ",
      tag("derived")
    );
  } else if (portOver) {
    // under the threshold before portable classrooms; paying for them out of next year's budget could put it over
    perPupil = h(
      "p",
      {},
      `Before portable classrooms, spending per pupil would be about ${money(pp)} under the `,
      thresholdTerm,
      `. ${portAdds}, which ${portOver} put it over and mean an `,
      term("penalty", "excess spending penalty"),
      ". ",
      tag("derived")
    );
  } else {
    perPupil = h(
      "p",
      {},
      `Spending per pupil would ${meets ? "" : "still "}be about ${money(pp)} under the `,
      thresholdTerm,
      ", so there would be no excess spending penalty",
      meets ? "" : ", but less margin than the target leaves",
      port ? ", even if the portable classrooms' cost all came out of next year's budget" : "",
      ". ",
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
              cite(itemSource(it, plan)),
              it.fte ? h("span", {}, `${fte(it.fte)} staff positions`) : null,
              it.id === "prekCenter"
                ? h(
                    "span",
                    { class: "bp-item-note" },
                    "The building's annual operating costs from the district's facility slide, which leave out custodial salaries and benefits, so keeping it open costs more than this. The district's figure for closing two schools assumes both buildings close. Pre-K staff move with the children."
                  )
                : it.upperBound
                ? h(
                    "span",
                    { class: "bp-item-note" },
                    `An upper limit. The district's figure assumes every valley 5th and 6th grader moves to Crossett Brook; this plan keeps ${plan.valleyTop === 5 ? "valley 5th graders" : "them"} in the valley. On October 28 an administrator said keeping them there would leave about 126 students at Crossett Brook and would not achieve as many staff cuts, so this would save less. `,
                    cite(ref("meeting1028", "keeping grades 5-6 in the valley")),
                    plan.bpsTop === 6
                      ? " Here those 5th and 6th graders move to Brookside instead, which the district has not costed. Nothing is counted for Crossett Brook's empty building: the district has published no operating cost for it, and an empty building still needs heat, power, and upkeep, more so during repairs."
                      : null
                  )
                : it.kind === "estimate"
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

  // costs outside the yearly savings: portable classrooms (the district's quote covers about two years), and
  // whatever using 300 for Waitsfield might take (the state permits reading already uses 300, so not then)
  const oneTime = [];
  if (port) {
    const after = afterPortables(b);
    const vsT =
      after.lo >= b.target
        ? `still ${money(after.lo - b.target)} or more above ${targetWord(b)}`
        : after.hi <= b.target
          ? `${money(b.target - after.hi)} to ${money(b.target - after.lo)} short of ${targetWord(b)}`
          : `between ${money(b.target - after.lo)} short of ${targetWord(b)} and ${money(after.hi - b.target)} above it`;
    oneTime.push(
      h(
        "li",
        {},
        h("span", { class: "bp-item-name" }, `Portable classrooms: ${plural(port.units, "unit")}, ${plural(port.units * 2, "classroom")}`),
        h("span", { class: "bp-item-amt" }, `${moneyShort(port.low)} to ${moneyShort(port.high)}`),
        h(
          "span",
          { class: "bp-item-meta" },
          tag("estimate"),
          cite(MODULAR.src),
          cite(ref("meeting1028", "portable classrooms")),
          h(
            "span",
            {},
            `The district's preliminary quote: ${money(MODULAR.low)} to ${money(MODULAR.high)} for two units over about two years, scaled here by the number of units. ${
              b.upperBound ? "If the district's full figure held and the cost all came out of next year's budget" : "If it all came out of next year's budget"
            }, this plan would save ${money(after.lo)} to ${money(after.hi)}, ${vsT}.`
          )
        )
      )
    );
  }
  if (plan.septicWES && plan.open.includes("WES") && r.capacity.reading === "slides") {
    oneTime.push(
      h(
        "li",
        {},
        h("span", { class: "bp-item-name" }, "Waitsfield at 300 instead of 230"),
        h("span", { class: "bp-item-amt bp-unknown" }, "Cost, if any, not published"),
        h(
          "span",
          { class: "bp-item-meta" },
          cite(FACILITIES.WES.permit.src),
          h(
            "span",
            {},
            "The slides list 230, “amenable to 300”; the 1991 state permit says 300 students. The district has not said whether using 300 needs any work or cost."
          )
        )
      )
    );
  }

  // the per-pupil amount slide 10 moved its level-funded figure by when it removed the debt exclusion
  const correction = money(EXCLUSION_PER_PUPIL);
  const [verdict, why] = verdictWords(b);
  return h(
    "section",
    { class: "bp-sec", "aria-labelledby": "bp-budget-h" },
    h("h3", { id: "bp-budget-h" }, "Budget"),
    h(
      "p",
      { class: "bp-verdict" },
      mayFallShort(b) ? unsure(verdict) : status(meets, verdict, verdict),
      why ? h("span", { class: "bp-verdict-why" }, ` ${why}`) : null
    ),
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
          h("h4", {}, "Costs not in the yearly savings"),
          h(
            "p",
            { class: "bp-muted" },
            "Not part of the yearly savings above.",
            port
              ? [
                  " Slide 26 calls portable classrooms “unbudgeted capital outlay for short-term modular leasing”; the district has not said how they would be paid for. On October 28 an administrator offered to show whether keeping grades 5-6 in the valley in temporary classrooms would exceed the excess spending threshold. ",
                  cite(ref("deck", "slide 26")),
                  " ",
                  cite(ref("meeting1028", "portable classrooms")),
                ]
              : null
          ),
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
      s.center ? h("span", { class: "bp-receives" }, "Pre-K center: no K-12 grades") : null,
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
  // which towns' children each school takes: every valley school that no longer teaches K-6 (a Pre-K center
  // included), with the share when part of a town goes to other schools
  const receivers = {};
  const split = effectiveSplit(plan);
  for (const id of VALLEY.filter((v) => !plan.open.includes(v))) {
    const town = SCHOOLS[id].town;
    const main = receivingSchool(plan, town);
    const alts = Object.entries(split[town] ?? {});
    const rest = 100 - alts.reduce((a, [, x]) => a + Math.round(x * 100), 0);
    if (rest > 0) (receivers[main] ??= []).push(alts.length ? `about ${rest}% of ${townName(town)}'s` : `${townName(town)}`);
    for (const [sid, x] of alts) (receivers[sid] ??= []).push(`about ${Math.round(x * 100)}% of ${townName(town)}'s`);
  }
  const overP = cap.schools.filter((s) => s.overPeople);
  const overR = cap.schools.filter((s) => s.overConsultant);


  const summary = [];
  const readingWords = cap.reading === "permits" ? "as the state permits read" : "as the slides apply them";
  summary.push(
    overP.length
      ? `${listJoin(overP.map((s) => schoolShort(s.id)))} would be over ${overP.length === 1 ? "its" : "their"} wastewater or occupancy limit, ${readingWords}.`
      : `Every school in use would be under its wastewater or occupancy limit, ${readingWords}.`
  );
  const overM = cap.middle.filter((m) => m.over);
  summary.push(
    overR.length
      ? `${listJoin(overR.map((s) => schoolShort(s.id)))} would hold more students than the district's consultant counted classroom space for.`
      : "Every elementary school would be within the classroom space the district's consultant counted."
  );
  if (overM.length) summary.push(`${listJoin(overM.map((m) => schoolName(m.id)))} would hold more students than the consultant counted classroom space for (see the middle schools below).`);

  // the Pre-K cut ends Pre-K classes in district buildings, so the model leaves Pre-K out of every count
  const noPreK = plan.cuts.includes("prek");
  const preKWords = noPreK ? "without Pre-K (this plan ends district Pre-K classes)" : "including Pre-K";
  let source;
  if (cap.source === "district") {
    source = h(
      "p",
      { class: "bp-source" },
      `Student counts for the elementary schools: the district's table for this pairing${noPreK ? ", without its Pre-K rows (this plan ends district Pre-K classes)" : ""}. `,
      tag("district"),
      cite(cap.table.src)
    );
  } else if (plan.open.length === 4 && plan.valleyTop === 6) {
    source = h(
      "p",
      { class: "bp-source" },
      `Student counts: this year's enrollment on October 1, ${preKWords}. `,
      tag("district"),
      cite(ATTENDING.src, "Oct 1 report")
    );
  } else if (plan.open.length === 4) {
    source = h(
      "p",
      { class: "bp-source" },
      `Student counts are our estimate: this year's students, ${preKWords}, with valley ${plan.valleyTop === 5 ? "6th graders" : "5th and 6th graders"} counted at Crossett Brook. `,
      tag("estimate"),
      cite(ATTENDING.src, "Oct 1 report")
    );
  } else {
    source = h(
      "p",
      { class: "bp-source" },
      `The district did not publish a table for this combination, so the counts are our estimate: this year's students move with their school to the school that receives them${
        plan.open.length === 2 ? ", split the way the district's table for this pair places them unless you changed the shares in step 2" : Object.keys(plan.split).length ? ", split by the shares in step 2" : ""
      }, and ${
        noPreK ? "Pre-K is left out (this plan ends district Pre-K classes)" : `Pre-K follows the district's planning numbers, ${PK_WORDS}`
      }. `,
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
      r.closed.length ? `${listJoin(r.closed.map(schoolShort))} ${r.closed.length === 1 ? "closes" : "close"}.` : "None close.",
      plan.prekCenter
        ? ` ${schoolShort(plan.prekCenter.school)} becomes a Pre-K center for ${plan.prekCenter.scope === "all" ? "the whole district, Brookside's Pre-K included" : "valley families"}, with this year's district Pre-K children (our estimate of who would attend).`
        : "",
      plan.bpsTop === 6 ? " Brookside teaches K-6, and Crossett Brook's building holds no classes." : ""
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
    middleCaps(cap.middle),
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
          "Wastewater, as the state permits read: Waitsfield 300 students, as its 1991 permit words it (the design behind it counted students and staff, and a 1996 letter in the state's file says 230); Fayston 235 and Warren 237 students and staff; Moretown 2,820 gallons a day, counted as 235 people; Brookside 480 counting everyone. Staff numbers are our estimate. Choose the reading under Advanced. ",
          cite(ref("permitWES", "condition 1.2"), "Waitsfield permit 1991")
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
          `When exactly two valley schools stay open, the counts come from the district's capacity table for that pairing, which includes its Pre-K planning numbers. With all four open, they are this year's students (October 1, 2026), including Pre-K. Otherwise we place this year's students where this plan would send them, and Pre-K follows the district's planning numbers from its capacity tables: ${PK_WORDS}. With the Pre-K cut, Pre-K is left out of every building. `,
          cite(ref("deck", "slides 27-32"))
        ),
        h("li", {}, "A portable unit adds 2 classrooms but does not change the wastewater limit. Using 300 for Waitsfield changes only its limit.")
      )
    )
  );
}

// Crossett Brook and Harwood Middle against the consultant's classroom capacities, with this year's students.
function middleCaps(middle) {
  const row = (m) =>
    h(
      "div",
      { class: "cap-row" },
      h("span", { class: "name" }, `${schoolName(m.id)}, grades ${m.grades}`, sr(":")),
      capBar(m.total, m.capacity, m.over),
      h("span", { class: "nums" }, `${num(m.total)}, room for ${num(m.capacity)}`),
      h("span", { class: "bp-cap-status" }, sr(". "), status(!m.over, "Enough", `${num(m.total - m.capacity)} over`))
    );
  return h(
    "div",
    { class: "bp-cap-school" },
    h("h4", {}, "Middle schools: classroom space"),
    h("div", { class: "cap" }, middle.filter((m) => !m.empty).map(row)),
    middle.some((m) => m.empty) ? h("p", {}, "Crossett Brook: no classes. Its 5th and 6th graders are counted at Brookside above.") : null,
    h(
      "p",
      { class: "bp-muted" },
      "This year's students in each building's grades under this plan. The consultant's 166 for Harwood Middle counts the rooms it uses now; it shares a building with the high school, whose capacity the consultant left “TBD.” ",
      tag("derived"),
      " ",
      cite(ref("truexCap", "Capacities"), "Consultant capacities")
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
    [m.byReason.brookside, "because Crossett Brook's 5th and 6th graders move to Brookside"],
    [m.byReason.other, "for other reasons"],
  ].filter(([n]) => n > 0);

  let moves;
  if (m.k12) {
    moves = h(
      "div",
      { class: "bp-moves" },
      h(
        "p",
        {},
        h("strong", { class: "wonk-num" }, num(m.k12)),
        " of next fall's K-12 students (this year's 4-year-olds in Pre-K through grade 11) would start fall 2027 in a different school than they would with no change:"
      ),
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
          `Also ${plural(m.preK, "child", "children")} who would be in Pre-K next fall would change programs: `,
          listJoin(
            [
              preKClosure ? `${num(preKClosure)} because their school closes` : null,
              m.byReason.prek
                ? plan.prekCenter
                  ? `${num(m.byReason.prek)} because Pre-K moves to the ${schoolShort(plan.prekCenter.school)} center`
                  : `${num(m.byReason.prek)} because district Pre-K classes end (families would get public tuition for private programs, which the superintendent said lack the room)`
                : null,
            ].filter(Boolean)
          ),
          ". ",
          tag("derived")
        )
      : null;

  // the Your child's path page shows the saved plan as "Your plan"; save it on the way there. With two valley
  // schools open, the link also sets that page's Path B row to the same pairing and grade 5-6 setup.
  const q = new URLSearchParams();
  if (plan.open.length === 2) {
    q.set("pair", [...plan.open].sort().join("+"));
    if (plan.valleyTop !== 5) q.set("top", String(plan.valleyTop)); // that page's Path B versions are grade 4 or 6
  }
  const childLink = h("a", { class: "wonk-btn", href: `#/your-child${q.toString() ? `?${q}` : ""}` }, "See your child's path under this plan");
  childLink.addEventListener("click", () => {
    const code = encodePlan(plan);
    store.set("plan", code);
    track("Child Path Opened", { from: "build", plan_code: code });
  });

  return h(
    "section",
    { class: "bp-sec", "aria-labelledby": "bp-kids-h" },
    h("h3", { id: "bp-kids-h" }, "Students"),
    h(
      "div",
      { class: "bp-stats" },
      kpiCard("Most schools for any child", String(r.maxYoung.all), `now in Pre-K to grade 2; ${moreThanToday(r.maxYoung.all)}`),
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
  const lower = lowerTarget(r.budget);
  const pairB = plan.open.length === 2;
  const planB = pairB ? pathB(plan.open, plan.valleyTop === 4 ? 4 : 6) : pathB(["MES", "WRN"], 4);
  const reading = r.capacity.reading;
  const a = evaluate(PLAN_A, { classSize, basis, reading });
  const bb = evaluate(planB, { classSize, basis, reading });
  const cols = [
    ["Your plan", r],
    ["Path A", a],
    ["Path B", bb],
  ];
  const rows = [
    // "Up to" sits on its own line in a narrow panel (build.css), so all three plans still fit
    ["Savings a year", (x) => [x.budget.upperBound ? h("span", { class: "bp-upto" }, "Up to ") : null, moneyShort(x.budget.savings)]],
    [lower ? "Meets the lower target" : "Meets the target", (x) => (mayFallShort(x.budget) ? unsure("Not known") : status(x.budget.gap <= 0, "Yes", "No"))],
    ["Buildings in use", (x) => `${x.buildingsOpen} of 7`],
    ["Most schools for any child", (x) => String(x.maxYoung.all)],
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
      `Path B here: ${bName}${pairB ? ", the same schools as your plan" : ", one of twelve versions"}. “Most schools for any child” is for a child now in Pre-K to grade 2; “changing schools” counts K-12 students. Savings for Path A and Path B are the district's figures (an upper limit when grades 5 and 6 stay in the valley); the rest is calculated${lower ? `, against the lower target of ${moneyShort(r.budget.target)}` : ""}. `,
      portablesShort(r.budget) && !r.budget.upperBound
        ? `Your plan's savings do not count its portable classrooms; if their cost all came out of next year's budget, it ${portWould(r.budget)} fall short. `
        : null,
      // keep the reader's wastewater reading; Compare has no lower target, so say which one it uses
      h("a", { href: `#/compare${reading === "permits" ? "?w=permits" : ""}`, onclick: () => track("Compare Opened", { from: "build" }) }, "Compare all the plans"),
      lower ? ` (Compare measures savings against the district's ${money(TARGET)} target.)` : null
    )
  );
}

// ---------------------------------------------------------------- share
// planCode: the plan on screen, as encodePlan writes it
function shareBlock(planCode) {
  const input = h("input", { class: "wonk-input", id: "bp-share-url", readonly: true, type: "text" });
  const fallback = h(
    "div",
    { class: "wonk-field bp-share-fallback", hidden: true },
    h("label", { class: "wonk-label", for: "bp-share-url" }, "Link to this plan"),
    input,
    h("span", { class: "wonk-help" }, "Press and hold the link and choose Copy. On a computer: Ctrl+C, or Command+C on a Mac.")
  );
  const btn = h("button", { type: "button", class: "wonk-btn wonk-btn--primary" }, "Copy link to this plan");
  btn.addEventListener("click", async () => {
    const url = location.href;
    track("Plan Link Copied", { plan_code: planCode() }); // copied, or the link shown to copy by hand
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(url);
      window.wonk?.toast("Link copied", "ok");
    } catch {
      // no clipboard API (some in-app browsers): show the link, selected, and try the older copy command
      input.value = url;
      fallback.hidden = false;
      input.focus();
      input.select();
      input.setSelectionRange(0, input.value.length);
      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch {
        copied = false;
      }
      if (copied) {
        // copied after all: the instructions would only contradict the toast
        window.wonk?.toast("Link copied", "ok");
        fallback.hidden = true;
        btn.focus();
      }
    }
  });
  return h(
    "section",
    { class: "bp-sec bp-share", "aria-labelledby": "bp-share-h" },
    h("h3", { id: "bp-share-h" }, "Share this plan"),
    h("p", {}, "The link opens this page with the same choices, so others can see exactly what you see."),
    h("div", { class: "btn-row" }, btn),
    fallback,
    h("p", { class: "bp-back-row" }, backButton())
  );
}
