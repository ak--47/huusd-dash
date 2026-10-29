import { ref } from "./sources.js";

// Arithmetic in the district's materials that checks out.
export const CHECKS = [
  { text: "Path A's six cuts add up to exactly $3,339,273, the cut the district says is needed.", ref: ref("deck", "slide 13") },
  { text: "Path B's two savings add up to $3,929,469, and the Path B budget is the level-service budget minus that amount.", ref: ref("deck", "slides 19-20") },
  { text: "The level-service budget minus the required cut equals this year's budget, $51,884,847.", ref: ref("deck", "slide 10") },
  { text: "The level-funded and Path B per-pupil figures agree with each other: both imply about 2,565 weighted pupils.", ref: ref("deck", "slides 10, 20") },
  { text: "In the October 1 enrollment report, every school's grade rows add up to its printed total, for 2024, 2025, and 2026.", ref: ref("enroll", "p. 1") },
  { text: "Eleven of the twelve capacity tables add up row by row, and every table's grand total is right.", ref: ref("deck", "slides 27-32") },
  { text: "In the capacity tables, students from a closed school go to the nearest open school, as the district says. For example, Moretown children go to Brookside when Moretown and Waitsfield both close.", ref: ref("deck", "slide 29") },
  { text: "The threshold schedule on the slides (115.5% in FY28 down to 112.5% in FY32) matches Act 169 of 2026.", ref: ref("act169", "Sec. 7") },
];

// Options residents and board members have raised, as reported. Not ranked.
export const IDEAS = [
  {
    title: "Close one valley school instead of two",
    text: "Fewer children change schools, and the district keeps more buildings. The district has not published what closing one school would save.",
    record: "The board's question-and-answer document says that from the models so far, closing one school \"does not look like it would save enough money to make it worthwhile.\"",
    ref: ref("qdoc", "closing one school"),
    refLabel: "Board Q&A",
    build: "#/build?o=MWR&t=6&m=1",
  },
  {
    title: "Keep grades 5 and 6 in the valley",
    text: "Use portable classrooms at the receiving schools, move Pre-K out to make room, or find other room in the district, so valley 5th and 6th graders do not go to Crossett Brook.",
    record: "Raised as community input in the board's question-and-answer document. On October 28 the board asked to see this version at its next meeting. The district priced portable classrooms at about $600,000 to $700,000 for two units with two classrooms each.",
    ref: ref("deck", "slide 26"),
    build: "#/build?o=MR&t=6&m=1&p=WRN1",
  },
  {
    title: "Grade-band pairing",
    text: "Make Moretown and Warren K-3, make Waitsfield grades 4 to 6, and close Fayston. Every valley child would change buildings at grade 4.",
    record: "Asked in the board's question-and-answer document. No answer is recorded.",
    ref: ref("qdoc", "grade pairing"),
    refLabel: "Board Q&A",
  },
  {
    title: "Merge the middle schools and keep all four valley schools",
    text: "Take the larger of Path B's two savings and make the rest of the cut from the Path A list.",
    record: "Not in the district's presentation. You can price it on the Build a plan page.",
    build: "#/build?o=FMWR&t=6&m=1",
  },
  {
    title: "Spend over the threshold and pay a smaller penalty",
    text: "Make some cuts but not all. The amount left over the limit is paid as an excess spending penalty on local tax rates.",
    record: "The district priced one version: a budget that grows with inflation (+2.7%) would be $172 per pupil over the limit, with a penalty of about $445,000.",
    ref: ref("deck", "slide 10"),
  },
  {
    title: "Change attendance boundaries",
    text: "Assign students to the nearest school instead of by town, to balance enrollment among the buildings that stay open.",
    record: "According to the board's question-and-answer document, the superintendent said at the October 14 meeting that \"the board can change attendance boundaries.\"",
    ref: ref("qdoc", "attendance boundaries"),
    refLabel: "Board Q&A",
  },
];

// Research on moving schools, closures, costs, school size, and bus rides: for and against.
export const EVIDENCE = [
  {
    topic: "Moving into a new school",
    summary: "Studies in New York City, Florida, and British Columbia find that students who move into a separate middle school score lower in the year they move, by about 0.1 to 0.2 standard deviations, and the drop lasts for years. They also miss more school. Other studies find the gap shrinks once student and school differences are accounted for, and one finds 6th graders placed with older students have more discipline problems, which supports keeping grades 5-6 apart from 7-8.",
    studies: [
      { cite: "Rockoff & Lockwood, 2010", where: "New York City", finding: "Moving into a middle school in grade 6 or 7 lowered math and English scores by about 0.15 standard deviations.", url: "https://www.educationnext.org/stuck-in-the-middle/" },
      { cite: "Schwerdt & West, 2013", where: "Florida", finding: "Students who moved to a middle school in grade 7 dropped 0.22 standard deviations in math and 0.15 in reading; absences and dropout rose.", url: "https://www.educationnext.org/the-middle-school-plunge/" },
      { cite: "Dhuey, 2013", where: "British Columbia", finding: "Attending a middle or junior high school reduced achievement gains in grades 4-7 compared with a K-8 school.", url: "https://ideas.repec.org/a/wly/canjec/v46y2013i2p469-496.html" },
      { cite: "Schwartz et al., 2011", where: "New York City", finding: "Students who went from a K-4 school to a 5-8 school, or stayed in a K-8 school, outperformed students on other grade paths.", url: "https://doi.org/10.3102/0162373711407062" },
      { cite: "Cook et al., 2008", where: "North Carolina", finding: "6th graders in middle schools were more likely to be cited for discipline problems than 6th graders in elementary schools.", url: "https://doi.org/10.1002/pam.20309" },
      { cite: "Hong, Zimmer & Engberg, 2018", where: "One U.S. district", finding: "Support for K-8 schools was much weaker than in earlier research once elementary-grade effects were accounted for.", url: "https://ideas.repec.org/a/eee/juecon/v105y2018icp1-19.html" },
      { cite: "Welsh, 2017", where: "Research review", finding: "Changing schools is generally linked to worse outcomes, unless the move is to a better school.", url: "https://doi.org/10.3102/0034654316672068" },
    ],
  },
  {
    topic: "When a school closes",
    summary: "For students whose school closes, test-score effects are usually small and short-lived, but not always zero. Some studies find short-term harm, especially for students from small schools; others find none. One Dutch reform that closed small schools slightly raised achievement.",
    studies: [
      { cite: "Beuchert et al., 2018", where: "Denmark", finding: "Short-run harm to students from closing schools, worst for those from small schools.", url: "https://doi.org/10.1016/j.econedurev.2018.05.004" },
      { cite: "Izadi, 2015", where: "Rural Finland", finding: "No measurable harm despite longer trips and larger schools.", url: "https://ideas.repec.org/p/fer/wpaper/63.html" },
      { cite: "de Haan et al., 2016", where: "Netherlands", finding: "Raising the minimum school size slightly raised achievement.", url: "https://econpapers.repec.org/RePEc:oup:jleorg:v:32:y:2016:i:4:p:816-839." },
      { cite: "Brummet, 2014", where: "Michigan", finding: "No lasting harm to displaced students on average; modest harm to students in receiving schools.", url: "https://ideas.repec.org/a/eee/pubeco/v119y2014icp108-124.html" },
      { cite: "Kim, 2024", where: "Texas", finding: "Test scores recovered within about three years; students in grades 3-5 saw no long-run harm, older students did.", url: "https://edworkingpapers.com/sites/default/files/ai24-963.pdf" },
    ],
  },
  {
    topic: "Whether consolidation saves money",
    summary: "Evidence on savings comes mostly from district mergers, not school closures. Large savings show up mainly for very small districts. Several studies find transportation and staffing costs rise enough to cancel much of the savings. In six large city districts, closing a school saved well under $1 million a year per building.",
    studies: [
      { cite: "Duncombe & Yinger, 2007", where: "Rural New York", finding: "Large per-pupil savings only for very small districts, reduced by capital costs.", url: "https://eric.ed.gov/?id=EJ896695" },
      { cite: "Gordon & Knight, 2008", where: "Iowa", finding: "District consolidations showed no efficiency gains.", url: "https://doi.org/10.1177/1091142107305219" },
      { cite: "McGee, Mills & Goldstein, 2021", where: "Arkansas", finding: "Mandatory consolidation of small districts produced no evidence of economies of scale.", url: "https://www.edworkingpapers.com/sites/default/files/ai21-347.pdf" },
      { cite: "Pew Charitable Trusts, 2011", where: "Six large urban districts", finding: "Savings averaged well under $1 million per closed school per year, often below projections.", url: "https://www.pewtrusts.org/-/media/assets/2011/10/19/closing_public_schools_philadelphia_report.pdf" },
      { cite: "Kolbe et al., 2019", where: "Vermont", finding: "Schools under 100 students cost about 24% more per pupil, and schools of 101-250 about 12% more.", url: "https://legislature.vermont.gov/assets/Legislative-Reports/edu-legislative-report-pupil-weighting-factors-2019" },
    ],
  },
  {
    topic: "Bus rides",
    summary: "Rigorous evidence is thin. A large New York City study found long rides raised absences but did not lower test scores overall. Teenagers with longer commutes sleep less.",
    studies: [
      { cite: "Cordes et al., 2022", where: "New York City, grades 3-6", finding: "Longer rides increased absences and chronic absenteeism; no effect on test scores overall.", url: "https://edworkingpapers.com/sites/default/files/ai21-504_0.pdf" },
      { cite: "Howley et al., 2001", where: "Five-state principal survey", finding: "Rural schools were more likely to have longest rides of 30 minutes or more.", url: "https://journals.newprairiepress.org/jrre/article/id/20468/" },
      { cite: "Voulgaris et al., 2019", where: "U.S. time-use data", finding: "Teenagers with longer school commutes slept less.", url: "https://doi.org/10.1177/0739456X17725148" },
    ],
  },
];
