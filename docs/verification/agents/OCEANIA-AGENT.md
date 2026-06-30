# Oceania Agent — Language Namebase Verification

## Your Assignment

You are responsible for verifying ALL 581 language entries in `modules/namebases-oceania.js`.

This file contains languages from the Pacific region: Polynesian, Micronesian, Melanesian,
Australian Aboriginal, and Papuan languages.

**Critical principle**: Names are defined by the LANGUAGE that coined them, not by the region they're in. Your job is to ensure every name in each entry is authentically from that language.

## Non-Negotiable Rules

1. **EVERY NAME MUST BE VERIFIED** — No spot-checks, no sampling, no guessing. Each name must be confirmed against a reliable source (Wikipedia, Ethnologue, Joshua Project, GEOnames, Mapcarta).
2. **IF YOU CAN'T VERIFY A NAME, REMOVE IT** — Do not keep unverified names hoping they're correct.
3. **ACCURACY > SPEED** — It is better to have 5 entries fully verified than 50 entries with unverified names. Take the time to do it right.
4. **COVER TERMS GET MARKED WAITING** — If an entry is a language family, region, or cover term (not a single language), mark it WAITING. Do not try to fill its `b:` field.
5. **IF YOU CAN'T REACH 25 VERIFIED NAMES, MARK WAITING** — Explain what you searched and what you found.
6. **DOCUMENT EVERY NAME** — Your research log must note the source for each verified name.

## Your Workspace

- **Source file**: `modules/namebases-oceania.js`
- **Progress log**: `docs/verification/reports/oceania-progress.md`
- **Checkpoint**: `docs/verification/checkpoints/oceania-checkpoint.json`
- **Research notes**: `docs/verification/research/by-language/<name>.md`
- **Continent findings**: `docs/verification/research/by-continent/oceania-findings.md`

## Processing Order

Process entries **strictly in file order** (sequential, from top to bottom). Do NOT skip around or reorder by language size. This ensures predictable progress and makes resumption from checkpoints straightforward.

## Common Issues to Watch For

### 1. English Names in Bases
Many language bases may be contaminated with English names. Prefer names from the indigenous language. The test is: "Was this name coined by speakers of this language?"

### 2. Romanization
Polynesian and other languages have specific romanization (macrons, ʻokina, etc.). Keep diacritics that are part of standard orthography.

### 3. Very Small Name Sets
Many languages have very few documented place names. Include island names, atoll names, village names, river names, and mountain names.

### 4. Cross-File Issues
Some languages span multiple regions. Ensure each entry has names from the relevant language variety.

## Verification Workflow

Same as the general workflow in MASTER-PLAN.md.

### Step 1: Research the Language
1. Search Wikipedia: `"<Language>" language`
2. Note: islands/regions where spoken, speaker count, language family
3. Note: typical place name patterns and romanization

### Step 2: Verify Each Name (EVERY NAME MUST BE VERIFIED)
1. Extract all names from the `b:` field
2. Count them — if <25, you need to find more from reliable sources
3. **Verify EVERY SINGLE NAME** against a reliable source — NO spot-checks, NO sampling
4. For EACH name, search the name + the language name to confirm:
   - It is a real place (city, town, village, geographic feature)
   - The name is authentically from the correct language
   - It is in Romanized form
   - It passes all the criteria in MASTER-PLAN §2.2B
5. **Remove ANY name that fails verification — do NOT keep unverified names**
6. Find replacement names from Wikipedia, Ethnologue, Joshua Project, or GEOnames

### Step 3: Expand if Needed
If fewer than 30 names (50 preferred):
1. Search for place names from the language itself
2. Use Wikipedia lists of islands, villages, and geographic features
3. Include island names and atoll names
4. For Papuan languages, use river names and mountain names

### Step 4-6: Same as general workflow

## Quality Checklist Per Language

- [ ] Language name is a real language (not a family, region, or cover term)
- [ ] **EVERY name in `b:` has been individually verified** against a reliable source
- [ ] All names are real places (city, town, village, geographic feature)
- [ ] All names are from the correct LANGUAGE (language determines name origin, not geography)
- [ ] All names use Latin/Romanized script
- [ ] Minimum 25 verified names (target 50+)
- [ ] Prefer indigenous-language place names over colonial names
- [ ] `min`/`max` are reasonable
- [ ] `d` value matches language phonotactics
- [ ] No encoding issues
- [ ] Research log documents EVERY name and its source
- [ ] If entry is a cover term → marked WAITING with explanation
- [ ] If cannot verify enough names → marked WAITING with explanation

