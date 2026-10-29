import { ref } from "./sources.js";

// Board calendar for the FY28 budget (deck slide 36) and the consolidation steps (slides 35, 37),
// plus the closure process in the Articles of Agreement (Article 6(E)).
export const TIMELINE = [
  { date: "2026-10-14", title: "Budget presentation #1", detail: "Level service budget; consolidation of the middle schools and valley elementary schools.", src: ref("deck", "slide 36") },
  { date: "2026-10-28", title: "Budget presentation #2 and a straw poll", detail: "Facility profiles and capacity tables. In a straw poll, not a formal vote, the board agreed to keep developing Path B. A board member asked to see a version that keeps valley 5th and 6th graders in temporary classrooms in the valley, and the administration said it would bring one.", src: ref("meeting1028", "end of meeting") },
  { date: "2026-11-02", title: "Public meeting on the school buildings", detail: "Board members said this meeting would go through all the buildings to help with their scoring of the six pairings. Members' individual scores are due November 3 and will be shown publicly with names.", src: ref("meeting1028", "homework timeline") },
  { date: "2026-11-04", title: "Next board meeting", detail: "The administration said it would bring a version of Path B that keeps valley 5th and 6th graders in temporary classrooms in the valley. The decision point is which buildings to consider and whether to hold the three public hearings required before closing a school.", src: ref("meeting1028", "end of meeting"), key: true },
  // Dated January: the working-draft Gantt chart (deck slide 35) puts its "Board vote on school closures" marker
  // about five days into January 2027, on the same scale that puts the December 1 tax letter on December 1.
  { date: "2027-01", title: "Closure vote, if pursued", detail: "The superintendent described the sequence: three public hearings, two of them in the buildings that could close, then a board discussion at a December meeting. If the board wants to go ahead, it warns a vote at least ten days in advance and votes at a later meeting; closing a school takes a two-thirds vote of the board. The district's working-draft schedule (slide 35) marks the vote in early January 2027.", src: ref("meeting1028", "closure sequence") },
  { date: "2026-11-18", title: "Budget overview #1", detail: "Enrollment and staffing.", src: ref("deck", "slide 36") },
  { date: "2026-12-02", title: "Budget overview #2", detail: "", src: ref("deck", "slide 36") },
  { date: "2026-12-16", title: "Budget overview #3", detail: "", src: ref("deck", "slide 36") },
  { date: "2027-01-06", title: "Budget recap", detail: "The district receives the Common Level of Appraisal from the Vermont Department of Taxes.", src: ref("deck", "slide 36") },
  { date: "2027-01-13", title: "Final budget", detail: "The board approves the warning and articles for Town Meeting Day. An extra meeting on January 20 if needed.", src: ref("deck", "slide 36") },
  { date: "2027-03-01", title: "Budget informational hearing", detail: "", src: ref("deck", "slide 36") },
  { date: "2027-03-02", title: "Town Meeting Day", detail: "Voters decide the FY28 budget.", src: ref("deck", "slide 36"), key: true },
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
  property: "A closed valley school building is offered to its town for $1, if the town uses it for community purposes for at least five years (Article 6(B)).",
  caution: "The district's own Articles presentation cautions against converting \"two-thirds\" into a number of members or vote-weight points without confirming current voting rules with counsel.",
};

TIMELINE.sort((a, b) => a.date.localeCompare(b.date));
