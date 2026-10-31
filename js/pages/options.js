import { h, moneyShort, num, store } from "../ui/dom.js";
import { cite, cites, fold, note, pageHead, schoolShort, section, status, tag, unsure } from "../ui/kit.js";
import { track } from "../ui/track.js";
import { OPTIONS, TARGET, TARGET_WITH_EXCLUSION, encodePlan, evaluate } from "../model/index.js";
import { ref } from "../../data/sources.js";
import { MODULAR } from "../../data/budget.js";

const VALLEY_TOWNS = ["moretown", "waitsfield", "fayston", "warren"];
const pairId = (plan) => [...plan.open].sort().join("+");
const MOST_SCHOOLS = "Most schools for any child (valley / Waterbury-Duxbury)";

// The district's savings figures assume valley 5th and 6th graders move to Crossett Brook. Where a plan keeps
// them in the valley, the model marks its savings as an upper limit (budget.upperBound).
const fiveSixNote = (which, it) =>
  `The district's savings figures assume valley 5th and 6th graders move to Crossett Brook. On October 28 an administrator said keeping them in the valley would leave about 126 students at Crossett Brook and would not achieve as many staff cuts, so ${which} would save less, with “an impact in terms of a penalty”: staff would have to stay to serve those students or be shared with Brookside. The district has not costed ${it}. `;
const fiveSixCite = () => cite(ref("meeting1028", "keeping grades 5-6 in the valley"));

function score(plan, basis, reading) {
  const r = evaluate(plan, { basis, reading });
  return {
    r,
    savings: r.budget.savings,
    gap: r.budget.gap,
    estimate: r.budget.hasEstimate,
    upperBound: r.budget.upperBound,
    buildings: r.buildingsOpen,
    overPeople: r.capacity.overPeople,
    overRooms: r.capacity.overRooms,
    overConsultant: r.capacity.overConsultant,
    middleOver: r.capacity.middle.filter((m) => r.capacity.overMiddle.includes(m.id)),
    moved: r.moved.k12,
    valleyMax: Math.max(...VALLEY_TOWNS.map((t) => r.maxYoung[t])),
    wbMax: r.maxYoung.waterbury,
  };
}

// Whether a version fits the people limits using the district's printed school totals rather than the sum of its
// grade rows. They differ only where a table does not add up (the Fayston + Warren tables).
function passesAsPrinted(s) {
  const c = s.r.capacity;
  return c.schools.every((sc) => {
    const printed = c.mismatches.find((m) => m.school === sc.id)?.printed ?? sc.total;
    return sc.limit == null || printed + (sc.countsStaff ? sc.staff : 0) <= sc.limit;
  });
}

const range = (xs, f = num) => {
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  return lo === hi ? f(lo) : `${f(lo)} to ${f(hi)}`;
};

export default {
  title: "Options beyond A and B",
  render(el, { params, setParams }) {
    let basis = params.get("x") === "1" ? "exclusion" : "district";
    let reading = params.get("w") === "permits" ? "permits" : "slides";
    const host = h("div", {});
    const scored = h("p", { class: "small scored", role: "status" });

    const readingRadio = (value, label, sub) =>
      h(
        "label",
        {},
        h("input", { type: "radio", name: "reading", value, checked: reading === value, onchange: () => { reading = value; setParams({ w: value === "permits" ? "permits" : null }); track("Wastewater Reading Changed", { reading: value }); draw(); } }),
        h("span", {}, h("strong", {}, label), h("br"), h("span", { class: "small muted" }, sub))
      );

    const radio = (value, label, sub) =>
      h(
        "label",
        {},
        h("input", { type: "radio", name: "basis", value, checked: basis === value, onchange: () => { basis = value; setParams({ x: value === "exclusion" ? 1 : null }); track("Savings Target Changed", { target: value === "exclusion" ? "lower" : "district" }); draw(); } }),
        h("span", {}, h("strong", {}, label), h("br"), h("span", { class: "small muted" }, sub))
      );

    const assumptions = fold(
      "Change the assumptions: savings target and wastewater limits",
      h(
        "fieldset",
        { class: "group basis-pick" },
        h("legend", {}, "Which savings target?"),
        h(
          "div",
          { class: "choice choice--stack" },
          radio("district", `${moneyShort(TARGET)}: the district's target`, "As presented on October 14 and 28."),
          radio("exclusion", `${moneyShort(TARGET_WITH_EXCLUSION)}: if older bond payments are left out`, "State law leaves payments on bonds approved before July 1, 2026 out of the FY28 test. The district's figures appear to count them; it has not said why.")
        ),
        h("p", { class: "hint" }, "Why there are two targets: ", h("a", { href: "#/findings?at=finding-debt-basis" }, "What we checked"), ". ", cite(ref("vsa4001", "§ 4001(6)(B)"), "State law"))
      ),
      h(
        "fieldset",
        { class: "group basis-pick" },
        h("legend", {}, "Which wastewater limits?"),
        h(
          "div",
          { class: "choice choice--stack" },
          readingRadio(
            "slides",
            "As on the slides",
            "Students only, against 230 (Waitsfield), 250 (Fayston), 235 (Moretown), 237 (Warren), and Brookside's occupancy of 480, as the district compared them."
          ),
          readingRadio(
            "permits",
            "As the state permits read",
            "Waitsfield: 300 students, as its 1991 permit words it. Elsewhere staff count too, and Fayston's limit is 235. Staff numbers are our estimate."
          )
        ),
        h("p", { class: "hint" }, "Why there are two readings: ", h("a", { href: "#/findings?at=finding-permits" }, "What we checked"), ". ", cite(ref("permitWES", "PDF p. 12, condition 1.2")))
      )
    );
    assumptions.classList.add("no-print", "opt-assumptions");
    // A shared link with other settings opens the choices, so the reader sees what changed.
    if (basis !== "district" || reading !== "slides") assumptions.open = true;

    el.append(
      pageHead({
        kicker: "Beyond Path A and Path B",
        title: "Other ways to close the gap, scored the same way",
        lede: "The district presented the decision as Path A or Path B. Those are two combinations of a few building blocks: closing valley schools, merging the middle schools, where grades 5 and 6 go, and cutting programs. Here are other combinations of the same blocks, each scored on the same measures.",
      }),
      assumptions,
      section(
        { id: "scored", title: "Each option, scored" },
        scored,
        fold(
          "How to read this",
          h(
            "ul",
            {},
            h(
              "li",
              {},
              h("strong", {}, "Saves"),
              ": yearly savings. District figures for the Path A cuts, for closing two valley schools ($1.83M), and for merging the middle schools ($2.10M); the last two assume valley 5th and 6th graders move to Crossett Brook. Where a plan keeps grades 5-6 in the valley, the middle-school figure is an upper limit. Our estimate for closing one school is half the two-school figure. Upper limits and estimates are marked ",
              tag("estimate"),
              "."
            ),
            h(
              "li",
              {},
              h("strong", {}, "Against the target"),
              ": what would still have to come from cuts on the Path A list, or be paid as an excess spending penalty of roughly the same amount each year. \"May fall short\" and \"or more\" mark plans whose savings are an upper limit."
            ),
            h("li", {}, h("strong", {}, "Grades 5-6"), ": whether valley 5th and 6th graders stay in a valley school or go to Crossett Brook Middle School in Duxbury."),
            h(
              "li",
              {},
              h("strong", {}, "Students fit"),
              ": the wastewater limits, read the way you choose above, and Brookside's occupancy of 480. Classrooms are checked against the capacities the district's consultant, TruexCullins, calculated in March 2025, plus 40 students for each portable unit of two classrooms. For the middle schools: Crossett Brook 359, and Harwood Middle 166, which counts only the rooms the middle school uses now in the building it shares with the high school. That building held 766 students in grades 7-12 in 2010-11; with the merger it would hold about 738. ",
              cite(ref("truexCap", "Capacities")),
              " ",
              cite(ref("qdoc", "enrollment by school"), "Board Q&A")
            ),
            h(
              "li",
              {},
              h("strong", {}, "Change schools next fall"),
              ": students in K-12 next fall (this year's 4-year-olds in Pre-K through grade 11) who would start fall 2027 somewhere they would not otherwise go."
            ),
            h("li", {}, h("strong", {}, MOST_SCHOOLS), ": the highest number of different K-12 schools any child now in Pre-K to grade 2 would attend. Today it is 3 everywhere.")
          ),
          h("p", {}, "These rows are not recommendations. They apply the district's figures, and our labeled estimates where it has none, to combinations it did not present.")
        ),
        host
      ),
      section(
        { id: "not-modeled", title: "Ideas this site cannot score yet" },
        h(
          "ul",
          { class: "prose" },
          h("li", {}, "Grade-band pairing: Moretown and Warren as K-3, Waitsfield as grades 4-6, and Fayston closed. Asked in the board's question-and-answer document; no answer is recorded. ", cite(ref("qdoc", "K-6 configuration changes"))),
          h("li", {}, "New attendance boundaries that send families to the nearest school regardless of town."),
          h("li", {}, "A bond for deferred maintenance with no closures. Under current law, payments on a new bond would count toward the threshold."),
          h(
            "li",
            {},
            "Move Crossett Brook's 5th and 6th graders to Brookside for a year so Crossett Brook can close for renovations (a parent's suggestion). With the middle schools merged, Crossett Brook would otherwise hold only about 131 Waterbury-area 5th and 6th graders. Brookside would then hold about 469 students including Pre-K: just under its occupancy of 480 if staff are not counted, and about 70 over the consultant's classroom capacity of 399, roughly 2 portable units. The consultant's 2025 evaluation lists about $10.2 million of deferred maintenance at Crossett Brook, $490,000 of it priority 1. The district has not published Crossett Brook's operating costs or a renovation plan, and a new bond would count toward the threshold. Build a plan can now move them to Brookside (step 4), and the Pre-K center plan above does, but what an empty Crossett Brook would save still cannot be scored. ",
            cite(ref("truexCap", "Capacities")),
            " ",
            cite(ref("truexEval", "Crossett Brook"))
          ),
          h("li", {}, "District mergers under Act 170, which could change the budget picture from FY29 on.")
        ),
        h("p", {}, h("a", { href: "#/findings?at=ideas" }, "More on these ideas"), ", or ", h("a", { href: "#/build" }, "build your own combination"), ".")
      )
    );

    function draw() {
      const rows = [];
      for (const o of OPTIONS) {
        if (o.versions) {
          rows.push({ o, versions: o.versions.map((v) => ({ v, s: score(v.plan ?? o.plan, basis, reading) })) });
        } else if (o.family) {
          const s = o.family.map((p) => score(p, basis, reading));
          rows.push({ o, family: s });
        } else {
          rows.push({ o, s: score(o.plan, basis, reading) });
        }
      }
      scored.textContent = `Scored against ${basis === "exclusion" ? `${moneyShort(TARGET_WITH_EXCLUSION)} (older bond payments left out)` : `the district's ${moneyShort(TARGET)} target`}, with wastewater limits ${reading === "permits" ? "as the state permits read" : "as on the slides"}.`;
      host.replaceChildren(
        note(
          "info",
          h("strong", {}, "Where things stand. "),
          "In a straw poll at the end of the October 28 meeting, not a formal vote, the board agreed to keep developing Path B. A board member asked to see a version that keeps valley 5th and 6th graders in temporary classrooms in the valley, and the administration said it would bring one. ",
          cite(ref("meeting1028", "end of meeting"))
        ),
        h("div", { class: "opt-list" }, rows.map(cardFor))
      );
      window.wonk?.init(host);
    }

    function metric(label, value, extra, { wide = false } = {}) {
      return h("div", { class: wide ? "opt-metric opt-metric--wide" : "opt-metric" }, h("dt", {}, label), h("dd", {}, value, extra ?? null));
    }

    const muted = (...text) => [h("br"), h("span", { class: "small muted" }, ...text)];

    // the measures for one plan, as on every single-plan card
    const metricsFor = (s) =>
      h(
        "dl",
        { class: "opt-metrics" },
        metric("Saves a year", `${s.upperBound ? "Up to " : ""}${moneyShort(s.savings)}`, s.estimate ? [" ", tag("estimate")] : null),
        metric("Against the target", gapCell(s.gap, s.upperBound)),
        metric("Buildings in use", String(s.buildings)),
        metric("Grades 5-6", s.r.plan.valleyTop === 6 ? "Stay in the valley" : "Go to Crossett Brook"),
        metric("Students fit", fitCell(s), null, { wide: true }),
        metric("Change schools next fall", num(s.moved)),
        metric(MOST_SCHOOLS, `${s.valleyMax} / ${s.wbMax}`)
      );

    function cardFor({ o, s, family, versions }) {
      const kids = store.get("kids");
      const actions = (plan, option) =>
        h(
          "p",
          { class: "opt-actions no-print" },
          h("a", { href: `#/build?${encodePlan(plan)}${basis === "exclusion" ? "&x=1" : ""}${reading === "permits" ? "&w=permits" : ""}`, onclick: () => track("Option Opened in Build", { option }) }, "Open in Build a plan"),
          plan.open.length === 2 && plan.msMerge && !plan.prekCenter
            ? [
                " · ",
                h(
                  "a",
                  {
                    href: `#/your-child?${new URLSearchParams({ pair: pairId(plan), top: plan.valleyTop, ...(typeof kids === "string" && kids ? { c: kids } : {}) })}`,
                    onclick: () => track("Option Child Path Opened", { option }),
                  },
                  "See a child's path"
                ),
              ]
            : null
        );
      if (family) {
        const fits = family.filter((x) => !x.overPeople.length).length;
        const fitsPrinted = family.filter(passesAsPrinted).length;
        const roomsOk = family.filter((x) => !x.overConsultant.length).length;
        const humsOver = family.filter((x) => x.middleOver.some((m) => m.id === "HUMS")).length;
        const inValley = family.filter((x) => x.upperBound).length;
        const toCB = family.find((x) => !x.upperBound) ?? family[0];
        return h(
          "article",
          { class: "wonk-card opt-card opt-card--b" },
          h("h3", {}, o.name),
          h("p", { class: "opt-what" }, o.what),
          h(
            "dl",
            { class: "opt-metrics" },
            metric("Saves a year", moneyShort(toCB.savings), muted(`the district's figure with grades 5-6 at Crossett Brook; an upper limit in the ${inValley} versions that keep them in the valley`)),
            metric("Against the target", gapCell(toCB.gap), muted(toCB.gap <= 0 ? `with grades 5-6 at Crossett Brook; the ${inValley} versions that keep them in the valley may fall short` : "more if grades 5-6 stay in the valley")),
            metric("Buildings in use", "5"),
            metric("Grades 5-6", `Crossett Brook in ${family.length - inValley} versions, valley in ${inValley}`),
            metric(
              "Students fit",
              `${fits} of ${family.length} versions pass the wastewater test${reading === "slides" && fitsPrinted !== fits ? ` once the Fayston + Warren totals are corrected (${fitsPrinted} as printed)` : ""}`,
              muted(
                `${roomsOk} of ${family.length} within the consultant's elementary classroom capacity${humsOver === family.length ? `; Harwood Middle is over the consultant's count for its current rooms in all ${family.length}` : humsOver ? `; Harwood Middle is over in ${humsOver}` : ""}`
              ),
              { wide: true }
            ),
            metric("Change schools next fall", range(family.map((x) => x.moved))),
            metric(MOST_SCHOOLS, `${range(family.map((x) => x.valleyMax))} / ${range(family.map((x) => x.wbMax))}`)
          ),
          o.notes.map((n) => h("p", { class: "opt-note" }, n, " ", cite(ref("meeting1028", "straw poll")))),
          inValley ? h("p", { class: "opt-note" }, fiveSixNote(`the ${inValley} versions that keep them there`, "them"), fiveSixCite()) : null
        );
      }
      // one card, several versions of the same plan: each with its own measures, then the notes they share
      if (versions) {
        return h(
          "article",
          { class: `wonk-card opt-card opt-card--${o.group}` },
          h("h3", {}, o.name),
          h("p", { class: "opt-what" }, o.what),
          versions.map(({ v, s: vs }) =>
            h(
              "section",
              { class: "opt-version", "aria-label": v.name },
              h("h4", {}, v.name),
              h("p", { class: "opt-what" }, v.what),
              metricsFor(vs),
              v.notes.map((n) => h("p", { class: "opt-note" }, n)),
              portablesNote(vs.r.budget.oneTime.portables),
              actions(v.plan ?? o.plan, v.id)
            )
          ),
          o.notes.map((n, i) => h("p", { class: "opt-note" }, n, o.refs && i === 0 ? [" ", cites(o.refs)] : null)),
          versions.some((x) => x.s.upperBound) ? h("p", { class: "opt-note" }, fiveSixNote("these versions", "them"), fiveSixCite()) : null
        );
      }
      const label = o.group === "one-closure" ? `${o.name}: ${schoolShort(o.closed)} closes` : o.name;
      const brief = o.group === "one-closure" && o.closed !== "FES";
      return h(
        "article",
        { class: `wonk-card opt-card opt-card--${o.group}` },
        h("h3", {}, label),
        brief ? h("p", { class: "opt-what" }, `Same as above, with ${schoolShort(o.closed)} closing.`) : h("p", { class: "opt-what" }, o.what),
        metricsFor(s),
        brief ? null : o.notes.map((n, i) => h("p", { class: "opt-note" }, n, o.refs && i === 0 ? [" ", cites(o.refs)] : null)),
        s.upperBound && !brief ? h("p", { class: "opt-note" }, fiveSixNote("this version", "it"), fiveSixCite()) : null,
        portablesNote(s.r.budget.oneTime.portables),
        actions(o.plan, o.id)
      );
    }

    // upperBound: the district says this plan saves less than the figures used, so the result is a best case.
    function gapCell(gap, upperBound = false) {
      if (upperBound) {
        return gap <= 0
          ? h("span", {}, unsure("May fall short"), muted(`${moneyShort(-gap)} to spare only if the district's full figure holds; the district says keeping grades 5-6 in the valley saves less`))
          : h("span", {}, `${moneyShort(gap)} short, or more`, muted("from cuts or a penalty"));
      }
      if (gap === 0) return h("span", { class: "status status--ok" }, "✓ Meets it exactly");
      return gap < 0 ? h("span", { class: "status status--ok" }, `✓ Meets it, ${moneyShort(-gap)} to spare`) : h("span", {}, `${moneyShort(gap)} short`, muted("from cuts or a penalty"));
    }

    function fitCell(s) {
      const withPortables = s.r.budget.oneTime.portables ? ", with the portables" : "";
      return [
        status(!s.overPeople.length, "Wastewater fits", `Wastewater over at ${s.overPeople.map(schoolShort).join(", ")}`),
        muted(
          s.overConsultant.length
            ? `Elementary classrooms: over the consultant's capacity at ${s.overConsultant.map(schoolShort).join(", ")}`
            : `Elementary classrooms: within the consultant's capacity${withPortables}`
        ),
        s.middleOver.map((m) =>
          muted(
            m.id === "HUMS"
              ? `Harwood Middle: about ${num(m.total)} in grades ${m.grades}, against the ${num(m.capacity)} the consultant counted for the rooms it uses now`
              : `Crossett Brook: about ${num(m.total)} in grades ${m.grades}, against the consultant's ${num(m.capacity)}`
          )
        ),
      ];
    }

    // Cost of the portable classrooms in a plan over about two years, from the district's preliminary quote.
    function portablesNote(p) {
      if (!p) return null;
      return h(
        "p",
        { class: "opt-note" },
        `Portable classrooms: ${p.units} units of two classrooms, about ${moneyShort(p.low)} to ${moneyShort(p.high)}, scaled from the district's best preliminary quote, which was for one unit at each of two schools over two years; other quotes ran higher. Not counted in the yearly savings. The district says all four valley sites have limited land and infrastructure for portables, and it has not said whether this many units would fit. `,
        tag("estimate"),
        " ",
        cite(MODULAR.src),
        " ",
        cite(ref("meeting1028", "portable classrooms"))
      );
    }

    draw();
    return null;
  },
};

