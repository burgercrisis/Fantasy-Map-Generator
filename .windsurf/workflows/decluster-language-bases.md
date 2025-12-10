---
description: Decluster shared language bases
auto_execution_mode: 3
---

Use this workflow when you want to **break up a specific shared-base cluster** in the language mixer so that each mapped language ends up with its own **unique, linguistically appropriate `[bases]` array**, in line with:

- [Language System Status – Markov & Mixer](../DEVplans/Languages-Status.md)
- [Races & Languages – System Rules §1.3](../DEVplans/Races-Languages-Rules.md#13-language-base-uniqueness-intent)

The high-level rules you must respect:

- **Per-language uniqueness**: in the end-state, no two non-sentinel mixer languages should share an **identical** `bases[]` set.
- **Historical / regional plausibility**: bases and mixes must reflect each languages **family, region, and role** (lexifier vs local, contact zone, etc.).
- **Race compatibility**: changes should keep race palettes and coverage sane; rely on family/category/tag metadata so race tools continue to work.
- **Documented exceptions**: some shared-base clusters are treated as **historically acceptable** (e.g. the core Finnic/Volgaic base-9 macro cluster); do **not** decluster those unless the devplans are updated.

---

## 1. Pick a cluster and confirm it should be declustered

1. **Run the base-cluster report** to see current shared `[bases]` arrays:

   ```bash
   node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families
   ```

2. **Choose a target cluster** for this session:

   - Prefer **large clusters** or those that:
     - mix **multiple families or regions**, or
     - are called out in [Languages-Status §3–4](../DEVplans/Languages-Status.md#3-not-unique-enough-clusters-current-suspects) as **uniqueness debt**.
   - Cross-check against any **explicit exceptions**, for example:
     - The **Finnic/Volgaic base-9 Uralic macro cluster** that is documented as historically acceptable.
   - If the cluster is marked in the devplans as **already resolved or intentionally shared**, **skip it** and pick another.

3. **Scope the work**:

   - Decide whether you are:
     - burning down the **entire cluster**, or
     - only splitting the worst offenders and leaving a small, well-justified shared core (e.g. a macro entry + its standard).
   - Keep the scope small enough to complete in one session (e.g. **5–15 languages**), but large enough to meaningfully reduce uniqueness debt on that base.

---

## 2. Inspect the languages in the cluster

1. For each ISO in the chosen cluster, gather context from:

   - `config/language-mixer-map.json` (the `[bases]` mapping you will edit).
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

   - Macro/family entries marked with `tags` like `"family"` may be allowed to share with their **single standard** in tightly controlled cases.
   - If devplans explicitly permit a macro + standard pair to share a base, you may keep that as the **minimal shared core**, but only if it is called out in documentation.

---

## 3. Design unique base mixes per language

1. For each language in the cluster, decide on a **target `[bases]` array** that:

   - Is **globally unique** (no other language ends up with the same array, order-insensitive).
   - Keeps an appropriate **anchor base** from the cluster (e.g. the original base or a very close neighbor).
   - Adds or swaps in **regional and family-appropriate** bases from the existing namebase pool.

2. Follow these design guidelines from the devplans:

   - **Keep anchors realistic**:
     - If the current shared base is historically plausible as a lexifier (e.g. Malay, English, Arabic, Swahili, Tamil), keep it as **one ingredient** in daughter mixes, not the sole base.
   - **Express relationships via mixes**, not sharing:
     - Related languages should show **overlapping but non-identical** `[bases]` arrays, e.g. siblings sharing 1–2 bases but differing in at least one.
   - **Respect region and script**:
     - Avoid mixes that cross obviously unrelated regions or scripts unless the language is **explicitly** a cross-region contact language.
   - **Use existing bases first**:
     - Prefer combinations of existing bases over inventing new ones.
     - If you truly need a new base, that work should be coordinated with the base-creation devplans, not ad hoc here.

3. Sanity-check uniqueness:

   - Before editing files, quickly scan `language-mixer-map.json` (or rerun the cluster report on a scratch copy) to ensure your proposed `[bases]` arrays are **not already in use** elsewhere.
   - Aim for **small mixes** (2–4 bases) unless the language is genuinely a heavy contact / creole case.

---

## 4. Apply mapping changes

1. Edit `config/language-mixer-map.json`:

   - For each targeted ISO in your cluster, update its `bases` field to the new array you designed.
   - Keep arrays sorted or consistently ordered so diffs are readable.
   - Do **not** change `iso`, `family`, `category`, or `region` here.

2. If any mapped language is **missing a catalog entry** in `config/language-mixes.json`:

   - Either add the missing catalog entry in line with existing patterns, or
   - Remove / correct the mapping if it was spurious.
   - Ensure `language-mixes.json` and `language-mixer-map.json` stay in sync for every ISO.

3. Save both files when done.

---

## 5. Re-run diagnostics and verify declustering

1. **Re-run the cluster report** focused on the base(s) you just changed to confirm the cluster is broken up:

   ```bash
   node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2 --include-families
   ```

   - The target cluster should either disappear or shrink to the small, intentional core (if you kept a documented macro + standard pair).

2. **Run the inconsistency checker** to ensure you did not introduce broken mappings:

   ```bash
   node tools/check-language-mixer-map-inconsistencies.js --show-all-bases
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
   - Summarize the before/after cluster situation (e.g. [29] cluster split; only `vie` remains pure-29, others now use unique 29-anchored mixes).

2. If the declustering establishes a **new permanent exception** (e.g. a macro + standard you intentionally keep sharing a base), document that explicitly in:

   - `Languages-Status.md` §3 (not-unique-enough clusters / exceptions), and
   - `Races-Languages-Rules.md` §1.3 if it changes the global uniqueness policy.

3. Commit your changes with a message that mentions:

   - The base(s) you declustered.
   - The families/regions affected.
   - Any new exceptions you introduced.
