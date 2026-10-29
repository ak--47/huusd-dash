import { ref } from "./sources.js";

// The twelve capacity tables in the district's deck (slides 27-32): each pairing of two valley
// elementary schools, in two grade setups.
//   "K6": valley schools keep grades 5-6 (the deck's "Impact of not moving valley 5th & 6th graders").
//   "PK4": valley schools become PK-4 and valley grades 5-6 move to Crossett Brook ("Impact of PK-4 grade").
// Students from closed schools are placed "based on home location to nearest school" (deck wording).
// rows: students by grade at each school, exactly as printed. printedTotal: the "Total" row as printed.
// PK rows are planning numbers in the deck, not this year's Pre-K enrollment.

const T = (pair, config, slide, side, cols, rows, printedTotal, printedTotalNoPK, headline) => ({
  id: `${pair.join("+")}:${config}`,
  pair,
  config,
  src: ref("deck", `slide ${slide} (${side} table)`),
  slide,
  cols,
  rows,
  printedTotal,
  printedTotalNoPK,
  headline,
});

export const DISTRICT_TABLES = [
  // ---- slide 27: K-6 ----
  T(["WRN", "MES"], "K6", 27, "left", ["WRN", "MES", "BPS", "CBMS"], {
    PK: [42, 30, 60, null], K: [26, 21, 50, null], 1: [33, 24, 55, null], 2: [40, 18, 61, null],
    3: [40, 26, 48, null], 4: [46, 17, 70, null], 5: [37, 24, null, 65], 6: [39, 21, null, 70],
  }, { WRN: 303, MES: 181, BPS: 344, CBMS: 135, all: 963 }, { WRN: 261, MES: 151, BPS: 284, CBMS: 135, all: 831 },
  "Warren would exceed wastewater capacity"),
  T(["WES", "WRN"], "K6", 27, "right", ["WES", "WRN", "BPS", "CBMS"], {
    PK: [30, 42, 60, null], K: [38, 9, 50, null], 1: [43, 10, 59, null], 2: [42, 14, 63, null],
    3: [43, 19, 52, null], 4: [49, 11, 73, null], 5: [45, 14, null, 67], 6: [46, 14, null, 70],
  }, { WES: 336, WRN: 133, BPS: 357, CBMS: 137, all: 963 }, { WES: 306, WRN: 91, BPS: 297, CBMS: 137, all: 831 },
  "Waitsfield would exceed wastewater capacity"),

  // ---- slide 28: K-6 ----
  T(["WES", "MES"], "K6", 28, "left", ["WES", "MES", "BPS", "CBMS"], {
    PK: [30, 30, 60, null], K: [29, 18, 50, null], 1: [33, 24, 55, null], 2: [39, 19, 61, null],
    3: [42, 24, 48, null], 4: [47, 16, 70, null], 5: [36, 25, null, 65], 6: [41, 19, null, 70],
  }, { WES: 297, MES: 175, BPS: 344, CBMS: 135, all: 951 }, { WES: 267, MES: 145, BPS: 284, CBMS: 135, all: 831 },
  "Waitsfield would exceed wastewater capacity"),
  T(["WES", "FES"], "K6", 28, "right", ["WES", "FES", "BPS", "CBMS"], {
    PK: [30, 30, 60, null], K: [38, 9, 50, null], 1: [46, 8, 58, null], 2: [45, 12, 62, null],
    3: [55, 9, 50, null], 4: [45, 15, 73, null], 5: [50, 9, null, 67], 6: [51, 9, null, 70],
  }, { WES: 360, FES: 101, BPS: 353, CBMS: 137, all: 951 }, { WES: 330, FES: 71, BPS: 293, CBMS: 137, all: 831 },
  "Waitsfield exceeds wastewater capacity"),

  // ---- slide 29: K-6 ----
  T(["FES", "WRN"], "K6", 29, "left", ["FES", "WRN", "BPS", "CBMS"], {
    PK: [30, 42, 60, null], K: [22, 9, 66, null], 1: [24, 10, 78, null], 2: [27, 14, 78, null],
    3: [24, 19, 71, null], 4: [35, 12, 86, null], 5: [25, 14, null, 87], 6: [27, 15, null, 88],
  }, { FES: 218, WRN: 118, BPS: 513, CBMS: 175, all: 963 }, { FES: 184, WRN: 93, BPS: 379, CBMS: 175, all: 831 },
  "Brookside exceeds wastewater capacity (max occupancy is 480)"),
  T(["FES", "MES"], "K6", 29, "right", ["FES", "MES", "BPS", "CBMS"], {
    PK: [30, 30, 60, null], K: [29, 18, 50, null], 1: [33, 24, 55, null], 2: [39, 19, 61, null],
    3: [42, 24, 48, null], 4: [47, 16, 70, null], 5: [36, 25, null, 65], 6: [41, 19, null, 70],
  }, { FES: 297, MES: 175, BPS: 344, CBMS: 135, all: 951 }, { FES: 267, MES: 145, BPS: 284, CBMS: 135, all: 831 },
  "Fayston exceeds wastewater capacity"),

  // ---- slide 30: PK-4 ----
  T(["WES", "WRN"], "PK4", 30, "left", ["WES", "WRN", "BPS"], {
    PK: [30, 42, 60], K: [38, 9, 50], 1: [43, 10, 59], 2: [42, 14, 63], 3: [43, 19, 52], 4: [49, 11, 73],
  }, { WES: 245, WRN: 105, BPS: 357, all: 707 }, null,
  "Waitsfield would exceed wastewater capacity"),
  T(["WRN", "MES"], "PK4", 30, "right", ["WRN", "MES", "BPS"], {
    PK: [42, 30, 60], K: [26, 21, 50], 1: [33, 24, 55], 2: [40, 18, 61], 3: [40, 26, 48], 4: [46, 17, 70],
  }, { WRN: 227, MES: 136, BPS: 344, all: 707 }, null,
  "No school would exceed wastewater capacity"),

  // ---- slide 31: PK-4 ----
  T(["WES", "MES"], "PK4", 31, "left", ["WES", "MES", "BPS"], {
    PK: [30, 30, 60], K: [29, 18, 50], 1: [33, 24, 55], 2: [39, 19, 61], 3: [42, 24, 48], 4: [47, 16, 70],
  }, { WES: 220, MES: 131, BPS: 344, all: 695 }, null,
  "No school would exceed wastewater capacity (printed as \"No school would not exceed\")"),
  T(["WES", "FES"], "PK4", 31, "right", ["WES", "FES", "BPS"], {
    PK: [30, 30, 60], K: [38, 9, 50], 1: [46, 8, 58], 2: [45, 12, 62], 3: [55, 9, 50], 4: [45, 15, 73],
  }, { WES: 259, FES: 83, BPS: 353, all: 695 }, null,
  "Waitsfield exceeds wastewater capacity"),

  // ---- slide 32: PK-4 ----
  T(["FES", "WRN"], "PK4", 32, "left", ["FES", "WRN", "BPS"], {
    PK: [30, 42, 60], K: [22, 9, 66], 1: [24, 10, 78], 2: [27, 14, 78], 3: [24, 19, 71], 4: [35, 12, 86],
  }, { FES: 218, WRN: 118, BPS: 513, all: 707 }, null,
  "Brookside exceeds wastewater capacity (max occupancy is 480)"),
  T(["FES", "MES"], "PK4", 32, "right", ["FES", "MES", "BPS"], {
    PK: [30, 30, 60], K: [29, 18, 50], 1: [33, 24, 55], 2: [39, 19, 61], 3: [42, 24, 48], 4: [47, 16, 70],
  }, { FES: 220, MES: 131, BPS: 344, all: 695 }, null,
  "No school exceeds wastewater capacity"),
];

// The six pairings, in the order the deck's "homework" slide lists them (slide 34).
export const PAIRS = [
  ["MES", "FES"],
  ["MES", "WES"],
  ["MES", "WRN"],
  ["FES", "WES"],
  ["FES", "WRN"],
  ["WES", "WRN"],
];

// The deck's homework table for the board (slide 34): criteria to score each pairing 1-5.
export const BOARD_CRITERIA = {
  src: ref("deck", "slide 34"),
  criteria: [
    "Enrollment & receiving capacity",
    "Building condition & capital needs",
    "Kitchen & meal operations",
    "Wastewater feasibility",
    "Ranking of school combination",
  ],
  scale: { 5: "Strong fit", 4: "Good fit", 3: "Adequate", 2: "Challenging", 1: "Poor fit" },
  question: "Which two-school configuration can safely accommodate more students, support strong programs, and deliver sustainable net savings?",
};

// Where students from a closed town mostly go in each district table (read from the tables:
// the grade-level increases at each open school). Some families in a town may be closer to
// a different school; the district places students by home address.
export const RECEIVING = {
  "WRN+MES": { waitsfield: "WRN", fayston: "WRN" },
  "WES+WRN": { fayston: "WES", moretown: "WES" },
  "WES+MES": { fayston: "WES", warren: "WES" },
  "WES+FES": { warren: "WES", moretown: "WES" },
  "FES+WRN": { waitsfield: "FES", moretown: "BPS" },
  "FES+MES": { waitsfield: "FES", warren: "FES" },
};
