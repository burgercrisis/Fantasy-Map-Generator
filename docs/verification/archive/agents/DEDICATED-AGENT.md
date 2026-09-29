# Dedicated Agent — Language Namebase Verification

## Your Assignment

You are responsible for verifying ALL 1,368 language entries in `modules/namebases-dedicated.js`.

This is the SECOND LARGEST assignment. The dedicated file contains high-priority languages
that have been given unique base indices (i:200000 to i:201367). These are languages
that need special attention and unique name sets.

**Critical principle**: Names are defined by the LANGUAGE that coined them, not by the region they're in. Your job is to ensure every name in each entry is authentically from that language.

## Your Workspace

- **Source file**: `modules/namebases-dedicated.js`
- **Progress log**: `docs/verification/reports/dedicated-progress.md`
- **Checkpoint**: `docs/verification/checkpoints/dedicated-checkpoint.json`
- **Research notes**: `docs/verification/research/by-language/<name>.md`
- **Continent findings**: `docs/verification/research/by-continent/dedicated-findings.md`

## Understanding the Dedicated File

The dedicated file contains languages that have been given special treatment:
- Each has a unique base index in the 200000+ range
- These languages are "pinned" in the mixer map (via dedicatedPins deltas)
- They are intended to have globally unique city lists
- They take priority over continent file entries in the merge (dedicated is concatenated last)

## Processing Order

Process entries **strictly in file order** (sequential, from top to bottom). Do NOT skip around or reorder by language size. This ensures predictable progress and makes resumption from checkpoints straightforward.

## Key Principles for Dedicated Entries

### 1. Uniqueness is Paramount
Each dedicated entry MUST have a name set that is distinct from:
- The same language in another file
- Other closely related languages in the dedicated file
- Any other language in the system

### 2. Geographic Specificity
Dedicated entries should reflect the specific dialect/variant:
- **Egyptian Arabic** → place names from Egyptian Arabic (Cairo, Alexandria, Giza, Luxor, Aswan)
- **Gulf Arabic** → place names from Gulf Arabic (Dubai, Abu Dhabi, Doha, Manama, Kuwait City)
- **Brazilian Portuguese** → place names from Brazilian Portuguese (São Paulo, Rio de Janeiro, Salvador)
- **Mexican Spanish** → place names from Mexican Spanish (Mexico City, Guadalajara, Monterrey)

The names must be from the LANGUAGE/DIALECT, not just from the region.

### 3. Name Count
Dedicated entries should have generous name counts:
- Major languages: 100+ names
- Medium languages: 75+ names
- Minor languages: 50+ names
- Hard minimum: 25 names

### 4. Cross-Reference with Other Files
Check if the same language exists in another file:
- If yes, ensure the dedicated entry has DIFFERENT names
- The dedicated entry should have names specific to its dialect/region
- Flag any duplicates for cross-file resolution

## Verification Workflow

### Step 1: Identify the Language
1. Read the `name` field
2. Determine: What language? What dialect/region?
3. Search Wikipedia: `"<Language>" language` or `"<Language>" dialect`
4. Note: countries where spoken, speaker count, language family

### Step 2: Verify Each Name
1. Extract all names from the `b:` field
2. Count them — if <25, flag for expansion
3. Spot-check at least 20% of names (minimum 10)
4. For each checked name:
   - Verify it's a real place
   - Verify the name is authentically from the correct language/dialect
   - Verify it's in Romanized form
   - If wrong → REMOVE and replace

### Step 3: Check Uniqueness
1. Search for the same language in other files
2. Compare name sets
3. Ensure the dedicated entry has distinct names
4. If names overlap significantly, replace with language-specific alternatives

### Step 4: Expand if Needed
If fewer than 50 names (75+ for medium, 100+ for major):
1. Search for place names from the specific language/dialect
2. Add verified authentic names
3. Ensure diversity within the language's naming range

### Step 5: Write Back
1. Edit the entry in `modules/namebases-dedicated.js`
2. Run `pnpm mixer:guardrails`
3. Log the results

### Step 6: Document
1. Create `research/by-language/<name>.md`
2. Update progress log
3. Update checkpoint

## Quality Checklist Per Language

- [ ] Language name is a real language/dialect
- [ ] All names in `b:` are real places
- [ ] All names are from the correct LANGUAGE (language determines name origin, not geography)
- [ ] All names use Latin/Romanized script
- [ ] Minimum 25 names (target 50-100+)
- [ ] Names are DISTINCT from the same language in other files
- [ ] Names span the language's naming range
- [ ] `min`/`max` are reasonable
- [ ] `d` value matches language phonotactics
- [ ] No encoding issues
- [ ] Index is in the 200000+ range (dedicated range)

## Common Issues to Watch For

### 1. Duplicate Names with Other Files
The most common issue: dedicated entries that copy names from other files.
This defeats the purpose of having dedicated entries.

### 2. Wrong-Language Names
A dialect-specific entry may contain names from the wrong language variety:
- Gulf Arabic entry with North African Arabic place names
- Brazilian Portuguese entry with European Portuguese place names

### 3. Non-Romanized Names
All names must be Romanized.

### 4. Thin Name Sets
Dedicated entries should be RICH in names. Thin sets are unacceptable.

