// Boot and hash router. Each page module exports { title, render(el, ctx) } and may return a cleanup function.
// A link can point at a section: #/findings?at=questions opens the page scrolled to the element with
// id "questions", with focus on its heading.

import { h, scrollRegions } from "./ui/dom.js";
import { GLOSSARY } from "./ui/glossary.js";

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
  history.replaceState(null, "", `#/${path}${q ? `?${q}` : ""}`);
}

export function go(path, params) {
  const q = params ? new URLSearchParams(params).toString() : "";
  location.hash = `#/${path}${q ? `?${q}` : ""}`;
}

async function route() {
  const mine = ++token;
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
  document.title = path ? `${mod.title} · ${SITE}` : `${SITE}: what Path A and Path B mean for HUUSD`;
  for (const a of document.querySelectorAll("[data-route]")) {
    const on = a.dataset.route === path;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  }
  window.wonk?.init(view);
  const at = params.get("at");
  const wasFirst = first;
  first = false;
  // On the first load the browser keeps its own scroll position; later page changes start at the top.
  if (at) {
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
  scrollRegions(view);
  watchTopbar();
  wireDrawer();
  window.addEventListener("hashchange", route);
  route();
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
