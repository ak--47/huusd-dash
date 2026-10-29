// Build a plan: the levers the district used, plus a few it did not test. A resident changes them
// and sees the budget, buildings, and students update. The plan lives in the URL (so it can be
// shared) and in local storage (so "Your child's path" can show it as "Your plan").
//
// URL keys: the plan's own (o, t, m, c, s, p, r: see encodePlan), cs (class sizes, when not the
// defaults), and x=1 (the lower savings target, as on the Options page).

import { h, store } from "../ui/dom.js";
import { note, pageHead } from "../ui/kit.js";
import { CS_DEFAULT, PORT_MAX, buildControls, csExpand, csFromString, csIsDefault, csToString } from "../ui/build-controls.js";
import { resultsPanel, verdictSentence } from "../ui/build-results.js";
import { PLAN_A, PLAN_TODAY, decodePlan, encodePlan, evaluate, makePlan, pathB, receivingOptions } from "../model/index.js";

// every query key encodePlan can write; absent keys are cleared from the URL. "n" is the district's
// draft roadmap (a new valley building in fall 2029).
const PLAN_KEYS = ["o", "t", "m", "c", "s", "p", "r", "n"];

// A link's list of open valley schools: "-" for none, or letters from F, M, W, R. Anything else
// (a typo, or a link cut short) would decode as "every school closes", so it is not read.
const readableOpen = (o) => o === "-" || /^[FMWR]{1,4}$/.test(o);

// Keep a plan consistent with itself and with these controls: no portables or septic work at a
// closed school, no more portable units than the steppers offer, no receiving choice that is not
// open or that is already the nearest-school default.
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
  return makePlan({ ...plan, portables, receiving, septicWES: plan.septicWES && plan.open.includes("WES") });
}

const samePlan = (a, b) => encodePlan(a) === encodePlan(b);
const basisOf = (v) => (v === "exclusion" ? "exclusion" : "district");

export default {
  title: "Build a plan",
  render(el, { params, setParams }) {
    const o = params.get("o");
    const unreadable = o != null && !readableOpen(o);
    const fromUrl = unreadable ? null : decodePlan(params.toString());
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
    const announce = (r) => {
      clearTimeout(liveTimer);
      liveTimer = setTimeout(() => {
        live.textContent = verdictSentence(r);
      }, 450);
    };

    const refresh = ({ speak = true } = {}) => {
      const classSize = csExpand(state.cs);
      const r = evaluate(state.plan, { classSize, basis: state.basis, reading: state.reading });
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
    };

    const controls = buildControls({
      state,
      onPlan: (fn) => setPlan(fn(state.plan)),
      onPreset: (kind, { pair, top }) => setPlan(kind === "today" ? PLAN_TODAY : kind === "A" ? PLAN_A : pathB(pair, top), { kind }),
      onUndo: () => {
        if (!state.undo) return;
        state.plan = tidy(state.undo.plan);
        state.undo = null;
        persist();
        refresh();
      },
      onClassSize: (cs) => {
        state.cs = cs;
        persist();
        refresh();
      },
      onBasis: (basis) => {
        state.basis = basisOf(basis);
        persist();
        refresh();
      },
      onReading: (reading) => {
        state.reading = reading === "permits" ? "permits" : "slides";
        persist();
        refresh();
      },
    });
    const results = resultsPanel({ onShowBasis: () => controls.showBasis() });

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
        h("div", { class: "bp-layout" }, h("div", { class: "bp-controls-col" }, controls.el, results.bar), results.el),
        live
      )
    );

    persist({ save: false });
    // A plan that arrives in a shared link is saved, so it shows as "Your plan" on the Your child's
    // path page. An untouched default is not saved.
    if (fromUrl) store.set("plan", encodePlan(state.plan));
    refresh({ speak: false });

    return () => clearTimeout(liveTimer);
  },
};
