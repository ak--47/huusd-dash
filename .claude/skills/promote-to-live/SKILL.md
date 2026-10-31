---
name: promote-to-live
description: Ship what is on the staging branch to the live site (main) for the Harwood School Plans Explorer. Use only when the owner asks in so many words, e.g. "promote staging", "merge staging to live/prod", "put it on live", "ship it to live". Not for normal changes, which go to staging.
---

# Promote staging to live

The site has two copies built from one GitHub Pages deploy: `main` is the live site (https://ak--47.github.io/huusd-dash/), `staging` is the preview (https://ak--47.github.io/huusd-dash/staging/). Promoting means merging `staging` into `main` with a merge commit. Full background: AGENTS.md, "Staging and live".

## Before you start

- **Only on the owner's explicit request.** "Looks good" about a staging change is not a request to promote. If unsure, ask.
- Nothing extra to edit: the same code runs on both copies, and `js/ui/staging.js` switches the notice, title, storage keys, and analytics `env` by address. Never add `if (STAGING)` branches.
- Everything on `staging` goes live. If the owner wants only some commits, use "Promoting only some changes" below.

## Steps

1. **See what will go live.**
   ```sh
   git fetch origin
   npm run staging:diff
   ```
   It lists commits on staging but not live, the files changed, and any live commits staging lacks. If it says "nothing", there is nothing to promote; tell the owner. If live has commits staging lacks (an urgent fix), merge `main` into `staging` first (see "Urgent fix" below) so the promotion does not conflict.

2. **Check the staging deploy passed** for the commit you are promoting:
   ```sh
   gh run list --branch staging --limit 1 --json headSha,conclusion
   ```
   Do not promote a staging commit whose run failed.

3. **Open the pull request into `main`**, with the `staging:diff` list in the body (end the body with the attribution line from the session's instructions):
   ```sh
   gh pr create --base main --head staging --title "Promote staging to live: <topic>" --body "..."
   ```

4. **Merge with a merge commit, never squash or rebase.** A merge commit keeps both branches on the same history, so the next `staging:diff` is empty and `staging` needs no reset.
   ```sh
   gh pr merge <number> --merge
   ```

5. **Watch the live deploy.** `.github/workflows/pages.yml` tests `main` (Ubuntu 22.04, Node 22, `npm test`, `npm run test:browser`) and publishes both branches.
   ```sh
   gh run list --branch main --limit 1 --json databaseId,status
   gh run watch <id> --exit-status
   ```
   If the run fails, the live site keeps its previous version. Read the log (`gh run view <id> --log-failed`), tell the owner, and fix through staging or, if the owner asks, an urgent fix on `main`.

6. **Confirm it is live.** Fetch a file the promotion added or changed from the live address with a cache-busting query, e.g. `curl -s "https://ak--47.github.io/huusd-dash/<file>?x=$RANDOM"`. Pages caches for about 10 minutes, so readers may need a reload. Then `npm run staging:diff` should say staging matches live.

7. **Record it.** Add a dated line to the MEMORY.md changelog saying what was promoted (PR number and the staging PRs it carried). That edit is a normal change: branch from `origin/staging`, pull request with `--base staging`.

## Promoting only some changes

Branch from `origin/main`, `git cherry-pick` the commits, open a pull request into `main`, merge it, then bring `main` back into `staging`:
```sh
git fetch origin && git checkout -B staging origin/staging
git merge origin/main && git push origin staging
```

## Urgent fix to live

Only when the owner asks to fix the live site directly: branch from `origin/main`, pull request with `--base main`, merge, then merge `main` into `staging` with the commands above so the fix is not undone at the next promotion.

## Never

- Push directly to `main`, or merge into `main` without the owner's request.
- Squash or rebase a promotion.
- Promote with a failed staging run, or report "live" before the `main` deploy succeeds.
