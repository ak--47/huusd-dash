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
  { date: "2026-10-31", text: "Build a plan: for each town whose school closes, you can now set the share of its children going to each open school, to the percent, and send part of a town to more than one school. With two valley schools open, the shares start where the district's table for that pair places children (our calculation: for Waitsfield + Warren, about 95% of Fayston's children to Waitsfield and 5% to Warren, and about 86% of Moretown's to Waitsfield and 14% to Brookside and Crossett Brook). Changing a share no longer makes the counts jump by about 20 students; they move by a few. Fixed: links copied from Build a plan's address bar dropped the setting that has Brookside teach grades 5 and 6." },
  { date: "2026-10-31", text: "Options: the Pre-K center plan now shows two versions side by side, with Moretown's building as the center (as before, unchanged) and with Waitsfield's, which residents also suggested ($3.73M, 351 K-12 students changing schools, Moretown 3 over its wastewater limit on the slides). Added a plan another resident suggested: three valley K-6 schools and a Pre-K center in Waitsfield's building, keeping every building and merging the middle schools (about $2.82M, about $519,000 short of the district's target, resting on two estimates). What we checked adds a finding on how the district's capacity tables place children, with the shares each table implies, and more questions for the board (one-time costs, tax rates by town, long bus rides). The budget page adds the district's September list of what drives next year's increase." },
  { date: "2026-10-31", text: "Corrected wording, no numbers changed: the projected-inflation card's garbled required cut is described as \"almost $1.3 million,\" the figure said at the October 28 meeting; the $1 building offer now lists its conditions; 2,565 pupils is no longer called a district projection; and two source notes (Act 169, board seats) are corrected." },
  { date: "2026-10-29", text: "The Pre-K center plan on Options now sends two thirds of Fayston's children to Waitsfield and a third to Warren (it had been the reverse), as its suggester asked. Waitsfield rises to about 252 students, 22 over the slides' wastewater limit of 230 but under the 1991 permit's 300; Warren drops to about 116. Savings do not change." },
  { date: "2026-10-29", text: "The Pre-K center plan on Options no longer includes portable classrooms, as its suggester asked. Its savings do not change (portable classrooms are a one-time cost, outside the yearly savings); Brookside and Waitsfield now show as over the consultant's classroom space, and the card says about 2 portable units each would reach it. In Build a plan, each school's portable classroom count now shows its one-time cost next to it." },
  { date: "2026-10-29", text: "The Pre-K center plan on Options now follows its suggester's update: Crossett Brook's 5th and 6th graders move to Brookside (so Brookside teaches K-6 and Crossett Brook's building holds no classes), and more of Fayston's children go to Warren. Waitsfield drops to about 223 students, under the slides' 230; Brookside rises to about 461, under its occupancy of 480 counting students only. The card now includes 2 portable units each at Waitsfield and Brookside, like the other K-6 versions, and shows the version where Crossett Brook keeps its 5th and 6th graders. Build a plan adds that choice in step 4. What we checked adds a finding on Pre-K in a building of its own, which a board member asked to see on October 28, and the meeting page adds the two quotes." },
  { date: "2026-10-29", text: "Options lists a parent's idea under \"Ideas this site cannot score yet\": move Crossett Brook's 5th and 6th graders to Brookside for a year so Crossett Brook can close for renovations, with what is known about space and repairs." },
  { date: "2026-10-29", text: "Build a plan can keep a closed valley school's building open as a Pre-K center (for valley families or the whole district), split a closed town's children between two schools, and shows Brookside. Options adds a plan a resident suggested: close Fayston, make Moretown the district's Pre-K center, keep Waitsfield and Warren K-6 (two thirds of Fayston's children to Waitsfield and a third to Warren; two thirds of Moretown's to Waitsfield and a third to Brookside), and merge the middle schools." },
  { date: "2026-10-29", text: "Build a plan adds two starting points (close one school; the middle-school merger with smaller cuts) and a choice of valley grades (through grade 4, 5, or 6, with or without Pre-K). Options adds the merger-with-smaller-cuts combination. A quote about keeping grades 5-6 in the valley is now attributed to a board member, not an administrator, after checking the speaker-labeled recording transcript." },
  { date: "2026-10-29", text: "First published. Built from the October 14 and 28 presentations, the October 1 enrollment report, the October 28 meeting recording, state permits and law, and published research." },
];
