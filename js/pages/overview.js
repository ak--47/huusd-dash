import { h, moneyShort, num, dateLong } from "../ui/dom.js";
import { cite, cites, fold, pageHead, section, tag, term, unsure } from "../ui/kit.js";
import { childForm } from "../ui/child-form.js";
import { BUDGET, PATH_A_CUTS, PATH_B_SAVINGS } from "../../data/budget.js";
import { PREK_2026 } from "../../data/enrollment.js";
import { TIMELINE } from "../../data/timeline.js";
import { MEETING } from "../../data/meeting.js";
import { OPTIONS, PATH_B_PLANS, PLAN_A, evaluate, studentsAtLeast, withRoadmap } from "../model/index.js";
import { ref } from "../../data/sources.js";

const range = (vals, f = num) => {
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return lo === hi ? f(lo) : `${f(lo)} to ${f(hi)}`;
};

const cutAmount = (id) => moneyShort(PATH_A_CUTS.items.find((c) => c.id === id).amount);

// The district's savings assume valley 5th and 6th graders move to Crossett Brook (October 28 meeting).
const fiveSixCite = () => cite(ref("meeting1028", "keeping grades 5-6 in the valley"));

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
        title: "The school board has agreed to keep working on Path B. It has not decided which two valley schools would close.",
        lede: [
          `District leaders say next year's budget needs about ${moneyShort(BUDGET.requiredCut)} in savings to stay under Vermont's `,
          term("threshold", "excess spending threshold"),
          ", a state limit on education spending per pupil; going over raises local property taxes. Path A keeps all 7 buildings and cuts programs. Path B closes 2 of the 4 valley elementary schools and moves Crossett Brook's 7th and 8th graders to Harwood. On November 4 the board is set to decide which buildings to consider and whether to start the public hearings required to close a school.",
        ],
      }),

      h(
        "section",
        { class: "wonk-card status-card", "aria-labelledby": "status-title" },
        h("h2", { id: "status-title" }, "Where things stand"),
        h(
          "ul",
          { class: "status-list" },
          h("li", {}, h("strong", {}, "October 28: "), "in a straw poll at the end of the meeting, not a formal vote, the board agreed to keep developing Path B: closing two of the four valley elementary schools and moving Crossett Brook's 7th and 8th graders to Harwood. ", cite(ref("meeting1028", "straw poll"))),
          h(
            "li",
            {},
            h("strong", {}, "Asked for next time: "),
            "a board member asked to see a version of Path B that keeps valley 5th and 6th graders in temporary classrooms in the valley, alongside the version that sends them to Crossett Brook, and the administration said it would bring it. ",
            cite(ref("meeting1028", "board discussion"))
          ),
          h("li", {}, h("strong", {}, "Next: "), "a public meeting on the buildings on November 2; board members' scores of the six possible pairs of valley schools to keep open, due November 3, shown publicly with names; and the board meeting on November 4, where the decision is which buildings to consider and whether to start the three public hearings required before closing a school. ", cite(ref("meeting1028", "homework timeline")), " ", cite(ref("aoa", "Article 6(E)"))),
          h("li", {}, h("strong", {}, "Not decided: "), "which two schools, where grades 5 and 6 go, and the later phases of the district's draft roadmap, including a new valley building in 2029. ", cite(ref("oct14", "Draft Proposal for School Reconfiguration & Consolidation Roadmap"))),
          h("li", {}, h("strong", {}, "What we checked: "), "several items in the district's numbers that could change which options work, including the wastewater limits and the size of the cut. ", h("a", { href: "#/findings" }, "See them, and questions to ask the board"))
        ),
        h("div", { class: "btn-row" }, h("a", { class: "wonk-btn", href: "#/options" }, "See options beyond A and B"))
      ),

      section(
        { id: "child", title: "Your child's path", intro: "Pick your town and your child's grade this year to see every school they would attend under each path." },
        h("div", { class: "wonk-card quick-child" }, childForm({ compact: true, onSubmit: (child) => go("your-child", { c: child }) }))
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
            sub: "Which two of Fayston, Moretown, Waitsfield, and Warren would close is not decided. The board agreed in a straw poll on October 28 to keep developing this path.",
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
        { id: "beyond", title: "Beyond A and B", intro: "Path A and Path B are two combinations of a few building blocks. Other combinations of the same blocks, scored the same way:" },
        h(
          "div",
          { class: "beyond-grid" },
          OPTIONS.filter((o) => ["B-FW-K6", "B-MW-K6", "MS+cuts", "MS+close-FES"].includes(o.id)).map((o) => {
            const r = evaluate(o.plan);
            const { savings, gap, upperBound, oneTime } = r.budget;
            const valleyMax = Math.max(r.maxYoung.moretown, r.maxYoung.waitsfield, r.maxYoung.fayston, r.maxYoung.warren);
            const wdMax = Math.max(r.maxYoung.waterbury, r.maxYoung.duxbury);
            return h(
              "article",
              { class: "wonk-card beyond-card" },
              h("h3", {}, o.id === "MS+close-FES" ? "Merge the middle schools and close one valley school (Fayston, as an example)" : o.name),
              // the option's first sentence says which schools stay open, e.g. "Fayston and Warren stay open as K-6 schools."
              h("p", { class: "small muted" }, `${o.what.split(". ")[0].replace(/\.$/, "")}.`),
              h(
                "p",
                { class: "beyond-facts" },
                `Saves ${upperBound ? "up to " : ""}${moneyShort(savings)} a year `,
                r.budget.hasEstimate ? tag("estimate") : null,
                h("br"),
                upperBound && gap <= 0
                  ? [unsure("May fall short of the target"), ` (${moneyShort(-gap)} to spare only if the district's full figure holds)`]
                  : gap <= 0
                    ? `Meets the target with ${moneyShort(-gap)} to spare`
                    : `${moneyShort(gap)}${upperBound ? " or more" : ""} short of the target`,
                oneTime.portables
                  ? [h("br"), `Plus about ${moneyShort(oneTime.portables.low)} to ${moneyShort(oneTime.portables.high)} for portable classrooms over about two years (the district's preliminary quote), not counted above`]
                  : null,
                h("br"),
                `Highest number of K-12 schools for a child now in Pre-K to grade 2: ${valleyMax} in the valley, ${wdMax} in Waterbury and Duxbury (today: 3)`
              ),
              // the wastewater condition each "grades 5-6 stay in the valley" variant depends on
              o.group === "b-variant" ? h("p", { class: "small muted" }, o.notes[0]) : null
            );
          })
        ),
        h(
          "p",
          { class: "small muted" },
          "“Up to,” “or more,” and “May fall short”: the district's savings figures assume valley 5th and 6th graders move to Crossett Brook. On October 28 an administrator said keeping them in the valley would save less, with “an impact in terms of a penalty.” ",
          fiveSixCite(),
          " For closing one school we use half the district's figure for closing two; the board's question-and-answer document says closing one “does not look like it would save enough money to make it worthwhile.” ",
          cite(ref("qdoc", "closing one school"))
        ),
        h("div", { class: "btn-row" }, h("a", { class: "wonk-btn", href: "#/options" }, "Compare all the options"), h("a", { class: "wonk-btn wonk-btn--quiet", href: "#/build" }, "Build your own"))
      ),

      section(
        {
          id: "missing",
          title: "What we found when we checked the district's numbers",
          intro: "Most of the district's arithmetic checks out, including the Path A cuts, the Path B savings, the October 1 enrollment report, and ten of the twelve capacity tables. These are the items that do not add up, or that are missing:",
        },
        h(
          "ul",
          { class: "prose findings-teaser" },
          h(
            "li",
            {},
            h("strong", {}, "How many schools a child attends. "),
            "Path B adds one or two schools for many children. For every Waterbury and Duxbury child now in grade 7 or below, the added school is Harwood Union Middle School, in the high school's building, so they still attend 3 buildings. Valley children whose school closes attend one or two more. In the versions that send grades 5-6 to Crossett Brook, valley children whose school stays open follow the same path as Brookside children: their elementary school, then Crossett Brook, then Harwood. The district's draft roadmap adds another move for valley children in fall 2029."
          ),
          h(
            "li",
            {},
            h("strong", {}, "The wastewater limits do not match the state permits. "),
            "Waitsfield's 1991 permit says 300 students, but its design counted students and staff and a 1996 letter in the state file says 230; the slides use 230. Fayston's and Warren's permits count students and staff; the slides count students only. Under the permits as written, a different set of pairings fits. ",
            cites([
              ref("permitWES", "PDF p. 12, condition 1.2"),
              ref("permitWES1996", "engineer's letter of July 18, 1996, PDF pp. 9-10"),
              ref("permitFES", "PDF p. 8"),
              ref("permitWRN", "PDF p. 341 of 346"),
            ])
          ),
          h(
            "li",
            {},
            h("strong", {}, "Every Path B version is over the consultant's classroom capacity somewhere. "),
            "Measured against the classroom capacities the district's planning consultant counted in March 2025, each version puts more students in at least one receiving school than its current classrooms hold. The consultant did not study Path B, and any added space is not in the savings. ",
            cite(ref("truexCap", "Capacities"))
          ),
          h(
            "li",
            {},
            h("strong", {}, "The size of the cut depends on how bond payments are counted. "),
            "State law leaves payments on bonds voters approved before July 1, 2026 out of the excess spending test. The district's slides indicate its $3.34M target counts them; a note on the slide says an earlier figure was \"corrected to remove the debt exclusion,\" without saying why. If the exclusion applies, the cut needed is about $500,000 smaller. ",
            cite(ref("vsa4001", "§ 4001(6)(B)"), "State law"),
            " ",
            cite(ref("deck", "slide 10"))
          ),
          h(
            "li",
            {},
            h("strong", {}, "The Fayston + Warren tables do not add up, and bus times are missing. "),
            "Both Fayston + Warren tables print a Brookside total of 513, which the slides use to rule the pairing out; the grade rows add to 439 students, under Brookside's occupancy of 480 if staff are not counted. Building occupancy usually counts staff, and with staff Brookside would still be over. Ride times, which the board asked for on October 14, were not presented; an administrator said routes would be modeled with the bus contractor once the board narrows the options. ",
            cite(ref("deck", "slides 29 and 32")),
            " ",
            cite(ref("meeting1028", "transportation"))
          ),
          h(
            "li",
            {},
            h("strong", {}, "Path A's details are missing too. "),
            "The deck does not say which bus routes would end. The superintendent said private Pre-K programs lack room for the children now in district Pre-K classes, and the finance director said Path A would mean more cuts each year as the threshold keeps stepping down. ",
            cite(ref("deck", "slide 13")),
            " ",
            cite(ref("meeting1028", "Path A"))
          )
        ),
        h(
          "div",
          { class: "btn-row" },
          h("a", { class: "wonk-btn", href: "#/findings" }, "See everything we checked"),
          h("a", { class: "wonk-btn", href: "#/findings?at=questions" }, "Questions to ask the board"),
          h("a", { class: "wonk-btn wonk-btn--quiet", href: "#/build" }, "Build your own plan")
        )
      ),

      section(
        { id: "meeting", title: "From the October 28 meeting", intro: "What was said, beyond the slides. Quotes come from a transcript of the public recording; it has no speaker labels, so we name people only where the recording makes it clear." },
        h(
          "div",
          { class: "meeting" },
          MEETING.groups.map((g) =>
            fold(
              g.title,
              h(
                "ul",
                { class: "quotes" },
                g.items.map((q) => h("li", {}, h("blockquote", {}, `“${q.text}”`), h("p", { class: "who" }, q.who)))
              )
            )
          ),
          h("p", { class: "small" }, h("strong", {}, "Public comment. "), MEETING.publicComment, " ", cite(MEETING.src))
        )
      ),

      section(
        { id: "next", title: "What happens next" },
        h(
          "ol",
          { class: "timeline" },
          TIMELINE.filter((t) => t.key || ["2026-10-28", "2026-11-02", "2027-01", "2027-01-13", "2027-08"].includes(t.date)).map((t) =>
            h(
              "li",
              { class: [t.key ? "is-key" : "", t.date < "2026-10-29" ? "is-past" : ""].join(" ") },
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
