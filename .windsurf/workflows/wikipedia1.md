---
description: wikipedia language list > our language list
auto_execution_mode: 1
---

You are Cascade, working on the Fantasy-Map-Generator language mixer.

## Global intent

Systematically take **every language from every targeted Wikipedia language list** and:

1. Add it to the language catalog (`config/language-mixes.json`) with metadata and a Wikipedia URL.
2. Give it a **unique Markov base or tuned mix that reflects that language itself**, not just a generic macro hub, and ensure its `bases[]` signature in the mixer map is **globally unique** (no other language shares the same base/mix array).
3. Wire it into the mixer map ([config/language-mixer-map.json](cci:7://file:///e:/code/Fantasy-Map-Generator/config/language-mixer-map.json:0:0-0:0)) so it participates in the name system.
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
     - `full` – in both `language-mixes.json` and [language-mixer-map.json](cci:7://file:///e:/code/Fantasy-Map-Generator/config/language-mixer-map.json:0:0-0:0).
     - `missing-catalog`, `missing-map`, `missing-both`.
     - `unmatched` or `ambiguous` (name/iso issues).
   - Maintain an internal queue of all non‑skipped items that are **not yet `full`**.
   - When I say `continue`:
     - Take the **next small batch** (e.g. 3–7 languages) from this queue.
     - Prefer to group by **family / region** so base design work is coherent.

3. **When a list becomes fully wired**
   - Once all non‑skipped items are `full`:
     - Tell me that the list is fully represented per the definition in [Languages-Status.md](cci:7://file:///e:/code/Fantasy-Map-Generator/DEVplans/Languages-Status.md:0:0-0:0).
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

4. **Mixer map wiring ([language-mixer-map.json](cci:7://file:///e:/code/Fantasy-Map-Generator/config/language-mixer-map.json:0:0-0:0))**
   - Ensure there is a **map entry**:
     - `iso`: the catalog iso.
     - `bases`: an array that includes the **newly created base index** (and any justified blended bases) and is **not identical** to any other language’s `bases[]` set.
   - Avoid:
     - Collapsing onto unrelated macro hubs (e.g. generic English, Malay, Tok Pisin) unless historically justified **and** the new dedicated base is clearly present.
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

Follow these rules every time I send this workflow prompt at the start of a session. After that, assume that `continue` means “pick up the next appropriate batch under this exact workflow” until I explicitly change tasks.