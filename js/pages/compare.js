// Compare the plans: Path A and all twelve Path B versions on the same measures, and the district's
// scoring sheet with the data behind it. Other combinations live on the Options page.

import { h, listJoin, money, num } from "../ui/dom.js";
import { cite, cites, note, pageHead, schoolShort, section, tag, term } from "../ui/kit.js";
import { comparisonTable } from "../ui/compare-table.js";
import { scoreSection } from "../ui/compare-score.js";
import { MEASURES, SETUPS, jumpTo, nameWithSetup, pairLabel, setReading, versionList } from "../ui/compare-versions.js";
import { PK_PLAN, evaluate, tableMismatches } from "../model/index.js";
import { BUDGET, PATH_B_SAVINGS } from "../../data/budget.js";
import { DISTRICT_TABLES } from "../../data/district-scenarios.js";
import { PREK_2026 } from "../../data/enrollment.js";
import { FACILITIES, VALLEY } from "../../data/schools.js";
import { ref } from "../../data/sources.js";

const READING_NAME = { slides: "As on the slides", permits: "As the state permits read" };

// Versions by grade 5-6 setup: "With grades 5-6 at Crossett Brook: Moretown + Fayston and Moretown + Warren.
// With grades 5-6 in the valley: Fayston + Warren."
const SETUP_WITH = { 4: "With grades 5-6 at Crossett Brook", 6: "With grades 5-6 in the valley" };
function bySetup(versions) {
  return SETUPS.flatMap((top) => {
    const names = versions.filter((v) => v.top === top).map((v) => v.name);
    return names.length ? [`${SETUP_WITH[top]}: ${listJoin(names)}.`] : [];
  }).join(" ");
}

// The district tables whose printed Brookside total does not match their grade rows: the Fayston + Warren
// tables on slides 29 and 32, as the deck stands. Empty if the district corrects them.
const BPS_TABLES = DISTRICT_TABLES.filter((t) => tableMismatches(t).some((m) => m.school === "BPS"));

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
    // "Back to the table" returns focus to the button that opens these definitions
    const howTo = howToRead(() => jumpTo(host.querySelector(".cmp-compare"), host.querySelector(".cmp-explain")));
    // Said right at the radios: on a phone the table is far below them
    const readingSaid = h("p", { class: "hint cmp-reading-said", role: "status" });
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
      const fitting = pathB.filter((v) => !v.r.capacity.overPeople.length);
      const fitCount = fitting.length;
      const fitList = fitCount ? ` ${bySetup(fitting)}` : "";
      const target = BUDGET.requiredCut;
      const surplus = PATH_B_SAVINGS.total - target;
      // the slides' own verdicts
      const slidesFit = DISTRICT_TABLES.filter((t) => /^No school/.test(t.headline)).length;
      const under = reading === "slides" ? tablesNote(pathB, slidesFit) : permitsNote(pathB);
      const fitText =
        reading === "permits"
          ? `Read the way the state permits are written, ${fitCount} of the 12 versions keep every open school within its wastewater limit; they are listed under the choice above.`
          : `By the student counts in the district's own tables, ${fitCount} of the 12 versions keep every open school within its limit; they are listed under the choice above.${
              slidesFit === fitCount ? "" : ` The slide headlines say ${slidesFit}${under ? "; the note under the table explains why" : ""}.`
            }`;
      // the permits reading counts only students at Waitsfield; these also fit with its staff counted
      const withWesStaff = pathB.filter((v) => v.r.capacity.schools.every((s) => (s.id === "WES" ? s.total + s.staff <= s.limit : !s.overPeople)));
      readingSaid.textContent =
        `${READING_NAME[reading]}: ${fitCount} of the 12 Path B versions keep every open school within its limit.${fitList}` +
        (reading === "slides" && slidesFit !== fitCount
          ? ` The slide headlines say ${slidesFit}: this count adds up the Fayston + Warren tables' grade rows instead of their printed totals (see the note under the table).`
          : "") +
        (reading === "permits" && withWesStaff.length !== fitCount
          ? ` This reading counts only students against Waitsfield's 300; if its staff count too, ${withWesStaff.length} fit${withWesStaff.length ? `: ${listJoin(withWesStaff.map(nameWithSetup))}` : ""}.`
          : "");

      const table = comparisonTable(versions, {
        sort,
        onSort: (s) => {
          sort = s;
          setParams({ sort: s?.key ?? null, dir: s?.dir ?? null });
        },
        onExplain: openHowTo,
      });
      cleanup = () => table.cleanup?.();
      // the other pages read the same ?w= setting, so a reader keeps the reading they chose
      const keepReading = reading === "permits" ? "?w=permits" : "";

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
            " On October 28 an administrator said the versions that keep grades 5-6 in the valley would save less, because Crossett Brook would keep only about 126 students, and would have “an impact in terms of a penalty”: staff would have to stay to serve those students or be shared with Brookside. The district has not costed them, so the table shows its figure as an upper limit for those six. ",
            cite(ref("meeting1028", "keeping grades 5-6 in the valley"))
          ),
          h("p", { class: "section-intro" }, fitText),
          h("p", { class: "section-intro" }, "Measured against the classroom capacities the district's consultant counted in 2025, which count only rooms now used as classrooms, every version puts more students than that in at least one school. The consultant did not study Path B."),
          table,
          middleNote(versions),
          under,
          howTo
        ),

        section(
          { id: "cmp-score", title: "Score the six pairings yourself" },
          h(
            "p",
            { class: "section-intro" },
            "The district's presentation asks board members to score each pairing from 1 (poor fit) to 5 (strong fit) in five columns, four criteria and an overall “Ranking of school combination,” and total them. Board members' scores are due November 3 and will be shown publicly with names. Each pairing below shows the data behind the criteria, plus two more this site adds. Nothing is scored for you, and your scores stay in this browser. ",
            cite(ref("deck", "slide 34")),
            " ",
            cite(ref("meeting1028", "homework timeline"))
          ),
          ...scoreSection()
        ),

        section(
          { id: "cmp-other", title: "Other combinations" },
          h(
            "p",
            { class: "section-intro" },
            "Merging only the middle schools, closing one valley school, keeping grades 5-6 in the valley with temporary classrooms, and other combinations of the same building blocks are scored the same way on ",
            h("a", { href: `#/options${keepReading}` }, "Options beyond A and B"),
            ". To change any setting yourself, use ",
            h("a", { href: `#/build${keepReading}` }, "Build a plan"),
            "."
          )
        )
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
          readingRadio(
            "slides",
            READING_NAME.slides,
            "Students only, against 230 (Waitsfield), 250 (Fayston), 235 (Moretown), 237 (Warren), and Brookside's occupancy of 480, as the district compared them."
          ),
          readingRadio(
            "permits",
            READING_NAME.permits,
            "Waitsfield: 300 students, as its 1991 permit words it. Elsewhere staff count too, and Fayston's limit is 235. Staff numbers are our estimate."
          )
        ),
        h("p", { class: "hint" }, "Why there are two readings: ", h("a", { href: "#/findings" }, "What we checked"), ". ", cite(ref("permitWES", "condition 1.2"), "Waitsfield permit")),
        readingSaid
      ),
      h(
        "p",
        { class: "cmp-jump no-print" },
        h(
          "button",
          { type: "button", class: "wonk-btn wonk-btn--quiet", onclick: () => jumpTo(host.querySelector("#cmp-score")) },
          "Go to: score the six pairings yourself"
        )
      ),
      host
    );
    draw();

    return () => cleanup?.();
  },
};

// Under the slides reading: the tables whose printed Brookside total does not match their grade rows
// (Fayston + Warren, slides 29 and 32). Nothing if the district corrects them.
function tablesNote(pathB, slidesFit) {
  const bps = BPS_TABLES.map((t) => tableMismatches(t).find((m) => m.school === "BPS")).filter(Boolean);
  if (!bps.length) return null;
  const many = BPS_TABLES.length > 1;
  const pair = pairLabel(BPS_TABLES[0].pair);
  const slides = `${many ? "Slides" : "Slide"} ${listJoin(BPS_TABLES.map((t) => String(t.slide)))}`;
  const printed = listJoin([...new Set(bps.map((m) => num(m.printed)))], "or");
  const rows = listJoin([...new Set(bps.map((m) => num(m.rows)))], "or");
  const occupancy = num(FACILITIES.BPS.occupancy);
  // Brookside's 480 is a building occupancy, which counts staff; counting our staff estimate, is it over in these versions?
  const mine = pathB.filter((v) => BPS_TABLES.some((t) => t.pair.every((id) => v.pair.includes(id))));
  const overWithStaff = mine.length > 0 && mine.every((v) => evaluate(v.plan, { reading: "permits" }).capacity.overPeople.includes("BPS"));
  // the same tables' other totals that do not match their rows, said only when none of them changes a verdict
  const others = BPS_TABLES.flatMap(tableMismatches).filter((m) => m.school !== "BPS");
  const otherIds = [...new Set(others.map((m) => m.school))];
  const limit = (id) => FACILITIES[id].wastewater;
  const noFlip = others.every((m) => m.printed > limit(m.school) === m.rows > limit(m.school));
  const which = otherIds.length === 1 ? "it does not change a verdict" : otherIds.length === 2 ? "neither changes a verdict" : "none of them changes a verdict";
  return note(
    "warn",
    h("strong", {}, `The ${pair} table${many ? "s do" : " does"} not add up. `),
    `${slides} say${many ? "" : "s"} Brookside would hold ${printed} students and exceed its occupancy of ${occupancy}. The grade rows in the same table${many ? "s" : ""} add to ${rows}. `,
    `This page uses the rows, so ${many ? `both ${pair} versions show` : `the ${pair} version shows`} every school within its limit; by the slides' own wording, ${slidesFit} of the 12 versions fit. `,
    overWithStaff
      ? `Brookside's ${occupancy} is a building occupancy, which normally counts staff too; counted that way (choose “${READING_NAME.permits}” above), Brookside is over in ${many ? "both versions" : "that version"}. `
      : "",
    otherIds.length && noFlip
      ? `The ${listJoin(otherIds.map(schoolShort))} totals on ${many ? "those slides" : "that slide"} do not match their rows either, but ${which}. `
      : "",
    ...cites(BPS_TABLES.map((t) => ref("deck", `slide ${t.slide}`)))
  );
}

// Under the permits reading: what each permit says, and what changes if Waitsfield's staff count too.
function permitsNote(pathB) {
  // the permits reading counts students only at Waitsfield; this counts its staff estimate too
  const withWesStaff = pathB.filter((v) => v.r.capacity.schools.every((s) => (s.id === "WES" ? s.total + s.staff <= s.limit : !s.overPeople)));
  return note(
    "info",
    h("strong", {}, "How the permit reading works. "),
    "Waitsfield's 1991 permit sets an approved maximum student population of 300, not the 230 on the slides; the design behind it counted students and staff, and a 1996 letter in the state's file says 230. Fayston's permit allows 235 students and staff, not 250. Fayston's and Warren's permits count students and staff together; Moretown's is a daily water flow, which the district converts to 235 people; Brookside's occupancy counts everyone in the building. So staff are added at every school except Waitsfield. ",
    `If Waitsfield's staff counted too, ${withWesStaff.length} of the 12 versions would fit${withWesStaff.length ? `: ${listJoin(withWesStaff.map(nameWithSetup))}` : ""}. Staff numbers are our estimate. `,
    tag("estimate"),
    " ",
    ...cites([FACILITIES.WES.permit.src, ref("permitWES1996", "PDF pp. 9-10"), FACILITIES.FES.permit.src, FACILITIES.MES.permit.src, FACILITIES.WRN.permit.src])
  );
}

// Harwood Middle is the same in every Path B version: the merger puts both middle schools' 7th and 8th graders there.
function middleNote(versions) {
  const m = versions.find((v) => v.kind === "B")?.r.capacity.middle.find((x) => x.id === "HUMS");
  if (!m?.over) return null;
  return note(
    "info",
    h("strong", {}, "Harwood Middle, in every Path B version. "),
    `Moving Crossett Brook's 7th and 8th graders to Harwood would put about ${num(m.total)} students in grades 7-8 there, against the ${num(m.capacity)} the district's consultant counted for the rooms the middle school uses now. It shares a building with the high school, whose capacity the consultant left “TBD.” That building held 766 students in grades 7-12 in 2010-11; it has 608 this year, and would have about 738 with Crossett Brook's 7th and 8th graders. `,
    cite(ref("truexCap", "Capacities"), "Consultant capacities"),
    " ",
    cite(ref("qdoc", "enrollment by school"), "Board Q&A")
  );
}

// The Pre-K the district's tables count at each open school, as words: "30 at Fayston, Moretown, or
// Waitsfield; 42 at Warren; and 60 at Brookside". These are planning numbers, not this year's classes.
function prekPlanText() {
  const groups = new Map();
  for (const id of VALLEY) groups.set(PK_PLAN[id], [...(groups.get(PK_PLAN[id]) ?? []), schoolShort(id)]);
  const parts = [...[...groups].map(([n, names]) => `${num(n)} at ${listJoin(names, "or")}`), `${num(PK_PLAN.BPS)} at Brookside`];
  return parts.length > 2 ? `${parts.slice(0, -1).join("; ")}; and ${parts[parts.length - 1]}` : parts.join(" and ");
}

// Valley schools with no Pre-K classes this year: "Fayston and Waitsfield".
function noPrekNow() {
  return VALLEY.filter((id) => {
    const pk = PREK_2026.bySchool[id];
    return pk && pk.PK3 + pk.PK4 === 0;
  }).map(schoolShort);
}

function howToRead(onBack) {
  const item = (title, ...text) => [h("dt", {}, title), h("dd", {}, ...text)];
  const empty = noPrekNow();
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
          cite(ref("meeting1028", "keeping grades 5-6 in the valley")),
          " This page measures savings against the district's target; Options beyond A and B and Build a plan can also use the lower target if older bond payments are left out."
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
          ` Pre-K counts in those tables are the district's planning numbers, not this year's enrollment: ${prekPlanText()}.${empty.length ? ` ${listJoin(empty)} ${empty.length === 1 ? "has" : "have"} no Pre-K classes now.` : ""} `,
          cite(PREK_2026.src, "Oct 1 report"),
          " Choose “As the state permits read” to use the limits written in the permits instead: Waitsfield 300 students, Fayston 235, and staff counted toward every limit except Waitsfield's. Staff numbers are our estimate. ",
          tag("estimate"),
          " The classroom line compares the same students with the classroom capacity the district's planning consultant, TruexCullins, calculated for each building in March 2025. Harwood Middle, the same in every version, is in the note under the table. ",
          cite(ref("truexCap", "Capacities"))
        ),
        item(
          "Changing schools next fall",
          "Students in kindergarten to grade 12 next fall, counted from this year's enrollment (this year's 4-year-olds in Pre-K through grade 11), who would start fall 2027 in a different school than they would with no change. Normal moves, like a valley 6th grader going on to Harwood Middle, are not counted. Children who would be in Pre-K next fall and change programs are shown separately. ",
          tag("derived"),
          " ",
          cite(ref("enroll", "p. 1"), "Oct 1 report")
        ),
        item(
          "Most schools for any child",
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
      ),
      // a button, not a #fragment link: the hash router would read a fragment as a route
      h("p", { class: "no-print" }, h("button", { type: "button", class: "wonk-btn wonk-btn--quiet", onclick: onBack }, "Back to the table"))
    )
  );
}
