# South America Agent — Language Namebase Verification

## Your Assignment

You are responsible for verifying ALL 170 language entries in `modules/namebases-southAmerica.js`.

This file primarily contains Indigenous languages of South America.

**Critical principle**: Names are defined by the LANGUAGE that coined them, not by the region they're in. Your job is to ensure every name in each entry is authentically from that language.

## Your Workspace

- **Source file**: `modules/namebases-southAmerica.js`
- **Progress log**: `docs/verification/reports/south-america-progress.md`
- **Checkpoint**: `docs/verification/checkpoints/south-america-checkpoint.json`
- **Research notes**: `docs/verification/research/by-language/<name>.md`
- **Continent findings**: `docs/verification/research/by-continent/south-america-findings.md`

## Processing Order

Process entries **strictly in file order** (sequential, from top to bottom). Do NOT skip around or reorder by language size. This ensures predictable progress and makes resumption from checkpoints straightforward.

## Common Issues to Watch For

### 1. Colonial-Language Names in Bases
Many language bases may be contaminated with Spanish or Portuguese colonial names. Prefer names from the indigenous language. The test is: "Was this name coined by speakers of this language?"

### 2. Romanization of Indigenous Names
Use standard orthography for each language. Keep diacritics that are part of standard orthography.

### 3. Very Small Name Sets
Many indigenous languages have very few documented place names. Include indigenous community names, river names, geographic features, and historical settlements.

### 4. Overlapping Territories
Many languages overlap in territory. Ensure names are from the specific language, not just the general region.

## Verification Workflow

Same as the general workflow in MASTER-PLAN.md.

### Step 1: Research the Language
1. Search Wikipedia: `"<Language>" language`
2. Note: countries where spoken, speaker count, language family
3. Note: typical place name patterns and romanization

### Step 2: Verify Each Name
1. Extract all names from the `b:` field
2. Count them — if <25, flag for expansion
3. Spot-check at least 20% of names (minimum 10)
4. For each checked name:
   - Verify it's a real place
   - Verify the name is authentically from the correct language
   - Verify it's in Romanized form
   - Prefer indigenous-language names over colonial names

### Step 3: Expand if Needed
If fewer than 30 names (50 preferred):
1. Search for place names from the language itself
2. Use Wikipedia lists of cities in the relevant countries
3. Include river names and geographic features (often retain indigenous names)
4. Include historical place names

### Step 4-6: Same as general workflow

## Quality Checklist Per Language

- [ ] Language name is a real language
- [ ] All names in `b:` are real places
- [ ] All names are from the correct LANGUAGE (language determines name origin, not geography)
- [ ] All names use Latin/Romanized script
- [ ] Minimum 25 names (target 50+)
- [ ] Prefer indigenous-language place names over colonial names
- [ ] `min`/`max` are reasonable
- [ ] `d` value matches language phonotactics
- [ ] No encoding issues

