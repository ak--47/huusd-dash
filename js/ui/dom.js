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
