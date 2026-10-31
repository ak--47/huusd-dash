# MEMORY.md: running changelog

What changed, when, and why, newest first, so any person or AI session can pick up where the last one stopped. `AGENTS.md` has the standing rules; this file has the history and the open items.

**How to add an entry:** put a dated section at the top of "Changelog" (`## YYYY-MM-DD: short title`) with what changed, why, and anything left unfinished. Keep entries short and factual. Update "Open items" at the end, and remove items that are done. When a reader-visible number or claim changes, also add a line to `UPDATES` in `data/history.js`, which the site shows on its Sources page.

## Changelog

## 2026-10-31: staging is up; docs made explicit

- `staging` branch created from `main` after PR #13; the `github-pages` environment now allows it. https://ak--47.github.io/huusd-dash/staging/ is live with its notice.
- AGENTS.md now opens with a "work on staging, not main" callout (CLAUDE.md repeats it), and "Staging and live" gives exact commands for a change, a promotion (merge commit only), a partial promotion, and an urgent live fix. Owner's call: staging links may be shared; the `/staging/` address and the notice are the separation.
- This entry itself went through staging and was promoted to live, the first use of the workflow.

## 2026-10-31: staging copy at /staging/

- The site is being shared in the community, and others are bringing new work. To keep the live site steady while that work is drafted, the owner asked for a staging copy: https://ak--47.github.io/huusd-dash/staging/, built from a new `staging` branch, for a small working group.
- One Pages deploy publishes both branches (`main` at the root, `staging` under `staging/`); a push to either rebuilds both. The `github-pages` environment now allows the `staging` branch.
- `js/ui/staging.js`: under /staging/ the site shows a notice above the top bar with a link to the same page on the live site, "[Staging]" in the tab title, a noindex tag, its own `hspe-staging:` storage keys, and the analytics super property `env: "staging"` (live sends `env: "live"`). `npm run serve` serves /staging/ too, and `npm run test:browser` has a `staging` step.
- `npm run staging:diff` lists what staging has that live does not. The workflow (branch from staging, promote with a merge-commit pull request) is in `AGENTS.md`, "Staging and live". From now on every change goes to staging first.

## 2026-10-29: PR #11 reverted, kept for later

- PR #11 ("Anchor untabled two-school plans to the district's tables; audit fixes") was reverted at the owner's request: it changed the Pre-K center plan's numbers (Waitsfield 252 → 231, Warren 116 → 120, Brookside 461 → 480) in a way the family wanted to understand before using. The site is back to the state after PR #10.
- The change is saved on branch `saved/audit-slides-adjusted-counts` and tag `saved-pr11-adjusted-counts` (commit 97d477a). To apply it later: `git cherry-pick 97d477a`, or revert this revert. That commit's `MEMORY.md` entry explains the method and the audit findings.
- What it did, in short: (1) all twelve capacity tables were checked cell by cell against the slide images and match; (2) plans with a Pre-K center, a split town, or Brookside K-6 with two valley schools open started from the district's table for that pair and changed only what the plan changes (`adjustedLoads()`), instead of this year's enrollment by school, which runs about 20 higher at Waitsfield than the slides' Waitsfield + Warren table (327 vs 306); (3) small audit fixes: slide 10's garbled "Required Cut: $1,2938,382" described as "almost $1.3 million" (said at the meeting) instead of $1,938,382; the $1 building offer's conditions (Article 6(B)); 2,565 pupils no longer called a district projection; Act 169 cited to slide 7's notes only; board seats cite Articles Article 7. Item (3) does not change any plan numbers and could be reapplied on its own.

## 2026-10-29: Pre-K center plan, Fayston back to Waitsfield

- The suggesters expect the town to prefer two thirds of Fayston to Waitsfield and a third to Warren (reversing the previous refinement); Moretown stays two thirds Waitsfield, a third Brookside; Brookside K-6 and no portables kept. Results: savings unchanged ($3,743,601); Waitsfield 252 (22 over the slides' 230; under the 1991 permit's 300, about 297 with the staff estimate; 78 over the consultant's 174); Warren 116; Brookside 461; 403 K-12 students change schools. Matches the family's spreadsheet (252 / 116 / 461). Build link: `o=WR&t=6&m=1&b=6&k=MES.all&sp=fayston~WRN~33.moretown~BPS~33`.

## 2026-10-29: Pre-K center plan without portables

- Its suggester asked to remove the portable classrooms from `B-center` (they found it confusing that adding them did not change the savings). The card now has none; savings unchanged ($3,743,601); Brookside (461) and Waitsfield (223) now show as over the consultant's classroom space, and the notes say about 2 units each would reach it ($1.2M-$1.4M over two years, one-time). The card's Build link is now `o=WR&t=6&m=1&b=6&k=MES.all&sp=fayston~WRN~67.moretown~BPS~33`.
- Build step 6: each school's portable count now shows its one-time cost ("+4 classrooms, about $600K to $700K one-time"), and the note says portables do not change the yearly savings.
- The link the family sent the principal lacks `b=6`, so it opens the fallback (Crossett Brook keeps grades 5-6: Brookside 315, 6 buildings, 339 students moving), not the plan in their email (Brookside 461).

## 2026-10-29: Pre-K center plan, second refinement (from its suggester)

- The plan is another parent's, worked out in conversation with the owner's spouse; the owner confirmed the card keeps "suggested by a resident" (this settles the earlier open item). Feedback relayed from them: move Crossett Brook's 5th and 6th graders to Brookside (Brookside K-6, Crossett Brook empty and free for renovation), and send more Fayston children to Warren, which has room, so Waitsfield fits. Their own spreadsheet numbers were guesses and were not used; the model computes its own.
- Model: `plan.bpsTop` (4 or 6; link key `b=6`). 6 only with the merger and K-6 valley schools. Brookside teaches through grade 6, Crossett Brook holds no classes (`capacity.middle` marks it `empty`; `evaluate().buildingsOpen` drops by one), and its 5th graders' move is a new reason, `brookside`, in `movedNextFall`. No savings counted for the empty building (no district operating cost; it still needs heat and power during repairs). `movedNextFall` no longer counts a child who stays in this year's school as moving (only affects Brookside 4th graders under `bpsTop` 6). `planAt` resets `bpsTop` to 4 when the roadmap starts.
- Options `B-center` now: Brookside K-6, Fayston two thirds to Warren, Moretown a third to Brookside, 2 portable units each at Waitsfield and Brookside (as the other K-6 cards include portables). Results: $3,743,601 (merger an upper limit), $404,328 over target on paper; Waitsfield 223 (under the slides' 230, 49 over the consultant's 174), Warren 145, Brookside 461 (under 480 students only; about 553 counting staff; 62 over the consultant's 399), Moretown 118 Pre-K; 5 buildings in use; 403 K-12 students change schools (64 more than with Crossett Brook keeping 5-6); Waterbury-Duxbury children attend 3 K-12 schools instead of 4. The fallback (Crossett Brook keeps 5-6) is in the card's notes and is one checkbox in Build step 4.
- Pre-K staffing reasoning added to the card: the district's Path B tables already plan Pre-K classes in the open schools, so its closure figure likely still pays Pre-K teachers; a Pre-K-only building's own overhead (custodian, office, nurse) is not counted, and the margin over target is the room for it.
- From the Oct 28 transcript (not previously on the site): a board member (SPEAKER 12) asked at 1:22:59 for versions with no Pre-K in the two open schools and Pre-K in a closed building leased back, and at 3:40:20 described a town lease of space in a closed building for valley Pre-K; an administrator (SPEAKER 02, 3:39:43) offered to bring "an option of moving PK into a building, a separate building, but that would be keeping a building." Added both quotes to `data/meeting.js` and a finding, `prek-building`, with a question for the board.
- Build: the starting-point hints below the dashed "Close one school" box no longer overlap its border (their negative top margin now applies only inside a box).
- Build results: Pre-K children moving to a center now read "because Pre-K moves to the Moretown center", not "because district Pre-K classes end" (a wording bug in the earlier center plan).

## 2026-10-29: Crossett Brook-to-Brookside idea (not modeled)

- A parent suggested moving Crossett Brook's 5th and 6th graders to Brookside for a year so Crossett Brook can close for renovations. Added to Options under "Ideas this site cannot score yet", not as a scored plan, because the district has published no Crossett Brook operating cost or renovation plan (so there is no savings figure to use), and Brookside would hold about 469 with Pre-K (284 K-4 + 54 Pre-K + 131), just under its 480 occupancy without staff but about 70 over the consultant's 399 (about 2 portable units, which could cancel a year's building savings). The consultant's Oct 2025 evaluation lists $10,187,109 of deferred maintenance at Crossett Brook ($489,663 priority 1); new source key `truexEval` links the cached text copy in `sources/`. To model it later: let Brookside teach through grade 6, add a Crossett Brook closure item once the district gives an operating cost, and add the portables.

## 2026-10-29: analytics

- Added anonymous Mixpanel analytics with session replay (owner's request; `js/ui/track.js`), loaded through the owner's proxy so ad blockers do not drop it. Everyone is anonymous: no `identify()`. Autocapture records clicks, inputs, and scrolling; the router sends a page view per route. Off on localhost, where a stub records every call in `window.__mpEvents` for browser tests.
- Named events for what readers do: shared ones in `js/app.js` (folds opened, sources followed, glossary, menu, printing) and each page's own choices (Build plan changes, Compare sorting and scoring, Your child's path forms, Options settings and links, Findings jumps, copying and printing the questions). The full list with properties is in `AGENTS.md` ("Analytics"). Events carry site choices only, never personal data or typed text.
- "Section Expanded" counts a reader's click (or Enter or Space) on a closed fold's summary, not the `toggle` event, which also fires when code opens a fold (`?at=` links, settings in a link, redraws, printing) and so sent events on page load. A card fold is named by its headline, without its changing facts. "Glossary Term Opened" no longer fires twice for a Build step 3 label (a label click also clicks its radio). `npm run test:browser` has an `analytics` step (one action each on Build, Compare, Your child's path, Options, What we checked).
- Privacy wording (owner's call): the Sources page's "The site uses no cookies, ads, or tracking. Anything you enter about your child stays in your browser." was removed, and README and AGENTS no longer say "no tracking". No new privacy statement and no opt-out switch for now; the owner will revisit the language. The site is for parents and is anonymous.

## 2026-10-29: deep links select their starting point

- Build a plan adds a "Pre-K center plan" starting point (the resident's plan). A link to any starting point (including the Options cards' "Open in Build a plan") now shows that button as selected, and a plan that equals any Options card says which one it matches (`presetOf`, `optionOf`, `centerPlan` in `js/ui/build-controls.js`).

## 2026-10-29: the Pre-K center plan, as refined by its suggester

- Options card `B-center` now matches the resident's full plan: close Fayston; all district Pre-K at Moretown; Waitsfield and Warren K-6; two thirds of Fayston's children to Waitsfield and a third to Warren; two thirds of Moretown's K-6 children to Waitsfield and a third to Brookside (then Crossett Brook for 5-6); every 7th and 8th grader to Harwood, Crossett Brook keeping grades 5-6 for Waterbury-area children. Result: about $3.74M on paper (merger an upper limit), Waitsfield about 252 students (over the slides' 230 and 78 over the consultant's 174; about 2 portable units, not included), Warren about 116, Brookside about 315, Crossett Brook 5-6 about 146.
- Split shares are now kept to the whole percent, and Build offers a third and two thirds as well as a quarter, half, and three quarters.
- The card says it was suggested by a resident after launch (the owner later clarified it is another parent's plan, so "a resident" is accurate).

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

- Analytics: after the first deploy, check in Mixpanel that page views, the named events, and session replays arrive through the proxy. The browser checks only see the localhost stub (`window.__mpEvents`).
- Before sharing widely (owner's call): consider a corrections channel residents will use (a form or a dedicated address, not the work email); GitHub issues is a barrier for most.
- Owner decision: the `ak--47.github.io` host reads like "AK-47" in link previews. Moving to a GitHub organization or a custom domain means updating `og:url`, `og:image`, README links, and the GitHub links on the site.
- Owner decision: whether to say the AI-assisted fact-check was "reviewed by the author" (only if true).
- Ask the district: what the middle-school merger saves with only Crossett Brook's own 5th and 6th graders (decides whether the least-disruption plan works); what closing one valley school saves; bus routes and ride times by pairing.
- Attendee notes from the Nov 2 and Nov 4 meetings: add to `data/meeting.js`, labeled "reported by attendees".
- After Nov 4: update `data/timeline.js` and the "Where things stand" card on Start here (`js/pages/overview.js`) with what the board decided.
- CI: the `ubuntu-22.04` runner retires in April 2027; upgrade Playwright (currently 1.44.1) and move the test job to `ubuntu-latest` before then. WebKit is not in CI; a WebKit overflow check on Your child's path would catch iPhone-only layout bugs.
- No license file yet; the owner may want one (for example CC BY for text, MIT for code).
- The district may bring a costed "Pre-K in a separate building" version to the Nov 2 or Nov 4 meeting (offered Oct 28). If it does, replace the `B-center` estimate (operating cost only) with the district's figure, and update the `prek-building` finding.
- Crossett Brook: no operating cost published, so an empty Crossett Brook saves $0 in the model. If the district publishes one, decide how much would remain during a renovation. This year's Crossett Brook 5th graders would go back to Brookside for one year under `bpsTop` 6.
- Pre-K center assumptions to revisit with the district: whether a Pre-K-only building needs its own principal, nurse, or office staff (not in the estimate); how many children a central Pre-K would draw (the model uses this year's 118 in district classes); bus service for 3- and 4-year-olds to Moretown.
- Possible next improvements: show the four interchangeable smaller-cut sets for the merger-with-cuts plan side by side; let Build model a valley-only Pre-K change (the district costed ending Pre-K only district-wide); add bus-route effects once the district publishes them.
