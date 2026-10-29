import { ref } from "./sources.js";

// School locations: NCES EDGE public school geocodes 2024-25; street addresses from each school's website.
export const LOCATIONS = {
  src: ref("nces", "EDGE public school geocodes 2024-25"),
  schools: {
    BPS: { lat: 44.339149, lon: -72.753211, address: "47 Stowe Street, Waterbury" },
    CBMS: { lat: 44.321112, lon: -72.752843, address: "5672 VT Route 100, Duxbury" },
    HU: { lat: 44.254059, lon: -72.786484, address: "458 VT Route 100 (Moretown mailing address; the campus is in Duxbury)" },
    MES: { lat: 44.247506, lon: -72.762611, address: "940 Route 100B, Moretown" },
    WES: { lat: 44.19438, lon: -72.819349, address: "3951 Main Street, Waitsfield" },
    FES: { lat: 44.179191, lon: -72.884179, address: "782 German Flats Road, Fayston" },
    WRN: { lat: 44.116433, lon: -72.852699, address: "293 School Road, Warren" },
    NEW: { lat: 44.2271003, lon: -72.7903531, address: "193 Home Farm Way, Waitsfield (former Cabot office; feasibility study site)" },
  },
  // Village centers (USGS GNIS); Fayston has no village center, so its town office is used.
  towns: {
    waterbury: { lat: 44.3378343, lon: -72.756229, label: "Waterbury" },
    duxbury: { lat: 44.3270012, lon: -72.7526176, label: "Duxbury" },
    moretown: { lat: 44.2508918, lon: -72.7609496, label: "Moretown" },
    waitsfield: { lat: 44.1900592, lon: -72.8248379, label: "Waitsfield" },
    fayston: { lat: 44.2321147, lon: -72.7997831, label: "Fayston (town office)" },
    warren: { lat: 44.112005, lon: -72.8559474, label: "Warren" },
  },
};

// Driving distance (miles) and time (minutes) by car, free-flow, from OSRM on OpenStreetMap roads.
// These are car times, not bus rides: buses stop along the way and run longer.
export const DRIVE = {
  src: ref("osrm", "table service, towns and schools"),
  schoolToSchool: {
    BPS: { CBMS: [2.2, 7], FES: [16.2, 31], HU: [7.1, 14], MES: [9.3, 18], WES: [12.3, 22], WRN: [19.3, 36] },
    CBMS: { BPS: [2.1, 7], FES: [14.6, 28], HU: [5.5, 10], MES: [7.7, 15], WES: [10.7, 19], WRN: [17.7, 33] },
    FES: { BPS: [16.2, 31], CBMS: [14.6, 28], HU: [9.2, 18], MES: [9.1, 18], WES: [4.0, 9], WRN: [8.2, 16] },
    HU: { BPS: [7.1, 14], CBMS: [5.5, 10], FES: [9.2, 18], MES: [2.4, 6], WES: [5.3, 10], WRN: [12.3, 24] },
    MES: { BPS: [9.3, 18], CBMS: [7.7, 15], FES: [9.1, 18], HU: [2.4, 6], WES: [5.2, 9], WRN: [12.1, 23] },
    WES: { BPS: [12.3, 22], CBMS: [10.7, 19], FES: [4.0, 9], HU: [5.3, 9], MES: [5.2, 9], WRN: [7.0, 15] },
    WRN: { BPS: [19.2, 36], CBMS: [17.7, 33], FES: [8.2, 16], HU: [12.3, 23], MES: [12.1, 23], WES: [7.0, 15] },
  },
  townToSchool: {
    waterbury: { BPS: [0.2, 1], CBMS: [1.9, 6], FES: [16.0, 30], HU: [6.9, 13], MES: [9.1, 17], WES: [12.1, 21], WRN: [19.0, 35], NEW: [9.7, 18] },
    duxbury: { BPS: [1.6, 5], CBMS: [0.7, 3], FES: [14.7, 27], HU: [5.6, 10], MES: [7.8, 14], WES: [10.8, 18], WRN: [17.8, 32], NEW: [8.4, 15] },
    moretown: { BPS: [9.4, 18], CBMS: [7.8, 15], FES: [9.2, 18], HU: [2.5, 6], MES: [0.3, 1], WES: [5.3, 9], WRN: [12.2, 23], NEW: [2.8, 7] },
    waitsfield: { BPS: [12.6, 23], CBMS: [11.0, 19], FES: [3.6, 8], HU: [5.7, 10], MES: [5.5, 10], WES: [0.4, 1], WRN: [6.6, 13], NEW: [3.3, 7] },
    fayston: { BPS: [10.1, 20], CBMS: [8.5, 17], FES: [7.8, 17], HU: [3.1, 8], MES: [3.0, 8], WES: [3.9, 8], WRN: [10.8, 22], NEW: [1.5, 5] },
    warren: { BPS: [18.9, 34], CBMS: [17.3, 31], FES: [7.8, 15], HU: [12.0, 22], MES: [11.8, 22], WES: [6.7, 13], WRN: [0.7, 3], NEW: [9.6, 19] },
  },
  note: "Fayston has no village center; distances use the town office at the northeast edge of town, near Route 100, so they understate drives from Fayston's western roads.",
};

// The district's bus routes this fall (First Student, effective 09/28/2026): the scheduled time from
// the first pickup to arrival at school, which is the longest ride on that run.
export const BUS = {
  src: ref("busRoutes", "AM runs"),
  morningElementary: { median: 37, min: 20, max: 72, longest: "Route 13 (Sugarbush): first pickup 6:08 AM in Warren, via Granville, at Warren Elementary 7:20 AM" },
  morningMiddleHigh: { median: 48, min: 26, max: 62 },
  middleSchoolLeg: "On six morning middle/high runs, the bus reaches Crossett Brook at 8:17-8:19 AM and Harwood at 8:30 AM.",
};

// 2020 Census: residents and land area by town.
export const CENSUS = {
  src: ref("census2020", "PL 94-171 and 2020 Gazetteer"),
  towns: {
    duxbury: { pop: 1413, land: 42.495 },
    fayston: { pop: 1364, land: 36.463 },
    moretown: { pop: 1753, land: 39.775 },
    waitsfield: { pop: 1844, land: 25.682 },
    warren: { pop: 1977, land: 40.025 },
    waterbury: { pop: 5331, land: 48.236 },
  },
};
