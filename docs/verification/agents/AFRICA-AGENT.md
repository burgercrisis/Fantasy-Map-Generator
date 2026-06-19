# Africa Agent — Language Namebase Verification

## Your Assignment

You are responsible for verifying ALL 790 language entries in `modules/namebases-africa.js`.

**Critical principle**: Names are defined by the LANGUAGE that coined them, not by the region they're in. Your job is to ensure every name in each entry is authentically from that language.

## Your Workspace

- **Source file**: `modules/namebases-africa.js`
- **Progress log**: `docs/verification/reports/africa-progress.md`
- **Checkpoint**: `docs/verification/checkpoints/africa-checkpoint.json`
- **Research notes**: `docs/verification/research/by-language/<name>.md`
- **Continent findings**: `docs/verification/research/by-continent/africa-findings.md`

## Processing Order

Process entries **strictly in file order** (sequential, from top to bottom). Do NOT skip around or reorder by language size. This ensures predictable progress and makes resumption from checkpoints straightforward.

## Common Issues to Watch For

### 1. Wrong-Language Names in Bases
The existing data may contain names from wrong languages. The key question is always: "Was this name coined by speakers of this language?" Remove any name that fails this test.

### 2. Thin Name Sets
Many entries may have very small name sets. Expand to at least 25 names, preferably 50+.

### 3. Romanization Variations
African languages have varying romanization standards. Use the most common English-language form. For languages with standard orthographies (e.g., Yoruba ṣ/ẹ/ọ, Swahili, Berber), use the standard romanization.

### 4. Colonial vs. Indigenous Names
Prefer indigenous-language place names over colonial-era names. For example:
- ✅ Lagos (indigenous), Ibadan, Kano
- ⚠️ Victoria (colonial) — replace with indigenous alternative if possible

### 5. Cross-File Languages
Some languages span Africa and other continents (Arabic, Berber). Ensure entries have names from the language as spoken in Africa.

## Verification Workflow

Same as the general workflow in MASTER-PLAN.md.

### Step 1: Research the Language
1. Search Wikipedia: `"<Language>" language`
2. Note: countries where spoken, speaker count, language family
3. Note: typical place name patterns for this language family

### Step 2: Verify Each Name
1. Extract all names from the `b:` field
2. Count them — if <25, flag for expansion
3. Spot-check at least 20% of names (minimum 10)
4. For each checked name:
   - Verify it's a real place
   - Verify the name is authentically from the correct language
   - If wrong language → REMOVE and replace

### Step 3: Expand if Needed
If fewer than 50 names:
1. Search for lists of cities/towns named by speakers of the language
2. Add verified authentic names from the language
3. Ensure diversity across the language's naming range

### Step 4-6: Same as general workflow

## Quality Checklist Per Language

- [ ] Language name is a real language
- [ ] All names in `b:` are real places
- [ ] All names are from the correct LANGUAGE (language determines name origin, not geography)
- [ ] All names use Latin/Romanized script
- [ ] Minimum 25 names (target 50-100+)
- [ ] Names span the language's naming range
- [ ] Prefer indigenous-language names over colonial names
- [ ] `min`/`max` are reasonable
- [ ] `d` value matches language phonotactics
- [ ] No encoding issues

## Research Sources

1. **Wikipedia**: Language articles, "List of cities in <country>"
2. **Ethnologue**: `https://www.ethnologue.com/`
3. **GeoNames**: `https://www.geonames.org/`
