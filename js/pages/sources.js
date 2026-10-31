import { h, dateLong, money, num } from "../ui/dom.js";
import { cite, fold, pageHead, section, tag } from "../ui/kit.js";
import { SOURCES, ref } from "../../data/sources.js";
import { GLOSSARY } from "../ui/glossary.js";
import { HISTORY, UPDATES, VOTES } from "../../data/history.js";
import { PUPILS, TARGET, CLASS_SIZE_DEFAULT } from "../model/index.js";
import { BUDGET, PATH_B_SAVINGS } from "../../data/budget.js";

const KIND_LABEL = { district: "District documents", state: "State and federal", research: "Research", news: "News", derived: "Our calculations" };
const TERM_LABEL = {
  threshold: "Excess spending threshold",
  penalty: "Excess spending penalty",
  perpupil: "Spending per pupil",
  fy28: "FY28",
  fte: "FTE",
  levelservice: "Level service",
  wastewater: "Wastewater limit",
  idc: "Intradistrict choice",
  prek: "Pre-K",
  valley: "Valley schools",
  deferred: "Deferred maintenance",
  schools: "Number of schools",
  move: "Move",
  pk4config: "Pre-K to 4 setup (grades 5-6 at Crossett Brook)",
  k6config: "K-6 setup (grades 5-6 stay in the valley)",
};

export default {
  title: "Sources and method",
  render(el) {
    const groups = {};
    for (const [id, s] of Object.entries(SOURCES)) (groups[s.kind] ??= []).push({ id, ...s });

    el.append(
      pageHead({
        kicker: "Sources and method",
        title: "Where every number comes from",
        lede: "This site is built from the district's own presentations and reports, Vermont law, and published research. Here is each source, how we calculate what we calculate, and who made the site.",
      }),

      section(
        { id: "about", title: "About this site" },
        h(
          "div",
          { class: "prose" },
          h("p", {}, h("strong", {}, "Built by Aaron Krivitzky, a Waitsfield parent."), " It is an independent project, not affiliated with or reviewed by the Harwood Unified Union School District. It does not endorse a plan. It shows the district's figures as published, checks the arithmetic, and adds measures the presentations leave out, mainly how many schools a child would attend."),
          h("p", {}, "Found a mistake? Please ", h("a", { href: "https://github.com/ak--47/huusd-dash/issues" }, "report it on GitHub"), ". Corrections will be posted with the date. The code and data are public at ", h("a", { href: "https://github.com/ak--47/huusd-dash" }, "github.com/ak--47/huusd-dash"), "."),
          h("p", {}, "Last updated October 29, 2026.")
        ),
        h(
          "dl",
          { class: "facts prov-key" },
          h("dt", {}, tag("district")), h("dd", {}, "Printed in the district's documents. Shown as published, even where we think it is wrong; corrections appear next to it."),
          h("dt", {}, tag("derived")), h("dd", {}, "Arithmetic on the district's own numbers, explained below."),
          h("dt", {}, tag("estimate")), h("dd", {}, "Our estimate where the district has not published a number. The assumption is always stated next to it.")
        )
      ),

      section(
        { id: "method", title: "How we calculate" },
        methodItem("Which school a child attends", [
          "Plans take effect in fall 2027 (FY28) and stay in place through grade 12. Where the draft roadmap is shown, valley students move into one new building in fall 2029. At the October 28 meeting its author said she would keep 5th and 6th graders at Crossett Brook, though in her example a Waitsfield 2nd grader moves to the new building after grade 4. We default to Pre-K to 4, which matches the roadmap's Phase 3; Pre-K to 5 (its Phase 2 text) and Pre-K to 6 (the feasibility study) are options.",
          "A child stays at this year's school while it is open and still teaches their grade. This covers families using intradistrict choice.",
          "When a town's school closes, its children go to the nearest open school, the rule the district used in its capacity tables. Our town-by-town order reproduces where every district table sends each town. Families can pick a different receiving school on the Your child's path page, since the district's tables place students by home address; the board has not decided how it would assign them.",
          "Under the Pre-K to 4 setup, valley 5th and 6th graders attend Crossett Brook. Under the middle school merger, Crossett Brook keeps grades 5 and 6, and all 7th and 8th graders attend Harwood Union Middle School.",
        ]),
        methodItem("Number of schools", [
          "The count of different schools a child attends from kindergarten through grade 12. Harwood Union Middle School and Harwood Union High School count as two schools; they share one building, so the building count is shown too.",
          "Pre-K is counted only if a family adds it, because Waitsfield and Fayston have no Pre-K classes and families use different programs.",
          "A move is any year a child starts at a different school than the year before.",
        ]),
        methodItem("Students changing schools next fall", [
          "From the October 1, 2026 enrollment report: every group of students (school and grade) is moved forward one grade to fall 2027, and placed under the plan and under no change. If the two schools differ, those students count. Normal moves, like 6th graders going to Harwood, are not counted.",
        ]),
        methodItem("Spending per pupil and the penalty", [
          `The district's level-funded budget is $25.67 per pupil under the threshold and its Path B budget, ${money(590196)} lower, is $255.76 under. That is ${money(590196)} ÷ $230.09 = about ${num(PUPILS)} weighted pupils, which also matches the district's level-service penalty (${money(2773267)} ÷ $1,081).`,
          `So for any plan: spending per pupil = $16,536.33 + (${money(TARGET)} − savings) ÷ ${num(PUPILS)}. If that is over the ${money(BUDGET.threshold)} threshold, the penalty is roughly the amount over times ${num(PUPILS)}, since Vermont counts the excess twice when it sets tax rates.`,
          "This reproduces the district's level-funded and Path B figures to the cent. It is a simplification: the state's official calculation also depends on next year's pupil count and excluded debt.",
        ]),
        methodItem("Savings from closing schools and merging the middle schools", [
          `For closing two valley schools we use the district's figure, ${money(PATH_B_SAVINGS.valley.amount)} and 16 positions, for every pairing, as the district does. For merging the middle schools we use its ${money(PATH_B_SAVINGS.middle.amount)}.`,
          `For closing one or three schools, which the district has not costed, we scale the two-school figure by the number of buildings closed: about ${money(Math.round(PATH_B_SAVINGS.valley.amount / 2))} per building. This is an estimate and is always labeled as one.`,
          [
            "The district's savings figures assume valley 5th and 6th graders move to Crossett Brook. On October 28 an administrator said keeping them in the valley would leave about 126 students at Crossett Brook and would not achieve as many staff cuts, so those versions would save less. The district has not costed them. For plans that keep grades 5-6 in the valley we still show the district's figures, but as an upper limit, with the middle school saving labeled an estimate. ",
            cite(ref("meeting1028", "keeping grades 5-6 in the valley")),
          ],
        ]),
        methodItem("Capacity", [
          "For the six pairings the district tabled, student counts come from its tables, with totals recomputed from the grade rows. For other combinations, this year's students move with their school to the receiving school, and Pre-K follows the district's planning numbers (30 per valley school, 42 at Warren, 60 at Brookside).",
          "Wastewater can be read two ways, and the site shows both. As on the slides: students including Pre-K against 230 (Waitsfield), 250 (Fayston), 235 (Moretown), 237 (Warren), and Brookside's occupancy of 480. As the state permits read: Waitsfield 300 students (1991 permit); Fayston 235 and Warren 237 students and staff; Moretown 2,820 gallons a day, counted as 235 people at 12 gallons; Brookside 480 counting everyone.",
          "Where a permit counts staff, we estimate staff: with all four valley schools open, each building's staff today; otherwise today's valley staff minus the positions the district says closing schools removes, shared out by students. Brookside's staff grow with its students. This is an estimate.",
          "Classrooms are checked against the capacities the district's planning consultant, TruexCullins, calculated in March 2025 (State Board maximums of 20 students per K-4 classroom and 25 per grade 5-8 classroom), plus 40 students for each portable unit of two classrooms.",
          `The Build a plan page also offers a class-size estimate of classrooms needed (by default at most ${CLASS_SIZE_DEFAULT.PK} in Pre-K, ${CLASS_SIZE_DEFAULT.K} in K-2, ${CLASS_SIZE_DEFAULT[3]} in grades 3-4, and ${CLASS_SIZE_DEFAULT[5]} in grades 5-6), which you can change.`,
        ]),
        methodItem("Driving times", ["Car times from OpenStreetMap road data (OSRM), with no traffic or stops. Bus rides are longer. Current bus schedules come from the district's route document."]),
        methodItem("The October 28 meeting", ["Quotes come from an automatic transcript of the public recording. It has no speaker labels, so we name a speaker only where the recording makes it clear, and bracketed words fix obvious transcription errors. Every quote was checked against the transcript."]),
        methodItem("How facts were checked", [
          "Every number from the district's documents was transcribed into the site's data files, which tests re-add on every change. Facts from state law, permits, news, and research were each opened and checked against the original source in a second, separate pass, done with AI research tools; for some studies that meant the published abstract.",
        ])
      ),

      section(
        { id: "history", title: "How we got here", intro: "Earlier HUUSD decisions on school buildings and budgets, as reported." },
        h(
          "ol",
          { class: "timeline" },
          HISTORY.map((e) => h("li", {}, h("span", { class: "when" }, e.when), h("span", { class: "what" }, e.what), e.detail ? h("p", { class: "detail" }, e.detail) : null, e.url ? h("p", { class: "detail" }, h("a", { href: e.url, target: "_blank", rel: "noopener", class: "cite" }, e.source)) : null))
        ),
        fold(
          "Budget votes since 2020",
          h(
            "div",
            { class: "table-scroll" },
            h(
              "table",
              { class: "wonk-table" },
              h("caption", { class: "wonk-sr" }, "HUUSD budget votes"),
              h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Budget vote"), h("th", { scope: "col", class: "num" }, "Yes"), h("th", { scope: "col", class: "num" }, "No"), h("th", { scope: "col" }, "Result"))),
              h("tbody", {}, VOTES.rows.map((v) => h("tr", {}, h("th", { scope: "row" }, v.label), h("td", { class: "num" }, num(v.yes)), h("td", { class: "num" }, num(v.no)), h("td", {}, v.pass ? "Passed" : "Failed"))))
            )
          ),
          h("p", { class: "small" }, VOTES.note)
        )
      ),

      section(
        { id: "updates", title: "Updates to this site" },
        h("ul", { class: "prose" }, UPDATES.map((u) => h("li", {}, h("strong", {}, dateLong(u.date)), ": ", u.text)))
      ),

      section(
        { id: "glossary", title: "Words used on this site" },
        h("dl", { class: "facts glossary" }, Object.entries(GLOSSARY).map(([k, v]) => [h("dt", {}, TERM_LABEL[k] ?? k), h("dd", {}, v)]))
      ),

      section(
        { id: "list", title: "Sources" },
        ...["district", "state", "research", "news", "derived"].filter((k) => groups[k]).map((k) =>
          h(
            "div",
            { class: "source-group" },
            h("h3", {}, KIND_LABEL[k]),
            h(
              "ul",
              { class: "source-list" },
              groups[k].map((s) =>
                h(
                  "li",
                  {},
                  /^https?:/.test(s.url) ? h("a", { href: s.url, target: "_blank", rel: "noopener" }, s.title) : h("a", { href: s.url }, s.title),
                  h("span", { class: "muted" }, ` · ${s.by} · ${/^\d{4}-\d{2}-\d{2}$/.test(s.date) ? dateLong(s.date) : s.date}`),
                  s.note ? h("span", { class: "source-note" }, s.note) : null
                )
              )
            )
          )
        )
      )
    );
  },
};

function methodItem(title, paras) {
  return h("div", { class: "method-item" }, h("h3", {}, title), paras.map((p) => h("p", {}, p)));
}
