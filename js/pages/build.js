// Build a plan: the levers the district used, plus a few it did not test. A resident changes them
// and sees the budget, buildings, and students update. The plan lives in the URL (so it can be
// shared) and in local storage (so "Your child's path" can show it as "Your plan").
//
// URL keys: the plan's own (o, t, m, c, s, p, r: see encodePlan), cs (class sizes, when not the
// defaults), and x=1 (the lower savings target, as on the Options page).

import { h, store } from "../ui/dom.js";
import { note, pageHead } from "../ui/kit.js";
import { track } from "../ui/track.js";
import { CS_DEFAULT, PORT_MAX, buildControls, csExpand, csFromString, csIsDefault, csToString, centerPlan, hybridPlan, onePlan, pairId } from "../ui/build-controls.js";
import { resultsPanel, verdictSentence } from "../ui/build-results.js";
import { PLAN_A, PLAN_TODAY, closedSchools, decodePlan, effectiveSplit, encodePlan, evaluate, makePlan, pathB, receivingOptions } from "../model/index.js";
import { PATH_A_CUTS } from "../../data/budget.js";

// every query key encodePlan can write; absent keys are cleared from the URL. "n" is the district's
// draft roadmap (a new valley building in fall 2029).
const PLAN_KEYS = ["o", "t", "m", "b", "c", "s", "p", "r", "n", "k", "sp"];

// A link's list of open valley schools: "-" for none, or letters from F, M, W, R. Anything else
// (a typo, or a link cut short) would decode as "every school closes", so it is not read.
const readableOpen = (o) => o === "-" || /^[FMWR]{1,4}$/.test(o);

// Keep a plan consistent with itself and with these controls: no portables or septic work at a
// closed school, no more portable units than the steppers offer, no receiving choice that is not
// open or that is already the nearest-school default, and no town shares that are the default anyway
// (the district's, with two valley schools open; otherwise all to the receiving school).
const sameShares = (a, b) => JSON.stringify(Object.entries(a ?? {}).sort()) === JSON.stringify(Object.entries(b ?? {}).sort());
function tidy(plan) {
  const portables = Object.fromEntries(
    Object.entries(plan.portables)
      .filter(([id]) => id === "BPS" || plan.open.includes(id))
      .map(([id, n]) => [id, Math.min(PORT_MAX, n)])
  );
  const receiving = {};
  for (const [town, id] of Object.entries(plan.receiving)) {
    const opts = receivingOptions(plan, town);
    if (opts.includes(id) && opts[0] !== id) receiving[town] = id;
  }
  const withRecv = makePlan({ ...plan, portables, receiving, septicWES: plan.septicWES && plan.open.includes("WES") });
  const mine = effectiveSplit(withRecv);
  const defaults = effectiveSplit({ ...withRecv, split: {} });
  const split = Object.fromEntries(Object.entries(withRecv.split).filter(([town]) => !sameShares(mine[town], defaults[town])));
  return makePlan({ ...withRecv, split });
}

const samePlan = (a, b) => encodePlan(a) === encodePlan(b);
const basisOf = (v) => (v === "exclusion" ? "exclusion" : "district");

// Analytics: the parts of a plan that "Plan Changed" names when they change. canon() ignores object key order.
const PARTS = ["open", "valleyTop", "msMerge", "bpsTop", "cuts", "septicWES", "portables", "receiving", "split", "prekCenter", "roadmap"];
const canon = (v) => JSON.stringify(v && typeof v === "object" && !Array.isArray(v) ? Object.entries(v).sort() : v);

// The "Plan Changed" event's properties: the plan's settings and its main results (evaluate's r)
function planProps(p, r) {
  const { budget: b, capacity: cap } = r;
  return {
    plan_code: encodePlan(p),
    open_schools: p.open,
    closed_schools: closedSchools(p),
    valley_top: p.valleyTop,
    middle_merge: p.msMerge,
    brookside_top: p.bpsTop,
    cuts: p.cuts,
    prek_center: p.prekCenter?.school ?? null,
    prek_center_scope: p.prekCenter?.scope ?? null,
    splits: Object.entries(p.split).flatMap(([town, s]) => (Object.keys(s).length ? Object.entries(s).map(([id, x]) => `${town}>${id} ${Math.round(x * 100)}%`) : [`${town}>all`])),
    portable_units: Object.values(p.portables).reduce((a, n) => a + n, 0),
    waitsfield_300: p.septicWES,
    roadmap: Boolean(p.roadmap),
    savings: Math.round(b.savings),
    gap: Math.round(b.gap), // negative: over the target
    meets_target: b.gap <= 0,
    upper_bound: b.upperBound,
    buildings_in_use: r.buildingsOpen,
    max_schools_per_child: r.maxYoung.all,
    students_changing_schools: r.moved.k12,
    over_wastewater: cap.overPeople,
    over_classrooms: [...cap.overConsultant, ...cap.overMiddle], // the consultant's classroom space
    target_basis: b.basis === "exclusion" ? "lower" : "district",
    reading: cap.reading,
  };
}

export default {
  title: "Build a plan",
  render(el, { params, setParams }) {
    const o = params.get("o");
    const unreadable = o != null && !readableOpen(o);
    const fromUrl = unreadable ? null : decodePlan(params.toString());
    // Program cuts this page does not know (a link cut short mid-word, say) are dropped by decodePlan. Say so,
    // since the plan that opens is then a different one: Path A minus a cut misses the target.
    const badCuts = fromUrl ? (params.get("c") ?? "").split(".").filter((t) => t && !PATH_A_CUTS.items.some((c) => c.id === t)) : [];
    const saved = store.get("plan", null);
    const fromStore = !fromUrl && typeof saved === "string" ? decodePlan(saved) : null;
    const urlCs = csFromString(params.get("cs"));
    const urlBasis = params.has("x") ? (params.get("x") === "1" ? "exclusion" : "district") : null;
    const state = {
      // start neutral: all four valley schools open, grades 5-6 in the valley, no merger, no cuts
      plan: tidy(fromUrl ?? fromStore ?? makePlan({})),
      // A shared link shows exactly what its sender saw: its own class sizes and target, or the
      // defaults. The viewer's saved settings apply only when no plan arrives in the link.
      cs: urlCs ?? (fromUrl ? { ...CS_DEFAULT } : (csFromString(store.get("buildCs", null)) ?? { ...CS_DEFAULT })),
      basis: urlBasis ?? (fromUrl ? "district" : basisOf(store.get("buildBasis", null))),
      reading: params.get("w") === "permits" ? "permits" : fromUrl ? "slides" : store.get("buildReading", null) === "permits" ? "permits" : "slides",
      undo: null, // { plan, kind } after a preset replaces the plan: the plan Undo restores, and the preset used
    };

    // The URL always shows the current plan. The browser remembers it only once the viewer changes
    // something here, so opening someone's link never replaces the viewer's own class sizes or target.
    const persist = ({ save = true } = {}) => {
      const q = Object.fromEntries(new URLSearchParams(encodePlan(state.plan)));
      const patch = Object.fromEntries(PLAN_KEYS.map((k) => [k, q[k] ?? null]));
      patch.cs = csIsDefault(state.cs) ? null : csToString(state.cs);
      patch.x = state.basis === "exclusion" ? 1 : null;
      patch.w = state.reading === "permits" ? "permits" : null;
      setParams(patch);
      if (save) {
        store.set("plan", encodePlan(state.plan));
        store.set("buildCs", csIsDefault(state.cs) ? null : csToString(state.cs));
        store.set("buildBasis", state.basis === "exclusion" ? "exclusion" : null);
        store.set("buildReading", state.reading === "permits" ? "permits" : null);
      }
    };

    const live = h("p", { class: "wonk-sr", role: "status", "aria-live": "polite" });
    let liveTimer = null;
    // The same words twice in a row are not read again, so a change whose results read the same (a receiving
    // school the district's table ignores, say) empties the region first and then speaks it again.
    const announce = (r) => {
      clearTimeout(liveTimer);
      liveTimer = setTimeout(() => {
        const next = verdictSentence(r);
        if (next === live.textContent) {
          live.textContent = "";
          liveTimer = setTimeout(() => (live.textContent = next), 50);
        } else live.textContent = next;
      }, 450);
    };

    // Analytics. Changes from the controls go out about 1.2 seconds after the last one, as one "Plan Changed"
    // listing the parts that differ from the plan last sent (and "Class Sizes Changed"). A starting point or
    // Undo sends its own event instead. flush() sends what is waiting before any other event, so they stay in order.
    let shown = null; // the latest evaluate() result
    let sent = { plan: state.plan, cs: csToString(state.cs) };
    let timer = null;
    const flush = () => {
      clearTimeout(timer);
      const changed = PARTS.filter((k) => canon(state.plan[k]) !== canon(sent.plan[k]));
      if (changed.length) track("Plan Changed", { changed, ...planProps(state.plan, shown) });
      const cs = csToString(state.cs);
      if (cs !== sent.cs) track("Class Sizes Changed", { class_sizes: cs });
      sent = { plan: state.plan, cs };
    };
    const later = () => {
      clearTimeout(timer);
      timer = setTimeout(flush, 1200);
    };
    const send = (event, props) => {
      flush();
      track(event, props);
    };
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);

    const refresh = ({ speak = true } = {}) => {
      const classSize = csExpand(state.cs);
      const r = evaluate(state.plan, { classSize, basis: state.basis, reading: state.reading });
      shown = r;
      controls.sync(state.plan, r);
      results.update(state.plan, r, { cs: state.cs, classSize });
      if (speak) announce(r);
    };

    const setPlan = (next, preset = null) => {
      const prev = state.plan;
      state.plan = tidy(makePlan(next));
      if (preset) {
        // a run of preset changes (say, stepping through Path B versions) undoes to where it began
        const origin = state.undo?.plan ?? prev;
        state.undo = samePlan(origin, state.plan) ? null : { plan: origin, ...preset };
      } else {
        state.undo = null;
      }
      persist();
      refresh();
      if (preset) sent.plan = state.plan;
      else later();
    };

    const controls = buildControls({
      state,
      onPlan: (fn) => setPlan(fn(state.plan)),
      onPreset: (kind, { pair, top, closed, center }) => {
        const which = kind === "B" ? { pairing: pairId(pair), setup: top === 4 ? "pk4" : "k6" } : kind === "one" ? { closed_school: closed } : kind === "center" ? { center_school: center } : {};
        send("Starting Point Chosen", { preset: kind, ...which });
        setPlan(
          kind === "today"
            ? PLAN_TODAY
            : kind === "A"
              ? PLAN_A
              : kind === "one"
                ? onePlan(closed)
                : kind === "hybrid"
                  ? hybridPlan()
                  : kind === "center"
                    ? centerPlan(center)
                    : pathB(pair, top),
          { kind }
        );
      },
      onUndo: () => {
        if (!state.undo) return;
        send("Plan Undone", { preset_before: state.undo.kind });
        state.plan = tidy(state.undo.plan);
        state.undo = null;
        sent.plan = state.plan;
        persist();
        refresh();
      },
      onClassSize: (cs) => {
        state.cs = cs;
        persist();
        refresh();
        later();
      },
      onBasis: (basis) => {
        send("Savings Target Changed", { target: basisOf(basis) === "exclusion" ? "lower" : "district" });
        state.basis = basisOf(basis);
        persist();
        refresh();
      },
      onReading: (reading) => {
        send("Wastewater Reading Changed", { reading: reading === "permits" ? "permits" : "slides" });
        state.reading = reading === "permits" ? "permits" : "slides";
        persist();
        refresh();
      },
    });
    const results = resultsPanel({ onShowBasis: () => controls.showBasis() });
    // a click in the results (copy the link, your child's path, compare) sends a change still waiting first
    results.el.addEventListener("click", flush, true);

    el.append(
      h(
        "div",
        { class: "bp" },
        pageHead({
          kicker: "Same levers, your choices",
          title: "Build your own plan",
          lede: "Start from no change, Path A, or Path B. Then open or close schools, move grades, and switch the six Path A program cuts on and off. The budget, the buildings, and how many schools children attend update as you go. Where the district did not publish a number, we label our estimate.",
        }),
        unreadable
          ? note(
              "warn",
              h("strong", {}, "This link's plan could not be read. "),
              `The list of schools in it is not one this page knows, so the page starts from ${fromStore ? "the plan you last built here" : "no change"} instead. The link may have been cut short.`
            )
          : null,
        badCuts.length
          ? note(
              "warn",
              h("strong", {}, "Part of this link could not be read. "),
              "Some program cuts in it are not ones this page knows, so they were left out. The link may have been cut short."
            )
          : null,
        h("div", { class: "bp-layout" }, h("div", { class: "bp-controls-col" }, controls.el, results.bar), results.el),
        live
      )
    );

    persist({ save: false });
    // A plan that arrives in a shared link is saved, so it shows as "Your plan" on the Your child's
    // path page. An untouched default is not saved.
    if (fromUrl) store.set("plan", encodePlan(state.plan));
    refresh({ speak: false });

    return () => {
      clearTimeout(liveTimer);
      results.destroy();
      flush(); // leaving the page: a change still waiting goes out now
      document.removeEventListener("visibilitychange", onHide);
    };
  },
};
