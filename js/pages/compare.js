// Compare the plans: Path A and all twelve Path B versions on the same measures, and the district's
// scoring sheet with the data behind it. Other combinations live on the Options page.

import { h, money, num } from "../ui/dom.js";
import { cite, cites, note, pageHead, section, tag, term } from "../ui/kit.js";
import { comparisonTable } from "../ui/compare-table.js";
import { scoreSection } from "../ui/compare-score.js";
import { MEASURES, setReading, versionList } from "../ui/compare-versions.js";
import { tableMismatches } from "../model/index.js";
import { BUDGET, PATH_B_SAVINGS } from "../../data/budget.js";
import { DISTRICT_TABLES } from "../../data/district-scenarios.js";
import { FACILITIES } from "../../data/schools.js";
import { ref } from "../../data/sources.js";

function parseSort(params) {
  const key = params.get("sort");
  if (!key || !MEASURES.some((m) => m.key === key)) return null;
  return { key, dir: params.get("dir") === "desc" ? "desc" : "asc" };
}

export default {
  title: "Compare the plans",
  render(el, { params, setParams }) {
    let reading = params.get("w") === "permits" ? "permits" : "slides";
    let sort = parseSort(params);
    let cleanup = null;
    const host = h("div", {});
    const howTo = howToRead();
    const openHowTo = () => {
      howTo.open = true;
      howTo.scrollIntoView({ block: "start" });
      howTo.querySelector("summary")?.focus({ preventScroll: true });
    };

    const readingRadio = (value, title, sub) =>
      h(
        "label",
        {},
        h("input", {
          type: "radio",
          name: "cmp-reading",
          value,
          checked: reading === value,
          onchange: () => {
            reading = value;
            setParams({ w: value === "permits" ? "permits" : null });
            draw();
          },
        }),
        h("span", {}, h("strong", {}, title), h("br"), h("span", { class: "small" }, sub))
      );

    function draw() {
      cleanup?.();
      setReading(reading);
      const versions = versionList();
      const pathB = versions.filter((v) => v.kind === "B");
      const fitCount = pathB.filter((v) => !v.r.capacity.overPeople.length).length;
      const target = BUDGET.requiredCut;
      const surplus = PATH_B_SAVINGS.total - target;
      // the slides' own verdicts, and the one table whose printed totals do not match its rows
      const slidesFit = DISTRICT_TABLES.filter((t) => /^No school/.test(t.headline)).length;
      const bpsMismatch = DISTRICT_TABLES.flatMap(tableMismatches).find((m) => m.school === "BPS");
      const fitText =
        reading === "permits"
          ? `Read the way the state permits are written, ${fitCount} of the 12 versions keep every open school within its wastewater limit.`
          : `By the student counts in the district's own tables, ${fitCount} of the 12 versions keep every open school within its limit. The slide headlines say ${slidesFit}; the note under the table explains why.`;

      const table = comparisonTable(versions, {
        sort,
        onSort: (s) => {
          sort = s;
          setParams({ sort: s?.key ?? null, dir: s?.dir ?? null });
        },
        onExplain: openHowTo,
      });
      cleanup = () => table.cleanup?.();

      host.replaceChildren(
        section(
          { id: "cmp-all", title: "Every version on the same measures" },
          h(
            "p",
            { class: "section-intro" },
            `The district gives one savings figure for Path B, ${money(PATH_B_SAVINGS.total)} a year, ${money(surplus)} more than the ${money(target)} target; Path A saves the target exactly. `,
            tag("district"),
            " ",
            cite(ref("deck", "slide 13")),
            " ",
            cite(ref("deck", "slide 19")),
            " On October 28 an administrator said the versions that keep grades 5-6 in the valley would save less, because Crossett Brook would keep only about 126 students; the district has not costed them, so the table shows its figure as an upper limit for those six. ",
            cite(ref("meeting1028", "keeping grades 5-6 in the valley")),
            ` The versions also differ in whether the schools that stay open fit within their limits, how many students change schools, and how many schools a child would attend. ${fitText} By the district consultant's classroom capacities, every version needs more classroom space somewhere. Sort by any measure to line the versions up your way.`
          ),
          table,
          middleNote(versions),
          reading === "slides"
            ? note(
                "warn",
                h("strong", {}, "One district table does not add up. "),
                `For Fayston + Warren, slides 29 and 32 say Brookside would hold ${bpsMismatch.printed} students and exceed its occupancy of ${FACILITIES.BPS.occupancy}. The grade rows in the same tables add to ${bpsMismatch.rows}. This page uses the rows, so both Fayston + Warren versions show every school within its limit; by the slides' own wording, ${slidesFit} of the 12 versions fit. The Fayston and Warren totals on those slides do not match their rows either, but neither changes a verdict. `,
                cite(ref("deck", "slide 29")),
                " ",
                cite(ref("deck", "slide 32"))
              )
            : note(
                "info",
                h("strong", {}, "How the permit reading works. "),
                "Waitsfield's 1991 permit allows 300 students, not the 230 on the slides, and Fayston's allows 235 students and staff, not 250. Fayston's and Warren's permits count students and staff together; Moretown's is a daily water flow, which the district converts to 235 people; Brookside's occupancy counts everyone in the building. So staff are added at every school except Waitsfield. Staff numbers are our estimate. ",
                tag("estimate"),
                " ",
                ...cites([FACILITIES.WES.permit.src, FACILITIES.FES.permit.src, FACILITIES.MES.permit.src, FACILITIES.WRN.permit.src])
              )
        ),

        section(
          { id: "cmp-score", title: "Score the six pairings yourself" },
          h(
            "p",
            { class: "section-intro" },
            "The district's presentation asks board members to score each pairing from 1 (poor fit) to 5 (strong fit) on four criteria, then rank them. Each pairing below shows the data behind those criteria, plus two more this site adds. Nothing is scored for you, and your scores stay in this browser. ",
            cite(ref("deck", "slide 34"))
          ),
          ...scoreSection()
        ),

        section(
          { id: "cmp-other", title: "Other combinations" },
          h(
            "p",
            { class: "section-intro" },
            "Merging only the middle schools, closing one valley school, keeping grades 5-6 in the valley with temporary classrooms, and other combinations of the same building blocks are scored the same way on ",
            h("a", { href: "#/options" }, "Options beyond A and B"),
            ". To change any setting yourself, use ",
            h("a", { href: "#/build" }, "Build a plan"),
            "."
          )
        ),

        howTo
      );
      window.wonk?.init(host);
    }

    el.append(
      pageHead({
        kicker: "Path A, Path B, and the six pairings",
        title: "Twelve versions of Path B, side by side with Path A",
        lede: "Path B keeps two of the four valley elementary schools open, and the board has not said which two: six possible pairs, each with grades 5 and 6 either staying in the valley or moving to Crossett Brook. Here are all twelve versions next to Path A, on the same measures.",
      }),
      h(
        "fieldset",
        { class: "group cmp-reading no-print" },
        h("legend", {}, "Which wastewater limits?"),
        h(
          "div",
          { class: "choice cmp-reading-choices" },
          readingRadio("slides", "As on the slides", "Students only, against 230 (Waitsfield), 250 (Fayston), 235 (Moretown), and 237 (Warren), as the district compared them."),
          readingRadio("permits", "As the state permits read", "Waitsfield: 300 students, as its 1991 permit words it. Elsewhere staff count too, and Fayston's limit is 235. Staff numbers are our estimate.")
        ),
        h("p", { class: "hint" }, "Why there are two readings: ", h("a", { href: "#/findings" }, "What we checked"), ". ", cite(ref("permitWES", "condition 1.2"), "Waitsfield permit"))
      ),
      host
    );
    draw();

    return () => cleanup?.();
  },
};

// Harwood Middle is the same in every Path B version: the merger puts both middle schools' 7th and 8th graders there.
function middleNote(versions) {
  const m = versions.find((v) => v.kind === "B")?.r.capacity.middle.find((x) => x.id === "HUMS");
  if (!m?.over) return null;
  return note(
    "info",
    h("strong", {}, "Harwood Middle, in every Path B version. "),
    `Moving Crossett Brook's 7th and 8th graders to Harwood would put about ${num(m.total)} students in grades 7-8 there, against the ${num(m.capacity)} the district's consultant counted for the rooms the middle school uses now. It shares a building with the high school, whose capacity the consultant left “TBD.” `,
    cite(ref("truexCap", "Capacities"), "Consultant capacities")
  );
}

function howToRead() {
  const item = (title, ...text) => [h("dt", {}, title), h("dd", {}, ...text)];
  return h(
    "details",
    { class: "wonk-fold cmp-howto", id: "cmp-howto" },
    h("summary", {}, "How to read this page"),
    h(
      "div",
      { class: "body" },
      h("p", {}, "Each measure, in plain words, and where it comes from. Every Path B version takes effect in fall 2027."),
      h(
        "dl",
        { class: "cmp-defs" },
        item(
          "Version",
          "A Path B version is named for the two valley schools that stay open; the line under the name says which two close. “Grades 5-6 at Crossett Brook” is the district's ",
          term("pk4config", "Pre-K to 4 setup"),
          ": valley schools keep Pre-K through grade 4, and all valley 5th and 6th graders go to Crossett Brook in Duxbury. “Grades 5-6 stay in the valley” is the ",
          term("k6config", "K-6 setup"),
          ", as today."
        ),
        item(
          "Saves each year",
          `The district's figures: Path A's cuts add up to the target exactly; Path B saves ${money(PATH_B_SAVINGS.valley.amount)} by closing two valley schools and ${money(PATH_B_SAVINGS.middle.amount)} by merging the middle schools. The district gave one savings figure for closing any two schools, so every pairing shows the same savings. `,
          cite(ref("deck", "slide 13")),
          " ",
          cite(ref("deck", "slides 17-19")),
          " Those figures assume valley 5th and 6th graders move to Crossett Brook. For the six versions that keep them in the valley, an administrator said on October 28 the savings would be lower, so the table marks the figure “Up to.” ",
          tag("estimate"),
          " ",
          cite(ref("meeting1028", "keeping grades 5-6 in the valley"))
        ),
        item(
          "Buildings in use",
          "School buildings the district would operate, out of 7: Brookside, Crossett Brook, the Harwood campus, and the four valley schools. Closed towns' children go to the nearest open school, the rule the district used for its tables; families closer to another school may go there instead, and parents can ask for another school. ",
          cite(ref("deck", "slides 27-32")),
          " ",
          cite(ref("aoa", "Article 6(E)"), "Articles")
        ),
        item(
          "Fits the buildings?",
          "The district's own measure: each open school's students, counting Pre-K, against its wastewater limit, or Brookside's occupancy of 480. Student counts are the grade rows of the district's capacity tables. ",
          cite(ref("deck", "slides 21-32")),
          " Choose “As the state permits read” to use the limits written in the permits instead: Waitsfield 300 students, Fayston 235, and staff counted toward every limit except Waitsfield's. Staff numbers are our estimate. ",
          tag("estimate"),
          " The classroom line compares the same students with the classroom capacity the district's planning consultant, TruexCullins, calculated for each building in March 2025. Harwood Middle, the same in every version, is in the note under the table. ",
          cite(ref("truexCap", "Capacities"))
        ),
        item(
          "Changing schools next fall",
          "This year's K-12 students who would start fall 2027 in a different school than they would with no change. Normal moves, like a valley 6th grader going on to Harwood Middle, are not counted. Pre-K students who would move are shown separately. ",
          tag("derived"),
          " ",
          cite(ref("enroll", "p. 1"), "Oct 1 report")
        ),
        item(
          "Most schools for one child",
          "The most different schools a child now in Pre-K to grade 2 would attend from kindergarten through grade 12, in any town, and the towns where that happens. Harwood Middle and Harwood High count as two schools in one building. Today every child attends 3. ",
          tag("derived")
        ),
        item(
          "Students at 5+ schools",
          "How many of this year's students in Pre-K to grade 8 would attend five or more different K-12 schools, by town. ",
          tag("derived")
        ),
        item(
          "Deferred repairs, elementary buildings",
          "The district's deferred maintenance figures (priority 1 to 3) added up for the elementary buildings that stay open, and for those that close. A closed valley building is offered to its town for $1, so its repairs would no longer be the district's if the town takes it. Crossett Brook and Harwood are not in the district's facility profiles and are the same in every version. ",
          tag("derived"),
          " ",
          cite(ref("deck", "slides 21-25")),
          " ",
          cite(ref("aoa", "Article 6(B)"), "Articles")
        ),
        item("Your scores", "Saved only in this browser, on this device. Nobody else sees them, and clearing your browser data removes them.")
      ),
      h(
        "p",
        {},
        "Every calculation is on the ",
        h("a", { href: "#/sources" }, "Sources and method"),
        " page. Found a mistake? ",
        h("a", { href: "https://github.com/ak--47/huusd-dash/issues" }, "Report a correction"),
        "."
      )
    )
  );
}
