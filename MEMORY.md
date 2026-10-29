# MEMORY.md: running changelog

What changed, when, and why, newest first, so any person or AI session can pick up where the last one stopped. `AGENTS.md` has the standing rules; this file has the history and the open items.

**How to add an entry:** put a dated section at the top of "Changelog" (`## YYYY-MM-DD: short title`) with what changed, why, and anything left unfinished. Keep entries short and factual. Update "Open items" at the end, and remove items that are done. When a reader-visible number or claim changes, also add a line to `UPDATES` in `data/history.js`, which the site shows on its Sources page.

## Changelog

## 2026-10-29: wrap-up, Build options, cached sources, docs

- Added `sources/`: cached copies of the primary documents (speaker-labeled Oct 28 transcript, Oct 28 and Oct 14 presentations, Oct 1 enrollment report, board Q&A and FAQs, agenda, superintendent's report, Oct 14 minutes, Articles of Agreement, feasibility RFP, consultant documents, and the wastewater permit pages for all four valley schools). Index and original links in `sources/README.md`. Not deployed.
- Added `AGENTS.md` (guide for AI sessions), `CLAUDE.md` (imports AGENTS.md and this file), and this changelog. Rewrote `README.md` for people.
- Build a plan: requested by parents after launch. More starting points, including closing one school, and a choice of valley grade span (Pre-K to 4, 5, or 6; K-only through the Pre-K tuition model). See the entries below once merged.
- Analysis requested by the owner: is there a plan that closes the fewest schools and moves the fewest students while meeting the target? Findings are in the next entry and on the Options page.

## 2026-10-29: least-disruption analysis ("Option C")

Question from parents: "drop Pre-K and close only Fayston". Answer from the model, with the district's figures:

- Close only Fayston + end district Pre-K: about $913K (our estimate, half the two-school figure) + $517K = **$1.43M, about $1.9M short** of $3,339,273. Closing one school only works with the middle-school merger, and the finance director said on Oct 28 that "taking only one school offline, we will not make the cut" without a penalty.
- Merge the middle schools + close Fayston + end district Pre-K: $3.53M on paper ($194K over), but 204 K-12 students plus Pre-K change schools, and two of its figures are uncertain.
- **Fewest closures that meet the target on paper:** merge the middle schools, keep all four valley schools, and make three of the smaller Path A cuts (special programming $583,516; Pre-K tuition model $517,000; 70% of athletics and activities $312,757). Total $3,516,215, $176,942 over the target; no elementary school closes; about 130 Crossett Brook 7th and 8th graders change schools (plus children in district Pre-K); valley children keep 3 K-12 schools, Waterbury and Duxbury children go to 4. Busing and intervention staff are kept.
- Its weak point: it needs the middle-school merger to save at least $1,926,000 (91.6% of the district's $2,102,942) with only Crossett Brook's own 5th and 6th graders there. The district put the merger at about $1.8M on Oct 14, and on Oct 28 an administrator said keeping valley 5th and 6th graders out of Crossett Brook means fewer staff cuts. Against the lower target (bond exclusion), it needs only $1,425,812 (67.8%).
- The superintendent told the board on Oct 28 it could still choose "a hybrid approach".
- Interchangeable: any mix of the smaller cuts adding up to about $1.24M does the same on paper (for example special programming + intervention staff + athletics = $3,455,215 and keeps Pre-K).

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
