import { ref } from "./sources.js";

// What was said at the October 28, 2026 board meeting, from an automatic transcript of the public
// recording. The transcript has no speaker labels; a speaker is named only where the recording makes it
// clear. Bracketed words fix obvious transcription errors.
const SRC = ref("meeting1028", "transcript of the public recording");

export const MEETING = {
  src: SRC,
  groups: [
    {
      title: "The straw poll",
      items: [
        { who: "The chair", text: "If you are for moving ahead at looking at option B and going where we're going right now, please raise your hand. If you are opposed to that, please raise your hand. All right, that was, they're abstaining. That poll is successful in that we will continue down the charges to carry on looking at option B." },
        { who: "A board member, before the poll", text: "This straw poll is just a poll, we're not voting." },
        { who: "A board member, before the poll", text: "This is a vote about whether we're going to try to do that again, or we're going to commit to turning off two buildings." },
        { who: "An administrator", text: "You still have options because you're not taking a formal vote to do anything yet... the only decision point at that next meeting... if you want to close a building or two buildings you will have to make a decision to have three public hearings." },
      ],
    },
    {
      title: "The administration",
      items: [
        { who: "The superintendent", text: "If I could present an option three tonight, I would be presenting that option three. If there is another way, people have said, is there another way? Within the current definition, we are presenting the options that are available. Our challenge, as I've said, is we can't continue cutting our way out of this." },
        { who: "The finance director, on Path A", text: "If you choose with the high impact cuts, that's not putting us on a sustainable path for the future. We will then see cuts year after year because the excess spending threshold in fiscal year 29 is dropping another percentage... So we're going to constantly see cuts." },
        { who: "The superintendent, on cutting buses under Path A", text: "But we could, in theory, reduce and eliminate transportation. As the educational leader of the district, I think that is a horrible idea and a poor choice." },
        { who: "The superintendent, on Path B", text: "Even... if the board goes path B and makes the reductions, we are, by the modeling we're doing, and again they're... projections, we are going to be just under the threshold in the next two years." },
        { who: "The finance director, on why the savings changed since October 14", text: "At the last presentation, the elementary consolidation would have achieved 2.1, but with actually looking at numbers in the seniority list, the numbers flipped a little bit." },
        { who: "A board member, on keeping grades 5-6 in the valley", text: "There's no scenario where we keep five, six in the Valley in two schools absent temporary classrooms, including with the potential removal of pre-K from those numbers." },
        { who: "An administrator, on keeping valley 5th and 6th graders out of Crossett Brook", text: "Moving 7-8 out of [Crossett Brook] and only leaving the current 5-6, you're cutting that enrollment in half. You're keeping about 126 kids in one building which then we're not going to achieve that many FTE cuts and we're not going to achieve a 3.9 million dollar cut or reduction. So I mean, we can start over and I can model all of this, but you know, I'm just telling you we will have an impact in terms of a penalty because I have to then keep staff to service 126 kids in that building, or... we're gonna have to model moving staff, shared staff, between Brookside and [Crossett Brook]." },
        { who: "An administrator, on closing one school", text: "One building will not get us to where we need to be." },
        { who: "An administrator, offering to model Pre-K in its own building", text: "Next week I can bring what it would look like with keeping five, six, say in the temporary classrooms... and what we would look like if then we with PK, maybe an option of moving PK into a building, a separate building, but that would be keeping a building. So our numbers are going to be going down." },
        { who: "An administrator, on buses", text: "If five and six were at [Crossett Brook] you are looking at another, you know, five to ten minutes, because the bus transportation is already coming from the valley to Harwood." },
        { who: "The roadmap's author, on a Waitsfield 2nd grader", text: "If they were amongst the one of the schools that happened to be closing... they would have four transitions. Three transitions is very similar to Brookside." },
        { who: "The roadmap's author", text: "That's nothing set in stone, that was just a suggestion. What I'm trying to minimize is actual moves and transition from school to school to school." },
        { who: "The superintendent, explaining why the slides could not be posted earlier", text: "There were two very significant errors that we made on the slides that we did not catch [until] today." },
      ],
    },
    {
      title: "Board members",
      items: [
        { who: "A board member", text: "While it's not ideal to have kids move to different school buildings, they're going to be making the move with their peers, which provides a lot of consistency to them." },
        { who: "A board member who was once principal of Duxbury Primary School, and later served on the board that closed it", text: "As much as that hurt me to close that school that I loved so dearly, I can only say that I'm really pleased." },
        { who: "A board member from outside the valley", text: "All of our students in Brookside go there [to Crossett Brook] after they get done at fourth grade. They have a great fifth, sixth grade experience." },
        { who: "A board member, on moving valley 5th and 6th graders to Crossett Brook", text: "A real concern that you do it and then it doesn't come back." },
        { who: "A board member from Warren", text: "I really do not want to export our children out of the valley to [Crossett Brook]... I'm up for B, but that does not include this fifth and sixth grader thing until I really feel like we've exhausted everything." },
        { who: "A board member, on Pre-K in a closed building", text: "I think this idea was talked about long ago, but if one of the Valley schools, if we close two of them, and there was a partnership or a lease from the town to use a space of that building to operate a pre-K that served the Valley, as opposed to keeping a third building, that's what I was saying." },
        { who: "A board member", text: "We are a unified school district and we need to start acting like one, and the conversation should be less about saving a particular school and more about saving education for every single kid." },
      ],
    },
    {
      title: "State legislators",
      items: [
        { who: "Rep. Dara Torre, on state money", text: "I wish I could say... that we have the money somewhere else in state government that we could do... more for our kids and not have to make choices like this, but it's not true. The money's not there. And in fact, we're expecting less." },
        { who: "Rep. Dara Torre, on the district's process", text: "I think this very proactive, very data-driven, very communicative process that you are spearheading for our community is the right way to go." },
        { who: "Rep. Candice White, on state money", text: "There's not more money to pour into schools, and we know that. And so this exercise is about trying to control education costs." },
        { who: "Rep. Dara Torre, on the threshold", text: "It's too fast, it's too much. So there are some things that we can do for fiscal year 28 maybe, but probably more fiscal year 29 in terms of putting the brakes on." },
        { who: "Rep. Candice White, on a possible reprieve", text: "Maybe we can advocate for a reprieve from the excess spending threshold because we don't want to be penalizing schools that are working as hard as they can to achieve... the savings that we are asking for." },
        { who: "A legislator", text: "One other intel piece that I picked up today was that the healthcare teacher increase is going to be held to below 3%." },
      ],
    },
  ],
  publicComment:
    "Six people spoke in the 15 minutes of public comment, at least five of them from Moretown. Several spoke for keeping Moretown Elementary open and against repeated cuts; one said quality comes from people rather than buildings and that a plan keeping quality within budget would have his vote even if it closed his town's school. The chair of the Moretown select board offered the town's 170 acres for a school as an alternative to 193 Home Farm Way in Waitsfield (the Cabot Creamery building), the site in the district's feasibility study.",
};

// The board's Building Use & Visioning Committee, November 2, 2026 (on Zoom), from an automatic transcript of the
// recording, which labels speakers by their Zoom names. We name people by role. Bracketed words fix obvious
// transcription errors; "uh" and "um" are cut only with ellipses. Figures said here are preliminary: the finance
// director said she would present them on November 4.
export const MEETING_1102 = {
  src: ref("meeting1102", "transcript of the recording"),
  groups: [
    {
      title: "New numbers",
      items: [
        { who: "The finance director, on lower health insurance rates", text: "So, it is roughly a $300,000 savings in our level service." },
        { who: "The finance director, on closing one valley school with grades 5-6 kept in the valley", text: "So instead of the projected $3.9 million in cost savings, we would only be seeing $2.3 million." },
        { who: "The finance director, on why", text: "...just having Brookside fifth and sixth graders, that only gives us 131 students in Crossett Brook. So, we're underutilizing Crossett Brook." },
        { who: "The finance director, with the health insurance savings counted", text: "We still would be having a penalty of $165,324... fiscal year 29 to not have an excess spending threshold penalty, we would have to cut another minimum of $350,000." },
        { who: "The finance director, on whether that version needs portable classrooms", text: "...this trailers would not be necessary, but they're larger, much larger class sizes." },
        { who: "The superintendent, on how many more students it would take to stay under the threshold", text: "We would need districtwide an additional 200 students in our district to be under that amount." },
      ],
    },
    {
      title: "The administration",
      items: [
        { who: "The superintendent, on Path B", text: "...it's the best option educationally... We would have K to four buildings, a 5 to six building and a 7 through 12." },
        { who: "An administrator who was once principal at Moretown", text: "...this is an opportunity to get fifth and sixth graders together to have alignment." },
        { who: "The superintendent, on closing one school now and another later", text: "...those students would move another time and they would not necessarily be moving with the same cohort of students that they would be if we did that at once." },
        { who: "The superintendent, on shared staff with one closure", text: "...you would have to take that capacity probably from Crossett Brook, who is a full-time nurse now... There's not an even split." },
        { who: "The superintendent, on other homes for Pre-K", text: "We would not recommend that for next year without... a lot of further work and research." },
        { who: "The superintendent, on rated and functional capacity", text: "...rated is what you could conceivably put in... but that's very large classes... that are not conducive to learning." },
        { who: "The superintendent, on Brookside's 480 and the consultant's 399", text: "I would go with the functional capacity." },
      ],
    },
    {
      title: "Buildings and wastewater",
      items: [
        { who: "The finance director, on the capacity tables", text: "...this right now is only including students. We haven't plugged in staff." },
        { who: "The finance director, on Waitsfield", text: "It's 230, but we would have to do an an amendment... to be able to reach up to 300." },
        { who: "The district's buildings and grounds representative", text: "...we don't we don't use our wastewater systems to capacity now... unless you're talking huge numbers you know almost doubling what you have... I don't see waste water as a constraint." },
        { who: "The committee chair, on Waitsfield's town wastewater system", text: "...the goal is to have the system online... by the fall of 2028." },
        { who: "The committee chair", text: "...the town of Waitsfield did... receive funding from the Northern Borders Regional Commission... of approximately $1 million... on an application that was premised on expanding the school to accommodate potential consolidation." },
        { who: "The superintendent, on Moretown's meals", text: "It's then transported in an employee[']s vehicle to get to... Moretown." },
      ],
    },
    {
      title: "Committee members",
      items: [
        { who: "The committee's co-chair", text: "...if we close one school for fiscal year 28 and then we close another school for fiscal 29, you're going to have kids that are going to move three times in three years." },
        { who: "A board member from Waterbury, on moving Crossett Brook's 5th and 6th graders back to Brookside", text: "...it was going to be incredibly challenging and tight squeeze because there are empty classrooms but it wasn't logistically feasible and then there were concerns about the cafeteria size..." },
        { who: "A board member, on sending valley 5th and 6th graders to Crossett Brook while a new school is planned", text: "I am worried about them being caught with a failed bond as someone from the public raised." },
      ],
    },
  ],
  publicComment:
    "Four people spoke. One favored a central school and did not like the idea of separating the 5th and 6th graders; one asked the board to consider new consultants and new ways to involve the public; two asked it not to lose sight of Harwood's building, and one of them urged it to look at two valley schools teaching K-6, with Pre-K elsewhere if needed, and worried that a bond for a new school might not pass. The committee put off reviewing the five feasibility-study proposals to a later meeting.",
};
