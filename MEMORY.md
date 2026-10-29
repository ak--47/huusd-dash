# MEMORY.md: running changelog

What changed, when, and why, newest first, so any person or AI session can pick up where the last one stopped. `AGENTS.md` has the standing rules; this file has the history and the open items.

**How to add an entry:** put a dated section at the top of "Changelog" (`## YYYY-MM-DD: short title`) with what changed, why, and anything left unfinished. Keep entries short and factual. Update "Open items" at the end, and remove items that are done. When a reader-visible number or claim changes, also add a line to `UPDATES` in `data/history.js`, which the site shows on its Sources page.

## Changelog

## 2026-10-29: Pre-K center, split towns, Brookside in Build (owner's family's feedback)

- Feedback: "You don't have Brookside in here anywhere? Not all Fayston kids would go to Waitsfield. What if we close Fayston, turn Moretown into Pre-K for everyone, have Waitsfield and Warren as K-6, and merge the middle?"
- Model: `plan.prekCenter = { school, scope: "valley" | "all" }` keeps a closed valley building open for Pre-K only (Pre-K children go there; with "all", Brookside's Pre-K too). Savings give back the building's operating cost from its facility slide (Moretown $185,868; custodial not included), an estimate. `plan.split = { town: { school, share } }` sends part of a closed town's K-6 children to a second open school (capacity only; each child's path still picks one school). Either one makes capacity use the model's own counts instead of the district's table. Link keys `k=MES.all`, `sp=fayston~WRN~50`.
- Build a plan: Brookside shown in step 2; "Where children go when their school closes" moved out of Advanced into step 2, with "Some [town] children closer to another school?" (a quarter, half, or three quarters); step 3 has a Pre-K center choice and who it serves.
- Options: added `B-center` (the scenario above, Fayston split half to Warren): about $3.74M on paper (merger figure an upper limit), 6 buildings, 339 K-12 students change schools, Waitsfield about 281 students (over the slides' 230 and the consultant's 174, under 300 students-only), Warren about 133.
- Tests 33, browser checks 39.

## 2026-10-29: wrap-up, Build options, cached sources, docs

- Added `sources/`: cached copies of the primary documents (speaker-labeled Oct 28 transcript, Oct 28 and Oct 14 presentations, Oct 1 enrollment report, board Q&A and FAQs, agenda, superintendent's report, Oct 14 minutes, Articles of Agreement, feasibility RFP, consultant documents, and the wastewater permit pages for all four valley schools). Index and original links in `sources/README.md`. Not deployed.
- Added `AGENTS.md` (guide for AI sessions), `CLAUDE.md` (imports AGENTS.md and this file), and this changelog. Rewrote `README.md` for people.
- Build a plan (parents' request after launch): two new starting points, "Close one school" (Path B's middle-school move with one valley closure; pick the school) and "Merger + smaller cuts"; step 3 is now "Valley school grades": through grade 6, 5 (new: 6th graders go to Crossett Brook), or 4, plus a "District schools keep Pre-K classes" switch tied to the Pre-K tuition cut (unchecked = K-only). The model accepts `valleyTop` 5 (`t=5` in links); there is no district table for it, so counts are the model's, and its middle-school saving is an upper limit like K-6.
- Options page and Start here: added "Merge the middle schools, keep all four valley schools, and make three smaller cuts" (`MS+cuts` in `js/model/options.js`), with its caveats.
- Fixed an attribution: "There's no scenario where we keep five, six in the Valley in two schools absent temporary classrooms" was said by a board member (SPEAKER 12 in the transcript), not an administrator (`data/meeting.js`, `data/findings.js`).
- Tests: 30 model tests; browser checks now include the close-one, merger-with-cuts, and grade-5 Build states (37 checks).
- Analysis requested by the owner: is there a plan that closes the fewest schools and moves the fewest students while meeting the target? See the next entry.

## 2026-10-29: least-disruption analysis ("Option C")

Question from parents: "drop Pre-K and close only Fayston". Answer from the model, with the district's figures:

- Close only Fayston + end district Pre-K: about $913K (our estimate, half the two-school figure) + $517K = **$1.43M, about $1.9M short** of $3,339,273. Closing one school only works with the middle-school merger, and the finance director said on Oct 28 that "taking only one school offline, we will not make the cut" without a penalty.
- Merge the middle schools + close Fayston + end district Pre-K: $3.53M on paper ($194K over), but 204 K-12 students plus Pre-K change schools, and two of its figures are uncertain.
- **Fewest closures that meet the target on paper:** merge the middle schools, keep all four valley schools, and make three of the smaller Path A cuts (special programming $583,516; Pre-K tuition model $517,000; 70% of athletics and activities $312,757). Total $3,516,215, $176,942 over the target; no elementary school closes; about 130 Crossett Brook 7th and 8th graders change schools (plus children in district Pre-K); valley children keep 3 K-12 schools, Waterbury and Duxbury children go to 4. Busing and intervention staff are kept.
- Its weak point: it needs the middle-school merger to save at least $1,926,000 (91.6% of the district's $2,102,942) with only Crossett Brook's own 5th and 6th graders there. The district put the merger at about $1.8M on Oct 14, and on Oct 28 an administrator said keeping valley 5th and 6th graders out of Crossett Brook means fewer staff cuts. Against the lower target (bond exclusion), it needs only $1,425,812 (67.8%).
- Interchangeable: any three of the five smaller cuts that add up to about $1.24M do the same on paper. The four smallest that work: Pre-K + intervention staff + athletics (+$49,426), special programming + intervention staff + athletics (+$115,942, keeps Pre-K), special programming + Pre-K + athletics (+$176,942, keeps intervention staff), special programming + Pre-K + intervention staff (+$320,185). Every no-closure plan that keeps busing needs the merger, so about 130 students moving is the floor; only Path A (which cuts busing) moves fewer.
- Verified by an independent three-agent check (Oct 29). Points it added: the superintendent's "hybrid approach" remark meant one closure plus cuts, or keeping grades 5-6 out of Crossett Brook, not this plan, so do not cite it as support; the athletics line ($312,757) includes $85,000 of athletic travel moved out of transportation since Oct 14; special programming ($583,516) has never been itemized and the Oct 14 deck listed career-center tuition among its examples; ending district Pre-K affects about 118 children a year (the model's 58 counts only current 3-year-olds); the target leaves $25.67 per pupil of room, so the margin against an actual penalty is about $242,787; Waterbury and Duxbury families carry the middle-school change and lose Brookside Pre-K while every valley building stays open; it starts FY29 about $413,000 behind Path B; keeping all buildings keeps their deferred maintenance; the merger's promised expanded athletics and the athletics cut may overlap.
- Naming: avoid calling it "Option C" in public; TruexCullins' 2025 study already has an "Option C".

## 2026-10-29: launch

- Merged PR #1 (`site-v1`) into `main`; GitHub Pages enabled with GitHub Actions as the source. Live at https://ak--47.github.io/huusd-dash/. CI: tests on Ubuntu 22.04 with Node 22, then deploy.
- Three independent review rounds (accuracy, balance, phone use, accessibility, deployment) were applied before launch. Key editorial decisions from them are listed in `AGENTS.md`.

## 2026-10-28: build

- Built overnight from the owner's brief: static site, WONK design system (paper theme), every number sourced, neutral stance with a findings page, the schools-per-child measure, Options beyond A and B, Build a plan, Compare with the board's scoring sheet.
- Owner's decisions: count named K-12 schools (Pre-K optional); show building counts too; neutral plus findings; byline with name, no email, corrections through GitHub issues; site name "Harwood School Plans Explorer"; push and deploy with GitHub Actions; add attendee meeting notes later, labeled as such.

## Open items

- Owner decision: the `ak--47.github.io` host reads like "AK-47" in link previews. Moving to a GitHub organization or a custom domain means updating `og:url`, `og:image`, README links, and the GitHub links on the site.
- Owner decision: whether to say the AI-assisted fact-check was "reviewed by the author" (only if true).
- Ask the district: what the middle-school merger saves with only Crossett Brook's own 5th and 6th graders (decides whether the least-disruption plan works); what closing one valley school saves; bus routes and ride times by pairing.
- Attendee notes from the Nov 2 and Nov 4 meetings: add to `data/meeting.js`, labeled "reported by attendees".
- After Nov 4: update `data/timeline.js` and the "Where things stand" card on Start here (`js/pages/overview.js`) with what the board decided.
- CI: the `ubuntu-22.04` runner retires in April 2027; upgrade Playwright (currently 1.44.1) and move the test job to `ubuntu-latest` before then. WebKit is not in CI; a WebKit overflow check on Your child's path would catch iPhone-only layout bugs.
- No license file yet; the owner may want one (for example CC BY for text, MIT for code).
- Pre-K center assumptions to revisit with the district: whether a Pre-K-only building needs its own principal, nurse, or office staff (not in the estimate); how many children a central Pre-K would draw (the model uses this year's 118 in district classes); bus service for 3- and 4-year-olds to Moretown.
- Possible next improvements: show the four interchangeable smaller-cut sets for the merger-with-cuts plan side by side; let Build model a valley-only Pre-K change (the district costed ending Pre-K only district-wide); add bus-route effects once the district publishes them.
