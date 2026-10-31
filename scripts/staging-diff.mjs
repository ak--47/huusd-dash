// What staging has that the live site (main) does not, and the reverse: npm run staging:diff
// Compares the GitHub copies (origin/main, origin/staging), so commit and push first.
import { execSync } from "node:child_process";

const git = (cmd) => execSync(`git ${cmd}`, { encoding: "utf8" }).trimEnd();
git("fetch --quiet origin main staging");

const ahead = git("log --oneline --no-merges origin/main..origin/staging");
const behind = git("log --oneline --no-merges origin/staging..origin/main");
const files = git("diff --stat origin/main...origin/staging").replace(/^ /gm, "");

console.log("On staging, not yet live:");
console.log(ahead ? ahead.replace(/^/gm, "  ") : "  nothing: staging matches the live site");
if (ahead) console.log(`\nFiles changed:\n${files.replace(/^/gm, "  ")}`);
if (behind) console.log(`\nLive, but not on staging (merge main into staging):\n${behind.replace(/^/gm, "  ")}`);
console.log("\nLive:    https://ak--47.github.io/huusd-dash/");
console.log("Staging: https://ak--47.github.io/huusd-dash/staging/");
console.log("Compare: https://github.com/ak--47/huusd-dash/compare/main...staging");
