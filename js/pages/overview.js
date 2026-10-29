import { h, moneyShort, num, dateLong } from "../ui/dom.js";
import { cite, fold, pageHead, section, tag, term } from "../ui/kit.js";
import { childForm } from "../ui/child-form.js";
import { BUDGET, PATH_A_CUTS, PATH_B_SAVINGS } from "../../data/budget.js";
import { TIMELINE } from "../../data/timeline.js";
import { MEETING } from "../../data/meeting.js";
import { OPTIONS, PATH_B_PLANS, PLAN_A, evaluate, studentsAtLeast, withRoadmap } from "../model/index.js";
import { ref } from "../../data/sources.js";

const range = (vals, f = num) => {
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return lo === hi ? f(lo) : `${f(lo)} to ${f(hi)}`;
};

export default {
  title: "Start here",
  render(el, { go }) {
    const a = evaluate(PLAN_A);
    const bs = PATH_B_PLANS.map((p) => evaluate(p));
    const bMoved = bs.map((r) => r.moved.k12);
    const bMax = bs.map((r) => r.maxYoung.all);
    const bFive = bs.map((r) => r.fivePlus.total);
    const roads = PATH_B_PLANS.map((p) => evaluate(withRoadmap(p)));
    const roadMax = roads.map((r) => r.maxYoung.all);
    const roadSix = roads.map((r) => studentsAtLeastSix(r));
    const surplus = PATH_B_SAVINGS.total - BUDGET.requiredCut;

    el.append(
      pageHead({
        kicker: "HUUSD · FY28 budget decision",
        title: "The school board has agreed to keep working on Path B. Which two valley schools would close is still open.",
        lede: `District leaders say next year's budget has to stay flat to avoid a state tax penalty, which means finding about ${moneyShort(BUDGET.requiredCut)} in savings. This site shows what Path B, Path A, and other combinations mean for the budget, for each school, and for how many schools your child would attend.`,
      }),

      h(
        "section",
        { class: "wonk-card status-card", "aria-labelledby": "status-title" },
        h("h2", { id: "status-title" }, "Where things stand"),
        h(
          "ul",
          { class: "status-list" },
          h("li", {}, h("strong", {}, "October 28: "), "in a straw poll at the end of the meeting, not a formal vote, the board agreed to keep developing Path B: closing two of the four valley elementary schools and moving Crossett Brook's 7th and 8th graders to Harwood. ", cite(ref("meeting1028", "straw poll"))),
          h("li", {}, h("strong", {}, "Asked for next time: "), "a version of Path B that keeps valley 5th and 6th graders in temporary classrooms in the valley, alongside the version that sends them to Crossett Brook. ", cite(ref("meeting1028", "board discussion"))),
          h("li", {}, h("strong", {}, "Next: "), "a public meeting on the buildings on November 2; board members' scores of the six pairings due November 3, shown publicly with names; and the board meeting on November 4, where the decision is which buildings to consider and whether to start the three public hearings required before closing a school. ", cite(ref("meeting1028", "homework timeline")), " ", cite(ref("aoa", "Article 6(E)"))),
          h("li", {}, h("strong", {}, "Not decided: "), "which two schools, where grades 5 and 6 go, and the later phases of the district's draft roadmap, including a new valley building in 2029. ", cite(ref("oct14", "Draft Proposal for School Reconfiguration & Consolidation Roadmap")))
        ),
        h("div", { class: "btn-row" }, h("a", { class: "wonk-btn wonk-btn--primary", href: "#/your-child" }, "See your child's path"), h("a", { class: "wonk-btn", href: "#/options" }, "See options beyond A and B"))
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
              ["What is cut", `Bus routes (${moneyShort(1360000)}), district Pre-K classes (${moneyShort(517000)}), 70% of athletics and clubs, special programs, support staff, electives`],
              ["School buildings", "7, no change"],
              ["Students changing schools next fall", h("span", {}, `None in K-12. ${num(a.moved.preK)} Pre-K students would move to private programs `, tag("derived"))],
              ["Most schools for a child in Pre-K to grade 2 today", h("span", {}, `${a.maxYoung.all}, as today `, tag("derived"))],
            ],
            actions: [h("a", { class: "wonk-btn", href: "#/budget" }, "See the cuts")],
          }),
          pathCard({
            letter: "B",
            title: "Close 2 valley elementary schools, merge the middle schools",
            sub: "Which two of Fayston, Moretown, Waitsfield, and Warren would close is not decided. The board agreed in a straw poll on October 28 to keep developing this path.",
            facts: [
              ["Saves", h("span", {}, `${moneyShort(PATH_B_SAVINGS.total)} a year, ${moneyShort(surplus)} more than the target `, tag("district"), " ", cite(ref("deck", "slide 19")))],
              ["What changes", `Two valley schools close. Crossett Brook's 7th and 8th graders move to Harwood. ${num(PATH_B_SAVINGS.fteTotal, 1)} fewer staff positions.`],
              ["School buildings", "5 in use"],
              ["Students changing schools next fall", h("span", {}, `${range(bMoved)} in K-12, depending on which schools stay open `, tag("derived"))],
              ["Most schools for a child in Pre-K to grade 2 today", h("span", {}, `${range(bMax)}, depending on the pairing and where grades 5 and 6 go `, tag("derived"))],
              ["If the draft roadmap follows", h("span", {}, `The two valley schools move into one new building in fall 2029. Most schools: ${range(roadMax)}; ${range(roadSix)} of this year's students would attend 6 `, tag("derived"), " ", cite(ref("oct14", "Draft Proposal for School Reconfiguration & Consolidation Roadmap"), "Oct 14 deck"))],
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
            h("li", {}, "Students changing schools next fall: this year's students who would start fall 2027 in a different school than they would with no change, not counting normal moves like 6th graders going on to Harwood."),
            h("li", {}, "Most schools: the number of different schools a child attends from kindergarten through grade 12, for children in Pre-K to grade 2 this year. Today every child attends 3. Pre-K is not counted here; you can add it on the ", h("a", { href: "#/your-child" }, "Your child's path"), " page."),
            h("li", {}, `Path B ranges cover all twelve versions in the district's tables: six pairs of schools, each with grades 5 and 6 staying in the valley or moving to Crossett Brook. In the Pre-K to 4 versions, ${range(bFive)} of this year's students would attend five or more schools.`)
          ),
          h("p", {}, "Every number links to its source. ", h("a", { href: "#/sources" }, "Read the method."))
        )
      ),

      section(
        { id: "beyond", title: "Beyond A and B", intro: "Path A and Path B are two combinations of a few building blocks. Other combinations of the same blocks, scored the same way:" },
        h(
          "div",
          { class: "beyond-grid" },
          OPTIONS.filter((o) => ["B-FW-K6", "B-MW-K6", "MS-only", "MS+close-FES"].includes(o.id)).map((o) => {
            const r = evaluate(o.plan);
            const valleyMax = Math.max(r.maxYoung.moretown, r.maxYoung.waitsfield, r.maxYoung.fayston, r.maxYoung.warren);
            return h(
              "article",
              { class: "wonk-card beyond-card" },
              h("h3", {}, o.id === "MS+close-FES" ? "Merge the middle schools and close one valley school" : o.name),
              h(
                "p",
                { class: "beyond-facts" },
                r.budget.gap <= 0 ? `Meets the target with ${moneyShort(-r.budget.gap)} to spare` : `${moneyShort(r.budget.gap)} short of the target`,
                r.budget.hasEstimate ? [" ", tag("estimate")] : null,
                r.budget.oneTime.portables
                  ? [h("br"), `Plus about ${moneyShort(r.budget.oneTime.portables.low)} to ${moneyShort(r.budget.oneTime.portables.high)} for portable classrooms`]
                  : null,
                h("br"),
                `Most schools for a valley child now in Pre-K to grade 2: ${valleyMax}`
              )
            );
          })
        ),
        h("div", { class: "btn-row" }, h("a", { class: "wonk-btn", href: "#/options" }, "Compare all the options"), h("a", { class: "wonk-btn wonk-btn--quiet", href: "#/build" }, "Build your own"))
      ),

      section(
        { id: "child", title: "Your child's path", intro: "Pick your town and your child's grade this year to see every school they would attend under each path." },
        h("div", { class: "wonk-card quick-child" }, childForm({ compact: true, onSubmit: (child) => go("your-child", { c: child }) }))
      ),

      section(
        { id: "missing", title: "What the presentation does not show" },
        h(
          "ul",
          { class: "prose findings-teaser" },
          h("li", {}, h("strong", {}, "How many schools a child attends. "), "Path B adds one or two new schools for many children, including every Waterbury and Duxbury child now in grade 7 or below. The district's draft roadmap adds another move for valley children in fall 2029."),
          h("li", {}, h("strong", {}, "The wastewater limits do not match the state permits. "), "Waitsfield's 1991 permit allows 300 students; the slides use 230. Fayston's and Warren's permits count students and staff; the slides count students only. Read the permits' way, a different set of pairings fits. ", cite(ref("permitWES", "condition 1.2"), "Permit")),
          h("li", {}, h("strong", {}, "Every Path B version needs more classrooms. "), "By the district's own planning consultant, each version puts more students in some receiving school than it has classroom space for. That cost is not in the savings. ", cite(ref("truexCap", "Capacities"), "Consultant")),
          h("li", {}, h("strong", {}, "The size of the cut may not reflect a state rule. "), "By law, payments on older voter-approved bonds are left out of the threshold test. The district's $3.34M target counts them. If the exclusion applies, the cut needed is about $500,000 smaller. ", cite(ref("vsa4001", "§ 4001(6)(B)"), "State law")),
          h("li", {}, h("strong", {}, "One capacity table does not add up, and bus times are missing. "), "The slides rule out Fayston + Warren with a Brookside total of 513; its grade rows add to 439. Ride times, which the board asked for on October 14, were not presented. ", cite(ref("deck", "slides 29 and 32")))
        ),
        h("div", { class: "btn-row" }, h("a", { class: "wonk-btn", href: "#/findings" }, "See everything we checked"), h("a", { class: "wonk-btn wonk-btn--quiet", href: "#/build" }, "Build your own plan"))
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
          TIMELINE.filter((t) => t.key || ["2026-10-28", "2026-11-02", "2026-12", "2027-01-13", "2027-08"].includes(t.date)).map((t) =>
            h(
              "li",
              { class: [t.key ? "is-key" : "", t.date < "2026-10-29" ? "is-past" : ""].join(" ") },
              h("span", { class: "when" }, dateLong(t.date)),
              h("span", { class: "what" }, t.title),
              t.detail ? h("p", { class: "detail" }, t.detail, " ", cite(t.src)) : null
            )
          )
        ),
        h("p", { class: "small muted" }, "Closing a school is a separate, later vote. The district's Articles of Agreement require three public hearings, one in the affected town, ten days' notice, and a two-thirds vote of the board. ", cite(ref("aoa", "Article 6(E)")))
      )
    );
  },
};

function studentsAtLeastSix(r) {
  return studentsAtLeast(r.plan, 6).total;
}

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

export { term };
