// Board vote simulator: set each member's vote and see the weighted totals, and whether a motion passes
// under the two readings in js/model/vote.js. A calculator, not a prediction: every vote starts blank.
// Link keys: m=majority (other motions; closure is the default), v=<one letter per seat> (see encodeVotes).

import { h, num, listJoin } from "../ui/dom.js";
import { cite, cites, note, pageHead, section, status, tag, unsure } from "../ui/kit.js";
import { track } from "../ui/track.js";
import { BOARD } from "../../data/schools.js";
import { CLOSURE_PROCESS } from "../../data/timeline.js";
import { ref } from "../../data/sources.js";
import { SEATS, RULES, TOTAL, VOTES, boardNeed, decodeVotes, encodeVotes, extremes, outcome, tally } from "../model/vote.js";

const pts = (n) => num(n / 100, 2);
const share = (a, b) => (b ? `${num((a / b) * 100, 1)}%` : "—");
const LABEL = { yes: "Yes", no: "No", absent: "Absent" };

const MOTIONS = {
  closure: {
    name: "Closing a school",
    sub: "Needs two-thirds of the board's weighted vote.",
    need: "two-thirds",
    needShort: "⅔",
  },
  majority: {
    name: "Other motions, such as choosing Path B",
    sub: "Needs more than half of the weighted vote. A tie fails.",
    need: "more than half",
    needShort: "½",
  },
};

// "Waterbury's 4 members", "both of Warren's", "1 of Moretown's 2"
function describe(seats) {
  const by = {};
  for (const s of seats) by[s.town] = (by[s.town] ?? 0) + 1;
  return listJoin(
    Object.entries(by).map(([town, n]) => {
      const of = SEATS.filter((s) => s.town === town).length;
      return n === of ? (of === 2 ? `both of ${town}'s members` : `all ${of} of ${town}'s members`) : `${n} of ${town}'s ${of}`;
    })
  );
}

function verdict(state) {
  if (state === "pass") return status(true, "Passes", "");
  if (state === "fail") return status(false, "", "Fails");
  return unsure("Not decided yet");
}

export default {
  title: "Board vote simulator",
  render(el, { params, setParams }) {
    let motion = params.get("m") === "majority" ? "majority" : "closure";
    const votes = decodeVotes(params.get("v"));

    const save = () => setParams({ m: motion === "majority" ? "majority" : null, v: encodeVotes(votes) || null });
    const resultNow = () => {
      const t = tally(votes);
      const o = outcome(t, RULES[motion]);
      return { yes_points: t.yes / 100, no_points: t.no / 100, result_board: o.board, result_cast: o.cast };
    };

    // ---- 1. the motion ----
    const motionPick = h(
      "fieldset",
      { class: "group vt-motion" },
      h("legend", {}, "What is the vote on?"),
      h(
        "div",
        { class: "choice choice--stack" },
        Object.entries(MOTIONS).map(([id, m]) =>
          h(
            "label",
            {},
            h("input", {
              type: "radio",
              name: "vt-motion",
              value: id,
              checked: motion === id,
              onchange: () => {
                motion = id;
                save();
                track("Vote Motion Chosen", { motion: id });
                draw();
              },
            }),
            h("span", {}, h("strong", {}, m.name), h("br"), h("span", { class: "small muted" }, m.sub))
          )
        )
      )
    );

    // ---- 2. the members ----
    const buttons = {};
    const rows = SEATS.map((s) => {
      buttons[s.id] = {};
      const who = `${s.name}, ${s.town}`;
      return h(
        "li",
        { class: "vt-row", dataset: { seat: s.id } },
        h("span", { class: "vt-who" }, h("strong", {}, s.name), h("span", { class: "vt-town" }, s.town)),
        h("span", { class: "vt-weight" }, `${pts(s.weight)}%`, h("span", { class: "wonk-sr" }, " of the vote")),
        h(
          "span",
          { class: "vt-btns", role: "group", "aria-label": `Vote for ${who}` },
          VOTES.map((v) => {
            const b = h(
              "button",
              {
                type: "button",
                class: `vt-btn vt-btn--${v}`,
                "aria-pressed": "false",
                onclick: () => {
                  const next = votes[s.id] === v ? "unset" : v;
                  if (next === "unset") delete votes[s.id];
                  else votes[s.id] = v;
                  save();
                  draw();
                  track("Board Vote Set", { seat: s.id, town: s.town.toLowerCase(), vote: next, motion, ...resultNow() });
                },
              },
              LABEL[v]
            );
            buttons[s.id][v] = b;
            return b;
          })
        )
      );
    });

    const setAll = (v) => {
      for (const s of SEATS) {
        if (v === "unset") delete votes[s.id];
        else votes[s.id] = v;
      }
      save();
      draw();
      track("All Votes Set", { vote: v, motion });
    };

    const quick = h(
      "div",
      { class: "btn-row vt-quick" },
      h("button", { type: "button", class: "wonk-btn", onclick: () => setAll("yes") }, "Everyone yes"),
      h("button", { type: "button", class: "wonk-btn", onclick: () => setAll("no") }, "Everyone no"),
      h("button", { type: "button", class: "wonk-btn", onclick: () => setAll("unset") }, "Clear all votes")
    );

    // ---- the result ----
    const result = h("div", { class: "wonk-card vt-result" });
    const live = h("p", { class: "wonk-sr", "aria-live": "polite" });
    const bar = h("div", { class: "vt-sticky", "aria-hidden": "true" });

    function meter(t, rule) {
      const seg = (cls, n) => (n ? h("span", { class: `vt-seg vt-seg--${cls}`, style: { width: `${(n / TOTAL) * 100}%` } }) : null);
      return h(
        "div",
        { class: "vt-meter", "aria-hidden": "true" },
        seg("yes", t.yes),
        seg("no", t.no),
        seg("absent", t.absent),
        seg("unset", t.unset),
        h("span", { class: "vt-mark", style: { left: `${(rule.num / rule.den) * 100}%` } })
      );
    }

    function draw() {
      const rule = RULES[motion];
      const m = MOTIONS[motion];
      const t = tally(votes);
      const o = outcome(t, rule);
      const cast = t.yes + t.no;
      const notSet = t.count.unset;

      for (const s of SEATS) {
        for (const v of VOTES) buttons[s.id][v].setAttribute("aria-pressed", String(votes[s.id] === v));
      }

      // closures: the Articles' wording ("two-thirds of the Board") first; other motions: votes cast first
      const boardLine = h(
        "div",
        { class: "vt-reading" },
        h("h4", {}, "Counting the whole board (all 100 points)"),
        h("p", { class: "vt-verdict" }, verdict(o.board)),
        h(
          "p",
          { class: "small" },
          `Yes has ${pts(t.yes)} points. It needs ${motion === "closure" ? `at least ${pts(boardNeed(rule))}` : "more than 50.00"}. `,
          motion === "closure" ? "A member who is absent or abstains counts the same as a No. " : "",
          o.board === "open" ? `It depends on the ${notSet === 1 ? "member" : `${notSet} members`} not set (${pts(t.unset)} points).` : ""
        )
      );
      const castLine = h(
        "div",
        { class: "vt-reading" },
        h("h4", {}, "Counting only members who vote Yes or No"),
        h("p", { class: "vt-verdict" }, verdict(o.cast)),
        h(
          "p",
          { class: "small" },
          cast ? `Yes is ${share(t.yes, cast)} of the ${pts(cast)} points cast. ` : "No votes cast yet. ",
          `It needs ${m.need}${motion === "closure" ? " (66.7%)" : ""}. `,
          o.cast === "open" ? `It depends on the ${notSet === 1 ? "member" : `${notSet} members`} not set.` : ""
        )
      );
      const [first, second] = motion === "closure" ? [boardLine, castLine] : [castLine, boardLine];
      const main = motion === "closure" ? o.board : o.cast;

      const count = (k) => `${t.count[k]} ${t.count[k] === 1 ? "member" : "members"}`;
      result.replaceChildren(
        h("h3", { class: "vt-result-title" }, `${m.name}: needs ${m.need}`),
        h(
          "dl",
          { class: "vt-totals" },
          h("div", { class: "vt-total vt-total--yes" }, h("dt", {}, "Yes"), h("dd", {}, h("span", { class: "wonk-num" }, `${pts(t.yes)}%`), h("small", {}, count("yes")))),
          h("div", { class: "vt-total vt-total--no" }, h("dt", {}, "No"), h("dd", {}, h("span", { class: "wonk-num" }, `${pts(t.no)}%`), h("small", {}, count("no")))),
          h("div", { class: "vt-total" }, h("dt", {}, "Absent or abstain"), h("dd", {}, h("span", { class: "wonk-num" }, `${pts(t.absent)}%`), h("small", {}, count("absent")))),
          h("div", { class: "vt-total" }, h("dt", {}, "Not set"), h("dd", {}, h("span", { class: "wonk-num" }, `${pts(t.unset)}%`), h("small", {}, count("unset"))))
        ),
        meter(t, rule),
        h("p", { class: "vt-meter-key small muted" }, `The line marks ${m.need} of the whole board.`),
        first,
        second,
        h("p", { class: "vt-src small muted" }, tag("derived"), " Weights ", cite(BOARD.src), motion === "majority" ? " · the majority rule is our assumption" : null)
      );

      bar.replaceChildren(
        h("span", { class: "vt-sticky-num vt-sticky-num--yes" }, `Yes ${pts(t.yes)}%`),
        h("span", { class: "vt-sticky-num vt-sticky-num--no" }, `No ${pts(t.no)}%`),
        h("span", { class: "vt-sticky-out" }, main === "pass" ? "✓ Passes" : main === "fail" ? "✕ Fails" : "? Not decided", h("span", { class: "vt-sticky-need" }, ` (needs ${m.needShort})`)),
        meter(t, rule)
      );

      live.textContent = `Yes ${pts(t.yes)} percent, No ${pts(t.no)} percent. ${main === "pass" ? "Passes" : main === "fail" ? "Fails" : "Not decided yet"}.`;
    }

    // ---- what the weights mean ----
    const seatsByTown = BOARD.seats.slice().sort((a, b) => b.weight - a.weight);
    const weightTable = h(
      "div",
      { class: "table-scroll" },
      h(
        "table",
        { class: "wonk-table vt-weights" },
        h("caption", {}, "Board seats and vote weights by town"),
        h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Town"), h("th", { scope: "col", class: "num" }, "Members"), h("th", { scope: "col", class: "num" }, "Each member's vote"), h("th", { scope: "col", class: "num" }, "Town's total"))),
        h(
          "tbody",
          {},
          seatsByTown.map((s) => h("tr", {}, h("th", { scope: "row" }, s.town), h("td", { class: "num" }, s.members), h("td", { class: "num" }, `${num(s.weight, 2)}%`), h("td", { class: "num" }, `${num(s.members * s.weight, 2)}%`)))
        ),
        h(
          "tfoot",
          {},
          h("tr", {}, h("th", { scope: "row" }, "Board"), h("td", { class: "num" }, BOARD.seats.reduce((a, s) => a + s.members, 0)), h("td", {}), h("td", { class: "num" }, `${num(BOARD.seats.reduce((a, s) => a + s.members * s.weight, 0), 2)}%`))
        )
      )
    );

    const takes = (id) => {
      const rule = RULES[id];
      const e = extremes(rule);
      const m = MOTIONS[id];
      return h(
        "div",
        { class: "vt-takes" },
        h("h3", {}, `${m.name} (${m.need}, whole board)`),
        h(
          "ul",
          {},
          h("li", {}, h("strong", {}, `As few as ${e.pass.seats.length} members`), ` can pass it, if they are ${describe(e.pass.seats)} (${pts(e.pass.points)} points).`),
          h("li", {}, h("strong", {}, `As many as ${e.short.seats.length} members`), ` can vote Yes and still fall short, if they are ${describe(e.short.seats)} (${pts(e.short.points)} points).`),
          h("li", {}, h("strong", {}, `As few as ${e.block.seats.length} members`), ` voting No or absent can stop it, if they are ${describe(e.block.seats)} (${pts(e.block.points)} points).`)
        )
      );
    };

    el.append(
      pageHead({
        kicker: "Board vote simulator",
        title: "How a weighted board vote adds up",
        lede: "The board has 14 members, and each member's vote counts for a share of 100 points set by their town's population. Pick a vote for each member to see the totals and whether a motion would pass.",
      }),
      note("info", h("p", {}, h("strong", {}, "A calculator, not a prediction. "), "Every vote starts blank. The site does not guess how any member will vote, and a vote you set here says nothing about how anyone should vote. Your choices stay in the page address, so you can share the link.")),

      section({ id: "motion", title: "1. Choose the motion" }, motionPick),

      section(
        { id: "votes", title: "2. Set each member's vote", intro: "Tap Yes, No, or Absent. Tap a chosen vote again to clear it." },
        quick,
        h(
          "div",
          { class: "vt-layout" },
          h(
            "div",
            { class: "vt-list-wrap" },
            h("div", { class: "vt-head", "aria-hidden": "true" }, h("span", {}, "Member and town"), h("span", {}, "Vote weight"), h("span", {}, "Vote")),
            h("ul", { class: "vt-list", "aria-label": "Board members" }, rows),
            h("p", { class: "small muted vt-names" }, "Members by town as listed in the board's October 14 minutes ", cite(BOARD.namesSrc), "; weights approved by the board on October 27, 2021 ", cite(BOARD.src), ".")
          ),
          h("div", { class: "vt-side" }, result)
        ),
        bar,
        live
      ),

      section(
        { id: "weights", title: "Where the weights come from" },
        h(
          "div",
          { class: "prose" },
          h("p", {}, "The Articles of Agreement give each of the six towns at least one board member, add members by population, and weight each member's vote so towns count in proportion to their size. The weights are recalculated after each census. The board approved the current weights on October 27, 2021, after the 2020 census. ", cites([BOARD.seatsSrc, BOARD.src]))
        ),
        weightTable
      ),

      section(
        { id: "takes", title: "What it takes to pass", intro: "Because the weights differ, the number of members it takes depends on which members vote which way. On the whole-board reading:" },
        h("div", { class: "vt-takes-grid" }, takes("closure"), takes("majority")),
        h("p", { class: "small" }, tag("derived"), " Our arithmetic on the board's weights. The district's own presentation on the Articles cautions against turning \"two-thirds\" into a number of members or points without confirming the voting rules with counsel. ", cite(ref("aoaDeck", "Board vote weights")))
      ),

      section(
        { id: "rules", title: "The rules behind each vote" },
        h(
          "div",
          { class: "prose" },
          h("h3", {}, "Closing a school"),
          h("p", {}, "Under the Articles of Agreement, closing a school takes these steps, in order: ", cite(CLOSURE_PROCESS.src)),
          h("ol", {}, CLOSURE_PROCESS.steps.map((s) => h("li", {}, s))),
          h("p", {}, "So a vote to close a school comes after the hearings. The Articles do not say whether two-thirds counts the whole board or only members who vote. At the October 28 meeting the superintendent described it as a two-thirds weighted vote of the board. The district's Articles presentation says to confirm how absences, abstentions, and vacancies count with counsel and the clerk. ", cites([ref("meeting1028", "Articles of Agreement review"), ref("aoaDeck", "Article 6(E) hearings, notice and two-thirds Board vote")])),
          h("h3", {}, "Other motions"),
          h("p", {}, tag("estimate"), " The Articles do not say what other board motions need. The superintendent said changing grade configuration, such as moving Crossett Brook's 7th and 8th graders to Harwood, is board authority under Article 12. This page assumes those motions need more than half of the weighted vote, and that a tie fails. The board's own rules may differ. ", cite(ref("meeting1028", "Articles of Agreement review")))
        )
      )
    );

    draw();
  },
};
