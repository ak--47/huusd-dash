import { ref } from "./sources.js";

// Board calendar for the FY28 budget (deck slide 36) and the consolidation steps (slides 35, 37),
// plus the closure process in the Articles of Agreement (Article 6(E)).
export const TIMELINE = [
  { date: "2026-10-14", title: "Budget presentation #1", detail: "Level service budget; consolidation of the middle schools and valley elementary schools.", src: ref("deck", "slide 36") },
  { date: "2026-10-28", title: "Budget presentation #2 and a straw poll", detail: "Facility profiles and capacity tables. In a straw poll, not a formal vote, the board agreed to keep developing Path B. A board member asked to see a version that keeps valley 5th and 6th graders in temporary classrooms in the valley, and the administration said it would bring one.", src: ref("meeting1028", "end of meeting") },
  { date: "2026-11-02", title: "Committee meeting on the school buildings", detail: "The Building Use & Visioning Committee went over the buildings for the board's scoring of the six pairings (scores due November 3). The finance director gave the district's first figure for closing one valley school instead of two (about $2.3 million with the merger and grades 5-6 kept in the valley, still leaving a penalty) and said lower health insurance rates save about $300,000. Review of the five feasibility-study proposals for 193 Home Farm Way was put off to a later committee meeting.", src: ref("meeting1102", "transcript of the recording") },
  { date: "2026-11-04", title: "Board meeting: scores and a straw poll", detail: "The board's own scores ranked Waitsfield + Warren first (248 points) and Moretown + Warren second (241). In a straw poll at the end of the meeting, not a formal vote, members chose Moretown + Warren 9 to 4 as the pair to plan around, so Fayston and Waitsfield are the schools proposed to close; the chair did not vote. An earlier straw poll dropped Path A's program cuts unanimously. The administration recommended Pre-K to 4 valley schools, grades 5-6 at Crossett Brook, and grades 7-12 at Harwood.", src: ref("meeting1104", "straw poll, 3:56-3:59") },
  { date: "2026-11-09", title: "Budget information session, Waitsfield", detail: "6 PM; location to be announced. The district's town sessions are posted on Front Porch Forum.", src: ref("meeting1104", "board reports") },
  { date: "2026-11-09", title: "Board visits to the schools, week of November 9", detail: "The superintendent said walkthroughs at Moretown, Waitsfield, and Warren would be scheduled for the week after November 4, at the end of the school day. Any board member can ask to visit.", src: ref("meeting1104", "site visits") },
  { date: "2026-11-12", title: "Budget information session, Waterbury and Duxbury", detail: "6 PM at Crossett Brook.", src: ref("meeting1104", "board reports") },
  { date: "2026-11-16", title: "Budget information session, Warren", detail: "6 PM at Warren School.", src: ref("meeting1104", "board reports") },
  { date: "2026-11-18", title: "Board meeting: vote to schedule the closure hearings", detail: "The administration is to bring dates for three public hearings, at least one in each town whose school is proposed to close (Fayston and Waitsfield), and ask the board to vote to warn them. Also the first budget overview: enrollment and staffing.", src: ref("deck1104", "slide 25"), key: true },
  { date: "2026-11-18", title: "Three public hearings, November 18 to December 16", detail: "If the board warns them, as the Articles of Agreement require before a closure vote. At least one in each town whose school is proposed to close.", src: ref("deck1104", "slide 25") },
  { date: "2026-12-01", title: "State tax letter", detail: "The state's projection of next year's tax rates. The superintendent said it is expected to show a sizable increase.", src: ref("meeting1104", "tax letter") },
  { date: "2026-12-02", title: "Budget overview #2", detail: "", src: ref("deck1104", "slide 24") },
  { date: "2026-12-16", title: "Budget overview #3, and the closure vote warned", detail: "If the board still intends to close schools after the hearings, it warns the vote here, at least ten days ahead.", src: ref("deck1104", "slide 25") },
  { date: "2027-01-06", title: "Closure vote", detail: "A vote to close a school needs two-thirds of the board's weighted vote. The same meeting is the budget recap, with the Common Level of Appraisal from the Vermont Department of Taxes.", src: ref("deck1104", "slides 24-25"), key: true },
  { date: "2027-01-13", title: "Final budget", detail: "The board approves the warning and articles for Town Meeting Day. An extra meeting on January 20 if needed.", src: ref("deck1104", "slide 24") },
  { date: "2027-03-01", title: "Budget informational hearing", detail: "", src: ref("deck1104", "slide 24") },
  { date: "2027-03-02", title: "Town Meeting Day", detail: "Voters decide the FY28 budget.", src: ref("deck1104", "slide 24"), key: true },
  { date: "2027-08", title: "Schools open under the new plan", detail: "The working-draft Gantt chart plans receiving-school readiness over the summer and school openings in August.", src: ref("deck", "slide 35") },
];

export const CLOSURE_PROCESS = {
  src: ref("aoa", "Article 6(E)"),
  steps: [
    "At least three public hearings on the proposed closure, at least one in the town where the school is.",
    "If the board then intends to vote, public notice of the vote and the reason for closure at least ten days before.",
    "An affirmative vote of two-thirds of the board.",
  ],
  placement: "Students in a town whose school closes may attend the district school closest to their home, unless parents choose another. Receiving-school space, classroom needs, and student-to-teacher ratios are also considered.",
  property: "A closed valley school building is offered to its town for $1, if the town uses it for community purposes for at least five years and takes on any outstanding bonds, state construction aid, and capital improvements since 2017 (Article 6(B)).",
  caution: "The district's own Articles presentation cautions against converting \"two-thirds\" into a number of members or vote-weight points without confirming current voting rules with counsel.",
};

TIMELINE.sort((a, b) => a.date.localeCompare(b.date));
