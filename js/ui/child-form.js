// The "your child" inputs: home town, grade this year, school this year, and (optionally) Pre-K.
// A child is encoded in the URL as town.grade.school[.pk], e.g. "waitsfield.0.WES".

import { TOWNS, SCHOOLS } from "../../data/schools.js";
import { PLAN_TODAY, defaultSchool, serves } from "../model/index.js";
import { h } from "./dom.js";

export const GRADE_OPTIONS = [
  [-2, "Pre-K (age 3)"],
  [-1, "Pre-K (age 4)"],
  [0, "Kindergarten"],
  ...Array.from({ length: 12 }, (_, i) => [i + 1, `Grade ${i + 1}`]),
];

export const PK_OPTIONS = [
  ["", "Don't count Pre-K"],
  ["BPS", "Brookside (Waterbury)"],
  ["MES", "Moretown"],
  ["WRN", "Warren"],
  ["PRIVATE", "A private Pre-K program"],
  ["OTHER", "Somewhere else"],
];

export function encodeChild(c) {
  return [c.town, c.grade, c.school || "", c.pk || ""].join(".").replace(/\.+$/, "");
}

export function decodeChild(s) {
  const [town, grade, school, pk] = String(s).split(".");
  const g = Number(grade);
  if (!TOWNS.some((t) => t.id === town) || !Number.isInteger(g) || g < -2 || g > 12) return null;
  const okSchool = school && (SCHOOLS[school] || school === "PRIVATE" || school === "OTHER") ? school : defaultSchoolToday(town, g);
  return { town, grade: g, school: okSchool, pk: pk && (SCHOOLS[pk] || pk === "PRIVATE" || pk === "OTHER") ? pk : "" };
}

// What analytics records about a child: home town and grade (the form's index and label), nothing else.
export function childProps(code) {
  const c = decodeChild(code);
  return c ? { town: c.town, grade: c.grade, grade_label: GRADE_OPTIONS.find(([g]) => g === c.grade)[1] } : {};
}

export function defaultSchoolToday(town, grade) {
  if (grade < 0) return { waterbury: "BPS", duxbury: "BPS", moretown: "MES", warren: "WRN" }[town] ?? "PRIVATE";
  return defaultSchool(PLAN_TODAY, town, grade);
}

// Schools a child in this grade could attend this year (their town's, or another by choice).
export function schoolChoices(grade) {
  if (grade < 0) return [["BPS", "Brookside Primary"], ["MES", "Moretown Elementary"], ["WRN", "Warren Elementary"], ["PRIVATE", "A private Pre-K program"], ["OTHER", "Somewhere else"]];
  return Object.values(SCHOOLS)
    .filter((s) => serves(PLAN_TODAY, s.id, grade))
    .map((s) => [s.id, s.name]);
}

let uid = 0;

export function childForm({ compact = false, value = null, onSubmit, onChange, submitLabel = "Show the path" } = {}) {
  const id = `cf${++uid}`;
  const v = value ?? { town: "waitsfield", grade: 0, school: "WES", pk: "" };
  const form = h("form", { class: "child-form", "aria-label": "Your child" });

  const town = h("select", { class: "wonk-select", id: `${id}-town`, name: "town" }, TOWNS.map((t) => h("option", { value: t.id, selected: t.id === v.town }, t.name)));
  const grade = h("select", { class: "wonk-select", id: `${id}-grade`, name: "grade" }, GRADE_OPTIONS.map(([g, label]) => h("option", { value: g, selected: g === v.grade }, label)));
  const school = h("select", { class: "wonk-select", id: `${id}-school`, name: "school" });
  const pk = h("select", { class: "wonk-select", id: `${id}-pk`, name: "pk" }, PK_OPTIONS.map(([val, label]) => h("option", { value: val, selected: val === (v.pk || "") }, label)));

  const fillSchools = (keep) => {
    const g = Number(grade.value);
    const def = defaultSchoolToday(town.value, g);
    const opts = schoolChoices(g);
    school.replaceChildren(...opts.map(([sid, label]) => h("option", { value: sid }, sid === def ? `${label} (usual for ${TOWNS.find((t) => t.id === town.value).name})` : label)));
    school.value = keep && opts.some(([sid]) => sid === keep) ? keep : def;
    pkField.hidden = g < 0;
  };

  const current = () => ({ town: town.value, grade: Number(grade.value), school: compact ? defaultSchoolToday(town.value, Number(grade.value)) : school.value, pk: compact || Number(grade.value) < 0 ? "" : pk.value });

  const field = (label, control, hint) =>
    h("div", { class: "wonk-field" }, h("label", { class: "wonk-label", for: control.id }, label), control, hint ? h("span", { class: "wonk-help" }, hint) : null);

  const pkField = field("Pre-K", pk, "Optional. Waitsfield and Fayston have no Pre-K classes in their buildings.");
  const row = h("div", { class: "field-row" }, field("Home town", town), field("Grade this year (2026-27)", grade));
  form.append(row);
  if (!compact) form.append(h("div", { class: "field-row" }, field("School this year", school), pkField));
  form.append(h("div", { class: "btn-row" }, h("button", { type: "submit", class: "wonk-btn wonk-btn--primary" }, submitLabel)));

  fillSchools(v.school);
  town.addEventListener("change", () => { fillSchools(null); onChange?.(encodeChild(current())); });
  grade.addEventListener("change", () => { fillSchools(school.value); onChange?.(encodeChild(current())); });
  school.addEventListener("change", () => onChange?.(encodeChild(current())));
  pk.addEventListener("change", () => onChange?.(encodeChild(current())));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    onSubmit?.(encodeChild(current()));
  });
  return form;
}
