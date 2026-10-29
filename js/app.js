// Boot and hash router. Each page module exports { title, render(el, ctx) } and may return a cleanup function.

import { h } from "./ui/dom.js";
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
  if (!first) {
    window.scrollTo({ top: 0 });
    document.getElementById("page-title")?.focus({ preventScroll: true });
  }
  first = false;
}

function boot() {
  window.wonk?.glossary(GLOSSARY);
  // The skip link targets #main, which a hash router would treat as a route.
  document.querySelector("[data-skip]")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("main").focus();
  });
  window.addEventListener("hashchange", route);
  route();
}

// wonk.js loads with defer; module scripts run after deferred scripts, but wait for DOM to be safe.
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
