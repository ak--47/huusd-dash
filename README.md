# Harwood School Plans Explorer

An independent, plain-language guide to the Harwood Unified Union School District's FY28 budget and school consolidation choices (Path A and Path B). It shows the district's figures as published, re-checks the arithmetic, and adds what the presentations leave out, mainly **how many different schools a child would attend** under each plan.

**Live site:** https://ak--47.github.io/huusd-dash/

Built by Aaron Krivitzky, a Waitsfield parent. Not affiliated with HUUSD. Corrections are welcome as [GitHub issues](https://github.com/ak--47/huusd-dash/issues).

## What's on the site

| Page | What it answers |
|---|---|
| Start here | Where the decision stands after the October 28 meeting, and the two paths side by side |
| Your child's path | Every school a child would attend, K-12, under each plan, including the district's draft roadmap |
| Compare the plans | Path A and all twelve versions of Path B on the same measures, plus the board's own scoring criteria |
| Options beyond A and B | Other combinations of the same building blocks (merge only the middle schools, close one school, keep grades 5-6 in the valley), scored the same way |
| Build a plan | Choose schools, grade setups, cuts, and building fixes; see budget, capacity, and students update |
| The budget | The four FY28 budgets, the state threshold, the Path A cuts, the Path B savings |
| The schools | Enrollment, space, condition, and costs for each building, with a map and drive times |
| What we checked | Arithmetic that does not add up, missing analyses, and questions to ask |
| Sources and method | Every source, every formula, and the history of earlier decisions |

## How it works

A static site: plain HTML, CSS, and ES modules. No build step, no server, no tracking.

- `data/` holds every number, transcribed from the sources, each with a reference to its document and page or slide.
- `js/model/` is the plan model: which school a child attends each year under a plan, building loads and capacity checks, budget effects, and student-level impacts. Pure functions, tested with Node.
- `js/pages/` renders each page; `js/ui/` holds shared pieces. Design system: WONK (paper theme), vendored in `wonk/`.

Every figure is labeled as a **district figure**, **calculated** (our arithmetic on the district's numbers), or an **estimate** (where the district has not published a number). The method is on the site's Sources and method page.

Building limits can be read two ways, and the site lets readers switch: the wastewater limits as shown on the district's slides, or as written in the state permits (Waitsfield 300 students; Fayston and Warren counting students and staff). Classroom space is checked against the capacities the district's planning consultant, TruexCullins, calculated in March 2025.

Quotes from the October 28 board meeting come from a recording transcript and are attributed to the meeting, not to individual speakers.

## Run it locally

```sh
npm install              # only needed for the browser checks
npm run serve            # http://127.0.0.1:4848/
npm test                 # model, data, and design-system checks
npm run test:browser     # every page in headless Chromium, desktop and mobile
```

## Sources

The district's October 14 and October 28, 2026 board presentations and the October 28 meeting recording, the October 1, 2026 enrollment report, state wastewater permits for the four valley schools, the TruexCullins facilities study, the superintendent's report, the Articles of Agreement, board minutes and Q&A documents; Vermont Acts 169 and 170 of 2026; NCES school locations; 2020 Census; OpenStreetMap routing; and published research. The full list, with links, is on the site.

## Deploying

Pushing to `main` runs the tests and publishes the site with GitHub Actions (`.github/workflows/pages.yml`). In the repository settings, Pages must use "GitHub Actions" as its source.

To update a number: change it in `data/`, keep its source reference, run `npm test`, and add a line to the updates log in `data/history.js`.
