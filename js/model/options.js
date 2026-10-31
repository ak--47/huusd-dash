// Options beyond "Path A or Path B", each a complete plan the model can score the same way.
// Wording is neutral: each option says what it does and what is uncertain about it.

import { PAIRS } from "../../data/district-scenarios.js";
import { ref } from "../../data/sources.js";
import { PLAN_A, makePlan, pathB } from "./plans.js";

export const OPTIONS = [
  {
    id: "A",
    group: "district",
    name: "Path A",
    what: "Keep all seven buildings and make the full cut from programs and services.",
    plan: PLAN_A,
    notes: ["Cuts $1.36M from transportation (daily routes, field trips, and technical-school rides; the deck does not say which routes would end), ends district Pre-K classes, and cuts athletics and activities by 70%."],
  },
  {
    id: "B",
    group: "district",
    name: "Path B",
    what: "Close two of the four valley elementary schools and move Crossett Brook's 7th and 8th graders to Harwood. Twelve versions: six pairs of schools, with grades 5-6 at Crossett Brook or in the valley.",
    family: PAIRS.flatMap((pair) => [pathB(pair, 4), pathB(pair, 6)]),
    notes: ["In a straw poll on October 28, the board agreed to keep developing Path B. Which two schools is not decided."],
  },
  {
    id: "B-FW-K6",
    group: "b-variant",
    name: "Path B, grades 5-6 stay in the valley: Fayston + Warren",
    what: "Fayston and Warren stay open as K-6 schools. Waitsfield children go to Fayston; Moretown children go to Brookside and Crossett Brook in Waterbury and Duxbury. Portable classrooms at Fayston and Brookside.",
    plan: makePlan({ ...pathB(["FES", "WRN"], 6), id: "B-FW-K6", portables: { FES: 2, BPS: 1 } }),
    notes: [
      "Passes the wastewater test as the slides apply it (students only), once the slide's totals are corrected. If staff count, as they do in Fayston's permit and normally in Brookside's occupancy limit, it is over at both.",
      "Includes about 2 portable units at Fayston and 1 at Brookside, enough to reach the consultant's classroom capacity.",
    ],
    refs: [ref("deck", "slides 29 and 32"), ref("permitFES", "PDF p. 8")],
  },
  {
    id: "B-MW-K6",
    group: "b-variant",
    name: "Path B, grades 5-6 stay in the valley: Moretown + Waitsfield, if Waitsfield's limit is 300 students",
    what: "Moretown and Waitsfield stay open as K-6 schools. Fayston and Warren children go to Waitsfield. Uses the 300-student limit in Waitsfield's 1991 state permit instead of the 230 on the slides.",
    plan: makePlan({ ...pathB(["MES", "WES"], 6), id: "B-MW-K6", septicWES: true, portables: { WES: 4, MES: 1 } }),
    notes: [
      "Waitsfield would hold 297 students: under the 1991 permit's 300 if staff are not counted, about 50 over if they are. A 1996 letter in the state's permit file says 230, and the slides use 230.",
      "Includes about 4 portable units at Waitsfield and 1 at Moretown, enough to reach the consultant's classroom capacity.",
    ],
    refs: [ref("permitWES", "PDF p. 12, condition 1.2"), ref("permitWES1996", "PDF pp. 9-10"), ref("deck", "slide 23")],
  },
  {
    id: "B-center",
    group: "b-variant",
    name: "Pre-K center plan: close Fayston, turn a second valley building into the district's Pre-K center, and merge the middle schools",
    what: "Fayston closes, and one more valley school stops teaching K-6 and becomes the Pre-K center for the whole district, Brookside's Pre-K included. The two other valley schools and Brookside each teach K-6: Crossett Brook's 5th and 6th graders move to Brookside and every 7th and 8th grader goes to Harwood, so Crossett Brook's building holds no classes. Suggested by residents after the site launched, in two versions, and scored the same way as the others.",
    // the first version is the card's plan (Build's "Pre-K center plan" starting point)
    plan: makePlan({
      id: "B-center",
      open: ["WES", "WRN"],
      valleyTop: 6,
      msMerge: true,
      bpsTop: 6,
      prekCenter: { school: "MES", scope: "all" },
      split: { fayston: { WRN: 0.33 }, moretown: { BPS: 0.33 } },
    }),
    versions: [
      {
        id: "B-center",
        center: "MES",
        name: "Moretown as the Pre-K center",
        what: "Waitsfield and Warren teach K-6. About two thirds of Fayston's children go to Waitsfield and a third to Warren; about two thirds of Moretown's K-6 children go to Waitsfield and a third to Brookside.",
        notes: [
          "Savings: the district's figures for closing two K-6 schools and merging the middle schools, minus Moretown's building operating costs ($185,868, not counting custodial staff). That is $404,328 over the target on paper.",
          "Brookside would hold about 461 students: under its occupancy of 480 counting students only, over it if staff count (about 553 with our staff estimate), and 62 over the consultant's classroom capacity of 399. Waitsfield would hold about 252: 22 over the slides' 230, under the 1991 permit's 300 (about 297 with our staff estimate, which that permit does not count), and 78 over the consultant's 174. Fitting Waitsfield under 230 would take a permit increase or sending about 22 more children to Warren, which has room. Warren (about 116) and Moretown (118 Pre-K children) are within every limit. Reaching the consultant's classroom space would take about 2 portable units each at Brookside and Waitsfield.",
          "If Crossett Brook keeps its 5th and 6th graders instead (a choice in Build a plan): Brookside holds about 315 and needs no portables, Crossett Brook about 146, Waterbury and Duxbury children attend 4 K-12 schools instead of 3, and 64 fewer students change schools.",
        ],
      },
      {
        id: "B-center-WES",
        center: "WES",
        name: "Waitsfield as the Pre-K center",
        what: "Waitsfield's building, near the middle of the valley, is the Pre-K center; Moretown and Warren teach K-6. About 80% of Waitsfield's K-6 children go to Moretown and 20% to Warren; about 80% of Fayston's go to Warren and 20% to Moretown. Those shares are a starting point some families suggested.",
        plan: makePlan({
          id: "B-center-WES",
          open: ["MES", "WRN"],
          valleyTop: 6,
          msMerge: true,
          bpsTop: 6,
          prekCenter: { school: "WES", scope: "all" },
          receiving: { waitsfield: "MES" },
          split: { waitsfield: { WRN: 0.2 }, fayston: { MES: 0.2 } },
        }),
        notes: [
          "Savings: the same district figures, minus Waitsfield's building operating costs ($196,038, about $10,000 more than Moretown's). That is $394,158 over the target on paper.",
          "Waitsfield's disputed wastewater limit stops mattering: its 118 Pre-K children fit under 230 or 300. Moretown would hold about 238 K-6 students: 3 over the slides' 235 (about 3 more Waitsfield children going to Warren would bring it under) and 73 over the consultant's 165. Warren would hold about 176: under its 237, and 21 over the consultant's 155. Brookside would hold about 415: under its occupancy of 480 counting students only, over it if staff count (about 498 with our staff estimate), and 16 over the consultant's 399. Under the permits' reading, which counts staff at Moretown and Warren, no split of these two towns fits both schools: one is always slightly over. Reaching the consultant's classroom space would take about 2 portable units at Moretown, 1 at Warren, and 1 at Brookside.",
          "About 351 K-12 students change schools, 52 fewer than with Moretown as the center, because Moretown's children stay where they are. Waitsfield and Fayston children would attend 4 K-12 schools; everyone else 3.",
        ],
      },
    ],
    notes: [
      "The merger figure is an upper limit because valley 5th and 6th graders stay in the valley. Nothing is counted for an empty Crossett Brook: the district has published no operating cost for it, and an empty building still needs heat, power, and upkeep, more so during repairs.",
      "Pre-K staff: the district's Path B tables already plan Pre-K classes in both valley schools that stay open, so its savings figure likely still pays for Pre-K teachers; here they would teach at the center instead. Not counted: staff a Pre-K-only building may need, such as a custodian, office staff, or a nurse. The margin over the target is the room for those costs, and less if the merger saves less than the district's figure.",
      "No portable classrooms are included; either version would need about 4 units to reach the consultant's classroom space, about $1.2M to $1.4M over two years, a one-time cost outside the yearly savings (step 6 in Build a plan adds them). The splits are estimates: the district's tables send most of a town to one school, and we do not know where families live. Build a plan lets you set each share to the percent. Waterbury and Duxbury 3- and 4-year-olds would go to the center for Pre-K, unless it serves valley families only.",
      "On October 28 a board member asked to see versions with Pre-K in one of the closed buildings instead of in the schools that stay open. An administrator offered to bring one, adding that it \"would be keeping a building. So our numbers are going to be going down.\"",
    ],
    refs: [ref("deck", "slide 22"), ref("deck", "slides 17-18"), ref("deck", "slides 27-32"), ref("truexCap", "Capacities"), ref("meeting1028", "Pre-K in a separate building")],
  },
  {
    id: "K6x3-center",
    group: "other",
    name: "Three valley K-6 schools and a Pre-K center: keep every building, merge the middle schools",
    what: "Waitsfield's building becomes a Pre-K center for valley families; Fayston, Moretown, and Warren teach K-6, and grades 5-6 stay in the valley. Crossett Brook's 7th and 8th graders move to Harwood. No building closes. Waitsfield's K-6 children go to the nearest open school, Fayston, unless you split them in Build a plan. Suggested by a resident, who proposed testing each valley building as the center, Waitsfield first because it sits near the middle of the valley.",
    plan: makePlan({ id: "K6x3-center", open: ["FES", "MES", "WRN"], valleyTop: 6, msMerge: true, prekCenter: { school: "WES", scope: "valley" } }),
    notes: [
      "Savings: the district's merger figure (an upper limit, since valley 5th and 6th graders stay in the valley), plus our estimate for ending one school's K-6 classes (half the district's figure for closing two), minus Waitsfield's building operating costs ($196,038). That is about $2.82M: about $519,000 short of the district's target and about $19,000 short of the lower one. With Fayston, Moretown, or Warren as the center instead, only the building's operating costs change (about $2.83M to $2.84M).",
      "Both figures it rests on may not hold, as its suggester points out. The district costed the merger with valley 5th and 6th graders filling Crossett Brook, and the board's question-and-answer document says closing one school \"does not look like it would save enough money to make it worthwhile.\" Its suggester proposes asking the district to cost it, and accepting a smaller budget increase or penalty in FY28 while the state's funding formula changes.",
      "Every building stays in use, so its deferred maintenance stays too. Fayston would hold about 190 K-6 students: under its 250 on the slides, and 51 over the consultant's 139. Moretown (137) and Warren (87) have room, so a split of Waitsfield's children would ease Fayston. Brookside keeps its own Pre-K.",
    ],
    refs: [ref("deck", "slides 17-18"), ref("qdoc", "closing one school"), ref("truexCap", "Capacities")],
  },
  {
    id: "MS-only",
    group: "other",
    name: "Merge the middle schools, keep all four valley schools",
    what: "Crossett Brook's 7th and 8th graders move to Harwood. No valley school closes. The rest of the savings would come from cuts or a penalty.",
    plan: makePlan({ id: "MS-only", msMerge: true }),
    notes: ["Uses the district's middle school savings figure as an upper limit."],
  },
  {
    id: "MS+cuts",
    group: "other",
    name: "Merge the middle schools, keep all four valley schools, and make three smaller cuts",
    what: "Crossett Brook's 7th and 8th graders move to Harwood, every valley school stays open through grade 6, and three of Path A's smaller cuts fill the rest: special programming, the Pre-K tuition model, and athletics and activities. Daily busing and intervention staff stay.",
    plan: makePlan({ id: "MS+cuts", msMerge: true, cuts: ["special", "prek", "athletics"] }),
    notes: [
      "Every plan that closes no school and keeps busing has to merge the middle schools and make at least three of Path A's five smaller cuts; this is one of those combinations. The students who change schools are about 130 Crossett Brook 7th and 8th graders, the same students who move in every Path B version, and district Pre-K classes end (about 118 children a year).",
      "Its largest number comes from Path B. The district costed the merger ($2,102,942) with valley 5th and 6th graders filling Crossett Brook; on October 28 the finance director said keeping only Crossett Brook's own 5th and 6th graders there means fewer staff cuts. This version meets the district's target only if the merger still saves at least $1,926,000; on October 14 the district put the merger at $1,783,005. Against the lower target it needs $1,425,812.",
      "The three cuts are among those the district called devastating. Special programming (Farm to School, outdoor education, and learning center supports) has not been itemized; the athletics line includes $85,000 of athletic travel; and the district says private Pre-K programs lack room.",
    ],
    refs: [ref("deck", "slides 13 and 18"), ref("oct14", "savings estimates"), ref("meeting1028", "merger without valley grades 5-6")],
  },
  ...["FES", "MES", "WES", "WRN"].map((closed) => ({
    id: `MS+close-${closed}`,
    group: "one-closure",
    closed,
    name: `Merge the middle schools and close one valley school`,
    what: "Crossett Brook's 7th and 8th graders move to Harwood, and one valley school closes; its students go to the nearest open school. Grades 5-6 stay in the valley.",
    plan: makePlan({ id: `MS+close-${closed}`, msMerge: true, open: ["FES", "MES", "WES", "WRN"].filter((x) => x !== closed) }),
    notes: [
      "The district has not published a figure for closing one school. We use half its figure for closing two. The board's question-and-answer document says closing one \"does not look like it would save enough money to make it worthwhile,\" because staff would move rather than all be cut, and an administrator said on October 28: \"One building will not get us to where we need to be.\" The real saving is likely lower.",
    ],
    refs: [ref("qdoc", "closing one school"), ref("meeting1028", "closing one school")],
  })),
  {
    id: "two-only",
    group: "other",
    name: "Close two valley schools, keep both middle schools",
    what: "Two valley schools close; Crossett Brook stays a grades 5-8 school. The rest of the savings would come from cuts or a penalty. Shown here for Moretown + Warren staying open, with valley 5th and 6th graders at Crossett Brook.",
    plan: makePlan({ id: "two-only", open: ["MES", "WRN"], valleyTop: 4 }),
    notes: ["Uses the district's savings figure for closing two valley schools."],
  },
];
