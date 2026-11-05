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
    notes: ["In a straw poll on November 4, the board chose to plan around Moretown + Warren staying open (Fayston and Waitsfield closing). The closure vote is set for January 6."],
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
      "At the November 2 committee meeting, a board member said moving Crossett Brook's 5th and 6th graders back to Brookside was looked at last year and \"was going to be incredibly challenging and tight squeeze... it wasn't logistically feasible,\" with concerns about the cafeteria. The superintendent said that for Brookside he \"would go with the functional capacity,\" the consultant's 399, rather than the occupancy of 480. On moving Pre-K to a building of its own he said: \"We would not recommend that for next year without... a lot of further work and research.\"",
    ],
    refs: [ref("deck", "slide 22"), ref("deck", "slides 17-18"), ref("deck", "slides 27-32"), ref("truexCap", "Capacities"), ref("meeting1028", "Pre-K in a separate building"), ref("meeting1102", "Brookside and Pre-K")],
  },
  {
    id: "K6x3-center",
    group: "other",
    name: "Three valley K-6 schools and a Pre-K center: keep every building, merge the middle schools",
    what: "Waitsfield's building becomes a Pre-K center for valley families; Fayston, Moretown, and Warren teach K-6, and grades 5-6 stay in the valley. Crossett Brook's 7th and 8th graders move to Harwood. No building closes. Waitsfield's K-6 children go to the nearest open school, Fayston, unless you split them in Build a plan. Suggested by a resident, who proposed testing each valley building as the center, Waitsfield first because it sits near the middle of the valley.",
    plan: makePlan({ id: "K6x3-center", open: ["FES", "MES", "WRN"], valleyTop: 6, msMerge: true, prekCenter: { school: "WES", scope: "valley" } }),
    notes: [
      "Savings: the district's figure for closing one valley school with the middle schools merged and grades 5-6 kept in the valley, $2,304,281 in all (November 4), minus Waitsfield's building operating costs ($196,038). That is about $2.11M: about $1.23 million short of the district's target and about $731,000 short of the lower one (about $431,000 short of it counting the health insurance update). With Fayston, Moretown, or Warren as the center instead, only the building's operating costs change (about $2.12M to $2.13M). Before November 2 the site used our own estimate here, about $2.82M.",
      "Its suggester proposed accepting a smaller budget increase or penalty in FY28 while the state's funding formula changes. On November 2 the superintendent said of moving Pre-K: \"We would not recommend that for next year without... a lot of further work and research.\"",
      "Every building stays in use, so its deferred maintenance stays too. Fayston would hold about 190 K-6 students: under its 250 on the slides, and 51 over the consultant's 139. Moretown (137) and Warren (87) have room, so a split of Waitsfield's children would ease Fayston. Brookside keeps its own Pre-K.",
    ],
    refs: [ref("deck1104", "slide 10"), ref("deck", "slide 23"), ref("truexCap", "Capacities")],
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
      "Its largest number comes from Path B. The district costed the merger ($2,102,942) with valley 5th and 6th graders filling Crossett Brook; on October 28 the finance director said keeping only Crossett Brook's own 5th and 6th graders there means fewer staff cuts. This version meets the district's target only if the merger still saves at least $1,926,000; on October 14 the district put the merger at $1,783,005. Against the lower target it needs $1,425,812. On November 4 the district put the merger plus one closure, with grades 5-6 in the valley, at $2,304,281 in all, so, if that total is simply the merger plus the one closure (our arithmetic), the merger alone would reach $1,926,000 only if closing that school saved less than about $378,000.",
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
      "Savings: the district's figure for this plan, given at the November 2 committee meeting and presented on November 4: $2,304,281 in all, with 21 positions (Path B: $3.93 million and 32.5), which its slide calls a net loss of $1,625,188 in savings. The finance director said keeping valley 5th and 6th graders in the valley leaves about 131 students at Crossett Brook, which \"still impacts the merger of the middle schools.\" Counting the lower health insurance rates she announced the same day, it would still mean a penalty of $165,324 in FY28, and in FY29 either a $325,299 penalty or at least $350,000 more in cuts. No portable classrooms would be needed, \"but they're larger, much larger class sizes.\" She did not say which school; the site uses the figure for each.",
    ],
    refs: [ref("deck1104", "slides 10-11"), ref("meeting1102", "closing one school"), ref("qdoc", "closing one school")],
  })),
  {
    id: "K4x3",
    group: "other",
    name: "Close one valley school instead of two, with Path B's grades",
    what: "One valley school closes and the other three teach Pre-K to grade 4, with every 5th and 6th grader in the district at Crossett Brook and every 7th and 8th grader at Harwood, as in Path B. The closed school's children go to the nearest open school. Compared with Path B, one more valley building stays open; Crossett Brook is as full as in Path B, which is what the district's merger figure assumes. The district has costed this grade setup only with two closures. Shown with each school closing.",
    // the first version is the card's plan
    plan: makePlan({ id: "K4x3", open: ["MES", "WES", "WRN"], valleyTop: 4, msMerge: true }),
    versions: [
      {
        id: "K4x3",
        closed: "FES",
        name: "Fayston closes",
        what: "Fayston's children go to Waitsfield, whose kitchen already sends meals to Fayston.",
        notes: [
          "Every elementary school stays within the consultant's capacity: Waitsfield about 164 students (of 174), Moretown 124 (of 165), Warren 103 (of 155), Brookside 344 (of 399). Waitsfield would need about 12 single-grade classes for its 11 classrooms; sending about a quarter of Fayston's children to Warren, which has room, would fit both.",
          "Fayston has the most deferred maintenance of the four buildings ($7.35 million, $1.74 million of it priority 1 or near-term) and the fewest classrooms (9). This year's Fayston children in kindergarten to grade 3, about 47, would attend 5 K-12 schools.",
        ],
      },
      {
        id: "K4x3-MES",
        closed: "MES",
        name: "Moretown closes",
        plan: makePlan({ id: "K4x3-MES", open: ["FES", "WES", "WRN"], valleyTop: 4, msMerge: true }),
        what: "Moretown's children go to Waitsfield.",
        notes: [
          "Waitsfield would hold about 193 students, over the consultant's 174. Sending about a quarter of Moretown's children to Brookside (then about 368, of 399) would bring Waitsfield to about 169, though it would still need about 12 single-grade classes for its 11 classrooms. Fayston (95) and Warren (103) have room.",
          "Moretown has the most students of the four (137 in K-6 and 32 in Pre-K), so this version moves the most: about 80 of this year's Moretown children in kindergarten to grade 3 would attend 5 K-12 schools. Moretown has the least priority 1 and near-term repair work of the four ($567,000) and a prep kitchen only.",
        ],
      },
      {
        id: "K4x3-WES",
        closed: "WES",
        name: "Waitsfield closes",
        plan: makePlan({ id: "K4x3-WES", open: ["FES", "MES", "WRN"], valleyTop: 4, msMerge: true }),
        what: "Waitsfield's children go to Fayston.",
        notes: [
          "Fayston would hold about 164 students, over the consultant's 139; sending about two fifths of Waitsfield's children to Warren (then about 131, of 155) would fit both.",
          "Waitsfield's building has the kitchen the board authorized about four years ago (about $1 million) and is the school the town's planned sewer connection, expected by fall 2028, would serve. About 52 of this year's Waitsfield children in kindergarten to grade 3 would attend 5 K-12 schools.",
        ],
      },
      {
        id: "K4x3-WRN",
        closed: "WRN",
        name: "Warren closes",
        plan: makePlan({ id: "K4x3-WRN", open: ["FES", "MES", "WES"], valleyTop: 4, msMerge: true }),
        what: "Warren's children go to Waitsfield.",
        notes: [
          "Every elementary school stays within the consultant's capacity, with enough classrooms for single-grade classes: Waitsfield about 160 students (of 174), Fayston 95, Moretown 124, Brookside 344.",
          "Warren is the largest valley building (14 classrooms and a cafeteria). Its children would have the longest drive to their new school of the four versions, about 13 minutes by car from Warren village to Waitsfield, against 8 or 9 in the others. About 49 of this year's Warren children in kindergarten to grade 3 would attend 5 K-12 schools, and Warren's Pre-K children would move too.",
        ],
      },
    ],
    notes: [
      "Savings, about $3.02 million: the district's figure for merging the middle schools ($2,102,942), which assumes valley 5th and 6th graders fill Crossett Brook, as they would here (about 256 students in grades 5-6), plus our estimate for closing one school, half the district's figure for two ($913,264). That is about $323,000 short of the district's target. Counting the lower health insurance rates reported on November 2 (about $300,000), it is about $23,000 short. Against the lower target, which leaves out older bond payments, it would have about $477,000 to spare.",
      "Everything turns on what one closure saves, and the district has not costed one closure with grades 5-6 at Crossett Brook. Counting the health insurance rates, it would have to save about $936,000 to meet the district's target, or about $436,000 to meet the lower one. The board's question-and-answer document says closing one school \"does not look like it would save enough money to make it worthwhile,\" because staff would move rather than all be cut, and an administrator said on October 28: \"One building will not get us to where we need to be.\" The district's November 2 figure for one closure keeps grades 5-6 in the valley (about $2.3 million in all, with the merger); the finance director said that is part of why it saves less, since only about 131 students would remain at Crossett Brook. The threshold drops again in FY29, when she said that version would need at least $350,000 more; this one has not been projected.",
      "When the superintendent said on November 2 that Path B is \"the best option educationally,\" one reason he gave was its grade pattern, which this plan shares: \"K to four buildings, a 5 to six building and a 7 through 12.\" Another was the number of classes per building, and with three valley schools instead of two there would be fewer classes per grade in each. As in Path B, every valley child would attend 4 K-12 schools, and younger children from the closed school would attend 5; this year's 3rd graders there would change schools two years in a row. Valley 5th and 6th graders would ride to Duxbury, about 31 minutes by car from Warren village before bus stops; routes have not been modeled, and the consultant's planning guideline is 45 minutes at most for elementary riders.",
      "Three valley buildings stay open instead of two, so shared staff such as nurses and specialists are spread over more buildings than in Path B. The superintendent said on November 2 that with one closure \"you would have to take that capacity probably from Crossett Brook, who is a full-time nurse now... There's not an even split.\" Pre-K stays in district schools, as the administration recommended for next year; our counts put 30 Pre-K children at each open valley school (42 at Warren), the district's planning numbers. Where Moretown stays open, its meals still come from Harwood by car; the superintendent said the district would need other options.",
    ],
    refs: [
      ref("deck", "slides 17-18"),
      ref("meeting1102", "closing one school"),
      ref("meeting1102", "health insurance update"),
      ref("qdoc", "closing one school"),
      ref("meeting1028", "closing one school"),
      ref("truexCap", "Capacities"),
      ref("deck", "slides 21-24"),
      ref("osrm", "table service, towns and schools"),
    ],
    // the caveat Start here shows under the card's measures
    startNote: "The district has not costed one closure with grades 5-6 at Crossett Brook; its question-and-answer document says closing one school \"does not look like it would save enough money to make it worthwhile.\"",
  },
  {
    id: "center56",
    group: "other",
    name: "Grades 5-6 center in the valley: close Fayston and empty Crossett Brook for repairs",
    what: "Fayston closes. Two valley schools teach Pre-K to grade 4, and the third becomes a grades 5-6 school for the whole district: valley 5th and 6th graders and Crossett Brook's own. Every 7th and 8th grader goes to Harwood, so Crossett Brook's building holds no classes and is free for renovation. Brookside stays Pre-K to 4 until a renovated Crossett Brook can take it. The grade setup is the one the administration and principals recommend (Pre-K to 4, 5-6, 7-12); only the 5-6 building differs. Suggested by a resident after the November 4 meeting, shown with each valley building as the center, and scored the same way as the others.",
    // the first version is the card's plan (Build's "Grades 5-6 center" starting point)
    plan: makePlan({ id: "center56", open: ["MES", "WRN"], valleyTop: 4, msMerge: true, center56: "WES" }),
    versions: [
      {
        id: "center56",
        center56: "WES",
        name: "Waitsfield as the grades 5-6 center",
        what: "Moretown and Warren teach Pre-K to 4, the two schools the board's November 4 straw poll chose to study. Waitsfield's building, near the middle of the valley, teaches grades 5 and 6.",
        notes: [
          "Savings: the district's Path B figures, minus Waitsfield's building operating costs ($196,038). That is $394,158 over the target on paper.",
          "Waitsfield would hold about 256 5th and 6th graders: 26 over the slides' 230, under the 1991 permit's 300, and 82 over the consultant's 174. They need about 12 classes and Waitsfield has 11 classrooms, so about one portable unit (two rooms), or a room now used for something else. The town sewer the school is to join by about fall 2028 would end the wastewater question. Waitsfield has a full kitchen. Moretown (about 134) and Warren (about 227) match the district's own classroom chart for this pair: Moretown needs 6 of its 11 classrooms and Warren 12 of its 14. Warren is over its 237 if staff count, as its permit says.",
          "By car, Waitsfield is about 21 minutes from Waterbury village and 13 from Warren village; in Path B, valley 5th and 6th graders ride to Duxbury, about 31 minutes from Warren village.",
        ],
      },
      {
        id: "center56-WRN",
        center56: "WRN",
        name: "Warren as the grades 5-6 center",
        what: "Moretown and Waitsfield teach Pre-K to 4. Warren's building, the largest in the valley (14 classrooms), teaches grades 5 and 6.",
        plan: makePlan({ id: "center56-WRN", open: ["MES", "WES"], valleyTop: 4, msMerge: true, center56: "WRN" }),
        notes: [
          "Savings: the same figures, minus Warren's building operating costs ($183,521). That is $406,675 over the target on paper.",
          "Warren is the only valley building with room for the 12 classes on the district's count of classrooms. Its 256 students would be 19 over its permit of 237 even without staff, which its permit counts, and 101 over the consultant's 155. Waitsfield would hold about 217 children in Pre-K to 4: under 230, but 13 classes for 11 classrooms; on the district's chart for this pair, sending some children to Moretown, which has room, would fit both.",
          "Warren is the farthest valley school from Waterbury: about 35 minutes by car from Waterbury village.",
        ],
      },
      {
        id: "center56-MES",
        center56: "MES",
        name: "Moretown as the grades 5-6 center",
        what: "Waitsfield and Warren teach Pre-K to 4, the pair the board's scores ranked first. Moretown's building, the closest valley school to Waterbury, teaches grades 5 and 6.",
        plan: makePlan({ id: "center56-MES", open: ["WES", "WRN"], valleyTop: 4, msMerge: true, center56: "MES" }),
        notes: [
          "Savings: the same figures, minus Moretown's building operating costs ($185,868). That is $404,328 over the target on paper.",
          "Moretown would hold about 256 5th and 6th graders: 21 over its 235 even without staff, 91 over the consultant's 165, and 12 classes for 11 classrooms. Its kitchen is a prep kitchen whose meals come from Harwood by car. Waitsfield would hold about 239 children in Pre-K to 4, over the slides' 230 and the consultant's 174.",
          "About 17 minutes by car from Waterbury village, and 23 from Warren village. This version moves the most students next fall (about 497 in K-12).",
        ],
      },
    ],
    notes: [
      "How the savings are figured, an estimate: the staffing is Path B's (Pre-K to 4 in two valley schools, every 5th and 6th grader in one building, every 7th and 8th grader at Harwood), so we use the district's Path B figures and give back the center building's operating costs, as for the Pre-K center plan. Nothing is counted for emptying Crossett Brook: the district has published no operating cost for it, and an empty building still needs heat, power, and upkeep. Busing changes too: about 131 Waterbury and Duxbury 5th and 6th graders would ride to the valley, instead of about 125 valley children riding to Duxbury; neither is costed.",
      "It moves more students next fall than Path B: about 460 to 500 in K-12, against 352 to 398 in the Pre-K to 4 versions of Path B, because Crossett Brook's current 5th graders and Brookside's 4th graders go to the center instead of Crossett Brook, and Crossett Brook's 7th graders go to Harwood. Every child would attend 4 K-12 schools, as in Path B, and younger Fayston children 5.",
      "Why a resident suggested it: the administration's long-term plan moves Brookside into Crossett Brook, and its principals named \"potential relocation of the Waterbury Duxbury Elementary School to the current CBMS campus\" among the changes their recommended grade setup leaves room for. A board member's published notes say Crossett Brook could not then hold valley 5th and 6th graders too: Brookside plus Crossett Brook's own 5th and 6th graders is about 470 students, the consultant modeled room for up to 515 with a small addition, and adding about 125 valley children comes to about 600. A 5-6 center in the valley gives those grades a home that does not depend on that sequence.",
      "Its weak points: renovating Crossett Brook needs a bond, and under Act 169 payments on a new bond count against the threshold; the superintendent said on November 4 that construction takes years from planning to opening. Until then Crossett Brook stands empty and Brookside keeps its building. No district table or costing covers this plan, every center building is over the consultant's capacity, and on the slides' limits the center is over its wastewater number in every version.",
    ],
    refs: [ref("deck", "slides 17-18"), ref("deck1104", "slides 6-9"), ref("meeting1104", "principals' letter"), ref("maconScores", "Why sequence matters"), ref("meeting1104", "bonds and construction"), ref("truexCap", "Capacities"), ref("osrm", "table service, towns and schools")],
    startNote: "No district table or costing covers this plan. Renovating Crossett Brook needs a bond, which under Act 169 counts against the threshold.",
  },
  {
    id: "two-only",
    group: "other",
    name: "Close two valley schools, keep both middle schools",
    what: "Two valley schools close; Crossett Brook stays a grades 5-8 school. The rest of the savings would come from cuts or a penalty. Shown here for Moretown + Warren staying open, with valley 5th and 6th graders at Crossett Brook.",
    plan: makePlan({ id: "two-only", open: ["MES", "WRN"], valleyTop: 4 }),
    notes: ["Uses the district's savings figure for closing two valley schools."],
  },
];
