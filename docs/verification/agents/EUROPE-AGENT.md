# Europe Agent — Language Namebase Verification

## Your Assignment

You are responsible for verifying ALL 722 language entries in `modules/namebases-europe.js`.

**Critical principle**: Names are defined by the LANGUAGE that coined them, not by the region they're in. A Spanish name in Japan is still Spanish. Your job is to ensure every name in each entry is authentically from that language.

## Your Workspace

- **Source file**: `modules/namebases-europe.js`
- **Progress log**: `docs/verification/reports/europe-progress.md`
- **Checkpoint**: `docs/verification/checkpoints/europe-checkpoint.json`
- **Research notes**: `docs/verification/research/by-language/<name>.md`
- **Continent findings**: `docs/verification/research/by-continent/europe-findings.md`

## Processing Order

Process entries **strictly in file order** (sequential, from top to bottom). Do NOT skip around or reorder by language size. This ensures predictable progress and makes resumption from checkpoints straightforward.

## Common Issues to Watch For

### 1. Wrong-Language Names in Bases
The existing data has been contaminated with Arabic and Asian place names in European language entries. This is the #1 issue to fix. Names must be from the LANGUAGE, not just from the continent.

**Example of WRONG data**:
- English base containing: "Al Ḩamīdīyah, Al Waheda, Al Karama" (these are Arabic, not English)
- French base containing: "Mirdif, Hawr al 'Anz, Mankhūl" (these are Arabic, not French)
- Italian base containing: "Dubai Festival City, Dubai International Financial Centre" (these are Arabic/English, not Italian)

### 2. Insufficient Name Counts
Many entries may have fewer than 25 names. Expand them.

### 3. Wrong File Assignment
Some Asian or African languages may be in the Europe file. Flag these for cross-file resolution.

### 4. Encoding Issues
Watch for mojibake patterns like "ProvenÃ§al" (should be "Provençal").

## Verification Workflow

For EACH language entry:

### Step 1: Research the Language
1. Search Wikipedia: `"<Language>" language`
2. Note: countries where spoken, speaker count, language family
3. Note: typical place name patterns for this language

### Step 2: Verify Each Name
1. Extract all names from the `b:` field
2. Count them — if <25, flag for expansion
3. Spot-check at least 20% of names (minimum 10)
4. For each checked name:
   - Search: `"<name>" <language> place`
   - Verify it's a real place and the name is authentically from the correct language
   - If wrong language → REMOVE and replace (even if it's from the right continent)

### Step 3: Expand if Needed
If fewer than 50 names (or 80 for major languages):
1. Search for lists of cities/towns named by speakers of the language
2. Add verified authentic names from the language (anywhere in the world the language has been spoken)
3. Ensure diversity across the language's naming range

### Step 4: Fix Entry Fields
- Verify `min`/`max` are reasonable
- Verify `d` matches the language's phonotactics
- Verify `m` is appropriate

### Step 5: Write Back
1. Edit the entry in `modules/namebases-europe.js`
2. Run `pnpm mixer:guardrails`
3. Log the results

### Step 6: Document
1. Create `research/by-language/<name>.md`
2. Update progress log
3. Update checkpoint

## Quality Checklist Per Language

- [ ] Language name is a real language
- [ ] All names in `b:` are real places
- [ ] All names are from the correct LANGUAGE (not just the right region — language determines name origin)
- [ ] All names use Latin/Romanized script
- [ ] Minimum 25 names (target 50-100+)
- [ ] Names span the language's naming range (anywhere the language has named places)
- [ ] `min`/`max` are reasonable
- [ ] `d` value matches language phonotactics
- [ ] `m` value is appropriate
- [ ] No encoding issues
- [ ] Entry is in the correct file

## Tools

After each language edit:
```bash
pnpm mixer:guardrails
```

After every 10 languages:
```bash
pnpm mixer:health
```

After completing all languages:
```bash
pnpm mixer:doctor
pnpm mixer:qa
```

## Research Sources

1. **Wikipedia**: `https://en.wikipedia.org/wiki/<Language>_language`
2. **Wikipedia lists**: "List of cities in <country>"
3. **GeoNames**: `https://www.geonames.org/`
4. **GEOnet**: `https://geonames.nga.mil/`

## Progress Template

For each language, log:

```markdown
## <Language> (i:<index>)

- **Status**: ✅ COMPLETE | 🔄 IN_PROGRESS | ❌ BLOCKED
- **Speaker count**: ~<N>M
- **Primary regions**: <countries>
- **Names before**: <count>
- **Names after**: <count>
- **Names removed**: <count> (<reasons>)
- **Names added**: <count>
- **Issues found**: <description>
- **Verification**: pnpm mixer:guardrails => OK
```
