---
description: Endless multi-agent Wikipedia language ingestion (catalog + unique bases + race reachability)
auto_execution_mode: 1
---

You are Cascade working on the Fantasy-Map-Generator language mixer.

This workflow is designed to be **re-sent verbatim** to multiple agents working on the same repo.

# Global end-state goal

Continuously drive the project toward:

- Every **real, distinguishable language and dialect** that appears on Wikipedia language lists being represented in the mixer.
- Each represented item is brought to the full quality bar:
  - Present in `config/language-mixes.json` (catalog)
  - Present in `config/language-mixer-map.json` (map)
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

4. If you cannot find any unclaimed target, pick the oldest `in_progress` claim and move it to `stalled` (do not delete it), then claim a different target.

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
   node tools/mixer-core/report-wikipedia-list-coverage.js <JSON_PATH>
   ```

2. Build a queue of the next **5–15** non-skipped items that are **not `full`**.
   - `full` is a **coverage** status only (catalog + mixer-map). It does not guarantee uniqueness or race reachability.

3. For each queued language item:

- **Catalog:** ensure a correct entry in `config/language-mixes.json`.
- **Map:** ensure a correct entry in `config/language-mixer-map.json`.
- Use conservative metadata conventions consistent with the repo.

## B. Uniqueness pass (bases[])

1. Run per-list uniqueness snapshot:

   ```bash
   node tools/mixer-core/report-wikipedia-list-base-uniqueness.js <JSON_PATH>
   ```

2. If the target list still has large shared-base clusters, pick **a small batch (5–15)** of the worst offenders and decluster them:

- Use:

  ```bash
  node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
  ```

- Make `bases[]` globally unique by editing `config/language-mixer-map.json`.
- Do not treat broad macro hubs as acceptable end state; any identical shared `bases[]` arrays among distinct non-skipped languages are uniqueness debt.

## C. Race reachability pass

1. Confirm race reachability for list items:

   ```bash
   node tools/mixer-races/report-wikipedia-list-race-coverage.js <JSON_PATH>
   ```

2. For any language with `RaceCount=0`, minimally adjust `raceLanguageProfiles` (prefer category/family-based inclusion rather than ad-hoc single-language hacks).

## D. Regenerate + verify

After any edits:

1. Run the core suite:

   ```bash
   node tools/mixer-core/run-language-mixer-suite.js
   ```

2. Re-run coverage and confirm the just-touched items improved:

   ```bash
   node tools/mixer-core/report-wikipedia-list-coverage.js <JSON_PATH>
   node tools/mixer-core/report-wikipedia-list-base-uniqueness.js <JSON_PATH>
   node tools/mixer-races/report-wikipedia-list-race-coverage.js <JSON_PATH>
   ```

## E. Update devplans (status tracking)

1. Update the per-list snapshot block (do not hand-edit counts):

   ```bash
   node tools/mixer-core/update-wikipedia-list-coverage-in-devplan.js <JSON_PATH>
   ```

2. Add brief status notes in the relevant `DEVplans/` file(s) describing what changed (no big new planning unless explicitly approved).

# Stop / handoff behavior

If you hit an ambiguity you cannot resolve safely:

- Mark the item `skip: true` only if it is clearly out of scope for “true languages/dialects” or is a known global exception category.
- Do not use `skip: true` as a workaround for shared-base clusters; it is only for classification rows, sign languages, or clearly out-of-scope items.
- Otherwise, mark your claim as `stalled` and write a short note (what is ambiguous + what decision is needed).

Then proceed to the next available target.
