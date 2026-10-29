// Town-by-grade table of how many K-12 schools a child would attend under a plan.

import { gradeLabel, gradeKey } from "../../data/enrollment.js";
import { schoolCountGrid } from "../model/index.js";
import { h } from "./dom.js";

const head = (g) => (g === -2 ? "PK3" : g === -1 ? "PK4" : g === 0 ? "K" : String(g));

export function heatGrid(plan, { includePreK = false, caption = "Number of different K-12 schools, by home town and grade this year" } = {}) {
  const grid = schoolCountGrid(plan, { includePreK });
  const grades = grid[0].cells.map((c) => c.grade);
  const table = h(
    "table",
    { class: "heat" },
    h("caption", { class: "wonk-sr" }, caption),
    h("thead", {}, h("tr", {}, h("th", { scope: "col" }, h("span", { class: "wonk-sr" }, "Town")), grades.map((g) => h("th", { scope: "col", "aria-label": gradeLabel(gradeKey(g)) }, head(g))))),
    h(
      "tbody",
      {},
      grid.map((row) =>
        h(
          "tr",
          {},
          h("th", { scope: "row" }, row.name),
          row.cells.map((c) =>
            h(
              "td",
              { class: `h${Math.min(6, Math.max(3, c.schools))}` },
              String(c.schools),
              c.extra > 0 ? h("span", { class: "up" }, `+${c.extra}`) : null
            )
          )
        )
      )
    )
  );
  const key = h(
    "div",
    { class: "heat-key", "aria-hidden": "true" },
    h("span", {}, "Schools:"),
    [3, 4, 5, 6].map((n) => h("span", {}, h("span", { class: `sw h${n}` }, String(n)), n === 6 ? " or more" : "")),
    h("span", {}, "+1 or +2 = more than today")
  );
  return h("div", { class: "heat-block" }, h("div", { class: "heat-wrap", tabindex: "0", role: "region", "aria-label": caption }, table), key);
}
