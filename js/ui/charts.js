// Plot labels its inner <g> elements with aria-label, which is not allowed on a plain group.
// The chart figure already has role="img" and a label, and every chart has a table view,
// so the inner labels are removed after each render.
export function quietPlotAria(el) {
  const strip = () => el.querySelectorAll("svg g[aria-label], svg [aria-label]:not(svg)").forEach((n) => n.removeAttribute("aria-label"));
  strip();
  const mo = new MutationObserver(strip);
  mo.observe(el, { childList: true, subtree: true });
  return () => mo.disconnect();
}

// d3 and Plot are about 490 KB, and only some pages draw charts, so they load on first use.
let loading = null;
const addScript = (src) =>
  new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.onload = resolve;
    el.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(el);
  });

export function loadCharts() {
  if (window.Plot && window.wonkCharts) return Promise.resolve();
  loading ??= (window.d3 ? Promise.resolve() : addScript("wonk/vendor/d3/d3.min.js"))
    .then(() => (window.Plot ? null : addScript("wonk/vendor/plot/plot.umd.min.js")))
    .then(() => (window.wonkCharts ? null : addScript("wonk/wonk-charts.js")));
  return loading;
}
