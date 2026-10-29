import { ref } from "./sources.js";

// State rules that shape the decision, in plain words, each tied to the law or agency text.
export const LAW = [
  {
    title: "The FY28 limit is not official yet",
    text: "The Secretary of Education sets each year's threshold on or before November 15, based on budgets passed so far. The district's $16,562 is a projection; the official FY28 figure is due after the November 4 meeting.",
    ref: ref("vsa5401", "§ 5401(12)"),
  },
  {
    title: "How the penalty works",
    text: "Spending per pupil above the threshold is counted twice when the state sets the district's tax rate. The Tax Department's example: a district that spends $17,000 per pupil against a $16,470 threshold is taxed as if it spent $17,530.",
    ref: ref("taxFaq", "excess spending"),
  },
  {
    title: "Older bond payments are left out of the test",
    text: "For FY28 and later, payments on bonds that voters approved before July 1, 2026 are not counted when testing spending against the threshold. Payments on any new bond would count. In FY27 the state recorded $563,816 of such excluded payments for HUUSD.",
    ref: ref("vsa4001", "§ 4001(6)(B)"),
    ref2: ref("jfo", "Harwood UUSD row"),
  },
  {
    title: "The threshold steps down, then may be replaced",
    text: "Act 169 lowers the threshold from 115.5% of the base in FY28 to 112.5% in FY32, and repeals the threshold's definitions on June 30, 2029. A new foundation formula could take its place from July 1, 2029, but only if the Legislature first passes several follow-up laws.",
    ref: ref("act169", "Secs. 7, 12, 16"),
    ref2: ref("act170", "Sec. 18"),
  },
  {
    title: "Minimum class sizes",
    text: "Since July 1, 2026, state standards set minimum average class sizes: 10 in grade 1, 12 in grades 2-5, 15 in grades 6-8, and 18 in high school, with mixed-grade classes limited to two grades. A school below them for three years in a row can face State Board action, but the count does not start before July 1, 2027, and waivers exist.",
    ref: ref("vsa165", "§ 165(a)(9)"),
    ref2: ref("act170", "Sec. 29a"),
  },
  {
    title: "What the Legislature found about closing small schools",
    text: "Act 170 includes this finding: \"closing small elementary schools often yields limited or inconsistent cost savings once transportation, capital adjustments, and community impacts are considered, and may negatively affect student outcomes and family engagement, particularly in rural areas.\"",
    ref: ref("act170", "Sec. 1(a)(3)"),
  },
  {
    title: "District mergers are being studied too",
    text: "Act 170 puts every district on a merger study committee, with final reports due September 1, 2027. Where a committee finds a merger advisable, voters decide on March 7, 2028. The Act suggested a group for HUUSD with Barre, Montpelier Roxbury, Paine Mountain, and Washington Central.",
    ref: ref("act170", "Secs. 13-14"),
  },
];
