---
description: Burn down race-unused languages
auto_execution_mode: 0
---

You are Cascade working on the Fantasy-Map-Generator language mixer.

# Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.
- Do **not** propose or run commits. The user/integrator owns all commits.
- Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope (e.g. `modules/races.js`, `DEVplans/*.md`), acquire a hub lock via `mcp5_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

# Objective

Reduce the `Languages never used by any race profile` count reported by:

```bash
pnpm run mixer:race-coverage
```

This workflow fixes **race eligibility** (whether a catalog language matches at least one race profile’s `categories` or `families`).

This workflow does **not** fix mixer-map wiring, namebases, or Wikipedia coverage; use the other workflows for that.

# What controls race eligibility

- The authoritative surface is `modules/races.js`:
  - `const raceLanguageProfiles = { ... }`

A language is considered **covered** if its catalog `category` or `family` matches at least one race profile’s `categories` or `families`.

Important:

- The report `tools/mixer-races/report-race-language-coverage.js` matches **literal strings** against `config/language-mixes.json`.
- Therefore, when adding coverage, copy the `category` / `family` string exactly as it appears in the report output.

# Required tools (exact commands)

Measure current state:

```bash
pnpm run mixer:race-coverage
```

Run the full race diagnostics suite (recommended after edits):

```bash
pnpm run mixer:race-suite
```

Enforce race profile invariants (included by the suite, but can be run standalone):

```bash
node tools/mixer-races/check-race-language-profiles.js
```

# Non-negotiable invariants

- Do not introduce wildcard category/family filters (`"*"`) in any race profile.
- Do not create multiple races with identical `(categories,families)` sets (the checker reports this).
- Keep `Human` and `AnyLanguage` as sentinel/fallback profiles (they intentionally have empty filters).

# Session loop

## 1) Preflight (required)

1. Run:

```bash
pnpm run mixer:race-suite
```

2. Capture the current `Languages never used by any race profile: N` value and the ISO list under:

`--- Languages not covered by any race profile ---`

## 2) Pick a small batch (required)

Pick a batch of **3–10** race-unused languages to fix.

Selection guidance:

- Prefer `mapped? = Y` first (they are already usable by the mixer; you’re only fixing race eligibility).
- Prefer grouping by the same `category`/`family` so one profile tweak covers multiple.

## 3) Design the minimal profile change (required)

For each batch language, decide a target race to cover it.

Guidelines:

- Prefer adding the language’s **category** to a thematically close race (smallest change).
- If the language’s family is more specific than category and matches your intent, add the **family** string instead.
- Prefer reusing an existing race profile over introducing new races.
- Avoid broadening a race profile to include unrelated categories/families; keep changes surgical.

## 4) Implement the change (required)

1. Acquire a hub lock:

- `file:modules/races.js`

2. Edit `modules/races.js`:

- Add the exact `category`/`family` strings to the chosen race’s `categories` / `families` arrays.

## 5) Verify (required)

Run:

```bash
node tools/mixer-races/check-race-language-profiles.js
pnpm run mixer:race-coverage
pnpm run mixer:race-suite
```

Confirm:

- `check-race-language-profiles.js` does not report wildcard usage or duplicate profiles.
- `Languages never used by any race profile:` decreases OR the batch ISOs disappear from the unused list.

## 6) Record status (required)

Add a **status-only** note to `DEVplans/Languages-Status.md` describing:

- The batch you targeted (ISOs)
- The race profiles you adjusted (race name + added category/family strings)
- The before/after `race-unused` count
- Verification commands run

# When to stop

Stop after one successful batch and wait for the user’s next instruction.
