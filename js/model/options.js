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
