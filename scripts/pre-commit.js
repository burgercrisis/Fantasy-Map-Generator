#!/usr/bin/env node
"use strict";

/**
 * Pre-commit gate. Invoked by simple-git-hooks (see package.json).
 *
 * WHY THIS IS A SCRIPT AND NOT A SHELL ONE-LINER
 * ----------------------------------------------
 * The hook used to be:
 *
 *     npm run lint && node scripts/sync-version.js --stage && ...
 *
 * That fails silently and completely on this machine. Git for Windows runs
 * hooks with its bundled sh, and `npm` there resolves to the POSIX shim at
 * C:\Program Files\nodejs\npm, whose shebang is `#!/usr/bin/env bash`. bash is
 * not on that sh's PATH, so the shim dies with
 *
 *     /usr/bin/env: 'bash': No such file or directory
 *
 * git then aborts the commit with exit code 1 and prints nothing at all. The
 * symptom is "git commit just fails" with no clue why, which is what happened
 * for an unknown number of commits - and it also meant stamp-assets.js never
 * ran, leaving a stale ?v= cache-buster on namebases-africa.js that stopped
 * browsers picking up seed changes.
 *
 * Two rules follow, and this script exists to enforce them:
 *   1. Never invoke `npm` or `npx` from inside a git hook. Call node directly.
 *   2. Always print which step failed. Silent failure is the real bug.
 *
 * Escape hatch: SKIP_SIMPLE_GIT_HOOKS=1 skips the hook entirely.
 */

const {execFileSync} = require("node:child_process");
const path = require("node:path");

if (process.env.SKIP_SIMPLE_GIT_HOOKS === "1") {
  console.log("[INFO] SKIP_SIMPLE_GIT_HOOKS is set to 1, skipping hook.");
  process.exit(0);
}

const root = path.resolve(__dirname, "..");
process.chdir(root);

const biome = path.join(root, "node_modules", "@biomejs", "biome", "bin", "biome");

const steps = [
  {
    name: "biome check --write",
    cmd: process.execPath,
    args: [biome, "check", "--write"]
  },
  {
    name: "namebase integrity gate",
    cmd: process.execPath,
    args: [path.join(root, "tools", "namebase-tools", "verify-namebase-integrity.js"), "--quiet"]
  },
  {name: "sync-version", cmd: process.execPath, args: [path.join(root, "scripts", "sync-version.js"), "--stage"]},
  {name: "stamp-assets", cmd: process.execPath, args: [path.join(root, "scripts", "stamp-assets.js"), "--stage"]}
];

const total = steps.length;
for (let i = 0; i < total; i++) {
  const step = steps[i];
  console.log(`[${i + 1}/${total}] ${step.name}`);
  try {
    execFileSync(step.cmd, step.args, {stdio: "inherit", cwd: root});
  } catch {
    console.error("");
    console.error(`[FAIL] pre-commit: "${step.name}" failed. Commit aborted.`);
    console.error("       Fix the problem above, or re-run with SKIP_SIMPLE_GIT_HOOKS=1");
    console.error("       if you are certain this check is wrong.");
    process.exit(1);
  }
}

console.log("[OK] pre-commit passed");
