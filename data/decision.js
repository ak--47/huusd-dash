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

// The Waterbury-Duxbury community forum, November 12, 2026, at Crossett Brook: five board members (the Waterbury and
// Duxbury representatives) with the superintendent and the finance director. Not a board meeting; no votes. Quotes from
// the cached transcript (automatic captions with speaker matching); residents who spoke are not named.
export const MEETING_1112 = {
  src: ref("forum1112", "transcript of the recording"),
  groups: [
    {
      id: "plan",
      title: "The plan as the board members presented it",
      items: [
        { who: "Theo Hanna (Waterbury), on closing two valley schools", at: "0:18:43", text: "And this would save us about $1.8 million." },
        { who: "Theo Hanna (Waterbury), on the middle schools", at: "0:18:43", text: "So, fifth and sixth moving to Crossett for the entire... district and seventh and eighth for the entire district moving to Harwood. This would save about $2.1 million" },
        { who: "Cindy Senning (Duxbury, vice chair)", at: "0:47:00", text: "one of the things that this board has been thinking about very seriously and would be planning to do for next year... is to move our seventh and eighth graders back to Harwood." },
        { who: "Pam Eaton (Waterbury)", at: "2:18:54", text: "We're sitting here looking at you guys tonight saying Brookside is going to close and we're going to move our kids here." },
        { who: "Pam Eaton (Waterbury), on renovating Crossett Brook for Brookside", at: "0:59:56", text: "So for that to happen, we need a bond." },
      ],
    },
    {
      id: "one-or-two",
      title: "One closure or two",
      items: [
        { who: "Pam Eaton (Waterbury)", at: "0:30:32", text: "The three school option just really kind of puts us on a back foot. We'll be in the same position again next year." },
        { who: "Rob Dabrowski (Waterbury)", at: "0:32:25", text: "So regardless of whether we close one school, two schools, zero schools, your taxes are going up, right? So closing one school is not enough." },
        { who: "Theo Hanna (Waterbury)", at: "1:17:01", text: "So if we did close just one valley school, we will be in the same position next year." },
        { who: "Emily Dolloff (Duxbury), on going over the threshold", at: "2:22:22", text: "We as a board do not believe that the community as a whole with students or without would support that." },
        { who: "Theo Hanna (Waterbury)", at: "2:00:59", text: "it does cost about a million dollars to operate two schools just year year to year." },
      ],
    },
    {
      id: "open",
      title: "Buses, buildings, and kitchens",
      items: [
        { who: "The finance director, on bus routes", at: "0:26:29", text: "until we know the path forward we haven't worked with the transportation department to look at the new routes but we'll we'll be working within our transportation contract for next year." },
        { who: "The superintendent, on busing valley 5th and 6th graders to Crossett Brook", at: "0:28:29", text: "So so it's built into the budget. It is possible and... it is feasible without going beyond the budget." },
        { who: "Emily Dolloff (Duxbury), after touring Waitsfield and Moretown", at: "0:43:53", text: "could one of these schools could these schools expand in some capacity if necessary down the future or down the road" },
        { who: "Pam Eaton (Waterbury), on Moretown", at: "2:33:11", text: "Moretown does have a flood insurance policy on it because of past events, but that doesn't necessarily mean it's going to happen in the future." },
        { who: "Pam Eaton (Waterbury), on Moretown's meals", at: "2:38:24", text: "there is food that's prepared there, but there's also food that gets transported to that kitchen to be reheated" },
        { who: "Pam Eaton (Waterbury), asked whether Waitsfield's sewer grant is at risk if the school closes (JB Weir is a Waitsfield board member)", at: "2:36:42", text: "I have not heard from JB on the clarification as to whether that's true or not true" },
        { who: "The superintendent, on moving Brookside to Crossett Brook", at: "1:37:49", text: "you're looking at at least three years... maybe longer." },
      ],
    },
  ],
  publicComment:
    "About eighteen residents spoke over two hours, from Waterbury, Duxbury, Moretown, Waitsfield, and Warren. Most from Waterbury and Duxbury supported closing two valley schools and merging the middle schools, citing the high school, programs, and years of delay; several asked the board to keep Pre-K in the schools. Valley residents asked the board to price new bus routes, to reconsider closing one school (two residents presented their own estimates, which assume Pre-K moves to private providers), and raised Waitsfield's sewer grant and village businesses, Moretown's kitchen, and flood risk at Moretown, which residents described differently.",
};

// The Warren community forum, November 16, 2026, at Warren School: the chair and three other board members in the room
// (Warren, Fayston, Waitsfield, Duxbury) and one Warren member on Zoom; the superintendent and finance director were not
// there. Not a board meeting; no votes. Karl Naden (Fayston) spoke from the floor during public comment. Quotes from the
// cached transcript (automatic captions with speaker matching); residents who spoke are not named.
export const MEETING_1116 = {
  src: ref("forum1116", "transcript of the recording"),
  groups: [
    {
      id: "wednesday",
      title: "What November 18 will and will not decide",
      items: [
        { who: "The board chair, Ashley Woods (Warren)", at: "1:35:45", text: "we are not taking a vote to close we're taking a vote to advance for consideration of closure." },
        { who: "Ashley Woods (Warren), on the board's scores", at: "0:34:43", text: "so that data was not ignored. It was weighed in." },
        { who: "Ashley Woods (Warren)", at: "0:34:43", text: "It's not necessarily going to end how anybody thinks it's going to end." },
        { who: "Ashley Woods (Warren), on the meeting's format", at: "1:07:11", text: "It's divided into three questions. Each board member is going to talk about where they stand on that given topic... people will have chances to make motions. We really don't know." },
        { who: "Langford Davidson (Fayston), on January 6", at: "1:37:18", text: "Each school is voted individually" },
        { who: "Ashley Woods (Warren), if the closure vote fails", at: "1:38:11", text: "If it doesn't happen, we have to revert to option A" },
      ],
    },
    {
      id: "grades56",
      title: "Grades 5 and 6, and buses",
      items: [
        { who: "Emily Dolloff (Duxbury), on sending grades 5-6 to Crossett Brook", at: "0:30:35", text: "We don't need to have any major modifications to fit the K through 4." },
        { who: "Ashley Woods (Warren), on bringing grades 5-6 back to the valley later", at: "1:00:26", text: "If we go to two schools and we want our fifth and sixth grade back, but we like the two school model, we can expand on the two schools we keep open." },
        { who: "Ashley Woods (Warren)", at: "1:02:14", text: "But it doesn't have to be forever is the you know we can't promise it." },
        { who: "Alexina Cather (Waitsfield), on the bus route", at: "1:04:07", text: "once they get to drop the kids off at Harwood, they go straight from Harwood to Crossett." },
        { who: "Langford Davidson (Fayston), on the bus contract", at: "0:50:57", text: "we can add bus routes to our contract. We just can't remove them." },
        { who: "Langford Davidson (Fayston)", at: "0:49:39", text: "I will be the first to admit that not everyone has bus access... it's $87,000 a year to add a bus" },
        { who: "Macon Phillips (Warren, on Zoom)", at: "2:13:30", text: "to me understanding buses around the fifth six stuff is like absolutely the top of my list." },
      ],
    },
    {
      id: "why-two",
      title: "Why two closures, and what fewer buildings would pay for",
      items: [
        { who: "Macon Phillips (Warren, on Zoom)", at: "1:18:12", text: "the board has decided we can't put forward a budget that goes over the threshold this year to the public." },
        { who: "Macon Phillips (Warren, on Zoom), on a bond for Crossett Brook", at: "1:18:12", text: "right now a bond also counts against our educational spend and towards a penalty." },
        { who: "Ashley Woods (Warren)", at: "1:26:35", text: "I also have heard a million people offer this three school model which does not financially work." },
        { who: "Emily Dolloff (Duxbury)", at: "0:45:13", text: "the elementary schools do not have a full-time nurse... So with fewer buildings, we can have a greater... educational options for students." },
        { who: "Ashley Woods (Warren), on staff cuts", at: "2:10:15", text: "we're going to work to offer incentives so that older teachers retire" },
      ],
    },
    {
      id: "buildings",
      title: "Closed buildings and the valley",
      items: [
        { who: "Ashley Woods (Warren), on what happens to a closed building", at: "1:55:27", text: "it's up to the towns. I mean, we'll have the opportunity to sell the t to offer it back to the town. They don't have to buy it." },
        { who: "Karl Naden (Fayston), from the floor during public comment", at: "1:42:28", text: "Can we imagine a situation where we can have that Waitsfield school be a community center that supports the district?" },
        { who: "Karl Naden (Fayston)", at: "1:42:28", text: "We're still able to support those families on the other side of Moretown Mountain Road because we still have a school in Moretown." },
        { who: "The Warren select board chair", at: "1:57:58", text: "the campus belongs to the town and we are ready and willing to talk about how to make that most beneficial for the entire valley." },
      ],
    },
  ],
  publicComment:
    "About fifteen residents spoke over about an hour and a half, most from Warren and Waitsfield, with families from Granville who send their children to Warren and one from Moretown. Several asked the board to keep grades 5 and 6 in the valley or not move them twice, citing long rides (Granville families described drives near 50 minutes to Crossett Brook); asked for a full transportation cost before the vote; and asked about the effect on the valley's economy. Waitsfield residents said village businesses depend on families at the school (several owners told one resident that closing it would cut their business, one by about 30%) and raised the school's generator and emergency-shelter role, its sewer grant, and its kitchen. Others asked what happens to closed buildings and who pays to keep them up, and how the board will help staff who lose their jobs. A few spoke for consolidation, for larger classes, and several asked the state's legislators to change the law.",
};

// The November 18, 2026 board meeting: roll-call votes to advance schools to the closure hearings Article 6(E)
// requires. The board's attorney advised (read by the chair) that advancing takes a majority of the weighted votes
// cast; closing takes two-thirds of the board, voted school by school, after the hearings. Each answer is from the
// recording (4:53-4:57). The chair read some names in pairs ("Cindy Macon", "Rob, Caitlin"); no answer from Cindy
// Senning or Robert Dabrowski is audible on either motion, so both are recorded as not heard. The chair was not called.
export const VOTES_1118 = {
  src: ref("meeting1118", "action items, 4:50-4:57"),
  rule: "majority",
  ruleText: "advancing a school for consideration requires a majority weighted vote cast",
  chair: "Ashley Woods",
  notHeardNote: "No answer from Cindy Senning or Robert Dabrowski is audible on the recording: the chair read their names together with the next member's (\"Cindy Macon,\" \"Rob, Caitlin\"). The chair was not called and did not vote.",
  motions: [
    {
      id: "MES",
      school: "MES",
      at: "4:53:28",
      by: "Pam Eaton",
      second: "Theo Hanna",
      text: "I move to propose the consideration of Moretown for possible closure and to warn public meetings as stipulated in the HUUSD articles of agreement.",
      announced: "That motion will pass.",
      votes: {
        "Alexina Cather": "yes", "JB Weir": "yes", "Cindy Senning": null, "Macon Phillips": "yes", "Robert Dabrowski": null,
        "Caitlin Lovegrove": "no", "Jillan Cantor-Sackett": "yes", "Emily Dolloff": "yes", "Pam Eaton": "yes",
        "Langford Davidson": "yes", "Karl Naden": "yes", "Theo Hanna": "yes", "Steve Rosenberg": "no",
      },
    },
    {
      id: "FES",
      school: "FES",
      at: "4:55:46",
      by: "Langford Davidson",
      second: "Karl Naden",
      text: "With much sorrow and trepidation, I move that the board formally considers potential closure of Fayston",
      announced: "And that will pass.",
      votes: {
        "Alexina Cather": "yes", "JB Weir": "yes", "Cindy Senning": null, "Macon Phillips": "yes", "Robert Dabrowski": null,
        "Caitlin Lovegrove": "yes", "Jillan Cantor-Sackett": "yes", "Emily Dolloff": "yes", "Pam Eaton": "yes",
        "Langford Davidson": "yes", "Karl Naden": "yes", "Theo Hanna": "yes", "Steve Rosenberg": "yes",
      },
    },
  ],
  noOtherMotions: "The chair then asked for other motions; there were none. Members said afterward that Moretown and Fayston are therefore the only schools the board can vote to close on January 6, and the chair agreed.",
};

// The three hearings, as moved and agreed by voice vote at 4:59-5:12. The superintendent said he would confirm the
// details with the principals the next morning.
export const HEARINGS_1118 = {
  src: ref("meeting1118", "hearing dates, 4:57-5:12"),
  list: [
    { date: "2026-12-01", day: "Tuesday", school: "MES", where: "Moretown", time: "6:00 PM" },
    { date: "2026-12-03", day: "Thursday", school: "FES", where: "Fayston", time: "6:00 PM" },
    { date: "2026-12-14", day: "Monday", school: null, where: "Brookside, Waterbury", time: "6:00 PM" },
  ],
  note: "A Moretown member asked to move one hearing so the board would not meet three evenings in a row (December 1-3, with a board meeting on December 2); the superintendent could not attend the following week, and the dates stayed. The superintendent said the hearings will be on Zoom and recorded.",
};

// The administration's November 18 headcounts and classrooms for the two finalists in fall 2027: this year's students
// moved up a grade and placed at the nearest open school by home address, checked student by student (deck slide 7).
// Pre-K to 4. These differ from the October 28 tables this site's model uses (built from this year's enrollment): most
// at Waitsfield (245 to 180) for Waitsfield + Warren, and at Warren (227 to 147) and Moretown (136 to 195) for Moretown +
// Warren. need/have: classrooms.
export const CLASSROOM_1118 = {
  src: ref("deck1118", "slide 7"),
  pairs: {
    "WES+WRN": { students: { WES: 180, WRN: 117, BPS: 380 }, need: { WES: 10, WRN: 7, BPS: 20 }, have: { WES: 11, WRN: 14, BPS: 24 } },
    "MES+WRN": { students: { MES: 195, WRN: 147, BPS: 335 }, need: { MES: 11, WRN: 8, BPS: 18 }, have: { MES: 11, WRN: 14, BPS: 24 } },
  },
  note: "The administration said every scenario fits once this year's students are moved up a grade; with Moretown + Warren, Moretown would use all 11 of its classrooms.",
};

// Moretown's kitchen and building costs, the board's November 4 request (deck slide 8).
export const MORETOWN_COSTS = {
  src: ref("deck1118", "slide 8"),
  kitchen: 134032.8,
  dishwasher: 96463,
  building: 41250,
  total: 175282.8,
};

// What was said on November 18, verbatim from the cached transcript (sources/2026-11-18-board-meeting/), trimmed with
// ellipses. A test checks each piece. The transcript labels some members by first name; see VOTES_1118.
export const MEETING_1118 = {
  src: ref("meeting1118", "transcript of the recording"),
  groups: [
    {
      id: "where",
      title: "Where each member stood (the third round)",
      items: [
        { who: "Theo Hanna (Waterbury)", at: "3:53:38", text: "I believe we should move forward considering uh Fayston and Moretown for potential closure." },
        { who: "Steve Rosenberg (Moretown)", at: "3:59:37", text: "I actually think keeping Warren and Moretown open makes the most sense. And the strongest case is made by the families in North Moretown." },
        { who: "Macon Phillips (Warren)", at: "4:02:12", text: "my current thinking is that Fayston and Moretown should move forward hearings and that Waitsfield and Warren should be our Valley schools... for me, choosing Waitsfield is a bet on the future." },
        { who: "Alexina Cather (Waitsfield)", at: "4:03:34", text: "We should choose the buildings that will serve the most children most safely for the longest time." },
        { who: "Pam Eaton (Waterbury)", at: "4:06:08", text: "I've already said keeping open Waitsfield and Warren is what makes sense for me." },
        { who: "Robert Dabrowski (Waterbury)", at: "4:09:20", text: "Without naming a specific building tonight, I want to focus on the principle that should guide what moves forward to public hearings." },
        { who: "JB Weir (Waitsfield)", at: "4:10:18", text: "The uh HUUSD board should move Moretown Elementary School and Fayston elementary school forward for public hearings on potential closure" },
        { who: "Langford Davidson (Fayston)", at: "4:13:12", text: "As a longtime supporter of the Moretown Warren scenario, tonight I have to switch my vote and support Waitsfield and Warren for a number of reasons." },
        { who: "Cindy Senning (Duxbury)", at: "4:15:15", text: "I do not think the Moretown School has the capacity to expand in a way that our future as a district will require." },
        { who: "Caitlin Lovegrove (Moretown), who calls a Moretown-based school \"MRV North\" (the captions spell it MRB)", at: "4:21:31", text: "In my opinion, for all the reasons we've said, MRB North is still the ideal location for a preK through four school in the valley." },
        { who: "Emily Dolloff (Duxbury)", at: "4:25:04", text: "the two schools that are Best suited to provide this are Warren and Waitsfield. These findings are different from my original findings a few weeks ago" },
        { who: "Jillan Cantor-Sackett (Waterbury)", at: "4:28:31", text: "I think that I have to um say that I think we should move forward with keeping the Waitsfield School open." },
        { who: "Karl Naden (Fayston), who named no school in this round, then seconded the Fayston motion and voted yes on both", at: "4:33:18", text: "at some level we can't close any of these three schools that we are discussing." },
        { who: "The chair, Ashley Woods (Warren), after a member noted she had not spoken", at: "4:37:46", text: "I'm not going to make a statement. I'm going to maintain my position as the leader of this group." },
      ],
    },
    {
      id: "evidence",
      title: "The evidence and the trade-offs (the first two rounds)",
      items: [
        { who: "Robert Dabrowski (Waterbury)", at: "2:34:23", text: "all of our aging schools carry similar maintenance needs. So this decision can't rest on a single spreadsheet line item." },
        { who: "Macon Phillips (Warren)", at: "3:01:51", text: "There's there's really no obvious answer to me in this data. certainly no compelling one. Both schools can work. Each has a real weakness." },
        { who: "Macon Phillips (Warren)", at: "3:26:00", text: "Waitsfield for the valley's economic development. Moretown for the valley's cohesion." },
        { who: "JB Weir (Waitsfield), on flooding", at: "2:35:25", text: "More towns sites largely within the FEMA 500year flood plane." },
        { who: "Steve Rosenberg (Moretown), on flooding", at: "2:59:18", text: "I think this issue is a minor consideration that's been blown out of proportion." },
        { who: "Steve Rosenberg (Moretown), on repairs", at: "2:59:18", text: "priority one needs for Moretown are 366,000. Same for Waitsfield is 622,000." },
        { who: "Cindy Senning (Duxbury), on access", at: "2:41:32", text: "Moretown was my bigger concern. It has three floors, no elevators" },
        { who: "Caitlin Lovegrove (Moretown), on bus rides", at: "2:44:52", text: "that would push that timing for those students on that edge of town outside of an hour" },
        { who: "Alexina Cather (Waitsfield), on kitchens", at: "3:29:22", text: "Choosing a building without an adequate adequate kitchen to meet the incoming need of children means paying twice." },
        { who: "Langford Davidson (Fayston), on grades 5-6", at: "3:38:28", text: "the biggest trade-off that I see is sending our fifth and sixth graders to Crossett Brook for an undetermined amount of time." },
        { who: "Pam Eaton (Waterbury)", at: "3:08:29", text: "this district can no longer afford to maintain the seven buildings we have." },
      ],
    },
    {
      id: "admin",
      title: "The administration's update",
      items: [
        { who: "The finance director", at: "2:00:46", text: "just the minimum not to have an excess spending threshold to cut is $3.3 million." },
        { who: "The superintendent, on the enrollment counts", at: "1:47:11", text: "we went through student by student, took a look at the addresses and and physically matched them." },
        { who: "The finance director", at: "1:39:34", text: "in using and advancing um enrollments for fiscal year 28, um all the scenarios actually work." },
        { who: "The finance director, on Moretown's kitchen", at: "1:48:04", text: "just to make the kitchenal functional, we would need to invest $134,000." },
        { who: "The finance director, on two closures in FY29", at: "2:19:53", text: "So, we would still be under the excess spending threshold in fiscal year 29." },
        { who: "The finance director, asked about tax increases \"regardless of school closings\"", at: "1:59:45", text: "it's higher than 10%." },
        { who: "The finance director, on staffing two schools", at: "2:02:37", text: "you'll basically be having a nurse in one school, a nurse in another school rather than sharing nursing positions" },
        { who: "The superintendent, on bus routes", at: "2:09:22", text: "Lisa and I have had conversations with first student uh they are prepared to do the necessary routing for uh this for this coming year." },
        { who: "The superintendent, asked whether 5th graders would ride with high schoolers", at: "2:10:54", text: "We have not determined exactly what that schedule would look like today, but that is a possibility." },
        { who: "The superintendent, on Brookside", at: "2:07:38", text: "10 years ago when she was a teacher at Brookside, they had about 100 more students than they have today." },
      ],
    },
    {
      id: "votes",
      title: "The votes and what comes next",
      items: [
        { who: "The chair", at: "4:50:20", text: "this is not a vote to close a school. We are only deciding whether a school should be advanced for further consideration through public hearings." },
        { who: "Steve Rosenberg (Moretown), on the hearing places", at: "5:08:06", text: "if the third meeting is in Waterbury then essentially that takes Waitsfield off the table and that's clearly the sense of the board." },
        { who: "Langford Davidson (Fayston)", at: "5:09:29", text: "Those are the only two schools we can vote to close on January 6 because they're the only two motions that we made tonight." },
        { who: "The superintendent", at: "5:05:11", text: "after the three hearings you have to take another vote to warrant a closure vote." },
        { who: "Langford Davidson (Fayston), on the architects' study", at: "5:13:38", text: "the purpose of that meeting will be to redefine the scope of what we're asking for from the architects" },
        { who: "Pam Eaton (Waterbury)", at: "5:15:00", text: "The board only authorized us to look at cabb in that RFP." },
      ],
    },
  ],
  publicComment:
    "Over a hundred people signed up; about 55 spoke for a minute each, after four Waitsfield students opened. Most were from Moretown and Waitsfield, with others from Fayston, Warren, Duxbury families whose children attend Moretown by choice, the Waitsfield select board, the teachers' union, and a Roxbury resident on what a town does with a closed school. Moretown speakers cited its outdoor (ECO) program and forest classrooms, growth and lower home prices, northern Moretown families who would go to Brookside (a letter with about 75 signatures), shorter bus rides, lower priority 1 repairs, and that its flood risk is small. Waitsfield speakers cited the village's businesses, housing plans, and the town sewer, its kitchen, generator, and emergency-shelter role, and walking access to the library and after-school programs; a Green Mountain Power employee described a power project serving the valley. Several asked for more time, bus plans, and after-school care.",
};

// Asked for at the meeting, for the next steps.
export const ASKED_1104 = [
  { who: "JB Weir", what: "The cost of what Moretown's kitchen would need to serve the larger school: a new kitchen, or a van to bring meals from Harwood, and everything that entails.", answered: "Answered November 18: $134,033 to make the kitchen functional (a dishwasher installation of $96,463 with electrical, plumbing, and ventilation, plus ovens, tables, and shelving). The same slide adds $41,250 of other Moretown building work (siding, heating controls). Asked for the same view of Waitsfield, the finance director named a boiler due for replacement (about $60,000) and a partial roof (about $400,000 over a couple of years)." },
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
    MES: "Prep kitchen only. Much of the food is cooked at Harwood and carried over in staff members' own cars, and some is made on site (a board member, November 12); the dishwasher needs replacing and more refrigeration is needed. On November 18 the district priced a functional kitchen at $134,033, mostly a $96,463 dishwasher installation.",
  },
  land: {
    WES: "7.7 acres, owned by the district. Town sewer targeted for about fall 2028, partly funded by a grant of about $1 million premised on expanding the school; its leach fields would then free land for additions. Whether the grant was at risk if the school closed was not answered on the record before the November 18 votes, which did not advance Waitsfield.",
    WRN: "The building sits on town land under an easement; additions need the town's written permission. No flood or wetland limits were noted.",
    MES: "About 2 acres. Most of the site is in the 500-year flood zone and the rear is out of it. The school flooded twice in the past three years from blocked culverts on a private road above it, which a board member said have since been cleared. The district carries flood insurance on it \"because of past events,\" a board member said on November 12, adding \"that doesn't necessarily mean it's going to happen in the future.\" Residents disagree about the risk now: one said the culvert and the downstream bridge have been rebuilt.",
  },
  src: [ref("deck1118", "slide 8"), ref("deck", "slides 22-24"), ref("meeting1104", "kitchens, flooding, and expansion"), ref("meeting1102", "Moretown's meals"), ref("maconScores", "Building and kitchen notes"), ref("forum1112", "2:33-2:38")],
};
