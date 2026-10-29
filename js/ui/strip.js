// A child's school path drawn as one row of grade cells, grouped into schools.

import { gradeKey } from "../../data/enrollment.js";
import { h, plural } from "./dom.js";
import { schoolName, schoolShort } from "./kit.js";

const gLabel = (g) => (g === -2 ? "PK3" : g === -1 ? "PK4" : g === 0 ? "K" : String(g));
const rangeLabel = (a, b) => {
  const word = (g) => (g === -2 ? "Pre-K 3" : g === -1 ? "Pre-K 4" : g === 0 ? "K" : String(g));
  if (a === b) return a <= 0 ? word(a) : `Grade ${a}`;
  if (b <= 0) return `${word(a)}–${word(b)}`;
  return `${a <= 0 ? word(a) : `Grades ${a}`}–${b}`;
};

// years: from journey(); base: the no-change journey for the same child (to mark changes)
export function strip(years, { base = null, showPreK = false, label = "" } = {}) {
  const shown = years.filter((y) => y.school && (showPreK || y.grade >= 0));
  const baseBy = new Map((base ?? []).map((y) => [y.fall, y.school]));
  const segs = [];
  for (const y of shown) {
    const last = segs.at(-1);
    const changed = base ? baseBy.get(y.fall) !== y.school : false;
    if (last && last.school === y.school && last.to === y.grade - 1) {
      last.to = y.grade;
      last.years.push(y);
      last.changed ||= changed;
    } else {
      segs.push({ school: y.school, from: y.grade, to: y.grade, years: [y], changed });
    }
  }
  const first = shown[0]?.grade ?? 0;
  const cols = 12 - first + 1;
  const now = years.find((y) => y.current);

  const summary = segs.map((s) => `${schoolName(s.school)}, ${rangeLabel(s.from, s.to).toLowerCase()}`).join("; ");
  const wrap = h("div", { class: "strip", style: `--cols:${cols}` });
  wrap.append(
    h(
      "div",
      { class: "strip-axis", "aria-hidden": "true" },
      shown.map((y) => h("span", { class: `strip-tick${y.current ? " is-now" : ""}`, style: `--col:${y.grade - first + 1}` }, gLabel(y.grade)))
    )
  );
  const list = h("ol", { class: "strip-segs", "aria-label": label ? `${label}: ${summary}` : summary });
  segs.forEach((s, i) => {
    const hasNow = now && s.from <= now.grade && now.grade <= s.to;
    const allPast = s.years.every((y) => y.past);
    list.append(
      h(
        "li",
        {
          class: [
            "seg",
            i % 2 ? "seg--b" : "seg--a",
            s.changed ? "seg--changed" : "",
            allPast ? "seg--past" : "",
            hasNow ? "seg--now" : "",
            s.school === "PRIVATE" || s.school === "OTHER" ? "seg--outside" : "",
            s.to - s.from < 1 ? "seg--narrow" : s.to - s.from < 2 ? "seg--two" : "",
          ].join(" "),
          style: `--start:${s.from - first + 1};--span:${s.to - s.from + 1}`,
          "data-tip": `${schoolName(s.school)} · ${rangeLabel(s.from, s.to)}${s.years[0] ? ` · ${s.years[0].schoolYear}${s.years.length > 1 ? ` to ${s.years.at(-1).schoolYear}` : ""}` : ""}${s.changed ? " · differs from no change" : ""}`,
          "data-tip-focus": "off",
        },
        h("span", { class: "seg-name" }, schoolShort(s.school)),
        h("span", { class: "seg-code", "aria-hidden": "true" }, s.school === "PRIVATE" ? "PVT" : s.school === "OTHER" ? "OTH" : s.school),
        h("span", { class: "seg-grades" }, rangeLabel(s.from, s.to))
      )
    );
  });
  wrap.append(list);
  return wrap;
}

export function countLine(counts, extra) {
  return h(
    "p",
    { class: "count-line" },
    h("strong", { class: "wonk-num" }, plural(counts.schools, "school")),
    h("span", { class: "sep", "aria-hidden": "true" }, " · "),
    plural(counts.buildings, "building"),
    h("span", { class: "sep", "aria-hidden": "true" }, " · "),
    plural(counts.moves, "move"),
    extra != null && extra !== 0 ? h("span", { class: `delta ${extra > 0 ? "delta--more" : "delta--fewer"}` }, ` (${extra > 0 ? "+" : ""}${extra} vs. no change)`) : null
  );
}

export { gLabel, rangeLabel, gradeKey };
