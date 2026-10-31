// The staging copy of the site lives at /staging/ next to the live site (see "Staging and live" in AGENTS.md).
// The code is the same on both; it only knows which one it is from its address. No imports, so dom.js can
// use it.

export const STAGING = /\/staging(\/|$)/.test(globalThis.location?.pathname ?? "");

/** The live site's address for the page the reader is on. */
export function liveHref() {
  return `${location.pathname.replace(/staging(\/.*)?$/, "")}${location.hash}`;
}

/** On staging: a notice above the top bar, "Staging" in the tab title, and no search indexing. */
export function markStaging() {
  if (!STAGING) return;
  const robots = document.createElement("meta");
  robots.name = "robots";
  robots.content = "noindex, nofollow";
  document.head.append(robots);
  const bar = document.createElement("div");
  bar.className = "staging-bar";
  bar.setAttribute("role", "note");
  const live = document.createElement("a");
  live.href = liveHref();
  live.textContent = "Go to the live site";
  const lead = document.createElement("strong");
  lead.textContent = "Staging preview, not the live site.";
  bar.append(lead, " This copy tests changes still being worked on, so its numbers and wording may be wrong or change. ", live);
  // keep the link on the same page as the reader moves around
  window.addEventListener("hashchange", () => (live.href = liveHref()));
  document.querySelector(".shell-main")?.prepend(bar);
}
