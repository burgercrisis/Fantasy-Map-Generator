---
description: Decluster shared language bases
auto_execution_mode: 0
---

Use this workflow when you want to **break up a specific shared-base cluster** in the language mixer so that each mapped language ends up with its own **unique, linguistically appropriate `[bases]` array**, in line with:

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

Verification order (diagnostic-first):

- Run `pnpm run mixer:guardrails` early (before suite).
- Run decluster-specific diagnostics (clusters + inconsistencies).
- Do **not** run `run-language-mixer-suite.js` unless the user explicitly asks.

- [Language System Status – Markov & Mixer](../DEVplans/Languages-Status.md)
- [Races & Languages – System Rules §1.3](../DEVplans/Races-Languages-Rules.md#13-language-base-uniqueness-intent)

The high-level rules you must respect:

- **Per-language uniqueness**: in the end-state, no two non-sentinel mixer languages should share an **identical** `bases[]` set.
- **Historical / regional plausibility**: bases and mixes must reflect each language’s **family, region, and role** (lexifier vs local, contact zone, etc.).
- **Race compatibility**: changes should keep race palettes and coverage sane; rely on family/category/tag metadata so race tools continue to work.
- **No broad exceptions**: identical shared `bases[]` arrays are treated as uniqueness debt. Sharing is permitted only for true aliases of the *same* language (same entity) or `skip: true` classification items in a Wikipedia list JSON.

---

## 1. Pick a cluster and confirm it should be declustered

1. **Run the base-cluster report** to see current shared `[bases]` arrays:

   ```bash
   pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families
   ```

2. **Choose a target cluster** for this session:

   - Prefer **large clusters** or those that:
     - mix **multiple families or regions**, or
     - are called out in [Languages-Status §3–4](../DEVplans/Languages-Status.md#3-not-unique-enough-clusters-current-suspects) as **uniqueness debt**.
   - If the cluster is marked as an **alias-of-the-same-language** case, confirm it is truly an alias and document that fact; otherwise treat it as a declustering target.

3. **Scope the work**:

   - Decide whether you are:
     - burning down the **entire cluster**, or
     - splitting a **small batch** first (recommended) and iterating until the cluster is gone.
   - Keep the scope small enough to complete in one session (e.g. **5–15 languages**), but large enough to meaningfully reduce uniqueness debt on that base.

---

## 2. Inspect the languages in the cluster

1. For each ISO in the chosen cluster, gather context from:

   - `config/language-mixer-map.json` (the `[bases]` mapping you will be changing).
   - `config/language-mixes.json` (the catalog entry: `iso`, `family`, `category`, `region`, `tags`, etc.).

2. Build a quick **per-language note** (mentally or in a scratchpad) capturing at least:

   - ISO code and name.
   - `family`, `category`, `region` from the catalog.
   - Any important `tags` (e.g. `"family"` for macro entries, `"creole"`, `"pidgin"`, `"historical"`).
   - Role in the cluster:
     - lexifier / trade hub,
     - typical daughter / regional lect,
     - contact-zone hybrid.

3. Identify **which entries can remain shared** (if any):

  - Only allow sharing when it is a true alias of the *same* language (same entity), or when a list item is explicitly excluded from coverage via `skip: true`.

---

## 3. Design unique base mixes per language

1. For each language in the cluster, decide on a **target `[bases]` array** that:

   - Is **globally unique** (no other language ends up with the same array, order-insensitive).
   - Keeps an appropriate **anchor base** from the cluster (e.g. the original base or a very close neighbor).
   - Adds or swaps in **regional and family-appropriate** bases from the existing namebase pool.

2. Follow these design guidelines from the devplans:

  - **Default: dedicated base per language**:
    - For non-hybrid languages, the long-term target is a **single-base** `[X]` array anchored on a base tuned to that language’s own family / region / script.
    - Multi-base `[X,Y,...]` mixes are primarily for **genuinely hybrid / contact / creole / mixed** languages and for a small number of deliberately broad macro entries.
  - **Keep anchors realistic**:
    - If the current shared base is historically plausible as a lexifier (e.g. Malay, English, Arabic, Swahili, Tamil), it can stay as **one ingredient** in daughter mixes, but it should not be the only thing giving them flavor long term.
  - **Create new bases when needed**:
    - If no existing base gives a language an accurate, distinctive flavor, plan to **introduce a new base** (or split an over-broad macro base) with its own seeds and settings rather than leaving that language permanently piggy-backing on unrelated neighbors.
    - Base creation work (new indices, seeds, `min/max/d` tuning, and potentially sharding into additional `namebases-*` files to keep load manageable) should follow the base-creation devplans, but it is an expected part of paying down shared-base uniqueness debt, not something to avoid.
  - **Express relationships via overlaps, not identical arrays**:
    - Related languages should show **overlapping but non-identical** `[bases]` arrays, e.g. siblings sharing 1–2 bases but differing in at least one.
  - **Respect region and script**:
    - Avoid mixes that cross obviously unrelated regions or scripts unless the language is **explicitly** a cross-region contact language.

3. Sanity-check uniqueness and base counts:

   - Before editing files, quickly scan `language-mixer-map.json` (or rerun the cluster report on a scratch copy) to ensure your proposed `[bases]` arrays are **not already in use** elsewhere.
   - For straightforward genealogical languages, try to converge them toward **single-base** `[X]` arrays as you work through clusters.
   - When a language is genuinely hybrid / creole / mixed, aim for **small mixes** (typically **2–4 bases**); larger mixes should be rare and strongly justified by the contact situation.

---

## 4. Apply mapping changes

1. Do **not** hand-edit `config/language-mixer-map.json`.

2. Apply mapping changes via a delta file under `tools/mixer-deltas/*.json`:

   - Use `setBases: { "iso": [<bases...>] }` to set the exact bases[] per ISO.
   - If you created a new dedicated base index for an ISO, also add:
     - `dedicatedPins: { "iso": <dedicatedBase> }`
   - Keep arrays sorted or consistently ordered so diffs are readable.

3. If any mapped language is **missing a catalog entry** in `config/language-mixes.json`:

   - Either add the missing catalog entry in line with existing patterns, or, if the mapping looks spurious, change it to point at the correct ISO instead of deleting it.
   - Under the no-deletion policy for languages, do **not** drop catalog or mapping rows as part of declustering; fixes always happen via additions and base/metadata adjustments.
   - Ensure `language-mixes.json` and `language-mixer-map.json` stay in sync for every ISO.

4. Apply deltas:

   ```bash
   pnpm run mixer:apply-deltas
   ```

   Single-integrator lane: if you are not the integrator, stop here and hand off (delta file + notes + verification commands to run) instead of applying/regenerating artifacts yourself.

---

## 5. Re-run diagnostics and verify declustering

1. **Re-run the cluster report** focused on the base(s) you just changed to confirm the cluster is broken up:

   ```bash
   pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families
   ```

   - The target cluster should disappear (or remain only among `skip: true` items, if applicable).

2. **Run the inconsistency checker** to ensure you did not introduce broken mappings:

   ```bash
   pnpm exec -- node tools/check-language-mixer-map-inconsistencies.js --show-all-bases
   ```

   - Fix any reported issues where a language has a mapping but no catalog entry, or vice versa.
   - Pay special attention to warnings about bases now spanning **too many unrelated families/regions**; you may need a second declustering pass.

3. Optionally, run the broader language mixer QA suite (see `Languages-Status.md` §1 and `tools/HELPER-TOOLS.md`) if you touched a high-impact lexifier hub.

---

## 6. Race-layer sanity checks (optional but recommended)

Because race language palettes depend on the language mixer catalogs, large declustering passes can shift which languages each race sees.

1. If you significantly change a **high-degree lexifier** cluster (e.g. English-based creoles, Malay/Papuan hubs, pan-African bases):

   - Re-run the relevant `tools/mixer-races/*.js` reports (see `Races-Languages-Rules.md` §5.2–5.3) to ensure:
     - No race suddenly reaches **near-100% catalog coverage**.
     - No race loses coverage for its intended region/families.

2. If race coverage looks wrong, adjust:

   - **Race profiles** (`raceLanguageProfiles` in `modules/races.js`), not the declustered language mappings, unless the mapping itself clearly violated family/region rules.

---

## 7. Document what you did

1. Update the **Languages-Status** devplan:

   - Note which **base(s)** and **families/regions** you declustered.
   - Summarize the before/after cluster situation (e.g. 	[29] cluster split; only `vie` remains pure-29, others now use unique 29-anchored mixes).

  2. If you believe a shared `bases[]` case is a true alias of the same language (same entity), document that explicitly in `DEVplans/Languages-Status.md` and ensure the relevant list JSON marks any non-language classification items as `skip: true`. **Only true aliases of the same language (same entity) or `skip: true` classification items are permitted to share identical `bases[]` arrays.**

 3. If a commit is needed, stop and ask the user.

    When preparing a commit message, it should mention:

   - The base(s) you declustered.
   - The families/regions affected.
