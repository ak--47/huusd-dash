# Harwood School Plans Explorer

An independent, plain-language guide to the Harwood Unified Union School District's (HUUSD) FY28 budget and school consolidation choices. It shows the district's figures as published, re-checks the arithmetic, models other combinations of the same building blocks, and adds what the presentations leave out, mainly **how many different schools a child would attend** under each plan.

**Live site:** https://ak--47.github.io/huusd-dash/
**Staging (changes being previewed, not final):** https://ak--47.github.io/huusd-dash/staging/

Built by Aaron Krivitzky, a Waitsfield parent. Independent, not affiliated with HUUSD. Corrections are welcome as [GitHub issues](https://github.com/ak--47/huusd-dash/issues).

## What you can do on the site

| Page | What it answers |
|---|---|
| Start here | Where the decision stands after the October 28 meeting, the district's two paths, and other combinations |
| Your child's path | Every school a child would attend, kindergarten through grade 12, under each plan, including the district's draft roadmap |
| Compare the plans | Path A and all twelve versions of Path B on the same measures, plus the board's own scoring sheet with the data behind it |
| Options beyond A and B | Other combinations of the same building blocks, scored the same way: merging only the middle schools, closing one school, keeping grades 5-6 in the valley, and the middle-school merger with smaller cuts |
| Build a plan | Start from no change, Path A, Path B, closing one school, or the merger with smaller cuts; then choose which schools stay open and where their children go (including splitting a town between two schools), the grades valley schools teach (through grade 4, 5, or 6, with or without Pre-K), a Pre-K center in a closed school's building, the middle schools, program cuts, and building changes |
| The budget | The four FY28 budgets, the state's excess spending threshold, the Path A cuts, the Path B savings, and what the district says each would do |
| The schools | Enrollment, space, condition, and costs for each building, with a map and drive times |
| What we checked + questions | What adds up, what does not, what is missing, and questions to bring to the board |
| Sources and method | Every source, every formula, the history of earlier decisions, and an updates log |

## The decision in brief

- The district says next year's budget needs about **$3.34 million** in savings to stay under Vermont's excess spending threshold. If payments on bonds approved before July 1, 2026 are left out of the test, as state law allows, the figure is about **$2.84 million**. The district's figures appear to count them.
- **Path A** keeps all seven buildings and makes six program cuts: bus routes, district Pre-K classes, special programming, intervention staff, athletics and activities, and electives.
- **Path B** closes two of the four valley elementary schools (Fayston, Moretown, Waitsfield, Warren) and moves Crossett Brook's 7th and 8th graders to Harwood. The district puts its savings at $3.93 million. On October 28 the board agreed in a straw poll, not a formal vote, to keep developing Path B.
- Today every child attends 3 K-12 schools. Under Path B many attend 4 or 5, and with the district's draft roadmap some of today's youngest children would attend 6.

## Is there a plan that closes fewer schools?

Parents asked whether closing only one school, or ending district Pre-K, could be enough. Using the district's own figures:

- **Close only Fayston and end district Pre-K:** about $1.43 million, roughly **$1.9 million short**. Closing one school only gets close when combined with the middle-school merger, and the district's finance director said on October 28 that one closure "will not make the cut" without a penalty.
- **Fewest closures that meets the target on paper:** merge the middle schools, keep all four valley schools, and make three of Path A's smaller cuts (special programming, the Pre-K tuition model, and athletics and activities). Total about **$3.52 million, $177,000 over the target**, with no school closed, daily busing and intervention staff kept, and about 130 students changing schools: Crossett Brook's 7th and 8th graders, who move in every Path B version too.
- **The catch:** the $2.1 million merger saving was costed for Path B, with valley 5th and 6th graders filling Crossett Brook. The finance director said keeping them in the valley means fewer staff cuts. This combination works only if the merger alone still saves at least **$1.93 million** (or $1.43 million against the lower target). The district put the merger at $1.78 million on October 14. It also ends district Pre-K for about 118 children a year and cuts programs the district called devastating.

So there is no plan that is clearly safe, closes nothing, and keeps every program. The question that decides whether the least-disruptive combination works is one the district has not answered: **what does merging the middle schools save if valley 5th and 6th graders stay in the valley?** The site's Options page and Build a plan show all of these combinations with their caveats.

## How the numbers work

A static site: plain HTML, CSS, and JavaScript modules. No build step, no server.

- `data/` holds every number, transcribed from the sources, each with a reference to its document and page or slide.
- `js/model/` is the plan model: which school a child attends each year under a plan, building loads and capacity checks, budget effects, and student-level impacts. Pure functions, tested with Node.
- Every figure on the site is labeled as a **district figure**, **calculated** (our arithmetic on the district's numbers), or an **estimate** (where the district has not published a number).
- Wastewater limits can be read two ways: as on the district's slides, or as written in the state permits. Classroom space is checked against the capacities the district's planning consultant calculated in March 2025.
- Savings for plans the district did not cost are estimates: closing one school uses half the district's two-school figure, and plans that keep valley 5th and 6th graders out of Crossett Brook show the merger saving as an upper limit.
- Quotes from the October 28 board meeting were checked against a transcript of the recording and are attributed by role.

## Sources

The district's October 14 and October 28, 2026 presentations and the October 28 meeting recording; the October 1, 2026 enrollment report; the board's question-and-answer document; the superintendent's report; the Articles of Agreement; state wastewater permits; the TruexCullins facility and planning studies; Vermont Acts 169 and 170 of 2026; NCES school locations; the 2020 Census; OpenStreetMap routing; and published research. The full list with links is on the site's Sources page.

Copies of the primary documents are cached in [`sources/`](sources/README.md) so the numbers can be checked even if a link moves.

## Run it locally

```sh
npm install              # Playwright and axe, for the browser checks
npm run serve            # http://127.0.0.1:4848/
npm test                 # model and data checks
npm run test:browser     # every page in headless Chromium, desktop and phone, with accessibility checks
```

## Update the site

1. Change the number in `data/`, keeping its source reference.
2. Run `npm test` and `npm run test:browser`.
3. Add a line to `UPDATES` in `data/history.js` (shown on the site) and to [`MEMORY.md`](MEMORY.md) (the project changelog).
4. Open a pull request into `staging` and merge it. GitHub Actions tests it and publishes it at /staging/ (`.github/workflows/pages.yml`) within about 10 minutes.
5. When the working group is happy, `npm run staging:diff` shows what is waiting, and a pull request from `staging` into `main` (merged with a merge commit) puts it on the live site. Details in [`AGENTS.md`](AGENTS.md) under "Staging and live".

Working with an AI coding assistant? Point it at [`AGENTS.md`](AGENTS.md) first.
