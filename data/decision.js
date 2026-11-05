import { ref } from "./sources.js";

// The November 4, 2026 board meeting: the board members' scores of the six pairs of valley schools, the straw poll
// that followed, and what was said around it. Board members are named (their scores and votes are public); staff
// are named by role; residents are not named.

// The five questions on each member's score sheet, in the sheet's column order. Each is scored 1 (poor fit) to 5
// (strong fit), so a pair's total from one member runs from 5 to 25.
export const CRITERIA = [
  { id: "capacity", name: "Enrollment and receiving capacity", short: "Capacity" },
  { id: "building", name: "Building conditions and capital needs", short: "Building" },
  { id: "kitchen", name: "Kitchen and meal operations", short: "Kitchen" },
  { id: "wastewater", name: "Wastewater feasibility", short: "Wastewater" },
  { id: "overall", name: "Overall fit of the school combination", short: "Overall fit" },
];

// The six pairs, as "school+school" in the order of the score sheet's rows.
export const SCORE_PAIRS = ["FES+MES", "MES+WES", "MES+WRN", "FES+WES", "FES+WRN", "WES+WRN"];

// Each member's scores, read from their tab of the district's workbook ("Strong Fit" 5 ... "Poor Fit" 1), in
// CRITERIA order. Names as in BOARD.members (the workbook's tab says "Jillan Sackett").
export const SCORES = {
  src: ref("scores1104", "each member's tab"),
  dashboardSrc: ref("scores1104", "dashboard"),
  slideSrc: ref("deck1104", "slide 22"),
  // the totals the district's dashboard and slide 22 show; two are 1 point low because of a formula that missed
  // cells with a trailing space (Emily Dolloff's tab), which the dashboard itself flags
  published: { "FES+MES": 165, "MES+WES": 223, "MES+WRN": 241, "FES+WES": 175, "FES+WRN": 180, "WES+WRN": 248 },
  members: {
    "Jillan Cantor-Sackett": { "FES+MES": [1, 1, 1, 4, 2], "MES+WES": [2, 3, 1, 4, 2], "MES+WRN": [4, 4, 1, 4, 3], "FES+WES": [2, 1, 4, 4, 2], "FES+WRN": [2, 1, 4, 4, 2], "WES+WRN": [4, 4, 4, 4, 4] },
    "Macon Phillips":        { "FES+MES": [1, 1, 2, 3, 2], "MES+WES": [2, 4, 3, 3, 3], "MES+WRN": [3, 3, 3, 3, 4], "FES+WES": [2, 2, 3, 3, 1], "FES+WRN": [2, 1, 3, 4, 2], "WES+WRN": [3, 4, 4, 3, 4] },
    "Caitlin Lovegrove":     { "FES+MES": [2, 2, 3, 3, 3], "MES+WES": [2, 5, 3, 3, 3], "MES+WRN": [5, 5, 3, 3, 4], "FES+WES": [2, 3, 2, 1, 2], "FES+WRN": [4, 1, 2, 5, 3], "WES+WRN": [4, 1, 2, 1, 2] },
    "Alexina Cather":        { "FES+MES": [3, 2, 2, 2, 1], "MES+WES": [4, 4, 3, 5, 5], "MES+WRN": [4, 3, 3, 3, 3], "FES+WES": [3, 2, 4, 3, 2], "FES+WRN": [2, 1, 4, 2, 1], "WES+WRN": [3, 3, 5, 3, 4] },
    "Ashley Woods":          { "FES+MES": [3, 3, 1, 2, 2], "MES+WES": [5, 3, 2, 5, 4], "MES+WRN": [4, 3, 3, 5, 4], "FES+WES": [2, 3, 5, 2, 2], "FES+WRN": [2, 3, 3, 2, 2], "WES+WRN": [4, 3, 5, 5, 5] },
    "Cindy Senning":         { "FES+MES": [1, 1, 2, 5, 1], "MES+WES": [2, 2, 2, 2, 2], "MES+WRN": [3, 3, 2, 5, 2], "FES+WES": [1, 1, 5, 2, 1], "FES+WRN": [1, 1, 5, 5, 1], "WES+WRN": [4, 5, 5, 2, 5] },
    "Emily Dolloff":         { "FES+MES": [2, 1, 2, 2, 4], "MES+WES": [3, 3, 2, 3, 3], "MES+WRN": [4, 5, 2, 4, 5], "FES+WES": [5, 1, 5, 5, 5], "FES+WRN": [3, 2, 5, 3, 2], "WES+WRN": [2, 5, 5, 2, 5] },
    "JB Weir":               { "FES+MES": [3, 3, 2, 2, 2], "MES+WES": [5, 4, 2, 5, 3], "MES+WRN": [4, 3, 1, 3, 3], "FES+WES": [2, 3, 4, 2, 2], "FES+WRN": [2, 2, 3, 2, 1], "WES+WRN": [4, 3, 5, 5, 5] },
    "Karl Naden":            { "FES+MES": [2, 2, 3, 5, 4], "MES+WES": [3, 3, 3, 5, 4], "MES+WRN": [3, 4, 3, 5, 4], "FES+WES": [2, 2, 5, 2, 3], "FES+WRN": [3, 2, 4, 5, 2], "WES+WRN": [2, 5, 4, 2, 3] },
    "Langford Davidson":     { "FES+MES": [3, 4, 3, 5, 5], "MES+WES": [3, 2, 3, 2, 2], "MES+WRN": [5, 4, 3, 5, 5], "FES+WES": [2, 2, 5, 2, 2], "FES+WRN": [3, 3, 5, 5, 4], "WES+WRN": [2, 2, 5, 2, 2] },
    "Pam Eaton":             { "FES+MES": [1, 1, 3, 4, 2], "MES+WES": [1, 2, 2, 1, 2], "MES+WRN": [1, 1, 2, 1, 1], "FES+WES": [1, 1, 4, 1, 1], "FES+WRN": [2, 1, 4, 2, 3], "WES+WRN": [3, 1, 5, 3, 4] },
    "Robert Dabrowski":      { "FES+MES": [1, 3, 1, 1, 1], "MES+WES": [4, 5, 4, 3, 3], "MES+WRN": [5, 2, 2, 2, 4], "FES+WES": [1, 4, 3, 1, 3], "FES+WRN": [2, 1, 1, 3, 2], "WES+WRN": [3, 3, 5, 4, 5] },
    "Steve Rosenberg":       { "FES+MES": [5, 3, 3, 5, 2], "MES+WES": [3, 5, 4, 5, 5], "MES+WRN": [4, 4, 4, 5, 5], "FES+WES": [1, 3, 5, 2, 2], "FES+WRN": [1, 1, 4, 1, 2], "WES+WRN": [2, 4, 5, 2, 1] },
    "Theo Hanna":            { "FES+MES": [1, 1, 2, 4, 1], "MES+WES": [3, 4, 3, 4, 4], "MES+WRN": [4, 5, 3, 4, 5], "FES+WES": [2, 1, 4, 2, 1], "FES+WRN": [3, 2, 4, 4, 1], "WES+WRN": [5, 5, 5, 2, 2] },
  },
  // from the "Explanation Summary" tab
  purpose: "The goal is not to make a final decision at this stage, but to build a shared understanding of the options and help inform our next steps as a Board.",
  overallQuestion: "Considering all available information, is this a sustainable two-school configuration that best positions HUUSD over the long term?",
};

// The straw poll near the end of the meeting (recording 3:56-3:59, about 9:55 PM): which of the two highest-scoring
// pairs the administration should plan around. Each member answered aloud in turn. The automatic transcript gets
// two labels wrong here; each answer below was checked against the video. Cindy Senning's answer is not on the
// recording (no microphone was open); the chair announced 9 to 4, and hers is the only answer missing, so it is
// counted for Waitsfield + Warren and marked as inferred. The board's minutes, once approved, can confirm it.
export const STRAW_POLL = {
  src: ref("meeting1104", "straw poll, 3:56-3:59"),
  question: "Which two valley schools should the administration plan around: Waitsfield + Warren, or Moretown + Warren?",
  choices: ["WES+WRN", "MES+WRN"],
  announced: "9 to 4 for Moretown + Warren",
  chair: "Ashley Woods",
  votes: [
    { name: "Karl Naden", vote: "MES+WRN", at: "3:56:44" },
    { name: "Jillan Cantor-Sackett", vote: "MES+WRN", at: "3:57:07" },
    { name: "Steve Rosenberg", vote: "MES+WRN", at: "3:57:19" },
    { name: "Theo Hanna", vote: "MES+WRN", at: "3:57:34" },
    { name: "Pam Eaton", vote: "WES+WRN", at: "3:57:37" },
    { name: "Caitlin Lovegrove", vote: "MES+WRN", at: "3:57:45" },
    { name: "Robert Dabrowski", vote: "MES+WRN", at: "3:58:04" },
    { name: "JB Weir", vote: "WES+WRN", at: "3:58:12" },
    { name: "Langford Davidson", vote: "MES+WRN", at: "3:58:19" },
    { name: "Cindy Senning", vote: "WES+WRN", at: "3:58:24", inferred: true },
    { name: "Emily Dolloff", vote: "MES+WRN", at: "3:58:31" },
    { name: "Alexina Cather", vote: "WES+WRN", at: "3:58:34" },
    { name: "Macon Phillips", vote: "MES+WRN", at: "3:58:39" },
    { name: "Ashley Woods", vote: null, at: "3:58:58", note: "The chair did not vote: \"that is a wide enough margin that my vote does not matter.\"" },
  ],
  inferredNote: "Cindy Senning's answer is not on the recording: no microphone was open and the camera did not turn to her. The chair announced 9 to 4 without voting herself, and every other member's answer is heard, so hers is counted for Waitsfield + Warren. The board's minutes can confirm it.",
  // the first straw poll, minutes earlier: whether to keep studying Path A
  pathA: "Every member polled said no to continuing to study Path A's cuts; the chair called it unanimous.",
};

// What was said, verbatim from the automatic transcript (sources/2026-11-04-board-meeting/meeting-transcript.txt),
// trimmed with ellipses. A test checks that each piece between ellipses appears in the transcript.
export const MEETING_1104 = {
  src: ref("meeting1104", "transcript of the recording"),
  groups: [
    {
      id: "before",
      title: "Before the poll: how much to weigh the scores",
      items: [
        { who: "Steve Rosenberg (Moretown)", at: "3:24:25", text: "So when we do our straw poll, I think actually we should incorporate a subjective element... The Moretown parents have been very outspoken and not just in numbers or volume or passion. I think they've made very good points... I don't think we're going to go just by the numbers. The numbers will be important, but it's not the only thing." },
        { who: "Alexina Cather (Waitsfield)", at: "3:25:52", text: "if you look at how the board members ranked generally their school is ranked highest so that's already incorporated here" },
        { who: "Caitlin Lovegrove (Moretown)", at: "3:26:12", text: "of the 112 people who've come to meetings since the beginning, the vast majority have been members of Moretown. And of the people who've spoken at the meeting, 70% of people here have been members of Moretown." },
        { who: "Emily Dolloff (Duxbury)", at: "3:26:46", text: "even in our own in our own data that we pulled together as a board, Moretown is a very strong leader. It might have ranked number two, but I mean number one and number two are pretty darn close" },
        { who: "Theo Hanna (Waterbury), on the loss of a town's school", at: "3:27:12", text: "I weighed that less in my in my scoring because I I really think this requires a mindset shift." },
        { who: "The board chair, Ashley Woods (Warren)", at: "3:38:47", text: "There's some subjectivity to these choices and that's okay... Use your brain. Use use your will to make up your mind." },
      ],
    },
    {
      id: "time",
      title: "Asking for more time",
      items: [
        { who: "Karl Naden (Fayston), first asked", at: "3:40:41", text: "I do feel I am having trouble making a definitive choice between the Waitsfield and Warren and Moretown and Warren option at this time." },
        { who: "Caitlin Lovegrove (Moretown)", at: "3:40:04", text: "I thought we said we were going to have site visits of the three schools." },
        { who: "The superintendent", at: "3:42:07", text: "It's 9:40 and my guess is if we come back with the top two in two weeks, we're going to have a long conversation as well." },
        { who: "Alexina Cather (Waitsfield)", at: "3:43:28", text: "What is really going to change between tonight and two weeks from now? Like, are we just buying two more weeks because we're not ready to say it?" },
        { who: "The finance director", at: "3:44:26", text: "I need to have an idea of what schools are going to stay open." },
        { who: "Emily Dolloff (Duxbury)", at: "3:45:56", text: "I think we need to decide that tonight." },
      ],
    },
    {
      id: "votes",
      title: "Reasons given with the votes",
      items: [
        { who: "Karl Naden (Fayston), after a five-minute recess", at: "3:56:44", text: "I will put down for Moretown and Warren. I feel that they represent the key characteristics of the valley schools in terms of outdoor space and I think that they could be long-term schools for the valley." },
        { who: "Caitlin Lovegrove (Moretown)", at: "3:57:45", text: "Moretown and Warren for all of the lovely reasons that everyone who's come and told us about the school has said, including Eco, the community that doesn't have another space" },
        { who: "JB Weir (Waitsfield)", at: "3:58:12", text: "for all the reasons that were just said uh is also applicable to Waitsfield. So I would go with Waitsfield and Warren." },
        { who: "Macon Phillips (Warren)", at: "3:58:39", text: "I think I'm gonna go with Moretown and Warren. Um, for all the reasons, but thinking about the replacement cost across those three communities and I think Waitsfield has the likeliest chance of filling it with something else" },
      ],
    },
    {
      id: "after",
      title: "After the poll",
      items: [
        { who: "Alexina Cather (Waitsfield)", at: "4:00:23", text: "because I think it's a subjective thing and and the data very much flipped subjectively tonight." },
        { who: "JB Weir (Waitsfield)", at: "4:02:09", text: "we did spend $1.1 million on a kitchen 3 years ago um in in the at a school that is the in the commercial center of the entire valley. So, it was just there's an element of of serious economic waste to that." },
        { who: "The board chair, on the Moretown van", at: "4:02:00", text: "we can't drive 300 kids food from Harwood in somebody's van, which is what we've been doing." },
      ],
    },
    {
      id: "admin",
      title: "The administration and the principals",
      items: [
        { who: "The superintendent", at: "1:56:06", text: "we feel educationally the best alignment and the best path forward is the P the preK to four five six uh and then 7 through 12 at Harwood." },
        { who: "The principals' letter, read by a principal", at: "2:00:04", text: "While we remain neutral on the specific facility decisions under consideration by the board tonight, we firmly believe that moving away for our from our current multi-building structure toward aligned grade configurations across elementary, upper elementary, and secondary levels is one of the most important steps we can take" },
        { who: "The superintendent, on the classroom charts for Pre-K to 4", at: "1:44:32", text: "They are the only ones that fit the three guiding principles criteria we had educationally. Not necessarily. And that's again that's for the board to decide" },
        { who: "The finance director, on Moretown's kitchen", at: "3:05:30", text: "Right now it's a prep kitchen at Moretown and we actually transport food. It's not, you know, ideal that we're actually having our staff transport food um in their their personal vehicles." },
        { who: "The finance director, on grades 5-6 at Crossett Brook", at: "3:14:11", text: "we're not saying it's permanent. We're not saying it's temporary." },
        { who: "The superintendent, on bonds", at: "2:44:45", text: "if we went out for a bond tomorrow, uh it would be part of the ED spend and it would increase our costs." },
      ],
    },
  ],
  publicComment:
    "The chair opened with the board's response to an open meeting law complaint about October 28: after consulting its attorney, the board's position is that it did not violate the law, and it extended public comment to three minutes a speaker. Fifteen people spoke, about half of them from Moretown's school community. Most asked the board to keep Moretown open, slow down, model more options, or weigh what closing a school does to a town; others asked for care with 5th and 6th graders who might move twice, raised long bus rides, and two supported consolidation and bringing middle-school students together.",
};

// Asked for at the meeting, for the next steps.
export const ASKED_1104 = [
  { who: "JB Weir", what: "The cost of what Moretown's kitchen would need to serve the larger school: a new kitchen, or a van to bring meals from Harwood, and everything that entails." },
  { who: "Theo Hanna", what: "Modeling of incentivized early retirement, instead of layoffs by seniority alone (the superintendent said this needs legal advice and an executive session)." },
  { who: "Pam Eaton and Alexina Cather", what: "Board visits to Moretown, Warren, and Waitsfield; the superintendent said walkthroughs would be scheduled the following week." },
];

// The administration's classroom modeling, shown on chart paper at the meeting (deck slides 6-9): classrooms each
// pair would need for Pre-K to 6 by October 1 enrollment and the nearest-school rule, against the classrooms each
// building has, and the same less grades 5-6 (Pre-K to 4). "need" and "have" by school.
export const CLASSROOM_CHART = {
  src: ref("deck1104", "slides 6-9"),
  have: { FES: 9, MES: 11, WES: 11, WRN: 14, BPS: 24 },
  pairs: {
    "MES+WRN": { pk6: { MES: 8, WRN: 16 }, pk4: { MES: 6, WRN: 12 } },
    "WES+WRN": { pk6: { WES: 16, WRN: 8 }, pk4: { WES: 12, WRN: 6 } },
    "MES+WES": { pk6: { WES: 16, MES: 8 }, pk4: { WES: 12, MES: 6 } },
    "FES+MES": { pk6: { FES: 16, MES: 8 }, pk4: { FES: 12, MES: 6 } },
    "FES+WRN": { pk6: { FES: 9, WRN: 8 }, pk4: { FES: 7, WRN: 6 } },
    "FES+WES": { pk6: { FES: 8, WES: 16 }, pk4: { FES: 6, WES: 12 } },
  },
  note: "Fayston + Warren needs fewer valley rooms because the nearest-school rule sends northern valley children to Brookside, which would need about seven more classrooms. The superintendent said Moretown + Warren and Fayston + Warren are the only Pre-K to 4 pairs that fit the administration's three guiding principles (grade alignment, facility fit, financial framework), adding that it is for the board to decide. With grades 5-6 kept in the valley, every pair is short of rooms in one building.",
};

// Facts about each finalist from the district's documents, for the side-by-side table.
export const FINALIST_FACTS = {
  kitchen: {
    WES: "Full kitchen, renovated about three years ago (about $1.1 million, a board member said); it also sends meals to Fayston.",
    WRN: "Full kitchen; limited cafeteria seating.",
    MES: "Prep kitchen only. Meals are cooked at Harwood and carried over in staff members' own cars; the dishwasher needs replacing and more refrigeration is needed. On November 4 the board asked for the cost of a van, or a new kitchen, for the larger school; not yet priced.",
  },
  land: {
    WES: "7.7 acres, owned by the district. Town sewer targeted for about fall 2028, partly funded by a grant of about $1 million premised on expanding the school; its leach fields would then free land for additions.",
    WRN: "The building sits on town land under an easement; additions need the town's written permission. No flood or wetland limits were noted.",
    MES: "About 2 acres. Most of the site is in the 500-year flood zone and the rear is out of it. The school flooded twice in the past three years from blocked culverts on a private road above it, which a board member said have since been cleared.",
  },
  src: [ref("deck", "slides 22-24"), ref("meeting1104", "kitchens, flooding, and expansion"), ref("meeting1102", "Moretown's meals"), ref("maconScores", "Building and kitchen notes")],
};
