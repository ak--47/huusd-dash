import { h, money, moneyShort, num, pct } from "../ui/dom.js";
import { cite, fold, note, pageHead, section, tag, term } from "../ui/kit.js";
import { BUDGET, PATH_A_CUTS, PATH_B_SAVINGS, THRESHOLD_SCHEDULE } from "../../data/budget.js";
import { FACILITIES, SCHOOLS, VALLEY } from "../../data/schools.js";
import { ATTENDING, DISTRICT_TREND } from "../../data/enrollment.js";
import { ref } from "../../data/sources.js";
import { LAW } from "../../data/law.js";
import { loadCharts, quietPlotAria } from "../ui/charts.js";
import { PLAN_TODAY, PUPILS, budget as budgetFor } from "../model/index.js";

export default {
  title: "The budget",
  render(el) {
    const ls = BUDGET.scenarios.find((s) => s.id === "level-service");
    const lf = BUDGET.scenarios.find((s) => s.id === "level-funded");
    const corrected = budgetFor(PLAN_TODAY);
    const charts = [];
    // For the district's case for consolidation: small valley grades this year, and the long-run enrollment trend.
    const valleyGrades = VALLEY.flatMap((id) => Object.values(ATTENDING[2026][id]));
    const smallGrades = valleyGrades.filter((n) => n <= 13);
    const trend = (year) => DISTRICT_TREND.points.find((p) => p.year === year).students;

    const optionRows = BUDGET.scenarios.map((s) => ({
      name: s.name,
      plain: s.plain,
      budget: s.budget,
      change: s.growth,
      vs: s.perPupilVsThreshold,
      penalty: s.penalty,
      src: s.src,
    }));

    const budgetChart = h("div", { class: "chart" });
    const scheduleChart = h("div", { class: "chart" });
    const cutsChart = h("div", { class: "chart chart--tall" });

    el.append(
      pageHead({
        kicker: "The FY28 budget",
        title: `Why the district says it must save ${moneyShort(BUDGET.requiredCut)}`,
        lede: `Keeping every program and position next year would cost ${moneyShort(ls.budget)}, ${pct(ls.growth, 1)} more than this year. A state limit on spending per pupil means the budget has to stay at about this year's ${moneyShort(BUDGET.fy27)} to avoid a tax penalty.`,
      }),

      h(
        "div",
        { class: "stat-row" },
        statCard("This year's budget (FY27)", moneyShort(BUDGET.fy27), "2026-27", "district", ref("deck", "slide 10")),
        statCard("Same services next year", moneyShort(ls.budget), `+${pct(ls.growth, 1)} over this year`, "district", ref("deck", "slide 10")),
        statCard("Savings needed", moneyShort(BUDGET.requiredCut), "to stay under the limit", "district", ref("deck", "slides 10, 13")),
        statCard("State limit per pupil (FY28)", money(BUDGET.threshold), term("threshold", "the excess spending threshold"), "district", ref("deck", "slide 10"))
      ),

      section(
        { id: "options", title: "Four budgets the district priced", intro: "How much each option for next year's budget changes from this year's. This year's budget is about at the state limit, so any increase lands over it." },
        budgetChart,
        h(
          "div",
          { class: "table-scroll" },
          h(
            "table",
            { class: "wonk-table" },
            h("caption", { class: "wonk-sr" }, "FY28 budget options"),
            h(
              "thead",
              {},
              h(
                "tr",
                {},
                h("th", { scope: "col" }, "Option"),
                h("th", { scope: "col", class: "num" }, "FY28 budget"),
                h("th", { scope: "col", class: "num" }, "Change"),
                h("th", { scope: "col", class: "num", "data-tip": "Spending per pupil compared with the $16,562 threshold. Negative means under." }, "Vs. limit, per pupil"),
                h("th", { scope: "col", class: "num", "data-tip": "Extra property tax the district says HUUSD taxpayers would owe" }, "Tax penalty")
              )
            ),
            h(
              "tbody",
              {},
              optionRows.map((r) =>
                h(
                  "tr",
                  {},
                  h("th", { scope: "row" }, h("strong", {}, r.name), h("br"), h("span", { class: "small muted" }, r.plain)),
                  h("td", { class: "num" }, money(r.budget)),
                  h("td", { class: "num" }, `${r.change > 0 ? "+" : ""}${pct(r.change, 1)}`),
                  h("td", { class: "num" }, r.vs > 0 ? `+${money(r.vs, 0)}` : money(r.vs, 2)),
                  h("td", { class: "num" }, r.penalty ? money(r.penalty) : "None")
                )
              )
            )
          )
        ),
        h("p", { class: "small" }, "All figures as printed by the district ", tag("district"), " ", cite(ref("deck", "slides 10 and 20"))),
        fold(
          "Two things in this table that do not line up",
          h(
            "p",
            {},
            `The level-funded card says its per-pupil figure "was corrected to remove the debt exclusion," moving it from $220.67 under the limit to $25.67 under. The level-service card's $1,081 over matches the old basis: $1,081 + $220.67 = ${money(1081 + 220.67, 2)}, which matches the ${money(BUDGET.requiredCut)} cut spread over about ${num(PUPILS)} pupils (about ${money(BUDGET.requiredCut / PUPILS)}). On the corrected basis, level service would be about ${money(corrected.vsThreshold)} over the limit per pupil, and the penalty about ${moneyShort(corrected.penalty)} instead of ${moneyShort(ls.penalty)}. `,
            tag("derived")
          ),
          h("p", {}, `The projected-inflation card ($172 over, ${money(445340)} penalty) does not follow the same per-pupil rule as the other three cards. It may use different assumptions; the presentation does not say. Neither point changes the size of the cut the district is asking for, ${money(BUDGET.requiredCut)}.`),
          h("p", {}, h("a", { href: "#/findings?at=finding-debt-basis" }, "More on what we checked"))
        )
      ),

      section(
        { id: "could-change", title: "What could still change these numbers", intro: "The FY28 figures are projections. Several inputs were still moving as of October 28." },
        h(
          "ul",
          { class: "prose change-list" },
          h("li", {}, h("strong", {}, "Teacher health insurance. "), "A legislator told the board the increase will be held below 3%, after just over 7% last year. The administration called it \"very good news\" that would require remodeling the budget. ", cite(ref("meeting1028", "legislators"))),
          h("li", {}, h("strong", {}, "The official limit. "), "The Secretary of Education sets the FY28 threshold by November 15; $16,562 is a projection. ", cite(ref("vsa5401", "§ 5401(12)"), "State law")),
          h("li", {}, h("strong", {}, "The tax yield. "), "The yield is a state number that turns spending per pupil into a tax rate. The finance director said Path B's figures use last December's first estimate, $8,849; last year's yield ended at $9,406. ", cite(ref("meeting1028", "finance director"))),
          h("li", {}, h("strong", {}, "Staff costs. "), "The consolidation savings use the current seniority list and could change as retirements become known. ", cite(ref("meeting1028", "finance director"))),
          h("li", {}, h("strong", {}, "Bond payments. "), "If payments on older voter-approved bonds are left out of the test, as state law allows, the cut needed is about $500,000 smaller. ", h("a", { href: "#/findings?at=finding-debt-basis" }, "Details")),
          h(
            "li",
            {},
            h("strong", {}, "The Legislature. "),
            "Rep. Dara Torre told the board the threshold is \"too fast\" and that relief is more likely for FY29 than FY28. Both legislators also said the state has no more money for schools, and Rep. Candice White said the planned foundation formula would mean a decrease for this district. ",
            cite(ref("meeting1028", "legislators"))
          )
        )
      ),

      section(
        { id: "threshold", title: "What the state limit is" },
        h(
          "div",
          { class: "prose" },
          h("p", {}, "Vermont sets an ", term("threshold", "excess spending threshold"), ": a ceiling on education spending per pupil. For FY28 the district puts it at ", h("strong", {}, money(BUDGET.threshold)), " per pupil ", cite(ref("deck", "slide 10")), ". A district can spend more, but the amount over the limit is counted twice when the state sets that district's property tax rates, so local taxpayers pay a ", term("penalty", "penalty"), "."),
          h("p", {}, "The limit is a percentage of statewide spending per pupil in FY25, adjusted for inflation. The percentage steps down every year through FY32 ", cite(THRESHOLD_SCHEDULE.src), ", so even a budget that fits in FY28 has less room each year after.")
        ),
        scheduleChart,
        h("p", { class: "small muted" }, THRESHOLD_SCHEDULE.note, " ", cite(THRESHOLD_SCHEDULE.law, "Act 169 of 2026")),
        note(
          "info",
          h("strong", {}, "The district's own view. "),
          "In its presentation, the district asks legislators to look again at the threshold: it says being labeled an excess spender does not explain why a district spends more, such as its geography, special education costs, regional salaries, or programs communities chose to add, and that even with consolidation HUUSD has \"limited room for annual budget growth after FY28.\" ",
          cite(ref("deck", "slide 38"))
        )
      ),

      section(
        { id: "rules", title: "Other state rules in play", intro: "Vermont law changed in 2025 and 2026. These are the parts that bear on this decision." },
        h(
          "div",
          { class: "law-list" },
          LAW.map((l) => h("div", { class: "law" }, h("h3", {}, l.title), h("p", {}, l.text, " ", cite(l.ref, "Law"), l.ref2 ? [" ", cite(l.ref2, l.ref2.id === "jfo" ? "JFO data" : "Act 170")] : null)))
        )
      ),

      section(
        { id: "path-a", title: "Path A: the cuts", intro: `The district's list of "high impact reductions" adds up to exactly ${money(PATH_A_CUTS.total)}.` },
        cutsChart,
        h(
          "dl",
          { class: "facts cut-list" },
          PATH_A_CUTS.items.map((c) => [h("dt", {}, c.name), h("dd", {}, h("strong", { class: "wonk-num" }, money(c.amount)), " · ", c.detail)])
        ),
        h("p", { class: "small" }, tag("district"), " ", cite(PATH_A_CUTS.src)),
        fold("What the district says these cuts would do (it calls the impact \"devastating\")", h("ul", {}, PATH_A_CUTS.impact.map((t) => h("li", {}, t))), h("p", { class: "small" }, cite(PATH_A_CUTS.src)))
      ),

      section(
        { id: "path-b", title: "Path B: the savings", intro: "Two consolidations, each priced by the district." },
        h(
          "div",
          { class: "stat-row" },
          statCard("Close 2 of 4 valley schools", moneyShort(PATH_B_SAVINGS.valley.amount), `${num(PATH_B_SAVINGS.valley.fte)} fewer staff positions`, "district", PATH_B_SAVINGS.valley.src),
          statCard("Merge the middle schools", moneyShort(PATH_B_SAVINGS.middle.amount), `${num(PATH_B_SAVINGS.middle.fte, 1)} fewer staff positions`, "district", PATH_B_SAVINGS.middle.src),
          statCard("Total", moneyShort(PATH_B_SAVINGS.total), `${moneyShort(PATH_B_SAVINGS.total - BUDGET.requiredCut)} more than needed`, "district", ref("deck", "slide 19"))
        ),
        fold(
          "What the district says consolidation would do",
          h(
            "ul",
            {},
            h(
              "li",
              {},
              "Larger groups of classmates: \"larger peer groups, dynamic social learning, and balanced classrooms.\" ",
              cite(ref("deck", "slide 14")),
              ` This year ${smallGrades.length} of the ${valleyGrades.length} grades in the four valley schools have ${Math.min(...smallGrades)} to 13 students. `,
              cite(ATTENDING.src)
            ),
            h(
              "li",
              {},
              "Full-time staff on site: the four valley schools now share arts staff and nurses each week; consolidation would mean \"on-site, full-time staff in the valley elementary schools,\" including a full-time nurse at each. ",
              cite(ref("deck", "slides 14, 17"))
            ),
            h("li", {}, "Teachers with grade-level colleagues, for \"grade-level team teaching, shared lesson planning, and professional growth.\" ", cite(ref("deck", "slide 14"))),
            h("li", {}, "Students with similar needs taught together where their IEPs allow, so a second teacher can help students who get no extra help now. ", cite(ref("deck", "slide 16"))),
            h(
              "li",
              {},
              "One middle school with \"expanded academic electives, athletics, and extracurricular offerings,\" grade-level teacher teams, and combined special education, counseling, and intervention support. ",
              cite(ref("deck", "slide 18"))
            ),
            h("li", {}, "Dedicated music spaces instead of shared multi-purpose rooms, and \"consistent weekly music, band, and choral scheduling.\" ", cite(ref("deck", "slide 40"))),
            h("li", {}, `Falling enrollment: ${num(trend("2009-10"))} students in 2009-10, ${num(trend("2026-27"))} this year, and ${num(trend("2031-32"))} projected for 2031-32. `, cite(DISTRICT_TREND.src))
          )
        ),
        h(
          "div",
          { class: "prose" },
          h("p", {}, "The district gives one savings figure for closing any two valley schools. The buildings' yearly operating costs, which are part of what closing saves, differ only a little:"),
          h(
            "ul",
            {},
            VALLEY.map((id) => h("li", {}, `${SCHOOLS[id].short}: ${money(FACILITIES[id].operatingCost)} a year`))
          ),
          h("p", { class: "small muted" }, "Operating costs exclude custodial salaries and benefits. ", cite(ref("deck", "slides 21-24"))),
          h("p", {}, "The district says the savings would be directed to educational quality, student support, and staff retention ", cite(ref("deck", "slide 19")), ". It has not published how the $1.83M and $2.10M break down between staff, buildings, and transportation.")
        )
      ),

      section(
        { id: "per-pupil", title: "How savings turn into dollars per pupil" },
        h(
          "div",
          { class: "prose" },
          h("p", {}, `The district's own cards fit a simple rule: every ${money(Math.round(PUPILS))} saved lowers spending per pupil by about $1. That is because spending is divided by about ${num(PUPILS)} weighted pupils. `, tag("derived")),
          h("p", {}, `Check: Path B saves ${money(PATH_B_SAVINGS.total - BUDGET.requiredCut)} more than the level-funded budget, and its per-pupil figure is ${money(255.76 - 25.67, 2)} lower: ${money(PATH_B_SAVINGS.total - BUDGET.requiredCut)} ÷ ${money(230.09, 2)} = ${num(PUPILS)} pupils. The level-service penalty gives the same count: ${money(ls.penalty)} ÷ $1,081 = ${num(ls.penalty / 1081)}.`),
          h("p", {}, "The Build a plan page uses this rule to show how far any plan lands from the limit, and the penalty if it falls short. Weighted pupils count some students more than others under state law, which is why the number is larger than enrollment.")
        )
      )
    );

    // charts load on demand, after the containers are in the page
    let alive = true;
    loadCharts()
      .then(() => {
        if (!alive) return;
        const T = window.wonkCharts;
      const label = (d) => `${d.delta > 0 ? "+" : ""}${moneyShort(d.delta)}${d.vs > 0 ? " · over limit" : " · under limit"}`;
      const deltas = optionRows.map((r) => ({ ...r, short: SHORT[r.name] ?? r.name, delta: r.budget - BUDGET.fy27 }));
      charts.push(
        T.plot(budgetChart, (t) => ({
          height: 200,
          marginLeft: 110,
          // room for the "+$3.34M · over limit" label on narrow screens
          marginRight: budgetChart.clientWidth < 500 ? 125 : 80,
          x: { label: null, tickFormat: (v) => (v > 0 ? "+" : "") + moneyShort(v), grid: true, domain: [-1.2e6, 4e6] },
          y: { label: null, domain: deltas.map((r) => r.short) },
          marks: [
            Plot.barX(deltas, { x: "delta", y: "short", fill: t.series[0], tip: { format: { x: (v) => money(v) } } }),
            Plot.ruleX([0], { stroke: t.ink, strokeWidth: 2 }),
            Plot.text(deltas.filter((d) => d.delta >= 0), { x: "delta", y: "short", text: label, dx: 6, textAnchor: "start", fill: t.ink }),
            Plot.text(deltas.filter((d) => d.delta < 0), { x: 0, y: "short", text: label, dx: 6, textAnchor: "start", fill: t.ink }),
          ],
        }), {
          label: "Change in the FY28 budget compared with this year's, for each option. This year's budget is about at the state limit.",
          table: { columns: [{ key: "name", label: "Option" }, { key: "budget", label: "FY28 budget", type: "money" }, { key: "delta", label: "Change from this year", type: "money" }], rows: deltas, rowKey: "name" },
        })
      );
      const sched = THRESHOLD_SCHEDULE.rows.map((r, i) => ({ ...r, i }));
      charts.push(
        T.plot(scheduleChart, (t) => ({
          height: 200,
          marginLeft: 50,
          x: { label: null, domain: sched.map((d) => d.fy), type: "point", padding: 0.3 },
          y: { label: null, domain: [1.1, 1.19], tickFormat: (v) => `${Math.round(v * 1000) / 10}%`, grid: true },
          marks: [
            Plot.line(sched, { x: "fy", y: "pct", stroke: t.series[0], strokeWidth: 2, curve: "step-after" }),
            Plot.dot(sched, { x: "fy", y: "pct", fill: t.series[0], r: 4, tip: { format: { y: (v) => `${Math.round(v * 1000) / 10}%` } } }),
            Plot.text(sched, { x: "fy", y: "pct", text: (d) => `${Math.round(d.pct * 1000) / 10}%`, dy: -12, fill: t.ink }),
          ],
        }), {
          label: "Excess spending threshold as a percent of the inflation-adjusted FY25 statewide spending per pupil, FY27 to FY32 and after",
          table: { columns: [{ key: "fy", label: "Fiscal year" }, { key: "pct", label: "Percent of base", type: "num" }], rows: sched.map((d) => ({ fy: d.fy, pct: Math.round(d.pct * 1000) / 10 })), rowKey: "fy" },
        })
      );
      const cuts = [...PATH_A_CUTS.items].sort((a, b) => b.amount - a.amount).map((c) => ({ ...c, short: CUT_SHORT[c.id] }));
      charts.push(
        T.plot(cutsChart, (t) => ({
          height: 240,
          marginLeft: 150,
          marginRight: 70,
          x: { label: null, tickFormat: (v) => moneyShort(v), grid: true },
          y: { label: null, domain: cuts.map((c) => c.short) },
          marks: [
            Plot.barX(cuts, { x: "amount", y: "short", fill: t.series[0], tip: { format: { x: (v) => money(v) } } }),
            Plot.ruleX([0], { stroke: t.ink }),
            Plot.text(cuts, { x: "amount", y: "short", text: (d) => moneyShort(d.amount), dx: 6, textAnchor: "start", fill: t.ink }),
          ],
        }), {
          label: "Path A cuts by amount",
          table: { columns: [{ key: "name", label: "Cut" }, { key: "amount", label: "Amount", type: "money" }], rows: cuts, rowKey: "id" },
        })
      );
          })
      .catch(() => {
        for (const box of [budgetChart, scheduleChart, cutsChart]) box.replaceChildren(h("p", { class: "small muted" }, "The chart did not load. The same numbers are in the tables on this page."));
      });
    const quiet = [budgetChart, scheduleChart, cutsChart].map(quietPlotAria);
    return () => {
      alive = false;
      quiet.forEach((stop) => stop());
      charts.forEach((c) => c.destroy());
    };
  },
};

const SHORT = {
  "Level service": "Same services",
  "Projected inflation": "Inflation only",
  "Level funded (at the threshold)": "Flat budget",
  "Consolidation (Path B)": "Path B",
};
const CUT_SHORT = {
  transport: "Transportation",
  special: "Special programs",
  prek: "Pre-K tuition model",
  staff: "Support staff",
  athletics: "Athletics and clubs",
  electives: "Electives and tech",
};

function statCard(label, value, sub, kind, src) {
  return h(
    "div",
    { class: "wonk-card" },
    h("div", { class: "wonk-stat stat" }, h("span", { class: "wonk-label" }, label), h("span", { class: "wonk-num" }, value), h("small", { class: "stat-sub" }, sub), h("span", { class: "stat-meta" }, tag(kind), " ", cite(src)))
  );
}
