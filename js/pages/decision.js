// The November 4 decision: the board's own scores of the six pairs of valley schools, the straw poll that followed,
// how each member's vote compares with their own score sheet, the reasons given on the record, the two finalists
// side by side, and what happens next. Board members are named (their scores and votes are public).

import { h, money, num, dateLong } from "../ui/dom.js";
import { cite, cites, fold, note, pageHead, schoolShort, section, status, tag } from "../ui/kit.js";
import { CLASSROOM_CHART, CRITERIA, FINALIST_FACTS, MEETING_1104, ASKED_1104, SCORES, STRAW_POLL } from "../../data/decision.js";
import { FACILITIES } from "../../data/schools.js";
import { TIMELINE, CLOSURE_PROCESS } from "../../data/timeline.js";
import { ref } from "../../data/sources.js";
import { memberRows, pairTotals, pollTally } from "../model/decision.js";
import { RULES, boardNeed } from "../model/vote.js";
import { evaluate, pathB } from "../model/index.js";

const pairName = (pair) => pair.split("+").map(schoolShort).join(" + ");
// the poll's two pairs, Waitsfield + Warren first, as the scores ranked them
const [TOP, SECOND] = STRAW_POLL.choices;
const pts = (n) => num(n / 100, 2);
const share = (a, b) => `${num((a / b) * 100, 1)}%`;
const avg = (n, of) => num(n / of, 2);

export default {
  title: "The November 4 decision",
  render(el) {
    const totals = pairTotals();
    const top = totals.find((p) => p.pair === TOP);
    const second = totals.find((p) => p.pair === SECOND);
    const rows = memberRows();
    const t = pollTally();
    const cast = t.asVoted[TOP].points + t.asVoted[SECOND].points;
    const need = boardNeed(RULES.closure);
    const diff = CRITERIA.map((c, i) => ({ c, d: top.byCriterion[i] - second.byCriterion[i] }));
    const kitchen = diff.find((x) => x.c.id === "kitchen").d;
    const membersN = top.members;

    // ---- the scores ----
    const scoreTable = h(
      "div",
      { class: "table-scroll" },
      h(
        "table",
        { class: "wonk-table dc-scores" },
        h("caption", {}, `The six pairs of valley schools, as the ${membersN} board members scored them (1 to 5 on each question; average per member)`),
        h(
          "thead",
          {},
          h(
            "tr",
            {},
            h("th", { scope: "col" }, "Schools kept open"),
            h("th", { scope: "col", class: "num" }, "Total points"),
            CRITERIA.map((c) => h("th", { scope: "col", class: "num" }, c.short))
          )
        ),
        h(
          "tbody",
          {},
          totals.map((p, i) =>
            h(
              "tr",
              { class: p.pair === TOP || p.pair === SECOND ? "is-finalist" : "" },
              h("th", { scope: "row" }, h("span", { class: "dc-rank" }, `${i + 1}. `), pairName(p.pair)),
              h("td", { class: "num" }, num(p.published), p.published !== p.total ? h("span", { class: "small muted" }, ` (${num(p.total)} recounted)`) : null),
              p.byCriterion.map((x) => h("td", { class: "num" }, avg(x, p.members)))
            )
          )
        )
      )
    );

    const diffList = h(
      "ul",
      { class: "dc-diff" },
      diff.map(({ c, d }) =>
        h(
          "li",
          {},
          h("strong", {}, `${c.name}: `),
          d === 0 ? "tied" : `${pairName(d > 0 ? TOP : SECOND)} by ${num(Math.abs(d))} point${Math.abs(d) === 1 ? "" : "s"}`
        )
      )
    );

    // ---- each member ----
    const voteCell = (r) =>
      r.vote == null
        ? h("span", { class: "muted" }, "Did not vote (chair)")
        : h("span", {}, pairName(r.vote), r.inferred ? h("span", { class: "dc-flag", title: STRAW_POLL.inferredNote }, " *") : null);
    const matchCell = (r) =>
      r.vote == null ? h("span", { class: "muted" }, "—") : r.matches ? status(true, "Same as the sheet", "") : status(false, "", "Against the sheet");
    const memberTable = h(
      "div",
      { class: "table-scroll" },
      h(
        "table",
        { class: "wonk-table dc-members" },
        h("caption", {}, "Each member's own scores for the two finalists, and their answer in the straw poll"),
        h(
          "thead",
          {},
          h(
            "tr",
            {},
            h("th", { scope: "col" }, "Member"),
            h("th", { scope: "col", class: "num" }, "Vote weight"),
            h("th", { scope: "col", class: "num" }, `Scored ${pairName(TOP)}`),
            h("th", { scope: "col", class: "num" }, `Scored ${pairName(SECOND)}`),
            h("th", { scope: "col" }, "Straw poll answer"),
            h("th", { scope: "col" }, "Compared with their scores")
          )
        ),
        h(
          "tbody",
          {},
          rows.map((r) =>
            h(
              "tr",
              { class: r.matches === false ? "is-against" : "" },
              h("th", { scope: "row" }, h("span", { class: "dc-name" }, r.name), h("span", { class: "dc-town" }, r.town)),
              h("td", { class: "num" }, `${pts(r.weight)}%`),
              h("td", { class: `num${r.pick === TOP ? " is-higher" : ""}` }, r.scores[TOP]),
              h("td", { class: `num${r.pick === SECOND ? " is-higher" : ""}` }, r.scores[SECOND]),
              h("td", {}, voteCell(r)),
              h("td", {}, matchCell(r))
            )
          )
        )
      )
    );

    const asVoted = t.asVoted;
    const sheets = t.bySheets;
    const sheetsChair = t.bySheetsWithChair;
    const against = t.against;

    // ---- the finalists side by side (the administration's recommended setup: Pre-K to 4, grades 5-6 together) ----
    const fin = (pair) => {
      const ids = pair.split("+");
      const r4 = evaluate(pathB(ids, 4));
      const rP = evaluate(pathB(ids, 4), { reading: "permits" });
      const at = (r, id) => r.capacity.schools.find((s) => s.id === id);
      const chart = CLASSROOM_CHART.pairs[pair];
      const valley = ids.filter((id) => id !== "WRN").concat("WRN");
      return { ids: valley, r4, rP, at, chart };
    };
    const A = fin(TOP);
    const B = fin(SECOND);
    const rooms = (f, key) =>
      f.ids.map((id) => {
        const need = f.chart[key][id];
        const have = CLASSROOM_CHART.have[id];
        return h("span", { class: "dc-line" }, `${schoolShort(id)}: needs ${need} of ${have} `, need > have ? status(false, "", `${need - have} short`) : status(true, "fits", ""));
      });
    const people = (f) =>
      f.ids.map((id) => {
        const s = f.at(f.r4, id);
        const p = f.at(f.rP, id);
        return h(
          "span",
          { class: "dc-line" },
          `${schoolShort(id)}: about ${num(s.total)} students; slides' limit ${num(s.limit)} `,
          s.overPeople ? status(false, "", "over") : status(true, "fits", ""),
          `; permit as written ${num(p.limit)}${p.countsStaff ? " with staff" : ""} `,
          p.overPeople ? status(false, "", "over") : status(true, "fits", ""),
          `; consultant's classroom capacity ${num(s.consultantCapacity)}`,
          s.overConsultant ? ` (${num(s.total - s.consultantCapacity)} over)` : ""
        );
      });
    const repairs = (f) => f.ids.reduce((a, id) => a + FACILITIES[id].priority1 + FACILITIES[id].impending, 0);
    const finRow = (label, a, b, src) => h("tr", {}, h("th", { scope: "row" }, label, src ? [" ", src] : null), h("td", {}, a), h("td", {}, b));
    const finalists = h(
      "div",
      { class: "table-scroll" },
      h(
        "table",
        { class: "wonk-table dc-finalists" },
        h("caption", {}, "The two finalists with valley schools teaching Pre-K to grade 4 and every 5th and 6th grader at Crossett Brook, the setup the administration recommends"),
        h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Measure"), h("th", { scope: "col" }, pairName(TOP)), h("th", { scope: "col" }, pairName(SECOND)))),
        h(
          "tbody",
          {},
          finRow("Board members' scores", `${num(top.published)} points (${avg(top.total, membersN)} a member)`, `${num(second.published)} points (${avg(second.total, membersN)} a member)`, tag("district")),
          finRow("Schools that close", "Fayston and Moretown", "Fayston and Waitsfield"),
          finRow("Savings", "$3.93M (the district's figure is the same for every pair)", "$3.93M", tag("district")),
          finRow("Classrooms, the administration's chart (Pre-K to 4)", rooms(A, "pk4"), rooms(B, "pk4"), cite(CLASSROOM_CHART.src)),
          finRow("Classrooms, the administration's chart (Pre-K to 6)", rooms(A, "pk6"), rooms(B, "pk6"), cite(CLASSROOM_CHART.src)),
          finRow("Students and limits (the district's table)", people(A), people(B), cites([A.r4.capacity.table?.src, B.r4.capacity.table?.src])),
          finRow("Kitchens", A.ids.map((id) => h("span", { class: "dc-line" }, `${schoolShort(id)}: ${FINALIST_FACTS.kitchen[id]}`)), B.ids.map((id) => h("span", { class: "dc-line" }, `${schoolShort(id)}: ${FINALIST_FACTS.kitchen[id]}`))),
          finRow("Land and room to grow", A.ids.map((id) => h("span", { class: "dc-line" }, `${schoolShort(id)}: ${FINALIST_FACTS.land[id]}`)), B.ids.map((id) => h("span", { class: "dc-line" }, `${schoolShort(id)}: ${FINALIST_FACTS.land[id]}`))),
          finRow("Priority 1 and near-term repairs at the two buildings kept", money(repairs(A)), money(repairs(B)), cite(ref("deck", "slides 22-24"))),
          finRow("K-12 students changing schools next fall", h("span", {}, num(A.r4.moved.k12), " ", tag("derived")), h("span", {}, num(B.r4.moved.k12), " ", tag("derived"))),
          finRow("This year's students who would attend 5 or more K-12 schools", h("span", {}, num(A.r4.fivePlus.total), " ", tag("derived")), h("span", {}, num(B.r4.fivePlus.total), " ", tag("derived")))
        )
      )
    );

    // ---- next steps ----
    const upcoming = TIMELINE.filter((x) => x.date >= "2026-11-05" && x.date <= "2027-03-02");

    el.append(
      pageHead({
        kicker: `November 4, 2026 board meeting`,
        title: `The board's own scores ranked ${pairName(TOP)} first. Its straw poll chose ${pairName(SECOND)}, 9 to 4.`,
        lede: [
          `Each board member scored the six possible pairs of valley schools to keep open, on five questions the district set. Added up, ${pairName(TOP)} came first with ${num(top.published)} points and ${pairName(SECOND)} second with ${num(second.published)}. At the end of a four-hour meeting, in a straw poll, nine members chose ${pairName(SECOND)}. Three of them had scored ${pairName(TOP)} higher on their own sheets. `,
          cite(SCORES.slideSrc),
          " ",
          cite(STRAW_POLL.src),
        ],
      }),
      note(
        "info",
        h("strong", {}, "A straw poll, not a vote to close a school. "),
        `It tells the administration which pair to plan the budget around. Closing Fayston and Waitsfield would still take three public hearings, at least one in each town, ten days' notice, and a vote of two-thirds of the board, set for January 6. `,
        cite(ref("meeting1104", "process and timeline")),
        " ",
        cite(CLOSURE_PROCESS.src)
      ),

      section(
        { id: "what-happened", title: "What happened on November 4" },
        h(
          "ol",
          { class: "prose dc-steps" },
          h("li", {}, `Before the meeting, all ${membersN} board members scored the six pairs. The district put the results in a public dashboard and on slide 22. The score sheet says its purpose: "${SCORES.purpose}" `, cites([SCORES.dashboardSrc, SCORES.slideSrc])),
          h("li", {}, "The administration showed its classroom modeling on chart paper and read a letter from every principal supporting Pre-K to 4, grades 5-6, and grades 7-12 across the district, while staying neutral on which buildings. ", cites([CLASSROOM_CHART.src, ref("meeting1104", "principals' letter")])),
          h("li", {}, `First straw poll: whether to keep studying Path A's program cuts. ${STRAW_POLL.pathA} `, cite(ref("meeting1104", "straw poll on Path A"))),
          h("li", {}, `Second straw poll, about 9:55 PM after a five-minute recess: ${STRAW_POLL.question} Each member answered aloud. The chair announced ${STRAW_POLL.announced} and did not vote. `, cite(STRAW_POLL.src)),
          h("li", {}, "Members asked for more information before January: the cost of Moretown's kitchen or a van, early-retirement modeling, and visits to the schools. ", h("a", { href: "#/decision?at=next" }, "See what was asked for"))
        )
      ),

      section(
        { id: "scores", title: "What the scores said", intro: `The district asked each member to score each pair from 1 (poor fit) to 5 (strong fit) on five questions, so one member's total for a pair runs from 5 to 25. The last question asks: "${SCORES.overallQuestion}"` },
        scoreTable,
        h(
          "p",
          { class: "small muted" },
          tag("district"),
          " Totals as published on the district's dashboard and slide 22. ",
          tag("derived"),
          " Averages recounted from each member's tab. Two published totals are 1 point low because a formula missed cells with a trailing space, which the dashboard flags; the top pairs are not affected. ",
          cite(SCORES.src)
        ),
        h("h3", {}, `Where ${pairName(TOP)}'s ${num(top.published - second.published)}-point lead comes from`),
        h(
          "p",
          {},
          `The top two pairs were close: ${num(top.published)} to ${num(second.published)}, ${avg(top.total, membersN)} to ${avg(second.total, membersN)} points a member out of 25. By question, across all ${membersN} members:`
        ),
        diffList,
        h(
          "p",
          {},
          `So the lead comes from the kitchen question (${num(kitchen)} points): ${pairName(TOP)} keeps two full kitchens, while Moretown's is a prep kitchen. ${pairName(SECOND)} scored higher on capacity, wastewater, buildings, and overall fit. `,
          tag("derived")
        )
      ),

      section(
        { id: "members", title: "How each member scored the finalists, and how they voted", intro: "Board members' scores and straw-poll answers are public: the district published the score sheets by name, and each member answered aloud. The higher of each member's two scores is highlighted." },
        memberTable,
        h("p", { class: "small muted" }, "* ", STRAW_POLL.inferredNote, " ", cite(STRAW_POLL.src)),
        h(
          "div",
          { class: "dc-findings" },
          h(
            "div",
            { class: "wonk-card dc-card" },
            h("h3", {}, "As the board answered"),
            h("p", { class: "dc-big" }, `${asVoted[SECOND].members} to ${asVoted[TOP].members}`),
            h("p", {}, `for ${pairName(SECOND)}. Weighted by town, ${pts(asVoted[SECOND].points)} points to ${pts(asVoted[TOP].points)}; the chair's ${pts(t.chair.weight)} not cast.`)
          ),
          h(
            "div",
            { class: "wonk-card dc-card" },
            h("h3", {}, "As members' own sheets ranked the two pairs"),
            h("p", { class: "dc-big" }, `${sheets[TOP].members} to ${sheets[SECOND].members}`),
            h("p", {}, `for ${pairName(TOP)} (${sheetsChair[TOP].members} to ${sheetsChair[SECOND].members} counting the chair's sheet). Weighted, ${pts(sheets[TOP].points)} to ${pts(sheets[SECOND].points)}. `, tag("derived"))
          )
        ),
        h(
          "p",
          {},
          h("strong", {}, `${against.length} members answered against their own scores, all toward ${pairName(SECOND)}: `),
          against.map((r, i) => [i ? (i === against.length - 1 ? ", and " : ", ") : "", `${r.name} of ${r.town} (scored ${r.scores[TOP]} to ${r.scores[SECOND]})`]),
          `. No member answered ${pairName(TOP)} against their sheet. The other ${rows.filter((r) => r.matches).length} answers match the pair each member's sheet scored higher.`
        ),
        h(
          "p",
          { class: "small" },
          "Scores are one input, not a rule: the district's sheet says it was meant to build understanding, not make the decision, and several members said before the poll that they would weigh other things. Their reasons are below, in their words."
        )
      ),

      section(
        { id: "weights", title: "The weighted count", intro: "The board's votes are weighted by town population (2021 weights). A straw poll is not a closure vote, but the closure vote in January will be counted this way." },
        h(
          "ul",
          { class: "prose" },
          h("li", {}, `The 9 members who chose ${pairName(SECOND)} hold ${pts(asVoted[SECOND].points)} of the board's 100 points. Closing a school takes two-thirds: ${pts(need)} points of the whole board, or two-thirds of the points of members who vote.`),
          h("li", {}, `On the whole-board reading, ${pts(asVoted[SECOND].points)} is ${pts(need - asVoted[SECOND].points)} short of two-thirds. Counting only the ${pts(cast)} points cast, it is ${share(asVoted[SECOND].points, cast)}, over two-thirds.`),
          h("li", {}, "A closure vote is on closing a particular school, not on a pair, and members may vote differently in January. This is arithmetic on the straw poll, not a prediction.")
        ),
        h("p", { class: "small" }, tag("derived"), " Weights ", cite(ref("aoaDeck", "Board vote weights")), " · ", h("a", { href: "#/vote" }, "Try the board vote simulator"))
      ),

      section(
        { id: "reasons", title: "Reasons given on the record", intro: "In their own words, from the recording. Board members are named; staff by role." },
        h(
          "div",
          { class: "meeting" },
          MEETING_1104.groups.map((g, i) => {
            const body = h(
              "ul",
              { class: "quotes" },
              g.items.map((q) => h("li", {}, h("blockquote", {}, `“${q.text}”`), h("p", { class: "who" }, `${q.who}, ${q.at}`)))
            );
            if (i < 3) return h("div", { class: "dc-quotes" }, h("h3", {}, g.title), body);
            return fold(g.title, body);
          }),
          h("p", { class: "small" }, h("strong", {}, "Public comment. "), MEETING_1104.publicComment, " ", cite(ref("omlResponse1104")), " ", cite(MEETING_1104.src))
        )
      ),

      section(
        { id: "finalists", title: "The two finalists side by side", intro: "No single fact in the district's documents rules either pair out. Each has costs that are not yet priced: Moretown's kitchen for one, Waitsfield's wastewater limit and classroom count for the other, and Warren's in both." },
        finalists,
        h(
          "p",
          { class: "small muted" },
          CLASSROOM_CHART.note,
          " Students: the district's capacity tables (Pre-K to 4). Staff counts are our estimate. Students changing schools and the 5-school count are calculated on this site from the October 1 enrollment report. ",
          cites(FINALIST_FACTS.src)
        ),
        h("p", {}, h("a", { class: "wonk-btn", href: "#/compare" }, "Compare all six pairs"), " ", h("a", { class: "wonk-btn wonk-btn--quiet", href: "#/options?at=option-center56" }, "A grades 5-6 center in the valley"))
      ),

      section(
        { id: "next", title: "What happens next" },
        h("h3", {}, "Asked for on November 4"),
        h("ul", { class: "prose" }, ASKED_1104.map((a) => h("li", {}, h("strong", {}, `${a.who}: `), a.what))),
        h("h3", {}, "Dates"),
        h(
          "ol",
          { class: "timeline" },
          upcoming.map((x) =>
            h(
              "li",
              { class: x.key ? "is-key" : "" },
              h("span", { class: "when" }, dateLong(x.date)),
              h("span", { class: "what" }, x.title),
              x.detail ? h("p", { class: "detail" }, x.detail, " ", cite(x.src)) : null
            )
          )
        ),
        h("p", {}, h("a", { class: "wonk-btn wonk-btn--primary", href: "#/findings?at=questions" }, "Questions to ask the board"))
      )
    );
  },
};
