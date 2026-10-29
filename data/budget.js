import { ref } from "./sources.js";

// FY28 = the 2027-28 school year. FY27 = 2026-27 (this year).
export const BUDGET = {
  fy27: 51884847, // printed as the "Level Funded (Cap EST)" budget at 0% year over year
  threshold: 16562, // FY28 excess spending threshold, dollars per pupil
  requiredCut: 3339273,
  src: ref("deck", "slide 10"),
  scenarios: [
    {
      id: "level-service",
      name: "Level service",
      plain: "Keep doing everything we do now",
      budget: 55224120,
      growth: 0.06436,
      perPupilVsThreshold: 1081,
      penalty: 2773267,
      src: ref("deck", "slide 10"),
    },
    {
      id: "inflation",
      name: "Projected inflation",
      plain: "Grow the budget with inflation only",
      budget: 53285738,
      growth: 0.027,
      cut: 1938382, // printed as "$1,2938,382"
      perPupilVsThreshold: 172,
      penalty: 445340,
      src: ref("deck", "slide 10"),
    },
    {
      id: "level-funded",
      name: "Level funded (at the threshold)",
      plain: "Hold the budget flat at this year's amount",
      budget: 51884847,
      growth: 0,
      cut: 3339273,
      perPupilVsThreshold: -25.67,
      perPupilNote: "Printed: \"($220.67) was corrected to remove the debt exclusion\"",
      penalty: 0,
      src: ref("deck", "slide 10"),
    },
    {
      id: "consolidation",
      name: "Consolidation (Path B)",
      plain: "Close two valley elementary schools and merge the middle schools",
      budget: 51294651,
      growth: -0.01138,
      perPupil: 16306.24,
      perPupilVsThreshold: -255.76,
      penalty: 0,
      src: ref("deck", "slide 20"),
    },
  ],
};

// Path A: the "high impact reductions" (deck slide 13). They add up to the required cut exactly.
export const PATH_A_CUTS = {
  src: ref("deck", "slide 13"),
  total: 3339273,
  items: [
    {
      id: "transport",
      name: "Transportation and bus routes",
      amount: 1360000,
      detail: "Daily routes, field trip travel, and transportation to the technical school",
    },
    {
      id: "special",
      name: "Special programming",
      amount: 583516,
      detail: "Farm to School, outdoor education, and learning center supports",
    },
    {
      id: "prek",
      name: "Pre-K tuition-only model",
      amount: 517000,
      detail: "Ends Pre-K classes in district schools; families use private Pre-K programs with public tuition",
    },
    {
      id: "staff",
      name: "Academic and behavioral support staff",
      amount: 456000,
      detail: "Fewer interventionists and paraeducators, less tier 2 and 3 student support",
    },
    {
      id: "athletics",
      name: "Athletics and co-curriculars (70% cut)",
      amount: 312757,
      detail: "Coaches, officials, theater, music, and student clubs",
    },
    {
      id: "electives",
      name: "Electives and technology",
      amount: 110000,
      detail: "Fewer course offerings, software, and hardware",
    },
  ],
  impact: [
    "Access and equity: transportation and Pre-K barriers fall hardest on vulnerable families.",
    "Student development: loss of sports, arts, electives, hands-on learning, and intervention support.",
    "School community: weaker support structures, strained classrooms, and loss of shared traditions.",
  ],
};

// Path B: the two consolidations (deck slides 17-19).
export const PATH_B_SAVINGS = {
  src: ref("deck", "slides 17-19"),
  valley: { amount: 1826527, fte: 16, src: ref("deck", "slide 17") },
  middle: { amount: 2102942, fte: 16.5, src: ref("deck", "slide 18") },
  total: 3929469,
  fteTotal: 32.5,
};

// The excess spending threshold: a percent of the FY25 statewide spending per pupil, adjusted
// for inflation (deck slides 7 and 38, citing Act 169 of 2026).
export const THRESHOLD_SCHEDULE = {
  src: ref("deck", "slides 7 and 38"),
  law: ref("act169", "sections 6-7"),
  rows: [
    { fy: "FY27", pct: 1.18 },
    { fy: "FY28", pct: 1.155 },
    { fy: "FY29", pct: 1.145 },
    { fy: "FY30", pct: 1.135 },
    { fy: "FY31", pct: 1.13 },
    { fy: "FY32+", pct: 1.125 },
  ],
  note: "FY30 onward applies if the planned foundation formula does not replace the excess spending threshold.",
};

// Portable classrooms, as costed by the district (deck slide 26).
export const MODULAR = {
  src: ref("deck", "slide 26"),
  low: 600000,
  high: 700000,
  units: 2,
  classroomsPerUnit: 2,
  note: "~$600K-$700K for two units at two locations (2 classrooms per unit). At the October 28 meeting this was described as the best preliminary quote, covering a two-year period, with site preparation the largest cost.",
};
