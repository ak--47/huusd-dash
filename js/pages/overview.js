import { h, moneyShort, num, dateLong } from "../ui/dom.js";
import { cite, fold, pageHead, section, tag, term } from "../ui/kit.js";
import { childForm, childProps } from "../ui/child-form.js";
import { track } from "../ui/track.js";
import { BUDGET, PATH_A_CUTS, PATH_B_SAVINGS } from "../../data/budget.js";
import { PREK_2026 } from "../../data/enrollment.js";
import { TIMELINE } from "../../data/timeline.js";
import { PATH_B_PLANS, PLAN_A, evaluate, studentsAtLeast, withRoadmap } from "../model/index.js";
import { ref } from "../../data/sources.js";

const range = (vals, f = num) => {
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return lo === hi ? f(lo) : `${f(lo)} to ${f(hi)}`;
};

const cutAmount = (id) => moneyShort(PATH_A_CUTS.items.find((c) => c.id === id).amount);

// The district's savings assume valley 5th and 6th graders move to Crossett Brook (October 28 meeting).
const fiveSixCite = () => cite(ref("meeting1028", "keeping grades 5-6 in the valley"));

// tracks a Start here button that opens another page, e.g. opens("Options Opened")
const opens = (event) => () => track(event, { from: "start" });

export default {
  title: "Start here",
  render(el, { go }) {
    const a = evaluate(PLAN_A);
    const bs = PATH_B_PLANS.map((p) => evaluate(p));
    const bMoved = bs.map((r) => r.moved.k12);
    const bMax = bs.map((r) => r.maxYoung.all);
    // valleyTop 4: grades 5-6 go to Crossett Brook (the district's "Pre-K to 4" tables); 6: they stay in the valley
    const bFive = bs.filter((r) => r.plan.valleyTop === 4).map((r) => r.fivePlus.total);
    const bFiveK6 = bs.filter((r) => r.plan.valleyTop === 6).map((r) => r.fivePlus.total);
    const roadSix = PATH_B_PLANS.map((p) => studentsAtLeast(withRoadmap(p), 6).total);
    const surplus = PATH_B_SAVINGS.total - BUDGET.requiredCut;

    el.append(
      pageHead({
        kicker: "Independent guide · HUUSD FY28 budget decision",
        title: "Where things stand on next year's budget and the valley schools",
        lede: [
          `District leaders say next year's budget needs about ${moneyShort(BUDGET.requiredCut)} in savings to stay under Vermont's `,
          term("threshold", "excess spending threshold"),
          ", a state limit on education spending per pupil; going over raises local property taxes. The board has dropped Path A's program cuts and is working on Path B: close 2 of the 4 valley elementary schools and move Crossett Brook's 7th and 8th graders to Harwood. On November 18 it sent Moretown and Fayston to public hearings on closing, so Waitsfield and Warren are the valley schools proposed to stay open. Nothing is final until the hearings and the closure votes, each needing two-thirds of the board, set for January 6.",
        ],
      }),

      h(
        "section",
        { class: "wonk-card status-card", "aria-labelledby": "status-title" },
        h("h2", { id: "status-title" }, "The latest"),
        h(
          "ul",
          { class: "status-list" },
          h(
            "li",
            {},
            h("strong", {}, "November 18, the votes: "),
            "in roll calls, the board advanced Moretown (11 yes, 2 no) and Fayston (13 yes, unanimous) for possible closure. Advancing takes a majority of the weighted votes cast. No other school was proposed. ",
            cite(ref("meeting1118", "action items, 4:50-4:57")),
            " ",
            h("a", { href: "#/decision?at=nov18" }, "How each member voted")
          ),
          h(
            "li",
            {},
            h("strong", {}, "What it would mean: "),
            "Waitsfield and Warren stay open. The administration and every principal recommend Pre-K to 4 in the valley schools, grades 5-6 together at Crossett Brook, and grades 7-12 at Harwood; the board has not voted on grades. ",
            cite(ref("meeting1104", "principals' letter"))
          ),
          h(
            "li",
            {},
            h("strong", {}, "How it changed: "),
            "on November 4 the board's scores ranked Waitsfield + Warren first (248 to 241), but a straw poll chose Moretown + Warren, 9 to 4. On November 18, seven of those nine voted to send Moretown to hearings; several explained in the discussion why they had changed their view. ",
            cite(ref("deck1104", "slide 22")),
            " ",
            cite(ref("meeting1118", "third round, 3:53-4:37"))
          ),
          h(
            "li",
            {},
            h("strong", {}, "Also on November 18: "),
            "the administration's fall 2027 counts, matching each child to the nearest open school by home address, fit both finalist pairs in their classrooms (Waitsfield 180, Warren 117, Brookside 380). Moretown's kitchen was priced at $134,033. Asked about tax increases regardless of school closings, the finance director said she has heard figures higher than 10%; the state's December 1 letter will say more. The superintendent hopes to have bus routes from the bus company within about a month. ",
            cite(ref("deck1118", "slides 7-8")),
            " ",
            h("a", { href: "#/meetings?at=m-1118" }, "What was said")
          ),
          h(
            "li",
            {},
            h("strong", {}, "Next: "),
            "public hearings on Tuesday, December 1 in Moretown, Thursday, December 3 in Fayston, and Monday, December 14 at Brookside in Waterbury, each at 6 PM; on December 16, a vote to warn the closure votes; on January 6, a closure vote for each school, each needing two-thirds of the board's weighted vote. ",
            cite(ref("meeting1118", "hearing dates, 4:57-5:12"))
          ),
          h("li", {}, h("strong", {}, "Still open: "), "bus routes and ride times, especially for valley 5th and 6th graders; how long grades 5 and 6 stay at Crossett Brook once Brookside moves there; and the architects' study, whose scope the board must now set.")
        ),
        h(
          "div",
          { class: "btn-row" },
          h("a", { class: "wonk-btn wonk-btn--primary", href: "#/decision", onclick: opens("Decision Opened") }, "How the board voted"),
          h("a", { class: "wonk-btn", href: "#/options", onclick: opens("Options Opened") }, "See options beyond A and B"),
          h("a", { class: "wonk-btn", href: "#/vote", onclick: opens("Vote Simulator Opened") }, "Try the board vote simulator")
        )
      ),

      section(
        { id: "child", title: "Your child's path", intro: "Pick your town and your child's grade this year to see every school they would attend under each path." },
        h(
          "div",
          { class: "wonk-card quick-child" },
          childForm({
            compact: true,
            onSubmit: (child) => {
              track("Child Path Requested", { ...childProps(child), from: "start" });
              go("your-child", { c: child });
            },
          })
        )
      ),

      section(
        { id: "paths", title: "The district's two paths", intro: "As presented on October 14 and 28." },
        h(
          "div",
          { class: "paths" },
          pathCard({
            letter: "A",
            title: "Keep all 7 buildings, cut programs",
            sub: "Make the full cut from programs and services.",
            facts: [
              ["Saves", h("span", {}, `${moneyShort(PATH_A_CUTS.total)} a year, exactly the target `, tag("district"), " ", cite(ref("deck", "slide 13")))],
              [
                "What is cut",
                `Bus routes (${cutAmount("transport")}), district Pre-K classes (${cutAmount("prek")}), Farm to School, outdoor education, and learning center supports (${cutAmount("special")}), intervention teachers and aides (${cutAmount("staff")}), 70% of sports and activities like theater and clubs (${cutAmount("athletics")}), and some electives and technology (${cutAmount("electives")})`,
              ],
              ["The district's view", h("span", {}, "A \"devastating impact\": transportation and Pre-K barriers, and lost sports, arts, electives, and intervention support ", cite(ref("deck", "slide 13")))],
              ["School buildings", "7, no change"],
              [
                "Students changing schools next fall",
                h(
                  "span",
                  {},
                  `None in K-12. District Pre-K classes end (${num(PREK_2026.inDistrict)} children in them this year). ${num(a.moved.preK)} of this year's 3-year-olds would need another Pre-K program next fall, and the superintendent said private programs lack the room. `,
                  tag("derived"),
                  " ",
                  cite(ref("meeting1028", "Pre-K tuition model"))
                ),
              ],
              ["Highest number of K-12 schools for any child now in Pre-K to grade 2", h("span", {}, `${a.maxYoung.all}, as today `, tag("derived"))],
            ],
            actions: [h("a", { class: "wonk-btn", href: "#/budget?at=path-a" }, "See the cuts")],
          }),
          pathCard({
            letter: "B",
            title: "Close 2 valley elementary schools, merge the middle schools",
            sub: "The path the board is working on. On November 18 it sent Moretown and Fayston to closure hearings, keeping Waitsfield and Warren; the closure votes are set for January 6.",
            facts: [
              [
                "Saves",
                h(
                  "span",
                  {},
                  `${moneyShort(PATH_B_SAVINGS.total)} a year with valley 5th and 6th graders at Crossett Brook, ${moneyShort(surplus)} more than the target `,
                  tag("district"),
                  " ",
                  cite(ref("deck", "slide 19")),
                  h("br"),
                  h("span", { class: "small muted" }, "An administrator said keeping them in the valley would save less. ", fiveSixCite())
                ),
              ],
              ["What changes", `Two valley schools close. Crossett Brook's 7th and 8th graders move to Harwood. ${num(PATH_B_SAVINGS.fteTotal, 1)} fewer staff positions.`],
              [
                "The district's view",
                h("span", {}, "Larger groups of classmates, a full-time nurse and arts staff on site at each valley school that stays open, and more electives and activities in one middle school ", cite(ref("deck", "slides 14-18"))),
              ],
              ["School buildings", "5 in use"],
              ["Students changing schools next fall", h("span", {}, `${range(bMoved)} in K-12, depending on which schools stay open `, tag("derived"))],
              ["Highest number of K-12 schools for any child now in Pre-K to grade 2", h("span", {}, `${range(bMax)}, depending on the pairing and where grades 5 and 6 go `, tag("derived"))],
              [
                "If a new valley school follows (draft, not decided)",
                h(
                  "span",
                  {},
                  `The two valley schools would move into one new building in fall 2029. ${range(roadSix)} of this year's students would then attend 6 schools, depending on the pairing (if the new building teaches Pre-K to 4). `,
                  tag("derived"),
                  " ",
                  cite(ref("oct14", "Draft Proposal for School Reconfiguration & Consolidation Roadmap"), "Oct 14 deck")
                ),
              ],
            ],
            actions: [h("a", { class: "wonk-btn wonk-btn--primary", href: "#/compare" }, "Compare the six pairings")],
          })
        ),
        fold(
          "How these numbers are counted",
          h("p", {}, "Savings, cuts, and staff positions are the district's figures from its October 28 presentation. The rest is calculated on this site from the district's October 1 enrollment report:"),
          h(
            "ul",
            {},
            h(
              "li",
              {},
              "Students changing schools next fall: students in K-12 next fall (this year's 4-year-olds in Pre-K through grade 11) who would start fall 2027 in a different school than they would with no change, not counting normal moves like 6th graders going on to Harwood."
            ),
            h(
              "li",
              {},
              "Highest number of K-12 schools: the most different schools any child now in Pre-K to grade 2 would attend from kindergarten through grade 12. Today every child attends 3. Pre-K is not counted here; you can add it on the ",
              h("a", { href: "#/your-child" }, "Your child's path"),
              " page."
            ),
            h(
              "li",
              {},
              `Path B ranges cover all twelve versions in the district's tables: six pairs of schools, each with grades 5 and 6 staying in the valley or moving to Crossett Brook. In the versions that send grades 5 and 6 to Crossett Brook (the district's "Pre-K to 4" tables), ${range(bFive)} of this year's students would attend five or more schools; in the versions that keep them in the valley, ${range(bFiveK6)}.`
            )
          ),
          h("p", {}, "Every number links to its source. ", h("a", { href: "#/sources" }, "Read the method."))
        )
      ),

      section(
        { id: "meetings", title: "What was said at the meetings", intro: "Each public meeting and forum since October 28, with a short summary and quotes in people's own words." },
        h(
          "ul",
          { class: "prose" },
          h("li", {}, h("a", { href: "#/meetings?at=m-1118" }, "November 18"), ": board meeting, Moretown and Fayston sent to closure hearings"),
          h("li", {}, h("a", { href: "#/meetings?at=m-1116" }, "November 16"), ": Warren community forum"),
          h("li", {}, h("a", { href: "#/meetings?at=m-1112" }, "November 12"), ": Waterbury-Duxbury community forum"),
          h("li", {}, h("a", { href: "#/meetings?at=m-1104" }, "November 4"), ": board meeting, the scores and the straw poll"),
          h("li", {}, h("a", { href: "#/meetings?at=m-1102" }, "November 2"), ": committee meeting on the school buildings"),
          h("li", {}, h("a", { href: "#/meetings?at=m-1028" }, "October 28"), ": board meeting, budget presentation #2")
        ),
        h("p", {}, h("a", { class: "wonk-btn", href: "#/meetings" }, "Read what was said"))
      ),

      section(
        { id: "next", title: "What happens next" },
        h(
          "ol",
          { class: "timeline" },
          TIMELINE.filter((t) => t.key || ["2026-11-04", "2026-12-16", "2027-01-13", "2027-08"].includes(t.date) || t.title.includes("closure hearing")).map((t) =>
            h(
              "li",
              { class: [t.key ? "is-key" : "", t.date < "2026-11-19" ? "is-past" : ""].join(" ") },
              h("span", { class: "when" }, dateLong(t.date)),
              h("span", { class: "what" }, t.title),
              t.detail ? h("p", { class: "detail" }, t.detail, " ", cite(t.src)) : null
            )
          )
        ),
        h(
          "p",
          { class: "small muted" },
          "Closing a school is a separate, later vote. The district's Articles of Agreement require three public hearings (at least one in the town where the school is), ten days' public notice, and a two-thirds vote of the board. ",
          cite(ref("aoa", "Article 6(E)"))
        )
      )
    );
  },
};

function pathCard({ letter, title, sub, facts, actions }) {
  return h(
    "article",
    { class: "wonk-card path", "aria-labelledby": `path-${letter}` },
    h(
      "div",
      { class: "path-head" },
      h("span", { class: `letter letter--${letter.toLowerCase()}`, "aria-hidden": "true" }, letter),
      h("div", {}, h("h3", { id: `path-${letter}` }, h("span", { class: "wonk-sr" }, `Path ${letter}: `), title), h("p", { class: "small muted" }, sub))
    ),
    h("dl", { class: "facts" }, facts.map(([k, v]) => [h("dt", {}, k), h("dd", {}, v)])),
    h("div", { class: "btn-row" }, actions)
  );
}
