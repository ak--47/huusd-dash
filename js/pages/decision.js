// The board's decision. First November 18: the roll-call votes that sent Moretown and Fayston to closure hearings,
// weighted by town, the hearing dates, and where each member stood. Then November 4: the board's own scores of the
// six pairs of valley schools, the straw poll that followed, how each member's answer compares with their own score
// sheet, the reasons given on the record, the two finalists side by side, and what happens next. Board members are
// named (their scores and votes are public).

import { h, money, num, dateLong } from "../ui/dom.js";
import { cite, cites, fold, note, pageHead, schoolShort, section, status, tag } from "../ui/kit.js";
import { CLASSROOM_1118, CLASSROOM_CHART, CRITERIA, FINALIST_FACTS, HEARINGS_1118, MEETING_1104, MEETING_1112, MEETING_1116, MEETING_1118, ASKED_1104, SCORES, STRAW_POLL, VOTES_1118 } from "../../data/decision.js";
import { FACILITIES } from "../../data/schools.js";
import { TIMELINE, CLOSURE_PROCESS } from "../../data/timeline.js";
import { ref } from "../../data/sources.js";
import { memberRows, pairTotals, pollTally, rollCall } from "../model/decision.js";
import { RULES, TOTAL, boardNeed } from "../model/vote.js";
import { evaluate, pathB } from "../model/index.js";

const pairName = (pair) => pair.split("+").map(schoolShort).join(" + ");
// the poll's two pairs, Waitsfield + Warren first, as the scores ranked them
const [TOP, SECOND] = STRAW_POLL.choices;
const pts = (n) => num(n / 100, 2);
const share = (a, b) => `${num((a / b) * 100, 1)}%`;
const avg = (n, of) => num(n / of, 2);

export default {
  title: "The board's decision",
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
    const fall27 = (pair, what) => {
      const c = CLASSROOM_1118.pairs[pair];
      return Object.keys(c.students).map((id) =>
        what === "students"
          ? h("span", { class: "dc-line" }, `${schoolShort(id)}: ${num(c.students[id])} students`)
          : h("span", { class: "dc-line" }, `${schoolShort(id)}: needs ${c.need[id]} of ${c.have[id]} `, c.need[id] > c.have[id] ? status(false, "", `${c.need[id] - c.have[id]} short`) : status(true, "fits", ""))
      );
    };
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
          finRow("Students, fall 2027 by home address (November 18; Pre-K to 4)", fall27(TOP, "students"), fall27(SECOND, "students"), cite(CLASSROOM_1118.src)),
          finRow("Classrooms, fall 2027 by home address (November 18)", fall27(TOP, "rooms"), fall27(SECOND, "rooms"), cite(CLASSROOM_1118.src)),
          finRow("Classrooms, the administration's November 4 chart (Pre-K to 4, this year's students)", rooms(A, "pk4"), rooms(B, "pk4"), cite(CLASSROOM_CHART.src)),
          finRow("Classrooms, the administration's chart (Pre-K to 6)", rooms(A, "pk6"), rooms(B, "pk6"), cite(CLASSROOM_CHART.src)),
          finRow("Students and limits (the district's October 28 table, this year's students)", people(A), people(B), cites([A.r4.capacity.table?.src, B.r4.capacity.table?.src])),
          finRow("Kitchens", A.ids.map((id) => h("span", { class: "dc-line" }, `${schoolShort(id)}: ${FINALIST_FACTS.kitchen[id]}`)), B.ids.map((id) => h("span", { class: "dc-line" }, `${schoolShort(id)}: ${FINALIST_FACTS.kitchen[id]}`))),
          finRow("Land and room to grow", A.ids.map((id) => h("span", { class: "dc-line" }, `${schoolShort(id)}: ${FINALIST_FACTS.land[id]}`)), B.ids.map((id) => h("span", { class: "dc-line" }, `${schoolShort(id)}: ${FINALIST_FACTS.land[id]}`))),
          finRow("Priority 1 and near-term repairs at the two buildings kept", money(repairs(A)), money(repairs(B)), cite(ref("deck", "slides 22-24"))),
          finRow("K-12 students changing schools next fall", h("span", {}, num(A.r4.moved.k12), " ", tag("derived")), h("span", {}, num(B.r4.moved.k12), " ", tag("derived"))),
          finRow("This year's students who would attend 5 or more K-12 schools", h("span", {}, num(A.r4.fivePlus.total), " ", tag("derived")), h("span", {}, num(B.r4.fivePlus.total), " ", tag("derived")))
        )
      )
    );

    // ---- November 18: the roll calls ----
    const calls = VOTES_1118.motions.map((m) => rollCall(m.id));
    const [mesCall, fesCall] = calls;
    const word = { yes: "Yes", no: "No" };
    const answer = (v) =>
      v === "chair" ? h("span", { class: "muted" }, "Not called (chair)") : v == null ? h("span", { class: "muted" }, "Not heard") : h("span", { class: `dc-vote dc-vote--${v}` }, word[v]);
    const flag = (name) => (VOTES_1118.unclear.includes(name) ? h("span", { class: "dc-flag", title: VOTES_1118.unclearNote }, " *") : null);
    const rollTable = h(
      "div",
      { class: "table-scroll" },
      h(
        "table",
        { class: "wonk-table dc-members dc-roll" },
        h("caption", {}, "Each member's answer in the two roll calls, November 18"),
        h(
          "thead",
          {},
          h(
            "tr",
            {},
            h("th", { scope: "col" }, "Member"),
            h("th", { scope: "col", class: "num" }, "Vote weight"),
            calls.map((c) => h("th", { scope: "col" }, `Send ${schoolShort(c.motion.school)} to hearings`))
          )
        ),
        h(
          "tbody",
          {},
          mesCall.rows.map((r, i) =>
            h(
              "tr",
              {},
              h("th", { scope: "row" }, h("span", { class: "dc-name" }, r.name), h("span", { class: "dc-town" }, r.town)),
              h("td", { class: "num" }, `${pts(r.weight)}%`),
              calls.map((c) => h("td", {}, answer(c.rows[i].vote), c.rows[i].vote === "yes" || c.rows[i].vote === "no" ? flag(r.name) : null))
            )
          )
        )
      )
    );
    const bar = (c) => {
      const seg = (cls, n, label) => (n ? h("span", { class: `dc-seg dc-seg--${cls}`, style: { width: `${(n / TOTAL) * 100}%` }, title: `${label}: ${pts(n)}` }) : null);
      return h(
        "div",
        { class: "dc-meter", "aria-hidden": "true" },
        seg("yes", c.yes, "Yes"),
        seg("no", c.no, "No"),
        seg("unheard", c.notHeard, "Not heard"),
        seg("chair", c.chair, "Chair, not called"),
        h("span", { class: "dc-mark", style: { left: "50%" } }),
        h("span", { class: "dc-mark dc-mark--dash", style: { left: `${(200 / 3).toFixed(2)}%` } })
      );
    };
    const callCard = (c) =>
      h(
        "div",
        { class: "wonk-card dc-card" },
        h("h3", {}, `Send ${schoolShort(c.motion.school)} to closure hearings`),
        h("p", { class: "dc-big" }, `${c.count.yes} to ${c.count.no}`),
        h("p", {}, `Passed. Weighted: ${pts(c.yes)} points Yes, ${pts(c.no)} No${c.notHeard ? `, ${pts(c.notHeard)} not heard` : ""}, ${pts(c.chair)} the chair's, not cast. Yes is ${share(c.yes, c.yes + c.no)} of the points cast. `, tag("derived")),
        bar(c),
        h("p", { class: "small muted" }, `Moved by ${c.motion.by}, seconded by ${c.motion.second}, ${c.motion.at}. `, cite(VOTES_1118.src))
      );
    // the nine who chose Moretown + Warren in the November 4 straw poll, and how they voted on sending Moretown to hearings
    const pollMES = STRAW_POLL.votes.filter((v) => v.vote === SECOND).map((v) => ({ name: v.name, now: VOTES_1118.motions[0].votes[v.name] }));
    const nowYes = pollMES.filter((v) => v.now === "yes").map((v) => v.name);
    const nowNo = pollMES.filter((v) => v.now === "no").map((v) => v.name);
    const nowUnheard = pollMES.filter((v) => v.now == null).map((v) => v.name);
    const names = (list) => list.map((n, i) => [i ? (i === list.length - 1 ? " and " : ", ") : "", n]);

    // ---- next steps ----
    const upcoming = TIMELINE.filter((x) => x.date >= "2026-11-19" && x.date <= "2027-03-02");

    el.append(
      pageHead({
        kicker: "November 18, 2026 board meeting",
        title: "The board sent Moretown and Fayston to closure hearings",
        lede: [
          `In two roll-call votes, the board advanced Moretown (${mesCall.count.yes} to ${mesCall.count.no}) and Fayston (${fesCall.count.yes} to ${fesCall.count.no}, unanimous) for possible closure. No other school was proposed, so Waitsfield and Warren are the valley schools that would stay open. This was not a vote to close: three public hearings come first, and the closure votes, a separate vote for each school and each needing two-thirds of the board's weighted vote, are set for January 6. `,
          cite(VOTES_1118.src),
        ],
      }),
      note(
        "info",
        h("strong", {}, "Not a vote to close a school. "),
        `The board's attorney advised that advancing a school to hearings takes a majority of the weighted votes cast. Closing it takes the hearings, ten days' notice of the vote, and two-thirds of the board. Only Moretown and Fayston can be voted on January 6. `,
        cite(ref("meeting1118", "action items, 4:50-4:57")),
        " ",
        cite(CLOSURE_PROCESS.src)
      ),

      section(
        { id: "nov18", title: "How each member voted on November 18", intro: "Each member answered aloud in a roll call. Votes are weighted by town (2021 weights)." },
        h("div", { class: "dc-findings" }, calls.map(callCard)),
        h("p", { class: "small muted" }, "Bars: green Yes, red No, gray the chair's, not cast. The solid line marks half of the whole board's 100 points and the dashed line two-thirds; the motions needed a majority of the points cast, which the cards give."),
        rollTable,
        h("p", { class: "small muted" }, "* ", VOTES_1118.unclearNote, " ", cite(VOTES_1118.src)),
        h(
          "ul",
          { class: "prose" },
          h("li", {}, `Since November 4: of the ${pollMES.length} members who chose ${pairName(SECOND)} in the straw poll, ${nowYes.length} voted to send Moretown to hearings (`, names(nowYes), `) and ${nowNo.length} voted no (`, names(nowNo), nowUnheard.length ? [`); ${nowUnheard.length} not heard (`, names(nowUnheard)] : null, "). Several said in the discussion why they had changed their view; their words are below. ", tag("derived")),
          h("li", {}, `For comparison with January 6, which needs two-thirds: the Yes votes on Moretown were ${pts(mesCall.yes)} points, ${share(mesCall.yes, mesCall.yes + mesCall.no)} of the points cast, against ${pts(need)} for two-thirds of the whole board; on Fayston they were ${pts(fesCall.yes)}. This is arithmetic on the November 18 votes, not a prediction: members can vote differently after the hearings, and the district's own Articles presentation cautions against turning two-thirds into points without confirming the rules with counsel. `, tag("derived"), " ", h("a", { href: "#/vote" }, "Try the board vote simulator"))
        )
      ),

      section(
        { id: "hearings", title: "The three hearings", intro: "Set by voice vote after the closure motions. Each starts at 6:00 PM." },
        h(
          "ol",
          { class: "timeline" },
          HEARINGS_1118.list.map((x) =>
            h(
              "li",
              { class: "is-key" },
              h("span", { class: "when" }, `${x.day}, ${dateLong(x.date)}`),
              h("span", { class: "what" }, `${x.where}${x.school ? `: the hearing on ${schoolShort(x.school)}` : ": the third hearing, outside the two towns"}, ${x.time}`)
            )
          )
        ),
        h("p", { class: "small" }, HEARINGS_1118.note, " ", cite(HEARINGS_1118.src)),
        h("p", {}, "After the hearings, on December 16, the board would vote to warn the closure votes for January 6. ", cite(ref("meeting1118", "5:05-5:07")))
      ),

      section(
        { id: "said-1118", title: "Where each member stood", intro: "Before the votes, each member spoke in three rounds: what the evidence shows, the trade-offs, and where to go from here. From the third round, in their own words:" },
        h(
          "div",
          { class: "meeting" },
          h("ul", { class: "quotes" }, MEETING_1118.groups[0].items.map((q) => h("li", {}, h("blockquote", {}, `“${q.text}”`), h("p", { class: "who" }, `${q.who}, ${q.at}`)))),
          h("p", { class: "small" }, cite(MEETING_1118.src), " ", h("a", { href: "#/meetings?at=m-1118" }, "More from November 18: the evidence, the trade-offs, and the administration's update"))
        )
      ),

      section(
        { id: "nov4", title: "November 4: the scores and the straw poll", intro: `The board's own scores ranked ${pairName(TOP)} first. Its straw poll, two weeks before the votes above, chose ${pairName(SECOND)}, 9 to 4.` },
        h(
          "p",
          {},
          `Each board member scored the six possible pairs of valley schools to keep open, on five questions the district set. Added up, ${pairName(TOP)} came first with ${num(top.published)} points and ${pairName(SECOND)} second with ${num(second.published)}. At the end of a four-hour meeting, in a straw poll, nine members chose ${pairName(SECOND)}. Three of them had scored ${pairName(TOP)} higher on their own sheets. `,
          cite(SCORES.slideSrc),
          " ",
          cite(STRAW_POLL.src)
        ),
        note(
          "info",
          h("strong", {}, "A straw poll, not a vote. "),
          "It told the administration which pair to plan the budget around. On November 18 the board advanced Moretown and Fayston instead, keeping Waitsfield and Warren. ",
          cite(ref("meeting1104", "process and timeline"))
        )
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
        { id: "finalists", title: "The two finalists side by side", intro: "The two pairs the board weighed. On November 18 it advanced Moretown and Fayston for closure, which keeps Waitsfield + Warren. The administration's November 18 counts, by home address for fall 2027, show both pairs fitting in their classrooms." },
        finalists,
        h(
          "p",
          { class: "small muted" },
          CLASSROOM_1118.note,
          " The November 18 counts move this year's students up a grade and place each at the nearest open school by home address, so they differ from the October 28 tables this site's model uses: for Waitsfield + Warren, Waitsfield 180 instead of 245 and Brookside 380 instead of 357; for Moretown + Warren, Moretown 195 instead of 136 and Warren 147 instead of 227. ",
          CLASSROOM_CHART.note,
          " Students: the district's capacity tables (Pre-K to 4). Staff counts are our estimate. Students changing schools and the 5-school count are calculated on this site from the October 1 enrollment report. ",
          cites(FINALIST_FACTS.src)
        ),
        h("p", {}, h("a", { class: "wonk-btn", href: "#/compare" }, "Compare all six pairs"), " ", h("a", { class: "wonk-btn wonk-btn--quiet", href: "#/options?at=option-center56" }, "A grades 5-6 center in the valley"))
      ),

      section(
        { id: "since", title: "Between November 4 and 18", intro: "Board members held two community forums between the straw poll and the votes. What was said at each, in their words, is on the meetings page." },
        h(
          "ul",
          { class: "prose" },
          h("li", {}, h("a", { href: "#/meetings?at=m-1116" }, "November 16: the Warren forum"), ". The chair said the board's scores were weighed in and the November 18 outcome is open; members described the bus plan for grades 5-6 and how they could return to the valley later. ", cite(MEETING_1116.src)),
          h("li", {}, h("a", { href: "#/meetings?at=m-1112" }, "November 12: the Waterbury-Duxbury forum"), ". Waterbury and Duxbury members argued for closing two valley schools rather than one, and for later moving Brookside to Crossett Brook. ", cite(MEETING_1112.src))
        )
      ),

      section(
        { id: "next", title: "What happens next" },
        h("h3", {}, "Asked for on November 4"),
        h("ul", { class: "prose" }, ASKED_1104.map((a) => h("li", {}, h("strong", {}, `${a.who}: `), a.what, a.answered ? [" ", h("em", {}, a.answered), " ", cite(ref("deck1118", "slide 8"))] : null))),
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
