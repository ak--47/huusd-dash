import { h, num, plural, store } from "../ui/dom.js";
import { cite, fold, note, pageHead, schoolName, schoolShort, section, tag } from "../ui/kit.js";
import { strip, countLine } from "../ui/strip.js";
import { childForm, decodeChild, encodeChild } from "../ui/child-form.js";
import { heatGrid } from "../ui/heat.js";
import { TOWNS } from "../../data/schools.js";
import { PAIRS } from "../../data/district-scenarios.js";
import { ref } from "../../data/sources.js";
import {
  PLAN_A, PLAN_TODAY, compareJourney, decodePlan, evaluate, makePlan, pathB, receivingOptions, receivingSchool, townSchool, withRoadmap,
} from "../model/index.js";

const pairId = (pair) => [...pair].sort().join("+");
const pairLabel = (pair) => pair.map(schoolShort).join(" + ");
const gradeWord = (g) => (g === -2 ? "a 3-year-old in Pre-K" : g === -1 ? "a 4-year-old in Pre-K" : g === 0 ? "a kindergartner" : `a ${ordinal(g)} grader`);
const ordinal = (n) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;
const townName = (id) => TOWNS.find((t) => t.id === id)?.name ?? id;

export default {
  title: "Your child's path",
  render(el, { params, setParams }) {
    const state = {
      kids: (params.get("c") ?? store.get("kids", "waitsfield.0.WES")).split("~").map(decodeChild).filter(Boolean),
      pair: PAIRS.find((p) => pairId(p) === (params.get("pair") ?? "").replace(/ /g, "+")) ?? PAIRS[0],
      top: params.get("top") === "6" ? 6 : 4,
      rtop: ["4", "5", "6"].includes(params.get("rt")) ? Number(params.get("rt")) : 4,
      pk: params.get("pk") === "1",
      recv: params.get("r") ?? "",
    };
    if (!state.kids.length) state.kids = [decodeChild("waitsfield.0.WES")];
    const saved = store.get("plan", null);
    const custom = saved ? decodePlan(saved) : null;

    const sync = () => {
      const c = state.kids.map(encodeChild).join("~");
      setParams({ c, pair: pairId(state.pair), top: state.top, pk: state.pk ? 1 : null, r: state.recv || null, rt: state.rtop === 4 ? null : state.rtop });
      store.set("kids", c);
    };

    const planB = () => {
      const recv = {};
      for (const part of state.recv.split(".").filter(Boolean)) {
        const [town, id] = part.split("~");
        recv[town] = id;
      }
      return makePlan({ ...pathB(state.pair, state.top), receiving: recv });
    };

    const kidsHost = h("div", { class: "kids" });
    const gridHost = h("div", {});

    const draw = () => {
      kidsHost.replaceChildren(...state.kids.map((kid, i) => childCard(kid, i)));
      drawGrid();
      window.wonk?.init(el);
    };

    function childCard(kid, i) {
      const opts = { includePreK: state.pk };
      const B = planB();
      const rows = [
        { plan: PLAN_TODAY, title: "No change", sub: "For comparison. Over the state limit, so not on the table as is." },
        { plan: PLAN_A, title: "Path A", sub: "Same schools as today. Pre-K moves to private programs." },
        { plan: B, title: "Path B", sub: `${pairLabel(state.pair)} stay open. ${state.top === 4 ? "Grades 5-6 at Crossett Brook." : "Grades 5-6 stay in the valley."}`, isB: true },
      ];
      const roadmap = withRoadmap(B, state.rtop);
      rows.push({
        plan: roadmap,
        title: "Path B, then the draft roadmap",
        sub: `The district's October 14 draft, which its author called a suggestion: in fall 2029 the two valley schools move into one new building for Pre-K to ${state.rtop}.`,
        isRoadmap: true,
      });
      if (custom) rows.push({ plan: custom, title: "Your plan", sub: "From Build a plan." });

      const results = rows
        .map((r) => ({ ...r, cmp: compareJourney(r.plan, kid, opts) }))
        .filter((r, _, all) => !r.isRoadmap || r.cmp.years.some((y, k) => y.school !== all[2].cmp.years[k]?.school));
      const today = results[0].cmp.counts.schools;
      const allB = PAIRS.flatMap((pair) => [4, 6].map((top) => compareJourney(pathB(pair, top), kid, opts).counts.schools));
      const bLo = Math.min(...allB);
      const bHi = Math.max(...allB);
      const allRoad = PAIRS.flatMap((pair) => [4, 6].map((top) => compareJourney(withRoadmap(pathB(pair, top), state.rtop), kid, opts).counts.schools));
      const roadDiffers = allRoad.some((n, k) => n !== allB[k]);
      const roadLo = roadDiffers ? Math.min(...allRoad) : null;
      const roadHi = roadDiffers ? Math.max(...allRoad) : null;
      const showPreK = state.pk || kid.grade < 0;
      const own = townSchool(kid.town);
      const closesIn = PAIRS.filter((p) => !p.includes(own)).length;

      const card = h("article", { class: "wonk-card child-card", "aria-labelledby": `kid-${i}`, "data-fold-key": null });
      card.append(
        h(
          "header",
          { class: "child-head" },
          h("div", {}, h("h2", { id: `kid-${i}`, tabindex: "-1" }, `${capital(gradeWord(kid.grade))} in ${townName(kid.town)}`), h("p", { class: "muted small" }, `This year at ${schoolName(kid.school)}${kid.pk ? ` · Pre-K: ${schoolShort(kid.pk)}` : ""}`)),
          h(
            "div",
            { class: "btn-row no-print" },
            h("button", { type: "button", class: "wonk-btn", "aria-expanded": "false", onclick: (e) => toggleEdit(e.currentTarget, i) }, "Change"),
            state.kids.length > 1
              ? h("button", { type: "button", class: "wonk-btn wonk-btn--quiet", onclick: () => { state.kids.splice(i, 1); sync(); draw(); } }, "Remove")
              : null
          )
        ),
        h("div", { class: "child-edit", id: `kid-edit-${i}`, hidden: true }),
        h(
          "p",
          { class: "child-summary" },
          `With no change: ${plural(today, "school")}. Path A: ${plural(results[1].cmp.counts.schools, "school")}. Path B: `,
          h("strong", {}, bLo === bHi ? plural(bLo, "school") : `${bLo} to ${bHi} schools`),
          own === "BPS" ? "." : `, depending on which valley schools stay open. ${schoolShort(own)} closes in ${closesIn} of the 6 pairings.`,
          roadLo != null ? ` With the district's draft roadmap after Path B: ${roadLo === roadHi ? plural(roadLo, "school") : `${roadLo} to ${roadHi} schools`}.` : ""
        )
      );

      const list = h("div", { class: "plan-rows" });
      for (const r of results) {
        const recvOpts = r.isB ? receivingOptions(r.plan, kid.town) : [];
        list.append(
          h(
            "div",
            { class: "plan-row" },
            h("div", {}, h("h3", {}, r.title), h("p", { class: "plan-sub" }, r.sub)),
            h(
              "div",
              {},
              strip(r.cmp.years, { base: r.plan === PLAN_TODAY ? null : results[0].cmp.years, showPreK, label: `${r.title} for this child` }),
              countLine(r.cmp.counts, r.plan === PLAN_TODAY ? null : r.cmp.extraSchools),
              recvOpts.length > 1 ? receivingPicker(kid, r.plan, recvOpts) : null
            )
          )
        );
      }
      card.append(list, versionsTable(kid, opts));
      return card;
    }

    function toggleEdit(btn, i) {
      const host = document.getElementById(`kid-edit-${i}`);
      const open = host.hidden;
      host.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
      if (open && !host.firstChild) {
        host.append(
          childForm({
            submitLabel: "Update",
            value: state.kids[i],
            onSubmit: (code) => {
              const kid = decodeChild(code);
              if (kid) state.kids[i] = kid;
              sync();
              draw();
              document.getElementById(`kid-${i}`)?.focus();
            },
          })
        );
      }
      if (open) host.querySelector("select")?.focus();
    }

    function receivingPicker(kid, plan, choices) {
      const id = `recv-${kid.town}`;
      const sel = h("select", { class: "wonk-select", id }, choices.map((sid) => h("option", { value: sid, selected: sid === receivingSchool(plan, kid.town) }, schoolName(sid))));
      sel.addEventListener("change", () => {
        const others = state.recv.split(".").filter((p) => p && !p.startsWith(`${kid.town}~`));
        state.recv = [...others, `${kid.town}~${sel.value}`].join(".");
        sync();
        draw();
      });
      return h(
        "div",
        { class: "wonk-field recv" },
        h("label", { class: "wonk-label", for: id }, `If ${schoolShort(townSchool(kid.town))} closes, my child would go to`),
        sel,
        h("span", { class: "wonk-help" }, "The district places students at the school closest to home, so families in the same town can land in different schools. Parents can also ask for another school.")
      );
    }

    function versionsTable(kid, opts) {
      const rows = PAIRS.map((pair) => {
        const cells = [4, 6].map((top) => {
          const c = compareJourney(pathB(pair, top), kid, opts);
          const on = pairId(pair) === pairId(state.pair) && top === state.top;
          return h(
            "td",
            { class: `num${on ? " is-on" : ""}` },
            h(
              "button",
              {
                type: "button",
                class: "wonk-value-link",
                "aria-pressed": on ? "true" : "false",
                "aria-label": `${pairLabel(pair)}, ${top === 4 ? "grades 5-6 at Crossett Brook" : "grades 5-6 in the valley"}: ${c.counts.schools} schools. Show this version.`,
                onclick: () => { state.pair = pair; state.top = top; sync(); draw(); },
              },
              String(c.counts.schools)
            )
          );
        });
        return h("tr", {}, h("th", { scope: "row" }, pairLabel(pair)), cells);
      });
      return fold(
        "All twelve Path B versions for this child",
        h("p", { class: "small" }, "Number of different K-12 schools. Select a number to show that version above."),
        h(
          "div",
          { class: "table-scroll" },
          h(
            "table",
            { class: "wonk-table versions" },
            h("caption", { class: "wonk-sr" }, "Schools attended under each Path B version"),
            h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Schools that stay open"), h("th", { scope: "col", class: "num" }, "Grades 5-6 at Crossett Brook"), h("th", { scope: "col", class: "num" }, "Grades 5-6 stay in valley"))),
            h("tbody", {}, rows)
          )
        )
      );
    }

    // ---- everyone: town by grade ----
    const gridPlanSel = h("select", { class: "wonk-select", id: "grid-plan" });
    const gridPlans = [
      ["A", "Path A", PLAN_A],
      ...PAIRS.flatMap((pair) => [4, 6].map((top) => [`B:${pairId(pair)}:${top}`, `Path B: ${pairLabel(pair)}, ${top === 4 ? "grades 5-6 at Crossett Brook" : "grades 5-6 in the valley"}`, pathB(pair, top)])),
    ];
    gridPlans.push(...PAIRS.flatMap((pair) => [4, 6].map((top) => [`R:${pairId(pair)}:${top}`, `Path B: ${pairLabel(pair)}, ${top === 4 ? "grades 5-6 at Crossett Brook" : "grades 5-6 in the valley"}, then the draft roadmap`, withRoadmap(pathB(pair, top), state.rtop)])));
    if (custom) gridPlans.push(["custom", "Your plan", custom]);
    gridPlanSel.append(...gridPlans.map(([v, label]) => h("option", { value: v }, label)));
    gridPlanSel.value = `B:${pairId(state.pair)}:${state.top}`;
    gridPlanSel.addEventListener("change", drawGrid);

    function drawGrid() {
      const entry = gridPlans.find(([v]) => v === gridPlanSel.value) ?? gridPlans[1];
      const r = evaluate(entry[2]);
      gridHost.replaceChildren(
        heatGrid(entry[2], { includePreK: false }),
        h(
          "p",
          { class: "small" },
          h("strong", {}, num(r.fivePlus.total)),
          ` of this year's students in Pre-K to grade 8 would attend 5 or more K-12 schools under this version `,
          tag("derived")
        )
      );
    }

    // ---- page ----
    const pkToggle = h("input", { type: "checkbox", id: "pk-toggle", checked: state.pk });
    pkToggle.addEventListener("change", () => { state.pk = pkToggle.checked; sync(); draw(); });

    const roadmapSel = h(
      "select",
      { class: "wonk-select", id: "roadmap-top" },
      [4, 5, 6].map((n) => h("option", { value: n, selected: n === state.rtop }, `Pre-K to ${n}${n === 4 ? " (author's intent)" : n === 5 ? " (Phase 2 text)" : " (feasibility study)"}`))
    );
    roadmapSel.addEventListener("change", () => { state.rtop = Number(roadmapSel.value); sync(); draw(); });
    const roadmapPick = h("div", { class: "wonk-field roadmap-pick" }, h("label", { class: "wonk-label", for: "roadmap-top" }, "Draft roadmap's new valley school teaches"), roadmapSel);

    const addHost = h("div", { class: "add-child", hidden: true });
    const addBtn = h("button", { type: "button", class: "wonk-btn" }, "Add another child");
    addBtn.addEventListener("click", () => {
      addHost.hidden = !addHost.hidden;
      addBtn.setAttribute("aria-expanded", String(!addHost.hidden));
      if (!addHost.hidden) addHost.querySelector("select")?.focus();
    });
    addBtn.setAttribute("aria-expanded", "false");
    addHost.append(
      childForm({
        submitLabel: "Add this child",
        value: { ...state.kids.at(-1) },
        onSubmit: (code) => {
          const kid = decodeChild(code);
          if (kid) state.kids.push(kid);
          addHost.hidden = true;
          addBtn.setAttribute("aria-expanded", "false");
          sync();
          draw();
        },
      })
    );


    el.append(
      pageHead({
        kicker: "The number the slides leave out",
        title: "How many schools would your child attend?",
        lede: "Every plan changes where some children go to school. Below is an example child; select Change to describe your own. You'll see every school they would attend from kindergarten through grade 12, year by year, under each path.",
      }),
      h(
        "div",
        { class: "controls-bar no-print" },
        h("div", { class: "btn-row" }, addBtn, h("label", { class: "wonk-check" }, pkToggle, " Count Pre-K in the totals"), roadmapPick),
        addHost
      ),
      h(
        "div",
        { class: "legend-row", "aria-hidden": "true" },
        h("span", {}, h("span", { class: "legend-swatch is-past" }), "Past years"),
        h("span", {}, h("span", { class: "legend-swatch is-now" }), "This year"),
        h("span", {}, h("span", { class: "legend-swatch is-changed" }), "Different from no change")
      ),
      kidsHost,
      section(
        { id: "why", title: "Why the number of schools matters" },
        h(
          "div",
          { class: "prose" },
          h("p", {}, "Research on moving into a new school points both ways, and none of it tests HUUSD's exact plan:"),
          h(
            "ul",
            {},
            h("li", {}, "Studies in New York City, Florida, and British Columbia find that students who move into a separate middle school score lower in the year they move, and the drop lasts for years. They also miss more school."),
            h("li", {}, "Other studies find smaller differences once student and school differences are accounted for, and some find no lasting harm when a school closes and students move together."),
            h("li", {}, "At the October 28 meeting, speakers noted that children make these moves with their classmates, and that every child in the district already changes schools at least twice. ", cite(ref("meeting1028", "board discussion")))
          ),
          h("p", {}, h("a", { href: "#/findings" }, "Read the research summary"), " on the What we checked page.")
        )
      ),

      section(
        { id: "everyone", title: "Every child, by town and grade", intro: "Number of different K-12 schools for a child in each town and grade this year, at their town's usual school. Today every cell is 3." },
        h("div", { class: "wonk-field grid-pick" }, h("label", { class: "wonk-label", for: "grid-plan" }, "Plan"), gridPlanSel),
        gridHost,
        fold(
          "How this is counted",
          h(
            "ul",
            {},
            h("li", {}, "We count different schools from kindergarten through grade 12. Harwood Union Middle School and Harwood Union High School are two schools in one building, so the building count is shown too."),
            h("li", {}, "Plans take effect in fall 2027 and stay in place through grade 12. If more schools close later, the counts would go up."),
            h("li", {}, "The draft roadmap rows follow the district's October 14 roadmap: in fall 2029 the valley schools move into one new building. Its Phase 2 says Pre-K to 5, its Phase 3 keeps grades 5-6 at Crossett Brook, and the feasibility study asks about Pre-K to 6. At the October 28 meeting its author said she kept grades 5-6 at Crossett Brook so 6th graders would not move twice, so Pre-K to 4 is the default; you can change it above. ", cite(ref("oct14", "Draft Proposal for School Reconfiguration & Consolidation Roadmap"), "Oct 14 deck"), " ", cite(ref("meeting1028", "roadmap discussion"))),
            h("li", {}, "A child stays at this year's school while it is open and teaches their grade, including families using intradistrict choice. When a school closes, children go to the nearest open school, the rule the district used for its capacity tables. ", cite(ref("deck", "slides 27-32"))),
            h("li", {}, "Children at Crossett Brook today follow the Waterbury and Duxbury path. Under Path B, Crossett Brook keeps grades 5 and 6 and its 7th and 8th graders move to Harwood. ", cite(ref("deck", "slide 18")))
          )
        )
      )
    );
    draw();
    sync();
  },
};

const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export { note };
