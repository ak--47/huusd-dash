// Meetings: what was said at each public meeting and forum, newest first. Quotes live in data/meeting.js
// (October 28, November 2) and data/decision.js (November 4, 12, 16, 18); summaries reuse the timeline's entries.

import { h, dateLong } from "../ui/dom.js";
import { cite, fold, pageHead, section } from "../ui/kit.js";
import { MEETING, MEETING_1102 } from "../../data/meeting.js";
import { MEETING_1104, MEETING_1112, MEETING_1116, MEETING_1118 } from "../../data/decision.js";
import { TIMELINE } from "../../data/timeline.js";
import { ref } from "../../data/sources.js";

const MEETINGS = [
  {
    id: "m-1118",
    date: "2026-11-18",
    title: "Board meeting: Moretown and Fayston sent to closure hearings",
    kind: "Board meeting at Harwood, about five hours and fifteen minutes, with about 55 public comments.",
    who: "The full board (the chair did not speak in the discussion and was not called in the roll calls), the superintendent, the finance director, and a district director.",
    data: MEETING_1118,
    timeline: "Board meeting: Moretown and Fayston sent to closure hearings",
    note: "On a slide titled as revised for the lower 2.5% health insurance rate, the administration still gave $3,339,273 as the cut needed, though that slide's level-service budget less this year's is $3,039,273 (our arithmetic). It and put one valley closure (grades 5-6 kept in the valley) at $2,304,281 and about 24 positions, leaving a $165,324 penalty. With two closures and the merger the budget would be $51,294,651, $255.76 per pupil under the threshold, and the finance director said it would stay under in FY29 with a 2.5% increase, using a low estimate of the state's yield. Fall 2027 headcounts by home address: Waitsfield + Warren, Waitsfield 180, Warren 117, Brookside 380; Moretown + Warren, Moretown 195, Warren 147, Brookside 335, all within each building's classrooms. Moretown's kitchen: $134,033, plus $41,250 for siding and heating controls. The two Moretown members put priority 1 repairs at about $366,000 for Moretown and about $622,000 to $633,000 for Waitsfield, one of them counting a roof of about $400,000 spread over a few years. The superintendent said the bus company, First Student, is ready to model routes once the board settles on a plan, and hopes to have details within about a month, and that 5th graders sharing a bus with high schoolers is possible but not decided.",
    more: { href: "#/decision?at=nov18", label: "How each member voted" },
  },
  {
    id: "m-1116",
    date: "2026-11-16",
    title: "Warren community forum",
    kind: "Community forum at Warren School, about 2 hours 15 minutes. Not a board meeting; no votes.",
    who: "The board chair and four other board members (Warren, Fayston, Waitsfield, Duxbury; one Warren member by Zoom). The superintendent and the finance director did not attend. Zoom listeners could not hear the room for the first half hour.",
    data: MEETING_1116,
    timeline: "Community forum, Warren",
    note: "No board member said they had changed their straw-poll choice. The chair said the board's scores were “weighed in,” that the board will no longer use the term “straw poll” (“a bad mechanism in my view”), and that after touring the three schools members filled in a second, simpler comparison sheet, which has not been published. The chair gave the savings as about $2.2 million for the middle-school merger and $1.7 million for closing two valley schools; the district's figures are $2.1 million and $1.8 million, and the total, about $3.9 million, is the same, so this site keeps the district's figures. A resident put the staff reduction at 34.5 positions; the district's figure is 32.5.",
  },
  {
    id: "m-1112",
    date: "2026-11-12",
    title: "Waterbury-Duxbury community forum",
    kind: "Community forum at Crossett Brook, about 2 hours 40 minutes. Not a board meeting; no votes.",
    who: "The five Waterbury and Duxbury board members, with the superintendent and the finance director.",
    data: MEETING_1112,
    timeline: "Community forum, Waterbury and Duxbury",
    note: "No board member at the forum said they had changed their straw-poll choice or proposed reopening the choice between Moretown and Waitsfield; residents disagreed about flood risk at Moretown, one calling the preference for Moretown over Waitsfield a mistake and another saying the culvert and the downstream bridge have been rebuilt. The figures given ($1.8 million for closing two valley schools, $2.1 million for the middle-school merger, about $3.9 million together) match the district's October 28 figures this site already uses.",
  },
  {
    id: "m-1104",
    date: "2026-11-04",
    title: "Board meeting: scores and a straw poll",
    kind: "Board meeting, about four hours, with an hour of public comment.",
    who: "The full board, the superintendent, and the finance director.",
    data: MEETING_1104,
    timeline: "Board meeting: scores and a straw poll",
    more: { href: "#/decision", label: "Each member's scores and straw-poll answer" },
  },
  {
    id: "m-1102",
    date: "2026-11-02",
    title: "Building Use & Visioning Committee",
    kind: "Committee meeting on Zoom. Figures said there were preliminary.",
    who: "Committee members, the superintendent, the finance director, and the district's buildings and grounds representative. People are named by role.",
    data: MEETING_1102,
    timeline: "Committee meeting on the school buildings",
  },
  {
    id: "m-1028",
    date: "2026-10-28",
    title: "Board meeting: budget presentation #2",
    kind: "Board meeting with the district's second budget presentation.",
    who: "The full board and the administration. The transcript has no reliable speaker labels, so people are named only where the recording makes it clear.",
    data: MEETING,
    timeline: "Budget presentation #2 and a straw poll",
  },
];

const quote = (q) => h("li", {}, h("blockquote", {}, `“${q.text}”`), h("p", { class: "who" }, q.at ? `${q.who}, ${q.at}` : q.who));

export default {
  title: "Meetings",
  render(el) {
    el.append(
      pageHead({
        kicker: "Meetings",
        title: "What was said at the meetings",
        lede: "Every public board meeting and community forum on the budget and the valley schools since October 28, newest first: what happened, then what people said in their own words, with a link to the recording. Board members are named; staff by role; residents who spoke are not named.",
      }),

      h(
        "nav",
        { class: "wonk-card meetings-toc", "aria-label": "Meetings on this page" },
        h("p", { class: "wonk-label" }, "Jump to a meeting"),
        h(
          "ul",
          {},
          MEETINGS.map((m) => h("li", {}, h("a", { href: `#/meetings?at=${m.id}` }, h("strong", {}, dateLong(m.date)), `: ${m.title}`)))
        ),
        h("p", { class: "small" }, "How these were made: ", h("a", { href: "#/sources?at=meeting-method" }, "transcripts and quote checks"), ".")
      ),

      ...MEETINGS.map((m, i) => {
        const tl = TIMELINE.find((x) => x.date === m.date && x.title === m.timeline);
        const groups = m.data.groups.map((g, j) => {
          const list = h("ul", { class: "quotes" }, g.items.map(quote));
          // The newest meeting shows its first groups open; older ones fold away.
          return i === 0 && j < 2 ? h("div", { class: "dc-quotes" }, h("h3", {}, g.title), list) : fold(g.title, list);
        });
        return section(
          { id: m.id, title: `${dateLong(m.date)}: ${m.title}`, intro: m.kind },
          h("p", { class: "small" }, m.who, " ", cite(m.data.src)),
          tl ? h("p", {}, tl.detail) : null,
          h(
            "div",
            { class: "meeting" },
            ...groups,
            m.note ? h("p", { class: "small" }, m.note, " ", cite(m.data.src)) : null,
            h("p", { class: "small" }, h("strong", {}, "Public comment. "), m.data.publicComment, " ", cite(m.data.src)),
            m.more ? h("p", {}, h("a", { class: "wonk-btn", href: m.more.href }, m.more.label)) : null
          )
        );
      }),

      h("p", { class: "small" }, "The district posts its meeting recordings on its public YouTube channel. ", cite(ref("ytChannel")))
    );
  },
};
