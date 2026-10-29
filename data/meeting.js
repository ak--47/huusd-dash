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
        { who: "The superintendent, on Path B", text: "Even if the board goes path B and makes the reductions... we are going to be just under the threshold in the next two years." },
        { who: "The finance director, on why the savings changed since October 14", text: "At the last presentation, the elementary consolidation would have achieved 2.1, but with actually looking at numbers in the seniority list, the numbers flipped a little bit." },
        { who: "An administrator, on keeping grades 5-6 in the valley", text: "There's no scenario where we keep five, six in the Valley in two schools absent temporary classrooms, including with the potential removal of pre-K from those numbers." },
        { who: "An administrator, on keeping valley 5th and 6th graders out of Crossett Brook", text: "Moving 7-8 out of [Crossett Brook] and only leaving the current 5-6, you're cutting that enrollment in half. You're keeping about 126 kids in one building which then we're not going to achieve that many FTE cuts and we're not going to achieve a 3.9 million dollar cut or reduction." },
        { who: "An administrator, on closing one school", text: "One building will not get us to where we need to be." },
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
