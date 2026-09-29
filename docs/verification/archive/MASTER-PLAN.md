# Master Verification Plan

## Overview

This document defines the complete 4-phase verification strategy for all 5,218 language
namebase entries across 9 source files. The work is distributed across 8 parallel agents
(7 continent agents + 1 dedicated agent), with a coordinator overseeing cross-cutting concerns.

## Phase 1: Index Collision Audit & Repair

**Owner**: Coordinator (run once before continent agents start)
**Duration**: ~1 hour
**Priority**: CRITICAL - must complete before any other work

### 1.1 Generate Collision Report

Run the collision audit tool:
```
node tools/verification/collision-audit.js
```

This scans all `modules/namebases-*.js` files and produces `reports/collision-report.md`.

### 1.2 Classify Each Collision

For each collision (same `i` index, different entries):

| Type | Description | Action |
|------|-------------|--------|
| A | Same name, same file | Delete duplicate |
| B | Same name, different continent | Keep in correct continent, remove from wrong one |
| C | Different name, same index | Reassign one entry's `i`, update mixer map |

### 1.3 Repair Type C Collisions

For each Type C collision:
1. Determine which entry "owns" the index based on geographic correctness
2. Assign the displaced entry a new unique `i` (use safe range: 300000+)
3. Update the `i` field in the source file
4. Search `config/language-mixer-map.json` for the old index
5. Update all references to the new index
6. Run `pnpm mixer:guardrails` to verify

### 1.4 Verify

- Re-run collision audit → zero collisions
- Run `pnpm mixer:guardrails` → OK
- Run `pnpm mixer:health` → no critical issues

**GATE**: Phase 1 must be fully complete before any Phase 2 work begins.

---

## Phase 2: Per-Entry Name Quality Verification

**Owner**: File agents (parallel)
**Duration**: Days to weeks (depending on thoroughness)
**Priority**: PRIMARY WORK

### 2.1 Processing Order

Process entries **strictly in file order** (sequential, from top to bottom). Do NOT skip around or reorder by language size. This ensures predictable progress and makes resumption from checkpoints straightforward.

**Success criterion**: Every single entry must pass the quality checklist. No exceptions. No language is too small, too obscure, or too difficult to verify properly. If you can't find information about a language, try multiple search strategies. If you cannot verify a name, **remove it**. Do NOT guess. Do NOT keep unverified names. Do NOT spot-check — verify EVERY name individually against a reliable source (Wikipedia, Ethnologue, Joshua Project, GEOnames, official government geographic databases).

**ACCURACY IS THE ONLY REQUIREMENT. Speed is irrelevant. If a language takes 5 hours to verify properly, it takes 5 hours. If you cannot verify a name, remove it. If you cannot verify enough names to reach 25, mark the entry WAITING and explain exactly what you searched and what you found.**

**For indigenous languages**: The standard is especially strict. English/French/Spanish colonial names in indigenous language entries must be replaced with authentic indigenous-language names. Cross-contamination between indigenous languages (e.g., Zapotec names in Mixe entry) must be found and fixed.

### 2.2 Per-Language Verification Checklist

For EACH language entry, the agent MUST complete ALL of these steps:

#### A. Language Identity Verification
- [ ] Confirm the `name` field is a real language/dialect name (not a family or region)
- [ ] Look up the language on Wikipedia to confirm it exists
- [ ] Note the language's ISO 639-3 code (if it has one)
- [ ] Note the language's geographic distribution (countries/regions where it's spoken)
- [ ] Note the language's speaker count estimate

#### B. Seed Name Authenticity (EVERY NAME MUST BE VERIFIED)
- [ ] Extract ALL names from the `b:` field
- [ ] Count the names — must be ≥25 (target 50-100+)
- [ ] **Verify EVERY SINGLE NAME** against a reliable source — NO spot-checks, NO sampling
- [ ] For EACH name, confirm by searching the name + the language name:
  - It is a real place (city, town, village, geographic feature) — verify with Wikipedia, GEOnames, or official sources
  - The name is authentically from the language — it was coined by speakers of that language, regardless of where the place is located
  - The name form matches the language's naming conventions and phonotactics
  - It is NOT an administrative unit name (province, state, district)
  - It is NOT a modern anachronism (post-1900 foundation in historical bases)
  - It is NOT a language name used as a place name (e.g., "Eyak" in Eyak entry)
  - It is NOT an ethnic group name used as a place name (e.g., "Tlingit" in Tlingit entry)
  - It is NOT a person name used as a place name (e.g., "Lone Wolf" in Kiowa entry)
  - It is NOT an event name used as a place name (e.g., "Trail of Tears" in Muscogee entry)
  - It is NOT an administrative region name (e.g., "Georgia", "Oklahoma" in Muscogee entry)
  - It is NOT a colonial-language name in an indigenous language entry (e.g., "Red Lake" in Ojibwe, "Sioux Falls" in Dakota, "Window Rock" in Navajo)
  - It is NOT a cross-language contamination (e.g., Zapotec names in Mixe entry, Cuicatec names in Huichol entry)
- [ ] **Remove ANY name that fails verification or cannot be confirmed — do NOT keep unverified names**
- [ ] Replace removed names with verified authentic alternatives from reliable sources
- [ ] If you cannot verify enough names to reach 25, mark the entry WAITING with detailed explanation of what you searched

#### C. Language Coverage
- [ ] Names should span the FULL range of the language's naming traditions
- [ ] NOT all from one location
- [ ] Include places named by speakers of the language across all areas where the language has been spoken
- [ ] For diaspora languages, include diaspora communities where the language has named places
- [ ] For colonial languages, include places named by speakers of that language in colonies (e.g., Spanish names in the Americas are still Spanish)

#### D. Linguistic Authenticity
- [ ] Names should follow the language's morphological patterns
- [ ] Check typical suffixes and prefixes for the language family
- [ ] Verify consonant clusters are plausible for the language
- [ ] Check that diacritics (if any) are correct for the language

#### E. Script Compatibility
- [ ] All names must be in Romanized/Latin script
- [ ] No Cyrillic, Arabic, CJK, Devanagari, or other non-Latin scripts
- [ ] Diacritics are acceptable if commonly used in the language's romanization
  - ✅ OK: ñ, é, ü, ø, ł, č, ő
  - ❌ Not OK: 漢字, Київ, 北京, मुंबई

#### F. Entry Completeness
- [ ] `min` and `max` values are reasonable for the language
- [ ] `d` (doubled-letter permission) matches the language's phonotactics
- [ ] `m` (multi-word rate) is appropriate
- [ ] Entry is in the correct file (files are organized by continent for convenience, but the language's names are defined by the language, not the region)

### 2.3 Research Methodology

For each language, the agent MUST:

1. **Search Wikipedia** for the language article
   - URL pattern: `https://en.wikipedia.org/wiki/<Language>_language`
   - Check: distribution, phonology, toponymy sections
   - If no Wikipedia article exists, search Ethnologue, Glottolog, Joshua Project
2. **Extract verified place names** from the source
   - Only include names explicitly listed as places where the language is spoken
   - Only include names you can confirm are real settlements/villages/towns
   - Do NOT include names just because they "look right" or "sound like" the language
3. **Cross-reference** existing names from the `b:` field
   - For EACH existing name, search to verify it's a real place from the correct language
   - If you cannot verify a name, REMOVE IT — do not keep it hoping it's correct
   - If you verify a name, keep it
4. **Find replacement names** for any that fail
   - Use Wikipedia lists of cities named by speakers of the relevant language
   - Use GEOnames.org for smaller places
   - Use official government geographic databases
   - Use Joshua Project for village lists
5. **If you cannot verify enough names to reach 25**, mark the entry WAITING with detailed explanation:
   - What sources you searched
   - What you found
   - Why you couldn't verify enough names
   - Do NOT mark an entry COMPLETE with unverified names

### 2.4 Verified Sources for Place Names

When researching a language, use these sources in order of preference:

1. **Wikipedia** — Search for the language article. The # Distribution or # Geographic distribution section often lists specific villages/towns.
2. **Ethnologue** (ethnologue.com) — Lists locations where each language is spoken. May require paid access for some details.
3. **Joshua Project** (joshuaproject.net) — Lists villages and communities for many small languages.
4. **Glottolog** (glottolog.org) — Provides geographic coordinates and references.
5. **GEOnames.org** — Database of geographic names worldwide. Useful for confirming a name is a real place.
6. **Mapcarta** — Maps with village-level detail for remote areas.
7. **Official government sources** — National census data, geographic surveys.

**IMPORTANT**: When you find a name in a source, note the source in your research log. Every name in the `b:` field must be traceable to a source.

### 2.5 Documentation

For each language, create a research log at:
`research/by-language/<language-name>.md`

Use the template from `templates/research-log-template.md`.

### 2.5 Progress Tracking

Update `reports/<file>-progress.md` after each language:
- Language name and index
- Status: IN_PROGRESS | COMPLETE | BLOCKED
- Names verified / total
- Issues found and fixed
- Time spent

Update `checkpoints/<file>-checkpoint.json` with current position.

---

### 2.6 Cover Terms and Non-Language Entries

Some entries in the namebase files are NOT single languages. They are cover terms, language families, or regions. These must be handled as follows:

| Type | Example | Action |
|------|---------|--------|
| Language family | "Engan Papuan", "Melanesian Vanuatu", "Dani Papuan" | Mark WAITING — not a single language |
| Cover term for multiple languages | "Land Dayak", "Flores-Lembata" | Mark WAITING — not a single language |
| Region name | "New Caledonia", "Central Pacific" | Mark WAITING — not a language |
| Proto-language | "Proto-Romance", "Proto-Finnic" | Mark WAITING — reconstructed, not attested |
| Dialect continuum | "Cavineena/Cavineña" (same language, two spellings) | Verify if it's one language or two |

**If an entry's `name` field is a family, region, or cover term (not an individual language), do NOT try to fill its `b:` field with names. Mark it WAITING with explanation.**

---

## Phase 3: Cross-Entry Consistency Audit

**Owner**: Coordinator (after all Phase 2 work is complete)
**Duration**: ~2-4 hours
**Priority**: HIGH

### 3.1 Identify Language Clusters

Run the cluster analysis tool:
```
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
```

### 3.2 Evaluate Each Cluster

For each cluster of languages sharing bases:
- **Expected**: Pidgins/creoles sharing a parent language
- **Expected**: Dialects of the same language
- **Expected**: Closely related languages with genuine shared toponymy
- **Suspicious**: Unrelated languages sharing a base
- **Suspicious**: Languages from different families sharing a base

### 3.3 Resolve Anomalous Clusters

For each suspicious cluster:
1. Determine if the sharing is justified
2. If not, give each language its own unique base entry
3. Update the mixer map accordingly
4. Run verification tools

### 3.4 Cross-File Duplicate Check

Verify no language appears in multiple files (unless intentionally — e.g., a dialect variant in dedicated and a base entry in a continent file):
```
node tools/verification/cross-continent-check.js
```

---

## Phase 4: Pipeline Validation

**Owner**: Coordinator (after all repairs are complete)
**Duration**: ~1 hour
**Priority**: FINAL GATE

### 4.1 Full Tool Suite

Run all verification tools in order:
```bash
pnpm mixer:guardrails
pnpm mixer:health
pnpm mixer:doctor
pnpm mixer:qa
node tools/tracking/consolidated-quality-tracker.js
```

### 4.2 Bundle Regeneration

After all changes:
```bash
node tools/mixer-core/generate-language-mixer.js
```

### 4.3 Final Report

Generate `reports/final-verification-report.md` with:
- Total entries verified
- Total issues found and fixed
- Remaining known issues (if any)
- Tool output summary
- Recommendations for ongoing maintenance

---

## Quality Gates Summary

| Phase | Gate Criteria | Tool |
|-------|---------------|------|
| 1 | Zero index collisions | `collision-audit.js` |
| 1 | Guardrails pass | `pnpm mixer:guardrails` |
| 2 | All entries have 25+ verified names | Manual per-entry |
| 2 | All names are authentic place names | Research per-entry |
| 2 | All entries in correct file (organizational, not definitional) | Cross-reference |
| 3 | No anomalous clusters | `report-language-mixer-base-clusters.js` |
| 3 | No cross-file duplicates (unless intentional) | `cross-continent-check.js` |
| 4 | All tools pass | `pnpm mixer:health` + `pnpm mixer:doctor` |
| 4 | Bundles regenerated | `generate-language-mixer.js` |
