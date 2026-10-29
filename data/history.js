// Earlier HUUSD decisions on buildings and budgets, as reported in local news and district records.
// Each entry links to the report it comes from.

export const HISTORY = [
  {
    when: "June 2016",
    what: "Six towns vote to form HUUSD",
    detail: "The Act 46 merger takes effect July 1, 2017. The Articles of Agreement barred closing a school without the town's consent for the first four years.",
    source: "Articles of Agreement",
    url: "https://drive.google.com/file/d/1kLO__EbjGspdLndF3-_DeDhrJwZarjpG/view",
  },
  {
    when: "March 2020",
    what: "A budget that merged middle school students at Crossett Brook fails",
    detail: "The FY21 budget, which included $315,000 for temporary classrooms at Crossett Brook, failed 3,048 to 2,254. A version without the merger passed in June 2020.",
    source: "Valley Reporter via Waterbury Roundabout",
    url: "https://waterburyroundabout.org/education/oyx4q5mvz53xwx9sma55d5rtg14myq",
  },
  {
    when: "November 2021",
    what: "A $59.5 million bond for Harwood and a Crossett Brook wing fails",
    detail: "Voters rejected it 2,599 to 975. The wing would have let the middle schools merge at Crossett Brook.",
    source: "Waterbury Roundabout",
    url: "https://waterburyroundabout.org/education/tdftzfys9ncqdk5c0bksdifclhbjkk",
  },
  {
    when: "June 2023",
    what: "The board drops the middle school merger from bond planning",
    detail: "The vote to keep 7th and 8th graders at both Harwood and Crossett Brook passed unanimously, with four members absent. The merger under discussion, like those in 2020 and 2021, would have combined them at Crossett Brook; Path B would combine them at Harwood.",
    source: "Valley Reporter",
    url: "https://valleyreporter.com/index.php/news/local-news/18022-no-middle-school-merger-in-bond-talks",
  },
  {
    when: "March 2025",
    what: "A planning consultant presents building options",
    detail: "TruexCullins drew up several district layouts, and their costs were modeled over 30 years; each required building additions. In a November 2025 update it wrote that the options' savings, including the status quo with a bond, were \"tightly grouped\" because \"the existing schools are currently close to capacity and each option require additions,\" so \"there was not significant savings compared to the status quo.\" Path B, as presented in October 2026, includes no building additions.",
    source: "TruexCullins update, November 20, 2025",
    url: "https://drive.google.com/file/d/1GfZsknL0ChNGqI3oatn58oSRFoCnn9Do/view",
  },
  {
    when: "June 18, 2026",
    what: "Vermont enacts Acts 169 and 170",
    detail: "Act 169 lowers the excess spending threshold each year from FY28 to FY32. Act 170 sets up district merger study committees and a possible new state funding formula from 2029.",
    source: "Act 169 of 2026",
    url: "https://legislature.vermont.gov/Documents/2026/Docs/ACTS/ACT169/ACT169%20As%20Enacted.pdf",
  },
  {
    when: "September 2026",
    what: "The district studies one central valley school",
    detail: "A request for proposals asks for a feasibility study of combining Fayston, Moretown, Waitsfield, and Warren into one Pre-K to 6 school at 193 Home Farm Way, Waitsfield. Proposals are due October 30, 2026.",
    source: "HUUSD feasibility study RFP",
    url: "https://docs.google.com/document/d/1FYPSMr9oWSv-nol1rTo5CtaPnTgG7Tua/edit",
  },
  {
    when: "October 14 and 28, 2026",
    what: "The FY28 budget presentations: Path A or Path B",
    detail: "The administration presents program cuts or closing two valley schools and merging the middle schools.",
    source: "October 28 presentation",
    url: "https://docs.google.com/presentation/d/1VJZfSHPb14bRDszD6VOgEPk5_JnaCY52p4DesVwItTk/edit",
  },
  {
    when: "October 28, 2026",
    what: "A straw poll to keep developing Path B",
    detail: "By a show of hands, not a formal vote, the board agreed to keep working on Path B. No schools were chosen. A board member asked to see a version that keeps valley 5th and 6th graders in temporary classrooms in the valley, and the administration said it would bring one.",
    source: "Board meeting recording",
    url: "https://www.youtube.com/watch?v=nIYZIJAZqPk",
  },
];

export const VOTES = {
  rows: [
    { label: "FY21, March 2020", yes: 2254, no: 3048, pass: false },
    { label: "FY21, second vote 2020", yes: 1213, no: 728, pass: true },
    { label: "FY22", yes: 1808, no: 1180, pass: true },
    { label: "FY23", yes: 1573, no: 1065, pass: true },
    { label: "FY24", yes: 1192, no: 599, pass: true },
    { label: "FY25, March 2024", yes: 1439, no: 2640, pass: false },
    { label: "FY25, April 2024", yes: 1565, no: 1731, pass: false },
    { label: "FY25, May 2024", yes: 2429, no: 1567, pass: true },
    { label: "FY26", yes: 2119, no: 871, pass: true },
    { label: "FY27, March 2026", yes: 2104, no: 1343, pass: true },
  ],
  note: "From the district's voting record and local news reports.",
};

// Changes to this site, newest first.
export const UPDATES = [
  { date: "2026-10-29", text: "Build a plan adds two starting points (close one school; the middle-school merger with smaller cuts) and a choice of valley grades (through grade 4, 5, or 6, with or without Pre-K). Options adds the merger-with-smaller-cuts combination. A quote about keeping grades 5-6 in the valley is now attributed to a board member, not an administrator, after checking the speaker-labeled recording transcript." },
  { date: "2026-10-29", text: "First published. Built from the October 14 and 28 presentations, the October 1 enrollment report, the October 28 meeting recording, state permits and law, and published research." },
];
