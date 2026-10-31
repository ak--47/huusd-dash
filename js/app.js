// Boot and hash router. Each page module exports { title, render(el, ctx) } and may return a cleanup function.
// A link can point at a section: #/findings?at=questions opens the page scrolled to the element with
// id "questions", with focus on its heading.

import { track, pageview } from "./ui/track.js";
import { h, scrollRegions } from "./ui/dom.js";
import { GLOSSARY } from "./ui/glossary.js";
import { STAGING, markStaging } from "./ui/staging.js";

const ROUTES = {
  "": () => import("./pages/overview.js"),
  "your-child": () => import("./pages/journey.js"),
  compare: () => import("./pages/compare.js"),
  options: () => import("./pages/options.js"),
  build: () => import("./pages/build.js"),
  budget: () => import("./pages/budget.js"),
  schools: () => import("./pages/schools.js"),
  findings: () => import("./pages/findings.js"),
  sources: () => import("./pages/sources.js"),
};

const SITE = "Harwood School Plans Explorer";
const view = document.getElementById("view");
let cleanup = null;
let first = true;
let token = 0;
// Back and Forward return readers to where they were on a page. Each history entry gets an id, and the
// scroll position for it is kept as the reader scrolls (in memory: history.replaceState is rate-limited).
const spots = new Map();
let spotCount = 0;

export function parseHash(hash = location.hash) {
  const raw = hash.replace(/^#\/?/, "");
  const [path, query = ""] = raw.split("?");
  return { path: path.replace(/\/$/, ""), params: new URLSearchParams(query) };
}

// Update the query part of the current route without re-rendering or adding history entries.
export function setParams(obj) {
  const { path, params } = parseHash();
  for (const [k, v] of Object.entries(obj)) {
    if (v == null || v === "" || v === false) params.delete(k);
    else params.set(k, String(v));
  }
  const q = params.toString();
  history.replaceState(history.state, "", `#/${path}${q ? `?${q}` : ""}`);
}

export function go(path, params) {
  const q = params ? new URLSearchParams(params).toString() : "";
  location.hash = `#/${path}${q ? `?${q}` : ""}`;
}

async function route() {
  const mine = ++token;
  const spot = history.state?.spot;
  const backTo = spot ? spots.get(spot) : undefined;
  // ids stay unique across reloads, which keep history entries but empty the map
  if (!spot) history.replaceState({ ...history.state, spot: `${Date.now().toString(36)}-${++spotCount}` }, "");
  const { path, params } = parseHash();
  const load = ROUTES[path];
  if (!load) {
    go("");
    return;
  }
  view.setAttribute("aria-busy", "true");
  let mod;
  try {
    mod = (await load()).default;
  } catch (err) {
    console.error(err);
    view.replaceChildren(h("div", { class: "wonk-state", "data-state": "error" }, h("h1", { id: "page-title", tabindex: "-1" }, "This page did not load."), h("p", {}, "Check your connection and reload. If it keeps happening, please report it on GitHub.")));
    view.setAttribute("aria-busy", "false");
    return;
  }
  if (mine !== token) return;
  if (typeof cleanup === "function") cleanup();
  cleanup = null;
  view.replaceChildren();
  try {
    cleanup = mod.render(view, { params, setParams, go });
  } catch (err) {
    console.error(err);
    view.replaceChildren(h("div", { class: "wonk-state", "data-state": "error" }, h("h1", { id: "page-title", tabindex: "-1" }, "Something went wrong drawing this page."), h("p", {}, "Please reload. If it keeps happening, report it on GitHub with the page address.")));
  }
  view.setAttribute("aria-busy", "false");
  document.title = `${STAGING ? "[Staging] " : ""}${path ? `${mod.title} · ${SITE}` : `${SITE}: what Path A and Path B mean for HUUSD`}`;
  for (const a of document.querySelectorAll("[data-route]")) {
    const on = a.dataset.route === path;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  window.wonk?.init(view);
  pageview(path, params);
  const at = params.get("at");
  const wasFirst = first;
  first = false;
  // On the first load the browser keeps its own scroll position; later page changes start at the top.
  // Back and Forward return to where the reader was, even on a page opened at a section.
  if (!wasFirst && backTo != null) {
    jump(() => window.scrollTo(0, backTo));
    document.getElementById("page-title")?.focus({ preventScroll: true });
  } else if (at) {
    requestAnimationFrame(() => {
      if (mine === token && !reveal(at) && !wasFirst) toTop();
    });
  } else if (!wasFirst) toTop();
}

function toTop() {
  jump(() => window.scrollTo(0, 0));
  document.getElementById("page-title")?.focus({ preventScroll: true });
}

// An instant jump: the smooth scrolling in css/app.css is for moves within a page, not page changes.
function jump(fn) {
  const root = document.documentElement;
  const was = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  root.getClientRects(); // apply the style before scrolling
  fn();
  root.style.scrollBehavior = was;
}

// Scroll to the element with this id on the current page and move focus to its heading. A chart or font
// that arrives late can push it down, so it is held in place until the reader scrolls or presses a key,
// for up to three seconds. Returns false when the page has no such element.
const HANDS_ON = ["wheel", "touchstart", "pointerdown", "keydown"];
let unhold = null;

function reveal(id) {
  const target = document.getElementById(id);
  if (!target || !view.contains(target)) return false;
  for (let d = target.closest("details:not([open])"); d; d = d.parentElement?.closest("details:not([open])")) d.open = true;
  const head = target.matches("h1, h2, h3, h4") ? target : (target.querySelector("h1, h2, h3, h4") ?? target);
  if (!head.hasAttribute("tabindex")) head.setAttribute("tabindex", "-1");
  let y = 0;
  let top = 0;
  const align = () => {
    jump(() => target.scrollIntoView(true));
    y = window.scrollY;
    top = target.getBoundingClientRect().top;
  };
  align();
  head.focus({ preventScroll: true });

  unhold?.();
  if (typeof ResizeObserver !== "function") return true;
  const stop = () => {
    hold.disconnect();
    clearTimeout(timer);
    for (const type of HANDS_ON) window.removeEventListener(type, stop, true);
    if (unhold === stop) unhold = null;
  };
  const hold = new ResizeObserver(() => {
    if (!target.isConnected || Math.abs(window.scrollY - y) > 1) stop();
    else if (Math.abs(target.getBoundingClientRect().top - top) > 1) align();
  });
  const timer = setTimeout(stop, 3000);
  for (const type of HANDS_ON) window.addEventListener(type, stop, { capture: true, passive: true });
  hold.observe(view);
  unhold = stop;
  return true;
}

function boot() {
  window.wonk?.glossary(GLOSSARY);
  // The skip link targets #main, which a hash router would treat as a route.
  document.querySelector("[data-skip]")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("main").focus();
  });
  // A link to the address already showing fires no hashchange; a ?at= link still scrolls to its section.
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href^="#/"]') : null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.getAttribute("href") !== location.hash) return;
    const at = parseHash(a.getAttribute("href")).params.get("at");
    if (at && reveal(at)) e.preventDefault();
  });
  // Tables that scroll sideways take keyboard focus, including ones a page redraws later.
  markStaging();
  scrollRegions(view);
  printFolds();
  trackShared();
  watchTopbar();
  wireDrawer();
  window.addEventListener(
    "scroll",
    () => {
      const id = history.state?.spot;
      if (id) spots.set(id, window.scrollY);
    },
    { passive: true }
  );
  window.addEventListener("hashchange", route);
  route();
}

// Interactions every page shares, tracked in one place: opening a fold, following a source or other
// outside link, opening a glossary definition, and printing. A fold counts when the reader clicks its
// summary while it is closed (Enter and Space click too), not when code opens it (?at= links, settings in
// a link, redraws, printing): those fire the same toggle event, but no click.
function trackShared() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest?.("a[href]");
    if (a && a.host && a.host !== location.host) {
      const label = a.getAttribute("aria-label") ?? "";
      track("Source Opened", {
        link_text: a.textContent.replace(/\s+/g, " ").trim().slice(0, 80),
        source: label.includes("Source: ") ? label.split("Source: ")[1].slice(0, 160) : null,
        host: a.host,
        url: a.href.slice(0, 300),
      });
      return;
    }
    const s = e.target.closest?.("summary");
    const d = s?.parentElement;
    if (d instanceof HTMLDetailsElement && !d.open && !e.defaultPrevented && s === d.querySelector(":scope > summary") && view.contains(d)) {
      // a card fold by its headline alone, without its changing facts ("Scored 2 of 7")
      const section = (s.querySelector(".headline") ?? s).textContent.replace(/\s+/g, " ").trim().slice(0, 120);
      track("Section Expanded", { section: section || d.id || "untitled" });
    }
    // a click on a label also clicks its control: count the term once, by its glossary key
    const term = e.target.closest?.("[data-term], .wonk-term");
    if (term && !e.target.closest("input, select, textarea")) track("Glossary Term Opened", { term: term.closest("[data-term]")?.dataset.term ?? term.textContent.trim().slice(0, 60) });
  });
  window.addEventListener("beforeprint", () => track("Page Printed"));
}

// A closed <details> never prints its contents, whatever the CSS says, so a printed page would show the
// folds (study lists, scoring cards, "How to read this") as empty boxes. Open them for printing, then
// close again the ones that were closed. Dropdown menus stay as they are.
function printFolds() {
  let opened = [];
  window.addEventListener("beforeprint", () => {
    opened = [...view.querySelectorAll("details:not([open]):not(.wonk-menu)")];
    for (const d of opened) d.open = true;
  });
  window.addEventListener("afterprint", () => {
    for (const d of opened) d.open = false;
    opened = [];
  });
}

// css/app.css offsets the open drawer and scrolled-to sections by the sticky top bar's height, which grows
// when its text wraps (narrow phones, larger text settings).
function watchTopbar() {
  const bar = document.querySelector(".wonk-topbar");
  if (!bar || typeof ResizeObserver !== "function") return;
  const set = () => document.documentElement.style.setProperty("--topbar-h", `${Math.ceil(bar.getBoundingClientRect().height)}px`);
  new ResizeObserver(set).observe(bar);
  set();
}

// The phone menu (800px and below). wonk.js opens and closes the drawer; Escape and a click outside close it,
// and Escape returns focus to Menu. Here, opening it moves focus into the nav and makes the page behind it
// inert, so Tab runs through the links and then to Menu, which stays visible above the drawer. Closing it
// any other way while focus is in the nav (which then turns inert) also sends focus back to Menu.
function wireDrawer() {
  const menu = document.querySelector("[data-wonk-drawer]");
  const nav = document.getElementById("app-nav");
  if (!menu || !nav) return;
  const behind = [".skip-link", ".topbar-title", "#main", ".site-foot"].map((sel) => document.querySelector(sel)).filter(Boolean);
  const narrow = window.matchMedia("(max-width: 800px)");
  let wasOpen = false;
  new MutationObserver(() => {
    const open = menu.getAttribute("aria-expanded") === "true" && narrow.matches;
    if (open === wasOpen) return;
    wasOpen = open;
    for (const el of behind) el.inert = open;
    if (open) track("Menu Opened");
    const focused = document.activeElement;
    if (open) {
      if (!nav.contains(focused)) (nav.querySelector('[aria-current="page"]') ?? nav.querySelector("a[href]"))?.focus();
    } else if (narrow.matches && (!focused || focused === document.body || nav.contains(focused))) {
      menu.focus();
    }
  }).observe(menu, { attributes: true, attributeFilter: ["aria-expanded"] });
}

// wonk.js loads with defer; module scripts run after deferred scripts, but wait for DOM to be safe.
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
