---
description: Seed uniqueness burn-down (strict + normalized)
auto_execution_mode: 0
---

Use this workflow to burn down **seed uniqueness debt** for language mixer entries that already have a globally-unique base anchor, but fail:

- strict unique seeds `< 1`
- normalized unique seeds `< 10`

# Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.
- Do **not** suggest “reverting”, “rolling back”, “dropping”, or “restoring” changes unless the user explicitly instructs you to revert a specific file (with an exact file list).
- Do **not** propose or run commits. The user/integrator owns all commits.
- If you see BOM / CRLF / timestamp churn or other suspicious diffs, the only allowed actions are:
  - Fix encoding/format **in-place** without removing content, or
  - Keep it as-is and continue, or
  - Leave it uncommitted / untouched and ask the user what to do.

Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope (e.g. `modules/namebases-*.js`, `tools/mixer-deltas/*.json`, `DEVplans/*.md`), acquire a hub lock on a stable resource string like `file:<repo-relative-path>`.

# Objective

For a small target batch of ISOs:

- Keep each ISO’s **globally-unique base anchor** intact.
- Raise uniqueness counts to at least:
  - strict unique seeds `>= 1`
  - normalized unique seeds `>= 10`

# Non-negotiable invariants

- Must preserve append-only registry; never delete ISOs.
- Do not “solve” by removing entries or converting them into family macros.
- Canonical write path:
  - Edit base definitions in `modules/namebases-*.js` (append-only)
  - Add a delta file under `tools/mixer-deltas/*.json`
  - Run `pnpm run mixer:apply-deltas`
  - Single-integrator lane: if you are not the integrator, do not run `pnpm run mixer:apply-deltas` or regenerate committed artifacts; hand off the delta + notes to the integrator for apply + verification. See `.windsurf/workflows/single-integrator-lane.md`.

# Required tools

- `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=300`
- `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2`
- `pnpm run mixer:guardrails`
- `pnpm run mixer:check-deltas`
- `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`
- `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`

# Session loop

## 1) Get the failing set

Run the failures report:

```bash
pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=300
```

Pick a small batch (default **10–25** ISOs), ideally grouped by family/region so fixes are coherent.

Optional: focus on a batch directly:

```bash
pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos=<comma-separated isos> --limit=300
```

## 2) Triage: choose the smallest effective fix

For each ISO in the batch, decide using the following decision tree.

### A) Strict `< 1` but normalized `>= 10`

- Goal: get **at least one strict-unique** seed.
- Typical fix: adjust the dedicated anchor base’s seeds so at least one seed generates outputs not shared by the nearest neighbors.

### B) Normalized `< 10` but strict `>= 1`

- Goal: increase **normalized diversity**.
- Typical fix: add more seed variety (more tokens, more phonotactic variety) on the dedicated anchor base.

### C) Both strict `< 1` and normalized `< 10`

- Goal: increase both uniqueness and variety.
- Typical fix order:
  1) Improve the dedicated anchor base’s seeds (more + more distinctive)
  2) If still low, consider whether the anchor base is too broad (a macro base): create a more specific dedicated base and pin the ISO to it via a delta.

### D) ISO does not have a globally-unique base anchor

Stop and switch workflows:

- If the ISO is `NO_UNIQ_BASE`, use `.windsurf/workflows/no-unique-base2.md`.
- If the ISO participates in identical `bases[]` collisions, use `.windsurf/workflows/language-uniqueness.md` or `.windsurf/workflows/decluster-language-bases.md`.

## 3) Apply changes (implementation lane)

Follow canonical write path:

1) Append-only edits to the relevant `modules/namebases-*.js` file.
2) Delta file under `tools/mixer-deltas/*.json` when you changed mapping/pins.
3) Apply (integrator lane):

```bash
pnpm run mixer:apply-deltas
```

If you are not the integrator, stop after (1)+(2) and hand off.

## 4) Required verification (must be green)

Run:

```bash
pnpm run mixer:guardrails
pnpm run mixer:check-deltas
pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js
pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js
```

Then re-run seed-uniqueness to verify improvements:

```bash
pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos=<comma-separated batch isos> --limit=300
```

Also confirm you didn’t introduce identical base-set collisions:

```bash
pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
```

Do **not** run `run-language-mixer-suite.js` as part of this workflow unless the user explicitly asks.

# Report format (when done)

Reply with:

- Batch ISOs
- Before/after strict+normalized values for each ISO you touched
- Files changed
- Suggested commit messages (no commits performed by agents)
- `git add -p` guidance for how to stage the changes into logical commits
- Verification commands run (or to run)
