import { ref } from "./sources.js";

// Grades are keyed "PK3", "PK4", "K", "1" ... "12".
export const GRADES = ["PK3", "PK4", "K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
export const gradeIndex = (g) => (g === "PK3" ? -2 : g === "PK4" ? -1 : g === "K" ? 0 : Number(g));
export const gradeKey = (i) => (i === -2 ? "PK3" : i === -1 ? "PK4" : i === 0 ? "K" : String(i));
export const gradeLabel = (g) =>
  g === "PK3" ? "Pre-K (age 3)" : g === "PK4" ? "Pre-K (age 4)" : g === "K" ? "Kindergarten" : `Grade ${g}`;

// Students attending each school on October 1 (K-12), from the district's enrollment report.
// HU = Harwood Union campus: grades 7-8 are Harwood Union Middle School, 9-12 Harwood Union High School.
// Totals include Early College students (7 in grade 12 in 2026).
export const ATTENDING = {
  src: ref("enroll", "p. 1, \"2024-2026 K-12 Enrollment by School on October 1\""),
  2024: {
    FES: { K: 13, 1: 15, 2: 17, 3: 12, 4: 16, 5: 13, 6: 12 },
    MES: { K: 18, 1: 19, 2: 13, 3: 20, 4: 18, 5: 14, 6: 19 },
    WES: { K: 19, 1: 17, 2: 19, 3: 15, 4: 21, 5: 23, 6: 16 },
    WRN: { K: 16, 1: 18, 2: 12, 3: 14, 4: 11, 5: 14, 6: 23 },
    BPS: { K: 57, 1: 51, 2: 64, 3: 67, 4: 64 },
    CBMS: { 5: 69, 6: 60, 7: 67, 8: 68 },
    HU: { 7: 65, 8: 60, 9: 112, 10: 118, 11: 112, 12: 122 },
  },
  2025: {
    FES: { K: 12, 1: 10, 2: 12, 3: 18, 4: 10, 5: 15, 6: 14 },
    MES: { K: 25, 1: 19, 2: 20, 3: 14, 4: 24, 5: 20, 6: 15 },
    WES: { K: 16, 1: 16, 2: 17, 3: 17, 4: 12, 5: 18, 6: 22 },
    WRN: { K: 8, 1: 15, 2: 18, 3: 11, 4: 15, 5: 10, 6: 16 },
    BPS: { K: 48, 1: 55, 2: 51, 3: 66, 4: 65 },
    CBMS: { 5: 67, 6: 61, 7: 68, 8: 67 },
    HU: { 7: 68, 8: 65, 9: 129, 10: 109, 11: 123, 12: 110 },
  },
  2026: {
    FES: { K: 12, 1: 13, 2: 11, 3: 11, 4: 18, 5: 9, 6: 13 },
    MES: { K: 16, 1: 25, 2: 19, 3: 20, 4: 14, 5: 23, 6: 20 },
    WES: { K: 11, 1: 12, 2: 14, 3: 15, 4: 17, 5: 14, 6: 20 },
    WRN: { K: 8, 1: 8, 2: 16, 3: 17, 4: 12, 5: 16, 6: 10 },
    BPS: { K: 51, 1: 53, 2: 59, 3: 49, 4: 72 },
    CBMS: { 5: 64, 6: 67, 7: 63, 8: 67 },
    HU: { 7: 62, 8: 65, 9: 134, 10: 123, 11: 108, 12: 116 },
  },
  // Printed totals, kept to check the rows against.
  printedTotals: {
    2024: { FES: 98, MES: 121, WES: 130, WRN: 108, BPS: 303, CBMS: 264, HU: 589, all: 1613 },
    2025: { FES: 91, MES: 137, WES: 118, WRN: 93, BPS: 285, CBMS: 263, HU: 604, all: 1591 },
    2026: { FES: 87, MES: 137, WES: 103, WRN: 87, BPS: 284, CBMS: 261, HU: 608, all: 1567 },
  },
};

// 2026-27 students by the school their home town is assigned to ("resident students"), and how many
// attend another district school through intradistrict choice (IDC) or tuition in from outside.
// Columns follow the report: active residents, IDC out (continuing + new), attending residents,
// IDC in (continuing + new), tuition in, total attending.
export const RESIDENTS_2026 = {
  src: ref("enroll", "pp. 6-7, \"Attending Student Data by Grade / by School\""),
  FES: {
    K: [9, 0, 9, 3, 0, 12], 1: [9, 0, 9, 3, 1, 13], 2: [12, 4, 8, 3, 0, 11], 3: [8, 1, 7, 4, 0, 11],
    4: [16, 1, 15, 3, 0, 18], 5: [9, 2, 7, 2, 0, 9], 6: [9, 1, 8, 5, 0, 13],
  },
  MES: {
    K: [17, 1, 16, 0, 0, 16], 1: [22, 3, 19, 6, 0, 25], 2: [17, 1, 16, 3, 0, 19], 3: [22, 2, 20, 0, 0, 20],
    4: [13, 1, 12, 2, 0, 14], 5: [23, 3, 20, 3, 0, 23], 6: [18, 0, 18, 2, 0, 20],
  },
  WES: {
    K: [13, 2, 11, 0, 0, 11], 1: [16, 4, 12, 0, 0, 12], 2: [15, 3, 12, 2, 0, 14], 3: [18, 4, 14, 1, 0, 15],
    4: [21, 4, 17, 0, 0, 17], 5: [15, 3, 12, 2, 0, 14], 6: [20, 2, 18, 2, 0, 20],
  },
  WRN: {
    K: [9, 2, 7, 1, 0, 8], 1: [6, 1, 5, 1, 2, 8], 2: [11, 0, 11, 2, 3, 16], 3: [15, 3, 12, 2, 3, 17],
    4: [8, 0, 8, 2, 2, 12], 5: [14, 1, 13, 3, 0, 16], 6: [13, 4, 9, 1, 0, 10],
  },
  BPS: {
    K: [50, 0, 50, 1, 0, 51], 1: [55, 5, 50, 3, 0, 53], 2: [61, 3, 58, 1, 0, 59], 3: [46, 0, 46, 3, 0, 49],
    4: [73, 2, 71, 1, 0, 72],
  },
  CBMS: {
    5: [65, 4, 61, 3, 0, 64], 6: [70, 3, 67, 0, 0, 67], 7: [57, 3, 54, 9, 0, 63], 8: [61, 2, 59, 8, 0, 67],
  },
  HUMS: {
    7: [66, 9, 57, 3, 2, 62], 8: [69, 8, 61, 2, 2, 65],
  },
  columns: ["active residents", "IDC out", "attending residents", "IDC in", "tuition in", "total attending"],
};

// Pre-K on October 1, 2026.
export const PREK_2026 = {
  src: ref("enroll", "p. 3, \"PK Data 2025 and Now\""),
  bySchool: {
    BPS: { PK3: 25, PK4: 29 },
    FES: { PK3: 0, PK4: 0 },
    MES: { PK3: 14, PK4: 18 },
    WES: { PK3: 0, PK4: 0 },
    WRN: { PK3: 19, PK4: 13 },
  },
  inDistrict: 118,
  privateAct166: { PK3: 33, PK4: 42, total: 75 },
  total: 193,
  total2025: 196,
  anticipatedK2027: 100,
};

// Intradistrict choice (IDC): students attending a district school other than their town's.
export const IDC_2026 = {
  src: ref("enroll", "p. 8, \"Count of HUUSD IDC Continuing and New 26-27\""),
  byResidentSchool: { BPS: 10, CBMS: 12, FES: 9, HUHS: 0, HUMS: 17, MES: 11, WES: 22, WRN: 11 },
  total: 92,
  reasons: [
    ["Continue same school as Pre-K", 7],
    ["Curriculum or building differences", 8],
    ["Moved within the district", 5],
    ["Individual situation", 2],
    ["Location or proximity", 2],
    ["Moved from outside the district", 2],
    ["Peer group", 2],
  ],
};

export const ENROLLMENT_FACTS = {
  k12_2026: 1567,
  k12_2025: 1591,
  valleyK6_2026: 414,
  valleyK6_2025: 439,
  kindergarten2026: 98,
  kindergarten2025: 109,
  graduates2026: 94,
  src: ref("supt", "Student Enrollment 2026-2027"),
};

// The district's long-run enrollment chart (deck slide 4). Only the labeled points are used.
export const DISTRICT_TREND = {
  src: ref("deck", "slide 4"),
  points: [
    { year: "2009-10", students: 1940, kind: "actual" },
    { year: "2024-25", students: 1613, kind: "actual", src: "enroll" },
    { year: "2025-26", students: 1591, kind: "actual", src: "enroll" },
    { year: "2026-27", students: 1567, kind: "actual" },
    { year: "2031-32", students: 1451, kind: "projected" },
  ],
  claims: {
    declineFrom2025: 140,
    totalLost: 489,
    pctLost: 0.252,
  },
};

// Vermont-wide context printed on deck slide 3.
export const STATE_TREND = {
  src: ref("deck", "slide 3"),
  vtPopulationGrowth2009to2025: 0.032,
  vtBirthsChange2009to2024: -0.178,
};
