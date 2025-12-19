---
description: wikipedia language list > our language list
auto_execution_mode: 0
---

You are Cascade, working on the Fantasy-Map-Generator language mixer.

## Execution guardrails (required)

- Do **not** run any `git` commands (including `status`, `diff`, `log`, `checkout`, `switch`, `pull`, `push`, `commit`, `stash`, `reset`, `merge`, `rebase`). If git is needed, stop and ask the user.
- Do **not** paraphrase this workflow into new commands. Only run the exact commands shown in this file.
- If you believe an additional command is required, stop and ask the user before running anything.
- Do **not** suggest “reverting”, “rolling back”, “dropping”, or “restoring” changes unless the user explicitly instructs you to revert a specific file (with an exact file list).
- Do **not** propose or run commits. The user/integrator owns all commits.
- If you see BOM / CRLF / timestamp churn or other suspicious diffs, the only allowed actions are:
  - Fix encoding/format **in-place** without removing content, or
  - Keep it as-is and continue, or
  - Leave it uncommitted / untouched and ask the user what to do.

Hub locks are the **only single-writer enforcement mechanism**. Before editing any shared file/scope (e.g. `tools/mixer-meta/*.json`, `tools/mixer-deltas/*.json`, `modules/namebases-*.js`, `DEVplans/*.md`), acquire a hub lock via `mcp1_lock_acquire` on a stable resource string like `file:<repo-relative-path>`.

## Diagnostic-first worker loop (required)

When wiring a batch, prefer this order to avoid suite failures and churn:

1. Run guardrails:
   - `pnpm run mixer:guardrails`
2. Pick a small batch using coverage tools and/or uniqueness reports.
3. Make edits (catalog + namebases + delta file under `tools/mixer-deltas/*.json`).
4. Apply deltas (writes committed artifacts + regenerates bundles):
   - `pnpm run mixer:apply-deltas`
   - Single-integrator lane: if you are not the integrator, do not run `pnpm run mixer:apply-deltas` or regenerate committed artifacts; hand off the delta + notes to the integrator for apply + verification. See `.windsurf/workflows/single-integrator-lane.md`.
5. Re-run targeted uniqueness verification for just the batch:
   - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --only-isos=<comma-separated batch isos> --limit=300`
6. Run core checks:
   - `pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js`
   - `pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js`
7. Do **not** run `run-language-mixer-suite.js` unless the user explicitly asks.

## Global intent

Systematically take **every language from every targeted Wikipedia language list** and:

1. Add it to the language catalog (`config/language-mixes.json`) with metadata and a Wikipedia URL.
2. Give it a **unique Markov base or tuned mix that reflects that language itself**, not just a generic macro hub, and ensure its `bases[]` signature in the mixer map is **globally unique** (no other language shares the same base/mix array).
3. Wire it into the mixer map via a delta file (do not hand-edit the map) so it participates in the name system.
4. Ensure that **at least one race** can actually use that language in the mixer (via `raceLanguageProfiles` in [modules/races.js](cci:7://file:///e:/code/Fantasy-Map-Generator/modules/races.js:0:0-0:0)).
5. Keep doing this in batches **until there are no more languages left on the lists**, responding to my `continue` requests without re‑asking for choices.

Always respect my standing preferences:
- When I say `continue` or `idc which`, **do not ask me to pick a language or family**. Pick the next logical batch in the current workflow (e.g., within the current Wikipedia list and family/region) and proceed.
- Prefer **thorough, fully wired** languages over half‑wired or dormant entries.
- Treat the devplans (especially [DEVplans/Languages-Status.md](cci:7://file:///e:/code/Fantasy-Map-Generator/DEVplans/Languages-Status.md:0:0-0:0)) as the source of truth for design intent.
- Do **not** treat coverage as a separate phase from uniqueness: when you wire a language from a Wikipedia list, bring it all the way to **catalog entry + mixer-map entry + globally unique `bases[]` + race reachability** in the same pass.
- Follow the global numbered pipeline in [DEVplans/Languages-Status.md](cci:7://file:///e:/code/Fantasy-Map-Generator/DEVplans/Languages-Status.md:0:0-0:0) for Wikipedia lists (steps 1–8); do **not** jump ahead to unrelated tasks or new lists while earlier steps remain unfinished.

## Wikipedia list / coverage handling

1. **List source**
   - I will either:
     - Give you the name + URL of a Wikipedia list, or
     - Point you at a JSON snapshot file under something like `tools/mixer-meta/wikipedia-lists/*.json`.
   - If I don’t specify a new list, **keep using the current list** across `continue` turns.

2. **Coverage detection**
   - Use [tools/mixer-core/report-wikipedia-list-coverage.js](cci:7://file:///e:/code/Fantasy-Map-Generator/tools/mixer-core/report-wikipedia-list-coverage.js:0:0-0:0) against the provided JSON list snapshot to classify each item:
     - `full` – in both `language-mixes.json` and [language-mixer-map.json](cci:7://file:///e:/code/Fantasy-Map-Generator/config/language-mixer-map.json:0:0-0:0). (**Note:** this is a *coverage* status only; it does not imply globally unique `bases[]` or race reachability.)
     - `missing-catalog`, `missing-map`, `missing-both`.
     - `unmatched` or `ambiguous` (name/iso issues).
   - Maintain an internal queue of all non‑skipped items that are **not yet `full`**.
   - When I say `continue`:
     - Take the **next small batch** (e.g. 3–7 languages) from this queue.
     - Prefer to group by **family / region** so base design work is coherent.

3. **When a list becomes fully wired**
   - Once all non‑skipped items are `full` (coverage: catalog + mixer-map):
     - Run the list-level checks for the remaining requirements of being **fully represented**:
       - base uniqueness / uniqueness debt via `report-wikipedia-list-base-uniqueness.js` (and/or the `Nonunique Bases` metric), and
       - race reachability via `tools/mixer-races/report-wikipedia-list-race-coverage.js`.
     - Only then tell me that the list is fully represented per the definition in [Languages-Status.md](cci:7://file:///e:/code/Fantasy-Map-Generator/DEVplans/Languages-Status.md:0:0-0:0).
     - Suggest a short entry I can add under the “Grow coverage via Wikipedia language lists” section (list name, scope, date).

## Per‑language workflow (for each item in a batch)

For each target language from the queue:

1. **Gather facts**
   - Use web search + the existing catalog to confirm:
     - Region, family, macro‑family, and script (Latin, Cyrillic, Abugida, etc.).
     - Any special typological traits that matter for names (e.g. clicks, consonant clusters, typical length, multi‑word patterns).
   - Note any **closely related bases** already in the project that might be reasonable anchors or reference points.

2. **Catalog entry (`language-mixes.json`)**
   - Ensure there is a **single catalog entry** with:
     - `name`: human‑readable language name.
     - `iso`: stable internal key (from the list, ISO 639 where possible, or a clean slug).
     - `region`, `category` (family group), `family` (more specific if useful).
     - `wikipedia`: the language’s main article URL (if available).
     - Any appropriate `tags` (e.g. `["creole"]`, `["family"]`, `["extinct"]`).
   - If the entry already exists:
     - Backfill missing `region`, `category`, `family`, `wikipedia`, `tags` as needed, staying consistent with existing conventions.

3. **Unique base / Markov design**
   - **Goal:** give this language a **unique base index or clearly unique blend** that actually feels like that language, and results in a `bases[]` combination that no other language uses.
   - When proposing or editing mappings for a **new** Wikipedia-list language, do **not** commit any change while its candidate `bases[]` is identical to an existing language’s mapping; instead, adjust the base choice or mix design until the new language’s `bases[]` is globally unique at commit time.
   - Steps:
     - Inspect current base inventory to find the **next free base index**.
     - Decide whether this base should be:
       - A **pure base** (own seed list and `min/max/d`), or
       - A **small blend** of an existing base plus a new one, if that better captures contact effects without collapsing uniqueness.
     - Curate a **seed list of place names / city names** for the language from reliable sources (Wikipedia lists, gazetteers, etc.).
       - Aim for a solid sample (dozens+), avoiding duplicates and non‑names.
     - Add a new base entry in the appropriate namebase file(s), following existing style:
       - Seeds from the curated list.
       - Initial `min/max` based on observed length distribution.
       - Initial duplication rule `d` guided by real orthography (geminates, digraphs, etc.).
     - Use existing tools (e.g. `check-namebase-lengths.js`, [generate-language-samples.js](cci:7://file:///e:/code/Fantasy-Map-Generator/tools/mixer-core/generate-language-samples.js:0:0-0:0)) to:
       - Inspect seed vs generated lengths.
       - Tweak `min/max/d` until generated names sit in a sensible p25–p75 band and feel like the language.

4. **Mixer map wiring (via delta file)**
  - Do **not** hand-edit `config/language-mixer-map.json`.
  - Add the mapping via `tools/mixer-deltas/*.json` using one of:
    - `setBases: { "iso": [<bases...>] }` for an exact bases[] mix, and/or
    - `dedicatedPins: { "iso": <dedicatedBase> }` (recommended when you created a unique base index), plus
    - `appendBases: { "iso": [<otherBases...>] }` for additional ingredients.
  - Apply with:
    - `pnpm run mixer:apply-deltas`
    - Single-integrator lane: if you are not the integrator, stop here and hand off (delta file + notes + verification commands to run) instead of applying/regenerating artifacts yourself. See `.windsurf/workflows/single-integrator-lane.md`.
   - Avoid:
     - Collapsing onto unrelated macro hubs (e.g. generic English, Malay, Tok Pisin). Lexifiers can appear as **ingredients**, but identical shared `bases[]` arrays among distinct non-skipped languages are not allowed.
     - Using lexifier or macro-hub bases (e.g. English, Malay, Tok Pisin, major trade languages) as the **sole** `bases[]` array for more than one language; they should appear only as ingredients in otherwise unique mixes.
   - Re‑run relevant mixer diagnostics (e.g. `check-language-mixer-map-inconsistencies.js`, [check-language-mixer-coverage.js](cci:7://file:///e:/code/Fantasy-Map-Generator/tools/mixer-core/check-language-mixer-coverage.js:0:0-0:0)) and resolve obvious issues for the new entries.

5. **Race coverage (ensure at least one race uses it)**
   - Use the existing race tooling (e.g. `tools/mixer-races/list-race-languages.js` or coverage reporters) to:
     - Check which races, if any, currently reach this language via `raceLanguageProfiles`.
   - If **no race can reach it**:
     - Minimal adjustment to `raceLanguageProfiles` in [modules/races.js](cci:7://file:///e:/code/Fantasy-Map-Generator/modules/races.js:0:0-0:0) so that **at least one race** in an appropriate region/fantasy flavor gains non‑zero weight for this language, via:
       - `categories` and/or `families` that include the language’s family/category.
       - Optionally adjusting weights or adding a narrow profile variant if needed.
   - Re‑run the race language tools to confirm:
     - The new language appears in **at least one race’s** detailed table.
     - Region/family distributions for that race still make sense.

6. **Validation & documentation**
   - Generate example names using the new base for a quick eyeball check:
     - Are they readable, in the right length range, and roughly in the right “feel”?
   - If anything looks badly off, iterate on seeds / `min/max/d` / blend choices.
   - If the language was in a Wikipedia list JSON:
     - Re-run [report-wikipedia-list-coverage.js](cci:7://file:///e:/code/Fantasy-Map-Generator/tools/mixer-core/report-wikipedia-list-coverage.js:0:0-0:0) and confirm this item is now `full`.

## Safety checks (required after each batch)

 Run:
 - `pnpm exec -- node tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js`
 - `pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js`

 Fix any reported issues before moving on to the next batch.

## Batch / session behavior

- **At the start of a new list or family:**
  - Summarize the **plan for this list**, including:
    - Focusing order (e.g. top N first, by region, by family).
    - Any decisions about which entries will intentionally be `skip`.
- **On each `continue` from me:**
  - Without asking me to pick again:
    - Take the **next batch** of not‑yet‑full languages from the current list, ideally within the same family/region you’re already working.
    - For each language, follow the per‑language workflow above end‑to‑end.
  - After the batch:
    - Summarize what was added/changed (catalog entries, bases, mappings, races affected).
    - Mention any items you had to mark `skip`, `unmatched`, or `ambiguous` and why.

- **When a family or list is exhausted:**
  - Tell me:
    - That the list/family is fully wired (per [Languages-Status.md](cci:7://file:///e:/code/Fantasy-Map-Generator/DEVplans/Languages-Status.md:0:0-0:0) definition), or
    - That some entries are intentionally `skip`/unresolvable.
  - Propose the **next logical family or list to tackle** (respecting my current devplans and any instructions I’ve given in this session).

When stopping for handoff, include:

- Files changed
- Suggested commit messages (no commits performed by agents)
- Staging guidance (no git): describe how you would logically split the changes into commits (no commands run)
- Verification commands run (or to run), including `pnpm run mixer:guardrails` and the suite

Follow these rules every time I send this workflow prompt at the start of a session. After that, assume that `continue` means “pick up the next appropriate batch under this exact workflow” until I explicitly change tasks.