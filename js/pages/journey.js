import { h, num, plural, store } from "../ui/dom.js";
import { cite, fold, note, pageHead, schoolName, schoolShort, section, tag } from "../ui/kit.js";
import { strip, countLine } from "../ui/strip.js";
import { childForm, decodeChild, encodeChild } from "../ui/child-form.js";
import { heatGrid } from "../ui/heat.js";
import { TOWNS, VALLEY } from "../../data/schools.js";
import { PAIRS } from "../../data/district-scenarios.js";
import { ref } from "../../data/sources.js";
import {
  PLAN_A, PLAN_TODAY, compareJourney, decodePlan, evaluate, makePlan, pathB, receivingOptions, receivingSchool, townSchool, withRoadmap,
} from "../model/index.js";

const pairId = (pair) => [...pair].sort().join("+");
const pairLabel = (pair) => pair.map(schoolShort).join(" + ");
const gradesWord = (top) => (top === 4 ? "grades 5-6 at Crossett Brook" : "grades 5-6 in the valley");
// ids for the version buttons, safe in CSS selectors too
const versionId = (i, pair, top) => `ver-${i}-${[...pair].sort().join("-")}-${top}`;
const gradeWord = (g) => (g === -2 ? "a 3-year-old in Pre-K" : g === -1 ? "a 4-year-old in Pre-K" : g === 0 ? "a kindergartner" : `a ${ordinal(g)} grader`);
const ordinal = (n) => `${n}${n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"}`;
const townName = (id) => TOWNS.find((t) => t.id === id)?.name ?? id;

export default {
  title: "Your child's path",
  render(el, { params, setParams }) {
    // stored values are only ever strings from this page and Build; anything else is ignored
    const savedKids = store.get("kids");
    const state = {
      kids: (params.get("c") ?? (typeof savedKids === "string" ? savedKids : "waitsfield.0.WES")).split("~").map(decodeChild).filter(Boolean),
      pair: PAIRS.find((p) => pairId(p) === (params.get("pair") ?? "").replace(/ /g, "+")) ?? PAIRS[0],
      top: params.get("top") === "6" ? 6 : 4,
      rtop: ["4", "5", "6"].includes(params.get("rt")) ? Number(params.get("rt")) : 4,
      pk: params.get("pk") === "1",
      recv: params.get("r") ?? "",
    };
    if (!state.kids.length) state.kids = [decodeChild("waitsfield.0.WES")];
    const saved = store.get("plan", null);
    const custom = typeof saved === "string" ? decodePlan(saved) : null;

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
    // Announces what a control changed; the cards it redraws are not announced on their own.
    const live = h("p", { class: "wonk-sr", role: "status" });
    // Children whose "All twelve Path B versions" fold is open, kept across redraws.
    const openVersions = new Set();

    // Redraw every child card. focusId: the control or heading to put focus back on, since the
    // redraw replaces the element that had it. say: a short message for the live region.
    const draw = (focusId = null, say = "") => {
      kidsHost.replaceChildren(...state.kids.map((kid, i) => childCard(kid, i)));
      drawGrid();
      window.wonk?.init(el);
      if (focusId) document.getElementById(focusId)?.focus();
      // a repeated message gets a trailing space so screen readers announce it again
      if (say) live.textContent = say === live.textContent ? `${say}\u00a0` : say;
    };

    function childCard(kid, i) {
      const opts = { includePreK: state.pk };
      const B = planB();
      const rows = [
        { plan: PLAN_TODAY, title: "No change", sub: "For comparison. It spends over the state's per-pupil limit, so it is not on the table as is." },
        {
          plan: PLAN_A,
          title: "Path A",
          sub: [
            "Same schools as today. District Pre-K classes end; families would get public tuition for private Pre-K, which the superintendent said lacks the room. ",
            cite(ref("meeting1028", "Pre-K tuition model")),
          ],
        },
        {
          plan: B,
          title: "Path B (one of 12 versions)",
          sub: `Shown: ${pairLabel(state.pair)} stay open, ${gradesWord(state.top)}. Pick another version under "All twelve Path B versions for this child" below.`,
          label: `Path B with ${pairLabel(state.pair)} open and ${gradesWord(state.top)}, for this child`,
          isB: true,
        },
      ];
      // the plan saved in Build a plan comes right after the Path B row, before the roadmap
      if (custom) rows.push({ plan: custom, title: "Your plan", sub: "From Build a plan." });
      const roadmap = withRoadmap(B, state.rtop);
      rows.push({
        plan: roadmap,
        title: "Path B, then the draft roadmap",
        sub: `The district's October 14 draft, which its author called a suggestion: in fall 2029 the two valley schools move into one new building for Pre-K to ${state.rtop}.`,
        isRoadmap: true,
      });

      // The roadmap row is shown only where it changes this child's path from the Path B row's.
      const computed = rows.map((r) => ({ ...r, cmp: compareJourney(r.plan, kid, opts) }));
      const bYears = computed.find((r) => r.isB).cmp.years;
      const results = computed.filter((r) => !r.isRoadmap || r.cmp.years.some((y, k) => y.school !== bYears[k]?.school));
      const today = results[0].cmp.counts.schools;
      const showPreK = state.pk || kid.grade < 0;
      // The school whose fate decides this child's Path B: the valley school they attend now (which
      // also covers intradistrict choice), or else their town's school.
      const own = VALLEY.includes(kid.school) ? kid.school : townSchool(kid.town);
      const closesIn = PAIRS.filter((p) => !p.includes(own)).length;
      const summary = h(
        "p",
        { class: "child-summary" },
        `With no change: ${plural(today, "school")}. Path A: ${plural(results[1].cmp.counts.schools, "school")}. `,
        pathBSummary(kid, opts, own, closesIn)
      );

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
            state.kids.length > 1 ? h("button", { type: "button", class: "wonk-btn wonk-btn--quiet", onclick: () => removeChild(i) }, "Remove") : null
          )
        ),
        h("div", { class: "child-edit", id: `kid-edit-${i}`, hidden: true }),
        summary
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
              strip(r.cmp.years, { base: r.plan === PLAN_TODAY ? null : results[0].cmp.years, showPreK, label: r.label ?? `${r.title} for this child` }),
              showPreK && !state.pk ? h("p", { class: "small muted" }, "Pre-K is shown but not counted.") : null,
              countLine(r.cmp.counts, r.plan === PLAN_TODAY ? null : r.cmp.extraSchools),
              recvOpts.length > 1 ? receivingPicker(kid, i, r.plan, recvOpts) : null
            )
          )
        );
      }
      card.append(list, versionsTable(kid, opts, i));
      return card;
    }

    // "Path B: 3 to 4 schools if Moretown stays open, 4 to 5 if it closes": the number a family
    // most wants depends first on whether their school stays open, then on where grades 5-6 go.
    function pathBSummary(kid, opts, own, closesIn) {
      const count = (plan) => compareJourney(plan, kid, opts).counts.schools;
      const per = PAIRS.map((pair) => ({
        pair,
        b: [4, 6].map((top) => count(pathB(pair, top))),
        road: [4, 6].map((top) => count(withRoadmap(pathB(pair, top), state.rtop))),
      }));
      const pick = (keep, key) => per.filter((p) => keep(p.pair)).flatMap((p) => p[key]);
      const span = (xs) => (Math.min(...xs) === Math.max(...xs) ? plural(xs[0], "school") : `${Math.min(...xs)} to ${Math.max(...xs)} schools`);
      const all = pick(() => true, "b");
      const allRoad = pick(() => true, "road");
      const roadDiffers = allRoad.some((n, k) => n !== all[k]);
      const byGrades56 = per.some((p) => p.b[0] !== p.b[1]);
      const out = ["Path B: "];
      const keeps = (pair) => pair.includes(own);
      const closes = (pair) => !pair.includes(own);
      const name = schoolShort(own);
      const split = own !== "BPS" && span(pick(keeps, "b")) !== span(pick(closes, "b"));
      if (own === "BPS") {
        out.push(h("strong", {}, span(all)), ".");
      } else if (Math.min(...all) === Math.max(...all)) {
        out.push(h("strong", {}, span(all)), " in every version.");
      } else if (!split) {
        out.push(h("strong", {}, span(all)), `, whether or not ${name} stays open${byGrades56 ? ", depending on where grades 5 and 6 go" : ""}.`);
      } else {
        out.push(
          h("strong", {}, span(pick(keeps, "b"))),
          ` if ${name} stays open, `,
          h("strong", {}, span(pick(closes, "b"))),
          ` if it closes (it closes in ${closesIn} of the 6 pairings)${byGrades56 ? ", depending also on where grades 5 and 6 go" : ""}.`
        );
      }
      if (roadDiffers) {
        const roadSplit = own !== "BPS" && span(pick(keeps, "road")) !== span(pick(closes, "road"));
        out.push(
          roadSplit
            ? ` With the district's draft roadmap after Path B: ${span(pick(keeps, "road"))} if ${name} stays open in 2027, ${span(pick(closes, "road"))} if it closes.`
            : ` With the district's draft roadmap after Path B: ${span(allRoad)}.`
        );
      }
      return out;
    }

    function removeChild(i) {
      state.kids.splice(i, 1);
      // the fold memory follows the children that moved up one place
      const open = [...openVersions].filter((k) => k !== i).map((k) => (k > i ? k - 1 : k));
      openVersions.clear();
      open.forEach((k) => openVersions.add(k));
      sync();
      draw(`kid-${Math.max(0, i - 1)}`, "Child removed.");
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
              draw(`kid-${i}`, "Child updated.");
            },
          })
        );
      }
      if (open) host.querySelector("select")?.focus();
    }

    function receivingPicker(kid, i, plan, choices) {
      // one per child card: siblings in the same town each get their own select
      const id = `recv-${i}-${kid.town}`;
      const sel = h("select", { class: "wonk-select", id }, choices.map((sid) => h("option", { value: sid, selected: sid === receivingSchool(plan, kid.town) }, schoolName(sid))));
      sel.addEventListener("change", () => {
        const others = state.recv.split(".").filter((p) => p && !p.startsWith(`${kid.town}~`));
        state.recv = [...others, `${kid.town}~${sel.value}`].join(".");
        sync();
        draw(id, `If ${schoolShort(townSchool(kid.town))} closes: ${schoolName(sel.value)}.`);
      });
      return h(
        "div",
        { class: "wonk-field recv" },
        h("label", { class: "wonk-label", for: id }, `If ${schoolShort(townSchool(kid.town))} closes, my child would go to`),
        sel,
        h("span", { class: "wonk-help" }, "The district places students at the school closest to home, so families in the same town can land in different schools. Parents can also ask for another school.")
      );
    }

    function versionsTable(kid, opts, i) {
      const rows = PAIRS.map((pair) => {
        const cells = [4, 6].map((top) => {
          const c = compareJourney(pathB(pair, top), kid, opts);
          const on = pairId(pair) === pairId(state.pair) && top === state.top;
          const id = versionId(i, pair, top);
          return h(
            "td",
            { class: `num${on ? " is-on" : ""}` },
            h(
              "button",
              {
                type: "button",
                id,
                class: "wonk-value-link",
                "aria-pressed": on ? "true" : "false",
                "aria-label": `${pairLabel(pair)}, ${gradesWord(top)}: ${plural(c.counts.schools, "school")}. Show this version.`,
                onclick: () => {
                  state.pair = pair;
                  state.top = top;
                  openVersions.add(i);
                  sync();
                  draw(id, `Showing Path B with ${pairLabel(pair)} open, ${gradesWord(top)}.`);
                },
              },
              String(c.counts.schools)
            )
          );
        });
        return h("tr", {}, h("th", { scope: "row" }, pairLabel(pair)), cells);
      });
      const d = fold(
        "All twelve Path B versions for this child",
        h("p", { class: "small" }, "Number of different K-12 schools. Select a number to show that version above."),
        h(
          "div",
          { class: "table-scroll" },
          h(
            "table",
            { class: "wonk-table versions" },
            h("caption", { class: "wonk-sr" }, "Schools attended under each Path B version"),
            h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "Schools that stay open"), h("th", { scope: "col", class: "num" }, "Grades 5-6 at Crossett Brook"), h("th", { scope: "col", class: "num" }, "Grades 5-6 stay in the valley"))),
            h("tbody", {}, rows)
          )
        )
      );
      // keep the fold open across redraws, so focus can return to the button that was used
      d.open = openVersions.has(i);
      d.addEventListener("toggle", () => (d.open ? openVersions.add(i) : openVersions.delete(i)));
      return d;
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
    pkToggle.addEventListener("change", () => {
      state.pk = pkToggle.checked;
      sync();
      draw(null, state.pk ? "Pre-K now counts in the totals." : "Pre-K no longer counts in the totals.");
    });

    const roadmapSel = h(
      "select",
      { class: "wonk-select", id: "roadmap-top" },
      [4, 5, 6].map((n) => h("option", { value: n, selected: n === state.rtop }, `Pre-K to ${n}${n === 4 ? " (Phase 3; author's stated preference)" : n === 5 ? " (Phase 2 text)" : " (feasibility study)"}`))
    );
    roadmapSel.addEventListener("change", () => {
      state.rtop = Number(roadmapSel.value);
      sync();
      draw(null, `The draft roadmap's new valley school now teaches Pre-K to ${state.rtop}.`);
    });
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
        value: { ...state.kids[state.kids.length - 1] },
        onSubmit: (code) => {
          const kid = decodeChild(code);
          if (kid) state.kids.push(kid);
          addHost.hidden = true;
          addBtn.setAttribute("aria-expanded", "false");
          sync();
          draw(`kid-${state.kids.length - 1}`, kid ? "Child added." : "");
        },
      })
    );


    el.append(
      pageHead({
        kicker: "Schools per child: a measure the slides do not include",
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
      live,
      section(
        { id: "why", title: "What research says about changing schools" },
        h(
          "div",
          { class: "prose" },
          h("p", {}, "Research on moving into a new school points both ways, and none of it tests HUUSD's exact plan:"),
          h(
            "ul",
            {},
            h("li", {}, "Studies in New York City, Florida, and British Columbia find that students who move into a separate middle school score lower in the year they move, and the drop lasts for years. They also miss more school."),
            h("li", {}, "Other studies find smaller differences once student and school differences are accounted for. Studies of school closures mostly find small, short-lived effects, though some find short-term harm, especially for students from small schools."),
            h("li", {}, "At the October 28 meeting, speakers noted that children make these moves with their classmates, and that every child in the district already changes schools at least twice. ", cite(ref("meeting1028", "board discussion")))
          ),
          h("p", {}, h("a", { href: "#/findings?at=research" }, "Read the research summary"), " on the What we checked page.")
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
            h("li", {}, "The draft roadmap rows follow the district's October 14 roadmap: in fall 2029 the valley schools move into one new building. Its Phase 2 says Pre-K to 5, its Phase 3 keeps grades 5-6 at Crossett Brook, and the feasibility study asks about Pre-K to 6. At the October 28 meeting its author said she would keep 5th and 6th graders at Crossett Brook, though in her example a Waitsfield 2nd grader moves to the new building after grade 4. We default to Pre-K to 4, which matches Phase 3; you can change it above. ", cite(ref("oct14", "Draft Proposal for School Reconfiguration & Consolidation Roadmap"), "Oct 14 deck"), " ", cite(ref("meeting1028", "roadmap discussion"))),
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
