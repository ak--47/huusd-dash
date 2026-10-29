// Small DOM and formatting helpers. Data never goes through innerHTML.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, String(v));
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export const frag = (...children) => {
  const f = document.createDocumentFragment();
  append(f, children);
  return f;
};

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---- scroll regions ----
// A .table-scroll box that scrolls sideways has to take keyboard focus, or keyboard and switch users
// can't reach its hidden columns (WCAG 2.1.1). While a box scrolls and holds nothing focusable, it gets
// tabindex="0", role="region", and its table's caption as a name; otherwise those come off again. A box
// a page set up itself (it already had a role or tabindex) is left alone. Watching root covers tables a
// page redraws in place, and size changes (rotation, zoom, a fold opening) are re-checked.
const TABBABLE = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function scrollRegions(root) {
  const mine = new Set();
  const theirs = new WeakSet();
  const fit = (box) => {
    const scrolls = box.scrollWidth > box.clientWidth + 1 || box.scrollHeight > box.clientHeight + 1;
    if (scrolls && !box.querySelector(TABBABLE)) {
      box.tabIndex = 0;
      box.setAttribute("role", "region");
      box.setAttribute("aria-label", box.querySelector("caption")?.textContent.trim() || "Table");
    } else if (box.hasAttribute("tabindex") && document.activeElement !== box) {
      box.removeAttribute("tabindex");
      box.removeAttribute("role");
      box.removeAttribute("aria-label");
    }
  };
  const resized = typeof ResizeObserver === "function" ? new ResizeObserver((entries) => entries.forEach((e) => mine.has(e.target) && fit(e.target))) : null;
  const scan = () => {
    for (const box of mine) {
      if (box.isConnected) continue;
      mine.delete(box);
      resized?.unobserve(box);
    }
    for (const box of root.querySelectorAll(".table-scroll")) {
      if (theirs.has(box)) continue;
      if (!mine.has(box)) {
        if (box.hasAttribute("tabindex") || box.hasAttribute("role")) {
          theirs.add(box);
          continue;
        }
        mine.add(box);
        resized?.observe(box);
      }
      fit(box);
    }
  };
  // One pass per frame, after wonk.js has made tooltip targets focusable (its observer runs first).
  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      scan();
    });
  };
  new MutationObserver(queue).observe(root, { childList: true, subtree: true });
  scan();
}

// ---- numbers ----
const MINUS = "−";
const nf = new Intl.NumberFormat("en-US");

export const num = (n, digits = 0) =>
  n == null || Number.isNaN(n) ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n).replace("-", MINUS);

export const money = (n, digits = 0) => (n == null || Number.isNaN(n) ? "—" : `${n < 0 ? MINUS : ""}$${num(Math.abs(n), digits)}`);

// $3.34M, $590K, $912
export function moneyShort(n) {
  if (n == null || Number.isNaN(n)) return "—";
  const a = Math.abs(n);
  const sign = n < 0 ? MINUS : "";
  if (a >= 1e6) return `${sign}$${(a / 1e6).toFixed(a >= 1e7 ? 1 : 2).replace(/\.?0+$/, "")}M`;
  if (a >= 1e4) return `${sign}$${Math.round(a / 1e3)}K`;
  if (a >= 1e3) return `${sign}$${(a / 1e3).toFixed(1).replace(/\.0$/, "")}K`;
  return `${sign}$${nf.format(Math.round(a))}`;
}

export const signed = (n, f = num) => (n > 0 ? `+${f(n)}` : n < 0 ? f(n) : f(0));

export const pct = (r, digits = 0) => (r == null ? "—" : `${num(r * 100, digits)}%`);

export const plural = (n, one, many = `${one}s`) => `${num(n)} ${n === 1 ? one : many}`;

export function listJoin(items, word = "and") {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} ${word} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, ${word} ${items.at(-1)}`;
}

export function dateLong(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return d ? `${months[m - 1]} ${d}, ${y}` : `${months[m - 1]} ${y}`;
}

// ---- storage: per-viewer conveniences only; the page works without it ----
export const store = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(`hspe:${key}`);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`hspe:${key}`, JSON.stringify(value));
    } catch {
      /* private mode or blocked storage: keep going */
    }
  },
};
