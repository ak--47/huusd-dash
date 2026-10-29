import { h, money, moneyShort, num, store } from "../ui/dom.js";
import { cite, fold, note, pageHead, schoolShort, section, status, tag } from "../ui/kit.js";
import { OPTIONS, TARGET, TARGET_WITH_EXCLUSION, encodePlan, evaluate, valleySavings } from "../model/index.js";
import { ref } from "../../data/sources.js";
import { MODULAR } from "../../data/budget.js";

const VALLEY_TOWNS = ["moretown", "waitsfield", "fayston", "warren"];
const pairId = (plan) => [...plan.open].sort().join("+");

function score(plan, basis, reading) {
  const r = evaluate(plan, { basis, reading });
  return {
    r,
    savings: r.budget.savings,
    gap: r.budget.gap,
    estimate: r.budget.hasEstimate,
    buildings: r.buildingsOpen,
    overPeople: r.capacity.overPeople,
    overRooms: r.capacity.overRooms,
    overConsultant: r.capacity.overConsultant,
    moved: r.moved.k12,
    valleyMax: Math.max(...VALLEY_TOWNS.map((t) => r.maxYoung[t])),
    wbMax: r.maxYoung.waterbury,
  };
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

    const readingRadio = (value, label, sub) =>
      h(
        "label",
        {},
        h("input", { type: "radio", name: "reading", value, checked: reading === value, onchange: () => { reading = value; setParams({ w: value === "permits" ? "permits" : null }); draw(); } }),
        h("span", {}, h("strong", {}, label), h("br"), h("span", { class: "small muted" }, sub))
      );

    const radio = (value, label, sub) =>
      h(
        "label",
        {},
        h("input", { type: "radio", name: "basis", value, checked: basis === value, onchange: () => { basis = value; setParams({ x: value === "exclusion" ? 1 : null }); draw(); } }),
        h("span", {}, h("strong", {}, label), h("br"), h("span", { class: "small muted" }, sub))
      );

    el.append(
      pageHead({
        kicker: "Beyond Path A and Path B",
        title: "Other ways to close the gap, scored the same way",
        lede: "The decision has been framed as Path A or Path B. Those are two combinations of a few building blocks: closing valley schools, merging the middle schools, where grades 5 and 6 go, and cutting programs. Here are other combinations of the same blocks, each scored on the same measures.",
      }),
      h(
        "fieldset",
        { class: "group basis-pick no-print" },
        h("legend", {}, "Which savings target?"),
        h(
          "div",
          { class: "choice choice--stack" },
          radio("district", `${moneyShort(TARGET)}: the district's target`, "As presented on October 14 and 28."),
          radio("exclusion", `${moneyShort(TARGET_WITH_EXCLUSION)}: if older bond payments are left out`, "State law leaves payments on bonds approved before July 1, 2026 out of the FY28 test. The district's target counts them.")
        ),
        h("p", { class: "hint" }, "Why there are two targets: ", h("a", { href: "#/findings" }, "What we checked"), ". ", cite(ref("vsa4001", "§ 4001(6)(B)"), "State law"))
      ),
      h(
        "fieldset",
        { class: "group basis-pick no-print" },
        h("legend", {}, "Which wastewater limits?"),
        h(
          "div",
          { class: "choice choice--stack" },
          readingRadio("slides", "As on the slides", "Students only, against 230, 250, 235, and 237, as the district compared them."),
          readingRadio("permits", "As the state permits read", "Waitsfield 300 students and Fayston 235; staff count toward every limit except Waitsfield's. Staff numbers are our estimate.")
        ),
        h("p", { class: "hint" }, "Why there are two readings: ", h("a", { href: "#/findings" }, "What we checked"), ". ", cite(ref("permitWES", "condition 1.2"), "Waitsfield permit"))
      ),
      host,
      fold(
        "How to read this",
        h(
          "ul",
          {},
          h("li", {}, h("strong", {}, "Saves"), ": yearly savings. District figures for closing two valley schools ($1.83M), merging the middle schools ($2.10M), and the Path A cuts; our estimate for closing one school (half the two-school figure), marked ", tag("estimate"), "."),
          h("li", {}, h("strong", {}, "Short of target"), ": what would still have to come from cuts on the Path A list, or be paid as an excess spending penalty of roughly the same amount each year."),
          h("li", {}, h("strong", {}, "Students fit"), ": the wastewater limits, read the way you choose above, and Brookside's occupancy of 480. Classrooms are checked against the capacities the district's consultant, TruexCullins, calculated in March 2025, plus 40 students for each portable unit of two classrooms. ", cite(ref("truexCap", "Capacities"))),
          h("li", {}, h("strong", {}, "Change schools next fall"), ": this year's K-12 students who would start fall 2027 somewhere they would not otherwise go."),
          h("li", {}, h("strong", {}, "Most schools"), ": the most different K-12 schools a child now in Pre-K to grade 2 would attend, in the valley towns and in Waterbury and Duxbury. Today it is 3 everywhere.")
        ),
        h("p", {}, "These rows are not recommendations. They show what the district's own numbers say about combinations it did not present.")
      ),
      section(
        { id: "not-modeled", title: "Ideas this site cannot score yet" },
        h(
          "ul",
          { class: "prose" },
          h("li", {}, "Grade-band pairing (for example Moretown and Warren as Pre-K to 3 and Waitsfield as 4 to 6), raised in the board's question-and-answer document."),
          h("li", {}, "New attendance boundaries that send families to the nearest school regardless of town."),
          h("li", {}, "A bond for deferred maintenance with no closures. Under current law, payments on a new bond would count toward the threshold."),
          h("li", {}, "District mergers under Act 170, which could change the budget picture from FY29 on.")
        ),
        h("p", {}, h("a", { href: "#/findings" }, "More on these ideas"), ", or ", h("a", { href: "#/build" }, "build your own combination"), ".")
      )
    );

    function draw() {
      const rows = [];
      for (const o of OPTIONS) {
        if (o.family) {
          const s = o.family.map((p) => score(p, basis, reading));
          rows.push({ o, family: s });
        } else {
          rows.push({ o, s: score(o.plan, basis, reading) });
        }
      }
      host.replaceChildren(
        note(
          "info",
          h("strong", {}, "Where things stand. "),
          "In a straw poll at the end of the October 28 meeting, not a formal vote, the board agreed to keep developing Path B and asked to see a version that keeps valley 5th and 6th graders in temporary classrooms in the valley. ",
          cite(ref("meeting1028", "end of meeting"))
        ),
        h("div", { class: "opt-list" }, rows.map(cardFor))
      );
      window.wonk?.init(host);
    }

    function metric(label, value, extra) {
      return h("div", { class: "opt-metric" }, h("dt", {}, label), h("dd", {}, value, extra ?? null));
    }

    function cardFor({ o, s, family }) {
      const actions = (plan) =>
        h(
          "p",
          { class: "opt-actions no-print" },
          h("a", { href: `#/build?${encodePlan(plan)}${basis === "exclusion" ? "&x=1" : ""}${reading === "permits" ? "&w=permits" : ""}` }, "Open in Build a plan"),
          plan.open.length === 2 && plan.msMerge
            ? [" · ", h("a", { href: `#/your-child?${new URLSearchParams({ pair: pairId(plan), top: plan.valleyTop, ...(store.get("kids") ? { c: store.get("kids") } : {}) })}` }, "See a child's path")]
            : null
        );
      if (family) {
        const fits = family.filter((x) => !x.overPeople.length).length;
        return h(
          "article",
          { class: "wonk-card opt-card opt-card--b" },
          h("h3", {}, o.name),
          h("p", { class: "opt-what" }, o.what),
          h(
            "dl",
            { class: "opt-metrics" },
            metric("Saves a year", moneyShort(family[0].savings)),
            metric("Against the target", gapCell(family[0].gap)),
            metric("Buildings in use", "5"),
            metric("Students fit", `${fits} of 12 versions pass the wastewater test`, [
              h("br"),
              h("span", { class: "small muted" }, `${family.filter((x) => !x.overConsultant.length).length} of 12 within the consultant's classroom capacity`),
            ]),
            metric("Change schools next fall", range(family.map((x) => x.moved))),
            metric("Most schools, valley / Waterbury", `${range(family.map((x) => x.valleyMax))} / ${range(family.map((x) => x.wbMax))}`)
          ),
          o.notes.map((n) => h("p", { class: "opt-note" }, n, " ", cite(ref("meeting1028", "straw poll"))))
        );
      }
      const label = o.group === "one-closure" ? `${o.name}: ${schoolShort(o.closed)} closes` : o.name;
      const brief = o.group === "one-closure" && o.closed !== "FES";
      return h(
        "article",
        { class: `wonk-card opt-card opt-card--${o.group}` },
        h("h3", {}, label),
        brief ? h("p", { class: "opt-what" }, `Same as above, with ${schoolShort(o.closed)} closing.`) : h("p", { class: "opt-what" }, o.what),
        h(
          "dl",
          { class: "opt-metrics" },
          metric("Saves a year", moneyShort(s.savings), s.estimate ? [" ", tag("estimate")] : null),
          metric("Against the target", gapCell(s.gap)),
          metric("Buildings in use", String(s.buildings)),
          metric("Students fit", fitCell(s)),
          metric("Change schools next fall", num(s.moved)),
          metric("Most schools, valley / Waterbury", `${s.valleyMax} / ${s.wbMax}`)
        ),
        brief ? null : o.notes.map((n) => h("p", { class: "opt-note" }, n)),
        portablesNote(s.r.budget.oneTime.portables),
        actions(o.plan)
      );
    }

    function gapCell(gap) {
      if (gap === 0) return h("span", { class: "status status--ok" }, "✓ Meets it exactly");
      return gap < 0 ? h("span", { class: "status status--ok" }, `✓ Meets it, ${moneyShort(-gap)} to spare`) : h("span", {}, `${moneyShort(gap)} short`, h("br"), h("span", { class: "small muted" }, "from cuts or a penalty"));
    }

    function fitCell(s) {
      const withPortables = s.r.budget.oneTime.portables ? ", with the portables" : "";
      return [
        status(!s.overPeople.length, "Wastewater fits", `Wastewater over at ${s.overPeople.map(schoolShort).join(", ")}`),
        h("br"),
        h(
          "span",
          { class: "small muted" },
          s.overConsultant.length
            ? `Classrooms: over the consultant's capacity at ${s.overConsultant.map(schoolShort).join(", ")}`
            : `Classrooms: within the consultant's capacity${withPortables}`
        ),
      ];
    }

    // One-time cost of the portable classrooms in a plan, from the district's preliminary quote.
    function portablesNote(p) {
      if (!p) return null;
      return h(
        "p",
        { class: "opt-note" },
        `Portable classrooms: ${p.units} units of two classrooms, about ${moneyShort(p.low)} to ${moneyShort(p.high)} at the district's preliminary quote, which covers two years. Not counted in the yearly savings. `,
        tag("estimate"),
        " ",
        cite(MODULAR.src)
      );
    }

    draw();
    return null;
  },
};

export { valleySavings };
