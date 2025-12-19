---
description: Endless multi-agent Wikipedia language ingestion (catalog + unique bases + race reachability)
auto_execution_mode: 0
---

You are Cascade working on the Fantasy-Map-Generator language mixer.

This workflow is designed to be **re-sent verbatim** to multiple agents working on the same repo.

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

Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope, acquire a hub lock via `mcp1_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

# Global end-state goal

Continuously drive the project toward:

- Every **real, distinguishable language and dialect** that appears on Wikipedia language lists being represented in the mixer.
- Each represented item is brought to the full quality bar:
  - Present in `config/language-mixes.json` (catalog)
  - Present in `config/language-mixer-map.json` (map)
  - Has at least one **globally-unique base index** (clear `NO_UNIQ_BASE` in `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`)
  - Has a **globally unique** `bases[]` signature (sharing is allowed only when linguistically defensible as the *same language* via a true alias, or when the row is explicitly excluded from coverage via `skip: true`)
  - Is reachable by at least one race via `raceLanguageProfiles` in `modules/races.js`

This work is intentionally long-running. If the user says `continue`, repeat the loop.

# Non-negotiable invariants

- **Never delete languages** from catalog or map once present. Fix issues by adding entries, repairing mappings, or restoring lost mappings.
- **No silent drift in devplans:** if a workflow depends on a definition (e.g. coverage vs fully represented), keep wording consistent with the actual helper scripts.
- **Prefer fully wired work:** avoid leaving languages half-added (e.g. catalog-only without map) unless explicitly blocked.

# Coordination protocol (multi-agent safe)

To avoid two agents doing the same batch:

1. Use a shared claim file at `tools/mixer-diagnostics/_wiki_multiagent_claims.json`.

Preferred (recommended writer; no manual JSON edits):

```bash
pnpm exec -- node tools/mixer-diagnostics/wiki-claim.js --dashboard
pnpm exec -- node tools/mixer-diagnostics/wiki-claim.js --workerId=<NUM> --target=<JSON_PATH> --scope=coverage_then_uniqueness_then_race --status=in_progress
pnpm exec -- node tools/mixer-diagnostics/wiki-claim.js --update --target=<JSON_PATH> --status=complete --note="..."
pnpm exec -- node tools/mixer-diagnostics/wiki-claim.js --update --target=<JSON_PATH> --status=stalled --appendNote --note="BLOCKER: ..."
```

2. If the file does not exist, create it as:

   ```json
   {"version":1,"claims":[]}
   ```

3. To claim work:
   - Load the JSON.
   - Pick a new `workerId` (integer) that is not already present in `claims[*].workerId`.
   - Pick a `target` that is not already claimed as `status: "in_progress"`.
   - Append a claim record:

     ```json
     {
       "workerId": 7,
       "target": "tools/mixer-meta/wikipedia-languages-of-europe.json",
       "scope": "coverage_then_uniqueness_then_race",
       "status": "in_progress",
       "startedAt": "YYYY-MM-DDTHH:MM:SSZ"
     }
     ```

   - Save the file.

4. If you cannot find any unclaimed target, or if the oldest `in_progress` claim is **> 24h** old and appears inactive, pick the oldest `in_progress` claim and move it to `stalled` (do not delete it), then claim a different target.

5. When you finish a target (or stop for any reason), update your claim’s `status` to one of:
   - `complete`
   - `stalled` (blocked on ambiguous ISO/name resolution or missing sources)

# Target selection (what to work on)

Work in this order:

1. **Existing Wikipedia registry JSONs**
   - Read `DEVplans/Languages-Status.md` §8 and collect every `- **JSON file:** ` entry.
   - Prefer targets whose snapshots show the biggest remaining work, e.g. large `Nonunique Bases` or non-zero missing counts.

2. **If all registered JSONs are complete**
   - Add the next Wikipedia list as a new JSON under `tools/mixer-meta/` and register it as a new §8.x entry.
   - Keep lists canonical (prefer `*-full.json` style for full article tables where possible).

# Execution loop (repeat endlessly)

## A. Coverage pass (catalog + map)

1. Run coverage:

   ```bash
   pnpm exec -- node tools/mixer-core/report-wikipedia-list-coverage.js <JSON_PATH>
   ```

2. Build a queue of the next **5–15** non-skipped items that are **not `full`**.
   - `full` is a **coverage** status only (catalog + mixer-map). It does not guarantee uniqueness or race reachability.

3. For each queued language item:

- **Catalog:** ensure a correct entry in `config/language-mixes.json`.
- **Map:** ensure a correct entry via a delta file under `tools/mixer-deltas/*.json` (do not hand-edit the map).
- Use conservative metadata conventions consistent with the repo.

## B. Uniqueness pass (bases[])

1. Run per-list uniqueness snapshot:

   ```bash
   pnpm exec -- node tools/mixer-core/report-wikipedia-list-base-uniqueness.js <JSON_PATH>
   ```

2. If the target list still has large shared-base clusters, pick **a small batch (5–15)** of the worst offenders and decluster them:

- Use:

  ```bash
  pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
  ```

- Make `bases[]` globally unique via delta `setBases` (do not hand-edit the map).
- Do not treat broad macro hubs as acceptable end state; any identical shared `bases[]` arrays among distinct non-skipped languages are uniqueness debt.

## C. Race reachability pass

1. Confirm race reachability for list items:

   ```bash
   pnpm exec -- node tools/mixer-races/report-wikipedia-list-race-coverage.js <JSON_PATH>
   ```

2. For any language with `RaceCount=0`, minimally adjust `raceLanguageProfiles` (prefer category/family-based inclusion rather than ad-hoc single-language hacks).

## D. Regenerate + verify

After any edits:

1. Apply deltas (runs guardrails + updates committed artifacts):

   ```bash
   pnpm run mixer:apply-deltas
   ```

   Single-integrator lane: if you are not the integrator, stop here and hand off (delta file + notes + verification commands to run) instead of applying/regenerating artifacts yourself. See `.windsurf/workflows/single-integrator-lane.md`.

2. Run core checks:

   ```bash
   pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js
   pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js
   ```

3. Do **not** run `run-language-mixer-suite.js` as part of this multi-agent loop unless the user explicitly asks.

4. Re-run coverage and confirm the just-touched items improved:

   ```bash
   pnpm exec -- node tools/mixer-core/report-wikipedia-list-coverage.js <JSON_PATH>
   pnpm exec -- node tools/mixer-core/report-wikipedia-list-base-uniqueness.js <JSON_PATH>
   pnpm exec -- node tools/mixer-races/report-wikipedia-list-race-coverage.js <JSON_PATH>
   ```

## E. Update devplans (status tracking)

1. Update the per-list snapshot block (do not hand-edit counts):

   ```bash
   pnpm exec -- node tools/mixer-core/update-wikipedia-list-coverage-in-devplan.js <JSON_PATH>
   ```

2. Add brief status notes in the relevant `DEVplans/` file(s) describing what changed (no big new planning unless explicitly approved).

# Stop / handoff behavior

If you hit an ambiguity you cannot resolve safely:

- Mark the item `skip: true` only if it is clearly out of scope for “true languages/dialects” or is a known global exception category.
- Do not use `skip: true` as a workaround for shared-base clusters; it is only for classification rows, sign languages, or clearly out-of-scope items.
- Otherwise, mark your claim as `stalled` and write a short note (what is ambiguous + what decision is needed).

Then proceed to the next available target.

When stopping for handoff, include:

- Files changed
- Suggested commit messages (no commits performed by agents)
- Staging guidance (no git): describe how you would logically split the changes into commits (no commands run)
- Verification commands run (or to run), including `pnpm run mixer:guardrails` and the suite
