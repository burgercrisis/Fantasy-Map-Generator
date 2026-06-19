# Asia Agent — Language Namebase Verification

## Your Assignment

You are responsible for verifying ALL 1,270 language entries in `modules/namebases-asia.js`.

This is the LARGEST assignment. Take your time and be thorough.

**Critical principle**: Names are defined by the LANGUAGE that coined them, not by the region they're in. Your job is to ensure every name in each entry is authentically from that language.

## Your Workspace

- **Source file**: `modules/namebases-asia.js`
- **Progress log**: `docs/verification/reports/asia-progress.md`
- **Checkpoint**: `docs/verification/checkpoints/asia-checkpoint.json`
- **Research notes**: `docs/verification/research/by-language/<name>.md`
- **Continent findings**: `docs/verification/research/by-continent/asia-findings.md`

## Processing Order

Process entries **strictly in file order** (sequential, from top to bottom). Do NOT skip around or reorder by language size. This ensures predictable progress and makes resumption from checkpoints straightforward.

## Common Issues to Watch For

### 1. Non-Romanized Names
Many names may be in non-Latin scripts. ALL names must be converted to Romanized form:
- 北京 → Beijing (NOT Chinese characters)
- 東京 → Tokyo (NOT Japanese characters)
- मुंबई → Mumbai (NOT Devanagari)
- 서울 → Seoul (NOT Hangul)

### 2. Wrong-Language Names in Bases
Remove any name not authentically from the correct language. The test is always: "Is this name from this language?"

### 3. Thin Name Sets
Many entries may be under-populated. Expand to at least 25 names, preferably 50+.

### 4. Romanization Consistency
Use consistent romanization within each language. Use the most common/standard system (Pinyin for Chinese, Hepburn for Japanese, Revised Romanization for Korean, etc.).

### 5. Language vs. Language Family
Ensure entries are for specific languages, not families:
- ✅ "Hindi" (specific language)
- ❌ "Indo-Aryan" (language family — too broad)

### 6. Cross-File Languages
Some languages span multiple files. Ensure each entry has names from the language as spoken in the relevant region.

## Verification Workflow

Same as the general workflow in MASTER-PLAN.md.

### Step 1: Research the Language
1. Search Wikipedia: `"<Language>" language`
2. Note: countries where spoken, speaker count, language family
3. Note: typical place name patterns and romanization standards

### Step 2: Verify Each Name
1. Extract all names from the `b:` field
2. Count them — if <25, flag for expansion
3. Spot-check at least 20% of names (minimum 10)
4. For each checked name:
   - Verify it's a real place
   - Verify the name is authentically from the correct language
   - Verify it's in Romanized form (not original script)
   - If wrong → REMOVE and replace

### Step 3: Expand if Needed
If fewer than 50 names (80 for major languages):
1. Search for lists of cities/towns named by speakers of the language
2. Add verified authentic names from the language in Romanized form
3. Ensure diversity across the language's naming range

### Step 4-6: Same as general workflow

## Quality Checklist Per Language

- [ ] Language name is a real language (not a family)
- [ ] All names in `b:` are real places
- [ ] All names are from the correct LANGUAGE (language determines name origin, not geography)
- [ ] **ALL names use Romanized Latin script (NO exceptions)**
- [ ] Romanization is consistent and standard
- [ ] Minimum 25 names (target 50-100+, 80+ for major languages)
- [ ] Names span the language's naming range
- [ ] `min`/`max` are reasonable
- [ ] `d` value matches language phonotactics
- [ ] No encoding issues

