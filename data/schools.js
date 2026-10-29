import { ref } from "./sources.js";

// The six member towns. "Valley" = the four towns with their own elementary school
// south of Waterbury on Route 100 (the deck's "valley elementary schools").
export const TOWNS = [
  { id: "waterbury", name: "Waterbury", valley: false },
  { id: "duxbury", name: "Duxbury", valley: false },
  { id: "moretown", name: "Moretown", valley: true },
  { id: "waitsfield", name: "Waitsfield", valley: true },
  { id: "fayston", name: "Fayston", valley: true },
  { id: "warren", name: "Warren", valley: true },
];

// Harwood Union Middle School and Harwood Union High School are separate schools
// in one building, so schools and buildings are listed separately.
export const BUILDINGS = {
  BPS: "Brookside building (Waterbury)",
  CBMS: "Crossett Brook building (Duxbury)",
  FES: "Fayston building",
  MES: "Moretown building",
  WES: "Waitsfield building",
  WRN: "Warren building",
  HU: "Harwood Union campus (Route 100)",
  NEW: "Proposed central valley building (193 Home Farm Way, Waitsfield)",
};

export const SCHOOLS = {
  BPS: { id: "BPS", name: "Brookside Primary School", short: "Brookside", town: "waterbury", building: "BPS", grades: "PK-4" },
  CBMS: { id: "CBMS", name: "Crossett Brook Middle School", short: "Crossett Brook", town: "duxbury", building: "CBMS", grades: "5-8" },
  FES: { id: "FES", name: "Fayston Elementary School", short: "Fayston", town: "fayston", building: "FES", grades: "K-6", valley: true },
  MES: { id: "MES", name: "Moretown Elementary School", short: "Moretown", town: "moretown", building: "MES", grades: "PK-6", valley: true },
  WES: { id: "WES", name: "Waitsfield Elementary School", short: "Waitsfield", town: "waitsfield", building: "WES", grades: "K-6", valley: true },
  WRN: { id: "WRN", name: "Warren Elementary School", short: "Warren", town: "warren", building: "WRN", grades: "PK-6", valley: true },
  HUMS: { id: "HUMS", name: "Harwood Union Middle School", short: "Harwood Middle", town: "duxbury", building: "HU", grades: "7-8" },
  HUHS: { id: "HUHS", name: "Harwood Union High School", short: "Harwood High", town: "duxbury", building: "HU", grades: "9-12" },
  // Only in the district's draft roadmap (Oct 14, 2026 deck): the two remaining valley schools move into
  // a new building in FY30. The feasibility study site is the former Cabot office at 193 Home Farm Way.
  NEW: { id: "NEW", name: "New central valley school (proposed)", short: "New valley school", town: "waitsfield", building: "NEW", grades: "PK-4 (draft)", proposed: true },
};

export const VALLEY = ["FES", "MES", "WES", "WRN"];

// Where each town's children go today, by grade band.
// Fayston and Waitsfield have no public Pre-K in their buildings (deck slides 21, 23; enrollment report p.3).
export const TODAY = {
  waterbury: { pk: "BPS", elem: "BPS", elemTop: 4, middle: "CBMS", middleFrom: 5, junior: "CBMS", high: "HUHS" },
  duxbury: { pk: "BPS", elem: "BPS", elemTop: 4, middle: "CBMS", middleFrom: 5, junior: "CBMS", high: "HUHS" },
  moretown: { pk: "MES", elem: "MES", elemTop: 6, junior: "HUMS", high: "HUHS" },
  waitsfield: { pk: null, elem: "WES", elemTop: 6, junior: "HUMS", high: "HUHS" },
  fayston: { pk: null, elem: "FES", elemTop: 6, junior: "HUMS", high: "HUHS" },
  warren: { pk: "WRN", elem: "WRN", elemTop: 6, junior: "HUMS", high: "HUHS" },
};

// Facility profiles from the district's deck (FY27). Values are as printed.
// wastewater: the deck's "Wastewater Permitting Capacity"; the deck compares it to student counts.
export const FACILITIES = {
  FES: {
    permit: { limit: 235, counts: "students and staff", wording: "a total enrollment of 235 students and staff", src: ref("permitFES", "condition 1") },
    consultantCapacity: 139,
    slide: 21,
    enrollmentPrinted: 84, // grade rows on the same slide add to 87; the Oct 1 report says 87
    deferredMaintenance: 7352902,
    priority1: 985516,
    impending: 756375,
    impendingNote: "Near-term critical repairs",
    sqft: 20528,
    classrooms: 9,
    outdoors: "Playgrounds and trails, no fields",
    fte: 25.63,
    wastewater: 250,
    heat: "Propane; no solar",
    land: "7.0 acres, with two easements through the property",
    kitchen: "Fully operational kitchen; gym is used as the cafeteria",
    operatingCost: 174783,
    maintenance: ["Roof replacement", "Fire panel replacement", "Water system controls replacement"],
    src: ref("deck", "slide 21"),
  },
  MES: {
    permit: { limit: 235, counts: "everyone", wording: "2,820 gallons a day, which the district counts as 235 occupants at 12 gallons each (the 1996 design used 10 gallons each, about 282 people)", src: ref("permitMES", "condition 3.3") },
    consultantCapacity: 165,
    slide: 22,
    enrollmentPrinted: 137,
    deferredMaintenance: 4875697,
    priority1: 366584,
    impending: 200000,
    impendingNote: "Near-term critical repairs, including an estimated $92K dishwasher replacement",
    sqft: 22100,
    classrooms: 11,
    outdoors: "Playgrounds; access to town fields and trails",
    fte: 28.05,
    wastewater: 235,
    heat: "Propane; no solar",
    land: "About 2.0 acres",
    kitchen: "Prep kitchen only; food is transported from Harwood. Dishwasher needs replacement; more refrigeration needed. Limited cafeteria seating",
    operatingCost: 185868,
    maintenance: ["Exterior siding repairs", "Heat controls replacement"],
    src: ref("deck", "slide 22"),
  },
  WES: {
    permit: { limit: 300, counts: "students", wording: "an approved maximum student population of 300 (1991); the 1990 permit's 230 came from the size of the water tank, which was replaced", src: ref("permitWES", "condition 1.2") },
    consultantCapacity: 174,
    slide: 23,
    enrollmentPrinted: 103,
    deferredMaintenance: 4840026,
    priority1: 622673,
    impending: 150000,
    impendingNote: "Near-term critical repairs",
    sqft: 23680,
    classrooms: 11,
    outdoors: "Playgrounds, fields, and access to the Mad River Path",
    fte: 23.25,
    wastewater: 230,
    wastewaterNote: "Printed as \"230* (admenable to 300)\"",
    wastewaterExpandable: 300,
    heat: "Oil; solar with a net-metering agreement with the Town of Waitsfield",
    land: "7.7 acres",
    kitchen: "Fully operational kitchen; also sends meals to Fayston. Gym is used as the cafeteria",
    operatingCost: 196038,
    maintenance: ["Boiler replacement", "Partial roof replacement"],
    src: ref("deck", "slide 23"),
  },
  WRN: {
    permit: { limit: 237, counts: "students and staff", wording: "237 full-time-equivalent students and staff, with cafeteria", src: ref("permitWRN", "project description") },
    consultantCapacity: 155,
    slide: 24,
    enrollmentPrinted: 87,
    deferredMaintenance: 4055711,
    priority1: 1451300,
    impending: 0,
    impendingNote: "Near-term critical repairs",
    sqft: 29738,
    classrooms: 14,
    outdoors: "Playground, fields and trails",
    fte: 25.63, // identical to Fayston's printed FTE
    wastewater: 237,
    heat: "Oil; solar with a net-metering agreement with the Town of Warren",
    land: "0 acres; the school has an easement for its building on town land",
    kitchen: "Fully operational kitchen; limited cafeteria seating",
    operatingCost: 183521,
    maintenance: [],
    src: ref("deck", "slide 24"),
  },
  BPS: {
    permit: { limit: 480, counts: "everyone", wording: "town sewer; the district gives a maximum occupancy of 480, and building occupancy normally counts everyone in the building", src: ref("deck", "slide 25") },
    consultantCapacity: 399,
    slide: 25,
    enrollmentPrinted: 284,
    deferredMaintenance: 16735501,
    priority1: 2686994,
    impending: 50000,
    impendingNote: "Near-term critical repairs",
    sqft: 60000,
    classrooms: 24,
    outdoors: "Playgrounds; access to town fields and trails",
    fte: 67.44,
    occupancy: 480,
    wastewaterNote: "Town sewer and water; 8,200 gallons per day allotted by the town. Maximum occupancy 480",
    heat: "Oil; solar",
    land: "10 acres",
    kitchen: "Full or partially operational kitchen; limited cafeteria seating",
    operatingCost: 393969,
    maintenance: ["Entry door replacement (safety concern)", "Basement egress repair"],
    src: ref("deck", "slide 25"),
  },
};

// Operating costs exclude custodial salaries and benefits (as printed on each slide).
export const OPERATING_COST_NOTE = "Annual operating costs, not including custodial salaries and benefits.";

// Music program today (deck slide 40, "District Allocation Matrix"). Shows the district's case
// that small schools share specialists.
export const MUSIC = {
  src: ref("deck", "slide 40"),
  rows: [
    { school: "BPS", population: 278, fte: 1, space: "Dedicated", k4: "75 minutes/week (2 of 6 days)", g56: null },
    { school: "FES", population: 89, fte: 0.25, space: "Shared", k4: "40 minutes/week", g56: "40 min general music, 30 min chorus, 30 min band" },
    { school: "MES", population: 136, fte: 0.25, space: "Shared", k4: "40 minutes/week", g56: "40 min general music, 30 min chorus, 40 min band" },
    { school: "WRN", population: 93, fte: 0.25, space: "Dedicated (shared next year)", k4: "40 minutes/week", g56: "40 min general music, 30 min chorus, 30-35 min band" },
    { school: "WES", population: 119, fte: 0.25, space: "Shared", k4: "40 minutes/week", g56: "40 min general music, 30 min chorus, 30 min band" },
    { school: "CBMS", population: 263, fte: 2, space: "Dedicated", k4: null, g56: "250 min general music (trimester rotation), 90 min chorus, 150 min band" },
  ],
};

// Board seats and vote weights (Superintendent's report, Oct 28, 2026; approved Oct 27, 2021).
export const BOARD = {
  src: ref("supt", "Articles of Agreement and Board Voting Weights"),
  seats: [
    { town: "Duxbury", members: 2, weight: 5.2 },
    { town: "Fayston", members: 2, weight: 5.0 },
    { town: "Moretown", members: 2, weight: 6.4 },
    { town: "Waitsfield", members: 2, weight: 6.7 },
    { town: "Warren", members: 2, weight: 7.2 },
    { town: "Waterbury", members: 4, weight: 9.75 },
  ],
};

// Classroom capacity, including Pre-K, from the district's planning consultant (TruexCullins, March 2025),
// using State Board maximums of 20 students per K-4 classroom and 25 per grade 5-8 classroom.
export const CONSULTANT_CAPACITY = {
  src: ref("truexCap", "Capacities"),
  method: ref("truexReport", "capacity method"),
  schools: { BPS: 399, FES: 139, MES: 165, WES: 174, WRN: 155, CBMS: 359, HUMS: 166 },
};
