# AGENTS.md

Guide for AI coding agents (and humans) working on this repository. Read this first, then `MEMORY.md` (the running changelog) for recent history and open items.

## What this is

**Harwood School Plans Explorer** (https://ak--47.github.io/huusd-dash/): an independent, plain-language website about the Harwood Unified Union School District's (HUUSD, Vermont) FY28 budget and school consolidation decision. It shows the district's figures as published, re-checks them, models other combinations of the same building blocks, and adds the measure the district's slides leave out: **how many different K-12 schools a child would attend** under each plan.

- **Owner:** Aaron Krivitzky (GitHub `ak--47`), a Waitsfield parent. Byline on the site: "Built by Aaron Krivitzky, a Waitsfield parent. Independent, not affiliated with HUUSD."
- **Readers:** residents and parents, most on phones, with no school-finance background; also board members.
- **Deadline context:** board meetings on November 2-4, 2026; budget vote on Town Meeting Day, March 2, 2027.

## Rules that are not negotiable

1. **Never look official.** No HUUSD logos, no district branding, no wording that implies affiliation. The independence note must stay visible on phones and desktop.
2. **Neutral.** Report what documents show. No advocacy for or against any path, no implied bad faith. When the site adds caveats to one option, check that comparable caveats exist for the others. The district's own case for consolidation stays on the site.
3. **Every number has a source.** Numbers live in `data/*.js` with a `ref(sourceKey, locator)`. Each figure on screen is tagged as a district figure, calculated (our arithmetic on district numbers), or an estimate (where the district published nothing). Never let an estimate read as a district figure.
4. **Quotes are exact.** Check every quote against `sources/2026-10-28-board-meeting/meeting-transcript-speakers.txt` (or the cited document) before adding it. Trim with ellipses only; never change meaning. Name a speaker only by role, and only when the recording makes the role clear.
5. **No personal contact details.** Do not publish the owner's email (corrections go through GitHub issues). Do not copy staff or family contact details from source documents.
6. **Attendee notes**, if added later, are labeled "reported by attendees", never as district data.
7. **Plain language.** Short sentences, sentence case, about an 8th-grade reading level. Define jargon with the glossary (`term()`).

## Stack and layout

A static site: plain HTML, CSS, and ES modules. No build step, no framework, no tracking, no server.

```
index.html              shell: sidebar nav, top bar, footer, script tags
js/app.js               hash router (#/route?query), focus and scroll handling, ?at=<id> deep links, print, drawer
js/pages/*.js           one module per page: export default { title, render(el, ctx) } (may return a cleanup fn)
js/ui/*.js              shared UI: dom.js (h(), money/num formatters, store), kit.js (cite, cites, tag, status,
                        unsure, fold, note, section, term, pageHead), strip.js, heat.js, charts.js (lazy d3/Plot),
                        compare-*.js (Compare page), build-*.js (Build page), child-form.js, glossary.js
js/model/*.js           the plan model, pure functions: plans.js, assign.js, journey.js, capacity.js, budget.js,
                        impact.js, options.js; index.js exports evaluate(plan, { basis, reading, classSize })
data/*.js               every number, with sources: budget, enrollment, district-scenarios (the 12 capacity
                        tables), schools (buildings, permits, consultant capacities), findings, meeting quotes,
                        context (checks, ideas, research), law, history (incl. UPDATES log), timeline, geo, sources
css/app.css             site styles on top of WONK; css/pages/*.css per page
wonk/                   vendored WONK design system (paper theme only). Do not edit; use its --ak-* tokens
sources/                cached primary documents (not deployed); see sources/README.md
test/                   node --test suites (model and data; WONK vendor check)
scripts/                serve.mjs (local server), browser-check.mjs (Playwright + axe over every route)
.github/workflows/      pages.yml: test on push to main, then deploy to GitHub Pages
```

Pages and routes: `#/` Start here (`overview.js`), `#/your-child` (`journey.js`), `#/compare`, `#/options`, `#/build`, `#/budget`, `#/schools`, `#/findings`, `#/sources`.

URL settings shared across pages: `w=permits` (wastewater reading), `x=1` (lower savings target), `?at=<element id>` (scroll to and focus a section). Build encodes plans as `o, t, m, c, s, p, r, n` (see `encodePlan` in `js/model/plans.js`). Your child's path uses `c` (children), `pair`, `top`, `pk`, `r`, `rt`.

## The model in one page

- **Plan:** `makePlan({ open, valleyTop, msMerge, cuts, septicWES, portables, receiving, roadmap })`. `open` lists the valley schools that stay open (FES, MES, WES, WRN); `valleyTop` 4 sends valley 5th-6th graders to Crossett Brook, 6 keeps them in the valley; `msMerge` moves Crossett Brook's 7th-8th graders to Harwood; `cuts` are Path A cut ids (`transport`, `special`, `prek`, `staff`, `athletics`, `electives`).
- **Named plans:** `PLAN_TODAY`, `PLAN_A`, `pathB(pair, top)`, `PATH_B_PLANS` (12), `withRoadmap(plan, top)` for the district's draft roadmap (new valley school in fall 2029).
- **Where children go:** `assign.js`. Closed towns go to the nearest open school (`NEAREST`), the rule the district's tables use; families can override in the UI.
- **Schools per child:** `journey.js`. Harwood Middle and Harwood High are two schools in one building. Pre-K is optional in the count.
- **Capacity:** `capacity.js`. Two readings of the wastewater limits: `slides` (the district's comparison, students only) and `permits` (each permit's wording; staff counted everywhere except Waitsfield, whose 1991 permit says "student population"; staff numbers are an estimate). Classroom space uses the consultant's March 2025 capacities plus 40 per portable unit. `capacity.middle` checks Crossett Brook and Harwood Middle. The Pre-K cut removes Pre-K from building loads.
- **Budget:** `budget.js`. The district's cards fit a straight line: about 2,565 pupils, so each $2,565 saved lowers spending per pupil by $1. Target $3,339,273, or about $2,839,085 with the bond exclusion (`basis: "exclusion"`). Closing one school is our estimate (half the two-school figure). `upperBound` is true when the middle schools merge but grades 5-6 stay in the valley: an administrator said on Oct 28 those versions save less than the district's figure.
- **Impact:** `impact.js`. Students changing schools next fall, school-count grids, students attending 5+ schools.
- **Options:** `js/model/options.js` lists the combinations on the Options page. To add one: add an entry (`id`, `group`, `name`, `what`, `plan`, `notes`, optional `refs`), add a test, and check the Options and Start here pages.

## Editorial decisions already made (do not silently reverse)

- Path B savings with grades 5-6 kept in the valley are shown as an upper limit ("Up to", "may fall short"), per the October 28 meeting.
- Waitsfield's wastewater limit is presented as disputed: the 1990 permit's 230, the 1991 permit's "student population" of 300 (whose design counted students and staff), and a 1996 letter saying 230. The slides use 230.
- Brookside's 480 is a building occupancy; under the permits reading it counts everyone.
- The Fayston + Warren capacity tables print totals that do not match their own rows (Brookside 513 vs 439). The site uses the rows and says so.
- Portable classrooms cost about $600K-$700K for two units over two years (the district's best preliminary quote); they are not in the yearly savings.
- The fact-check disclosure says the second pass was "done with AI research tools". Do not add "reviewed by the author" unless the owner confirms it.

## Working on it

```sh
npm install                 # Playwright 1.44.1 and axe-core, for browser checks
npm run serve               # http://127.0.0.1:4848/
npm test                    # node --test test/*.test.mjs
npm run test:browser        # every route at 1280 and 390 px, axe on both, overflow, drawer, deep links
```

- After any change: `npm test` and `npm run test:browser` must pass. Add a route to `scripts/browser-check.mjs` when you add a new page state worth guarding.
- Match the surrounding code: the `h()` helper, kit helpers, compact one-line CSS rules, `--ak-*` tokens. Prettier settings exist (`.prettierrc.json`), but the repo has not been run through Prettier as a whole; do not reformat whole files (data tables are hand-aligned).
- Gotchas:
  - `cites()` in `js/ui/kit.js` takes an **array**; the one in `js/ui/compare-table.js` takes varargs.
  - The router treats `#something` as a route. Use `?at=<id>` for in-page links, or buttons that call `scrollIntoView`.
  - `store` keys are prefixed `hspe:` and every read is wrapped for blocked storage.
  - Avoid browser features Safari 15 lacks (`Array.prototype.at`, unguarded `color-mix()`, container-query-only layouts).
  - d3 and Plot load lazily, only on the Budget page.
- When a number changes: edit `data/`, keep its `ref`, run the tests, add an entry to `UPDATES` in `data/history.js` (shown on the Sources page), and add a line to `MEMORY.md`.

## Deploy

Push to `main` (normally by merging a pull request from a feature branch). `.github/workflows/pages.yml` runs the tests on Ubuntu 22.04 with Node 22, then publishes `index.html og.png css js data wonk` to GitHub Pages (`sources/` is not published). Pages caches files for about 10 minutes. Commit messages end with a `Co-Authored-By` line when an AI agent wrote the change.

## Sources and verification

- `sources/` holds copies of the primary documents (meeting transcript, both district presentations, enrollment report, Q&A, permits, consultant documents). Use them to verify, then cite the online original via `data/sources.js`.
- In the October 28 transcript, SPEAKER 01 is the superintendent, SPEAKER 02 the director of finance and operations, and SPEAKER 03 the board chair, judging from context. Other numbers vary, and automatic speaker labels can merge or split people: confirm from context before naming a role.

## Open items

See the "Open items" section at the end of `MEMORY.md`.
