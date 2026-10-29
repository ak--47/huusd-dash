import { h, money, moneyShort, num, plural } from "../ui/dom.js";
import { cite, fold, pageHead, section, tag, term } from "../ui/kit.js";
import { ATTENDING, PREK_2026, RESIDENTS_2026 } from "../../data/enrollment.js";
import { FACILITIES, MUSIC, SCHOOLS, TOWNS, VALLEY, OPERATING_COST_NOTE } from "../../data/schools.js";
import { PAIRS } from "../../data/district-scenarios.js";
import { DRIVE, LOCATIONS } from "../../data/geo.js";
import { ref } from "../../data/sources.js";

const SVG = "http://www.w3.org/2000/svg";
const s = (tag, attrs = {}, ...kids) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, String(v));
  for (const k of kids) el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return el;
};

const ORDER = ["BPS", "CBMS", "HU", "MES", "WES", "FES", "WRN"];
const NAME = { ...Object.fromEntries(Object.entries(SCHOOLS).map(([k, v]) => [k, v.name])), HU: "Harwood Union Middle and High School" };
const SHORT = { ...Object.fromEntries(Object.entries(SCHOOLS).map(([k, v]) => [k, v.short])), HU: "Harwood Union" };
const sum = (o) => Object.values(o ?? {}).reduce((a, b) => a + b, 0);

export default {
  title: "The schools",
  render(el) {
    const rows = ORDER.map((id) => {
      const y = [2024, 2025, 2026].map((yr) => sum(ATTENDING[yr][id]));
      const pk = PREK_2026.bySchool[id] ? PREK_2026.bySchool[id].PK3 + PREK_2026.bySchool[id].PK4 : 0;
      return { id, y, pk };
    });
    const total = [2024, 2025, 2026].map((yr) => ATTENDING.printedTotals[yr].all);

    el.append(
      pageHead({
        kicker: "Seven buildings, six towns",
        title: "The school buildings",
        lede: "Students, space, condition, and running costs for each building, from the district's facility profiles and its October 1 enrollment report.",
      }),

      section(
        { id: "enrollment", title: "Students in each building", intro: "Kindergarten through grade 12 on October 1 of each year. Pre-K is listed separately." },
        h(
          "div",
          { class: "table-scroll" },
          h(
            "table",
            { class: "wonk-table" },
            h("caption", { class: "wonk-sr" }, "K-12 students by building, October 1, 2024 to 2026"),
            h(
              "thead",
              {},
              h(
                "tr",
                {},
                h("th", { scope: "col" }, "Building"),
                h("th", { scope: "col" }, "Grades"),
                h("th", { scope: "col", class: "num" }, "2024"),
                h("th", { scope: "col", class: "num" }, "2025"),
                h("th", { scope: "col", class: "num" }, "2026"),
                h("th", { scope: "col", class: "num" }, "Change since 2024"),
                h("th", { scope: "col", class: "num" }, "Pre-K 2026")
              )
            ),
            h(
              "tbody",
              {},
              rows.map((r) =>
                h(
                  "tr",
                  {},
                  h("th", { scope: "row" }, NAME[r.id]),
                  h("td", {}, r.id === "HU" ? "7-12" : SCHOOLS[r.id].grades),
                  r.y.map((v) => h("td", { class: "num" }, num(v))),
                  h("td", { class: "num" }, `${r.y[2] - r.y[0] > 0 ? "+" : ""}${num(r.y[2] - r.y[0])}`),
                  h("td", { class: "num" }, r.pk ? num(r.pk) : "—")
                )
              ),
              h(
                "tr",
                { class: "total-row" },
                h("th", { scope: "row" }, "District"),
                h("td", {}, "K-12"),
                total.map((v) => h("td", { class: "num" }, h("strong", {}, num(v)))),
                h("td", { class: "num" }, h("strong", {}, num(total[2] - total[0]))),
                h("td", { class: "num" }, num(PREK_2026.inDistrict))
              )
            )
          )
        ),
        h("p", { class: "small" }, tag("district"), " ", cite(ref("enroll", "p. 1")), ` Pre-K: ${num(PREK_2026.inDistrict)} children in district schools and ${num(PREK_2026.privateAct166.total)} in private programs paid with public tuition. Waitsfield and Fayston have no Pre-K classes. `, cite(ref("enroll", "p. 3"), "Oct 1 report, p. 3"))
      ),

      section(
        { id: "map", title: "Where the buildings are", intro: "Driving times from each town's center to each building, from OpenStreetMap road data. Bus rides take longer because buses stop along the way." },
        h("div", { class: "map-split" }, mapFigure(), driveTable())
      ),

      section(
        { id: "profiles", title: "Building by building", intro: "Open a building for its full profile. Figures are the district's, except classroom capacity (from the district's planning consultant) and permit wording (from the state permits)." },
        h(
          "div",
          { class: "fold-all-row" },
          h(
            "div",
            { class: "wonk-fold-all", role: "group", "aria-label": "Building profiles" },
            h("button", { type: "button", class: "wonk-btn wonk-btn--quiet", "data-wonk-fold-all": "open", "data-target": "#profiles-list" }, "Open all"),
            h("button", { type: "button", class: "wonk-btn wonk-btn--quiet", "data-wonk-fold-all": "close", "data-target": "#profiles-list" }, "Close all")
          )
        ),
        h("div", { id: "profiles-list", class: "profiles" }, ["BPS", ...VALLEY].map(profileCard), cbCard(), huCard())
      ),

      section(
        { id: "music", title: "Music today: shared specialists", intro: "The district's example of how small schools share staff. Each valley school gets a quarter of a music teacher." },
        h(
          "div",
          { class: "table-scroll" },
          h(
            "table",
            { class: "wonk-table" },
            h("caption", { class: "wonk-sr" }, "Music staffing and minutes by school"),
            h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "School"), h("th", { scope: "col", class: "num" }, "Music teacher (FTE)"), h("th", { scope: "col" }, "Music room"), h("th", { scope: "col" }, "General music, K-4"), h("th", { scope: "col" }, "Grades 5-6 each week"))),
            h(
              "tbody",
              {},
              MUSIC.rows.map((r) =>
                h("tr", {}, h("th", { scope: "row" }, SHORT[r.school]), h("td", { class: "num" }, String(r.fte)), h("td", {}, r.space), h("td", {}, r.k4 ?? "—"), h("td", {}, r.g56 ?? "—"))
              )
            )
          )
        ),
        h("p", { class: "small" }, tag("district"), " ", cite(MUSIC.src))
      )
    );
  },
};

function profileCard(id) {
  const f = FACILITIES[id];
  const kids = sum(ATTENDING[2026][id]);
  const pk = PREK_2026.bySchool[id] ? PREK_2026.bySchool[id].PK3 + PREK_2026.bySchool[id].PK4 : 0;
  const res = RESIDENTS_2026[id];
  const idcOut = res ? Object.values(res).reduce((a, r) => a + r[1], 0) : 0;
  const idcIn = res ? Object.values(res).reduce((a, r) => a + r[3], 0) : 0;
  const tuition = res ? Object.values(res).reduce((a, r) => a + r[4], 0) : 0;
  const openIn = VALLEY.includes(id) ? PAIRS.filter((p) => p.includes(id)).length : null;
  const limit = id === "BPS" ? `Occupancy ${num(f.occupancy)}` : `${num(f.wastewater)}${id === "WES" ? ' ("amenable to 300")' : ""}${id === "FES" ? " (240 in the October 14 table)" : ""}`;

  const facts = [
    ["Students, K-12", `${num(kids)}${pk ? ` plus ${num(pk)} in Pre-K` : ""}`],
    ["Grades", SCHOOLS[id].grades],
    ["Students by grade", gradeBar(ATTENDING[2026][id])],
    [
      "Choice and tuition students",
      res
        ? `${num(idcIn)} by intradistrict choice${tuition ? `, ${plural(tuition, "tuition student")}` : ""}; ${num(idcOut)} local students attend another district school`
        : "—",
    ],
    ["Classrooms", num(f.classrooms)],
    id === "BPS"
      ? [
          "Occupancy limit",
          h(
            "span",
            {},
            `On the slides: maximum occupancy ${num(f.occupancy)}. Brookside is on town sewer and water (the town allots it 8,200 gallons a day), so the district lists no wastewater permit limit for it. Building occupancy normally counts everyone in the building. `,
            cite(f.permit.src)
          ),
        ]
      : [
          h("span", {}, "Wastewater limit ", term("wastewater", "(?)")),
          h("span", {}, `On the slides: ${limit}. In the state permit: ${f.permit.wording}. `, cite(f.permit.src)),
        ],
    ["Classroom capacity", h("span", {}, `${num(f.consultantCapacity)} students including Pre-K, by the district's planning consultant `, cite(ref("truexCap", "Capacities")))],
    ["Staff", `${num(f.fte, 2)} FTE`],
    ["Building", `${num(f.sqft)} sq ft · ${f.land}`],
    [h("span", {}, term("deferred", "Deferred maintenance")), `${money(f.deferredMaintenance)} (priority 1: ${money(f.priority1)})`],
    ["Near-term repairs", f.impending ? `${money(f.impending)}${f.maintenance.length ? `: ${f.maintenance.join(", ").toLowerCase()}` : ""}` : `None listed${f.maintenance.length ? `; priority work: ${f.maintenance.join(", ").toLowerCase()}` : ""}`],
    ["Yearly operating cost", h("span", {}, money(f.operatingCost), " ", h("span", { class: "small muted" }, "excluding custodial pay"))],
    ["Kitchen", f.kitchen],
    ["Outdoors", f.outdoors],
    ["Heat and power", f.heat],
    ["Address", LOCATIONS.schools[id].address],
  ];
  return h(
    "details",
    { class: "wonk-card wonk-card--fold", "data-fold-key": `school-${id}` },
    h(
      "summary",
      {},
      h("span", { class: "headline" }, SCHOOLS[id].name),
      h("span", { class: "facts" }, `${num(kids)} students · ${num(f.classrooms)} classrooms · ${moneyShort(f.deferredMaintenance)} deferred maintenance${openIn != null ? ` · open in ${openIn} of 6 Path B pairings` : ""}`)
    ),
    h("div", { class: "body" }, h("dl", { class: "facts" }, facts.map(([k, v]) => [h("dt", {}, k), h("dd", {}, v)])), h("p", { class: "small" }, tag("district"), " ", cite(f.src), " ", cite(ref("enroll", "pp. 1, 6-7"), "Oct 1 report"), " ", h("span", { class: "muted" }, OPERATING_COST_NOTE)))
  );
}

function cbCard() {
  const kids = sum(ATTENDING[2026].CBMS);
  return h(
    "details",
    { class: "wonk-card wonk-card--fold", "data-fold-key": "school-CBMS" },
    h("summary", {}, h("span", { class: "headline" }, SCHOOLS.CBMS.name), h("span", { class: "facts" }, `${num(kids)} students · grades 5-8 today, 5-6 under Path B`)),
    h(
      "div",
      { class: "body" },
      h(
        "dl",
        { class: "facts" },
        [
          ["Students, grades 5-8", `${num(kids)}`],
          ["Students by grade", gradeBar(ATTENDING[2026].CBMS)],
          ["Under Path B", "Keeps grades 5-6 (the district calls it Crossett Brook Upper Elementary). Its 7th and 8th graders move to Harwood. In the versions that send grades 5-6 to Crossett Brook, every valley 5th and 6th grader comes here too."],
          ["Wastewater", "621 occupants (9,325 gallons a day at 15 per person), per the district's October 14 table"],
          ["Classroom capacity", "359 students, by the district's planning consultant (March 2025)"],
          ["Address", LOCATIONS.schools.CBMS.address],
        ].map(([k, v]) => [h("dt", {}, k), h("dd", {}, v)])
      ),
      h("p", { class: "small" }, tag("district"), " ", cite(ref("enroll", "p. 1"), "Oct 1 report"), " ", cite(ref("oct14", "Building Capacity and Wastewater permitting"), "Oct 14 deck"), " ", cite(ref("deck", "slide 18")))
    )
  );
}

function huCard() {
  const hu = ATTENDING[2026].HU;
  return h(
    "details",
    { class: "wonk-card wonk-card--fold", "data-fold-key": "school-HU" },
    h("summary", {}, h("span", { class: "headline" }, "Harwood Union Middle and High School"), h("span", { class: "facts" }, `${num(hu[7] + hu[8])} in grades 7-8 · ${num(hu[9] + hu[10] + hu[11] + hu[12])} in grades 9-12 · one campus`)),
    h(
      "div",
      { class: "body" },
      h(
        "dl",
        { class: "facts" },
        [
          ["Harwood Union Middle School", `${num(hu[7] + hu[8])} students in grades 7-8 (valley towns today)`],
          ["Harwood Union High School", `${num(hu[9] + hu[10] + hu[11] + hu[12])} students in grades 9-12, including early college`],
          ["Under Path B", `Becomes the district's only 7th and 8th grade school. Crossett Brook's ${num(ATTENDING[2026].CBMS[7] + ATTENDING[2026].CBMS[8])} 7th and 8th graders this year would have moved here.`],
          ["Wastewater", "1,000 students and staff, per the state permit and the district's October 14 table"],
          ["Middle school classroom capacity", "166 students in grades 7-8, by the district's planning consultant (March 2025). Under Path B, this year's grade 7-8 students from both middle schools would number about 257."],
          ["Address", LOCATIONS.schools.HU.address],
        ].map(([k, v]) => [h("dt", {}, k), h("dd", {}, v)])
      ),
      h("p", { class: "small" }, tag("district"), " ", cite(ref("enroll", "pp. 1, 7"), "Oct 1 report"), " ", cite(ref("oct14", "Building Capacity and Wastewater permitting"), "Oct 14 deck"))
    )
  );
}

function gradeBar(byGrade) {
  const entries = Object.entries(byGrade).sort((a, b) => (a[0] === "K" ? -1 : b[0] === "K" ? 1 : Number(a[0]) - Number(b[0])));
  const max = Math.max(...entries.map(([, n]) => n));
  return h(
    "div",
    { class: "gbars", role: "list" },
    entries.map(([g, n]) =>
      h("div", { class: "gbar", role: "listitem", "aria-label": `${g === "K" ? "Kindergarten" : `Grade ${g}`}: ${n}` }, h("span", { class: "gbar-fill", style: `--h:${(n / max) * 100}%` }), h("span", { class: "gbar-n" }, String(n)), h("span", { class: "gbar-g" }, g))
    )
  );
}

function mapFigure() {
  const pts = { ...LOCATIONS.schools };
  const lat0 = 44.35, lat1 = 44.105, lon0 = -72.905, lon1 = -72.735;
  const k = 2400;
  const cos = Math.cos((44.22 * Math.PI) / 180);
  const W = Math.round((lon1 - lon0) * cos * k) + 140;
  const H = Math.round((lat0 - lat1) * k) + 40;
  const X = (lon) => 20 + (lon - lon0) * cos * k;
  const Y = (lat) => 20 + (lat0 - lat) * k;
  const svg = s("svg", { viewBox: `0 0 ${W} ${H}`, class: "school-map", role: "img", "aria-labelledby": "map-title map-desc" });
  svg.append(s("title", { id: "map-title" }, "Map of HUUSD school buildings"), s("desc", { id: "map-desc" }, "Brookside and Crossett Brook are in the north near Waterbury. Harwood Union and Moretown Elementary are in the middle. Waitsfield, Fayston, and Warren elementary schools are in the south. The site under study for one central valley school is in northern Waitsfield."));
  // town labels
  for (const t of Object.values(LOCATIONS.towns)) {
    if (t.label.startsWith("Fayston")) continue;
    svg.append(s("text", { x: X(t.lon) + 14, y: Y(t.lat) + 22, class: "map-town" }, t.label));
  }
  // scale bar: 5 miles of latitude
  const mile = k / 69;
  svg.append(s("line", { x1: 24, x2: 24 + 5 * mile, y1: H - 14, y2: H - 14, class: "map-scale" }), s("text", { x: 24, y: H - 20, class: "map-small" }, "5 miles"));
  // north arrow
  svg.append(s("text", { x: W - 26, y: 30, class: "map-small", "text-anchor": "middle" }, "N"), s("line", { x1: W - 26, x2: W - 26, y1: 36, y2: 60, class: "map-scale" }));
  const label = { BPS: "Brookside", CBMS: "Crossett Brook", HU: "Harwood Union", MES: "Moretown", WES: "Waitsfield", FES: "Fayston", WRN: "Warren", NEW: "Site under study" };
  const dx = { BPS: 10, CBMS: 10, HU: -10, MES: 10, WES: 10, FES: 10, WRN: 10, NEW: 10 };
  for (const [id, p] of Object.entries(pts)) {
    const x = X(p.lon), y = Y(p.lat);
    const proposed = id === "NEW";
    svg.append(
      proposed ? s("rect", { x: x - 6, y: y - 6, width: 12, height: 12, class: "map-site" }) : s("circle", { cx: x, cy: y, r: 7, class: "map-school" }),
      s("text", { x: x + dx[id], y: y + 4, class: proposed ? "map-label map-label--site" : "map-label", "text-anchor": dx[id] < 0 ? "end" : "start" }, label[id])
    );
  }
  return h(
    "figure",
    { class: "map-fig" },
    svg,
    h(
      "figcaption",
      { class: "small muted" },
      "School locations from NCES. The square is 193 Home Farm Way in Waitsfield (the Cabot Creamery building), the site in the district's feasibility study for one valley school; the draft roadmap does not name a site. ",
      cite(LOCATIONS.src, "NCES"),
      " ",
      cite(ref("rfp", "scope"))
    )
  );
}

function driveTable() {
  const ids = ["BPS", "CBMS", "HU", "MES", "WES", "FES", "WRN"];
  const label = { BPS: "Brookside", CBMS: "Crossett Br.", HU: "Harwood", MES: "Moretown", WES: "Waitsfield", FES: "Fayston", WRN: "Warren" };
  const towns = TOWNS.map((t) => t.id);
  return h(
    "div",
    { class: "drive" },
    h("h3", {}, "Minutes by car from each town's center"),
    h(
      "div",
      { class: "table-scroll" },
      h(
        "table",
        { class: "wonk-table drive-table" },
        h("caption", { class: "wonk-sr" }, "Driving minutes from each town center to each school building"),
        h("thead", {}, h("tr", {}, h("th", { scope: "col" }, "From"), ids.map((id) => h("th", { scope: "col", class: "num" }, label[id])))),
        h(
          "tbody",
          {},
          towns.map((t) =>
            h(
              "tr",
              {},
              h("th", { scope: "row" }, LOCATIONS.towns[t]?.label ?? TOWNS.find((x) => x.id === t).name),
              ids.map((id) => {
                const v = DRIVE.townToSchool[t][id];
                return h("td", { class: "num", "data-tip-focus": "off" }, v ? String(v[1]) : "—");
              })
            )
          )
        )
      )
    ),
    h("p", { class: "small muted" }, DRIVE.note, " ", cite(DRIVE.src, "OSRM"))
  );
}
