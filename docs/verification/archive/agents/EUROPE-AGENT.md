# Europe Agent — Language Namebase Verification

## Your Assignment

You are responsible for verifying ALL 722 language entries in `modules/namebases-europe.js`.

**Critical principle**: Names are defined by the LANGUAGE that coined them, not by the region they're in. A Spanish name in Japan is still Spanish. Your job is to ensure every name in each entry is authentically from that language.

## Current State (2026-06-23)

### Distribution
| Range | Count | What this actually means |
|-------|-------|------------------------|
| Below 25 | 0 | No entries with critically low counts |
| 25-29 | 285 | Have enough names but NOT verified for linguistic accuracy |
| 30-49 | 380 | Have enough names but NOT verified for linguistic accuracy |
| 50-79 | 39 | Have enough names but NOT verified for linguistic accuracy |
| 80+ | 18 | Have enough names but NOT verified for linguistic accuracy |

**IMPORTANT**: The "30+" counts only mean the entry has ≥30 unique strings in the `b:` field. It does NOT mean those names have been verified as real places from the correct language.

### What Has Actually Been Done
1. Name counts expanded for many entries from <25 to 30+ by pulling names from Wikipedia search snippets
2. Polish entry (i:2716) fixed — had Albanian names, replaced with Polish names
3. Guardrails pass throughout

### What Has NOT Been Done (CRITICAL GAP)
**No entry has been properly verified for linguistic accuracy.** Specifically:

1. **Names were NOT verified against sources** — names were extracted from web search snippets without opening the actual Wikipedia/GeoNames pages to confirm they are real places
2. **Names were NOT checked for language authenticity** — no confirmation that names are actually used BY speakers of the entry's language
3. **Spelling/diacritics were NOT verified** — names may have incorrect spelling for their language
4. **Wrong-language names were NOT systematically removed** — the Polish entry was fixed because contamination was obvious, but no other entries were checked
5. **Phonotactic fields (`d:`) were NOT verified** against actual language phonology
6. **min/max fields were NOT checked** against actual name length distributions
7. **No research notes were created** in `docs/verification/research/by-language/`
8. **No progress log or checkpoint was updated**

### Known Problems (Not Yet Fixed)
1. **Polish (i:2716)**: FIXED — was Albanian names, now Polish
2. **Mari entries** (6 entries): Likely contain Russian names — NOT verified
3. **Possible contamination in other entries**: NOT checked
4. **285 entries at 25-29 names**: Need expansion but existing names NOT verified first

## Your Workspace

- **Source file**: `modules/namebases-europe.js`
- **Progress log**: `docs/verification/reports/europe-progress.md`
- **Checkpoint**: `docs/verification/checkpoints/europe-checkpoint.json`
- **Research notes**: `docs/verification/research/by-language/<name>.md`
- **Continent findings**: `docs/verification/research/by-continent/europe-findings.md`

## Processing Order

Process entries **strictly in file order** (sequential, from top to bottom). Do NOT skip around or reorder by language size.

## Verification Workflow (MANDATORY — DO NOT SKIP STEPS)

For EACH language entry:

### Step 1: Research the Language
1. **Use `webfetch`** to open `https://en.wikipedia.org/wiki/<Language>_language`
2. Confirm: Is this a real language? Where is it spoken? How many speakers?
3. Note typical place name patterns for this language
4. **Do NOT skip this step**

### Step 2: Verify Each Existing Name (MOST IMPORTANT)
1. Extract all names from the `b:` field
2. **For EACH name** (or at minimum 20% if there are many):
   - **Use `webfetch`** to open the Wikipedia page for that name
   - Confirm: Is this a real settlement/place?
   - Confirm: Is this name used BY speakers of this language (not just in the region)?
   - Confirm: Is the spelling correct for this language's orthography?
   - If wrong language → REMOVE
   - If not a real place → REMOVE
   - If spelling wrong → FIX

### Step 3: Expand if Needed (Only After Step 2)
If fewer than 30 verified names remain:
1. **Use `webfetch`** to open Wikipedia pages like "List of cities in <country>" for the language's region
2. Extract names from the **full page content** (not search snippets)
3. **Verify each name** (use `webfetch` to check it's real) before adding
4. Add only verified authentic names

### Step 4: Fix Entry Fields
- Verify `min`/`max` match actual name lengths in the entry
- Verify `d` matches the language's phonotactics
- Verify `m` is appropriate

### Step 5: Write Back
1. Edit the entry in `modules/namebases-europe.js`
2. Run `pnpm mixer:guardrails`

### Step 6: Document
1. Create `research/by-language/<name>.md` with verification notes
2. Update progress log
3. Update checkpoint

## Common Issues to Watch For

### 1. Wrong-Language Names (CRITICAL)
The existing data has contamination. The Polish entry had Albanian names. Others may have similar issues.

**How to catch this**: For each name, `webfetch` its Wikipedia page. Check what language the place name article is in, and whether speakers of the entry's language actually use that name.

### 2. Search Snippets Are Not Verification
**CRITICAL**: `websearch` returns snippets. Snippets are NOT reliable for verification. You MUST use `webfetch` to open the actual page.

Example of why this matters:
- A search snippet might show "Moscow" in a result about the Mari language
- But `webfetch`ing the Moscow page reveals it's a Russian name, not a Mari name
- Without opening the page, you'd add a Russian name to a Mari entry

### 3. Non-Place Words in Bases
Some entries contain words that are not place names (river names, abbreviations, etc.). Remove these.

### 4. Encoding Issues
Watch for mojibake patterns like "ProvenÃ§al" (should be "Provençal").

## Quality Checklist Per Language

- [ ] Language confirmed real via `webfetch` of Wikipedia article
- [ ] Each name verified as real place via `webfetch` of its Wikipedia page
- [ ] Each name confirmed from correct LANGUAGE (not just region)
- [ ] Spelling/diacritics verified correct for the language
- [ ] Wrong-language names removed
- [ ] Minimum 30 verified names (target 50 medium, 80 major)
- [ ] `min`/`max` verified against actual name lengths
- [ ] `d` verified against language phonotactics
- [ ] Research notes created in `research/by-language/`

## Tools

After each language edit:
```bash
pnpm mixer:guardrails
```

After every 10 languages:
```bash
pnpm mixer:health
```

## Research Sources (Use webfetch, NOT just websearch)

1. **Wikipedia language articles**: `https://en.wikipedia.org/wiki/<Language>_language`
2. **Wikipedia lists**: `https://en.wikipedia.org/wiki/List_of_cities_in_<country>`
3. **GeoNames**: `https://www.geonames.org/`
4. **GEOnet**: `https://geonames.nga.mil/`

## Progress Template

For each language, log:

```markdown
## <Language> (i:<index>)

- **Status**: ✅ VERIFIED | 🔄 IN_PROGRESS | ❌ BLOCKED
- **Speaker count**: ~<N>M (source: Wikipedia)
- **Primary regions**: <countries> (source: Wikipedia)
- **Names before**: <count>
- **Names after**: <count>
- **Names removed**: <count> (<reasons with sources>)
- **Names added**: <count> (<sources>)
- **Names verified**: <count> via webfetch of Wikipedia pages
- **Issues found**: <description>
- **Verification**: pnpm mixer:guardrails => OK
```

## Priority Actions

1. **Verify existing names in entries 1-50** (English, French, Italian, etc.) — these are the most commonly used
2. **Check all entries for wrong-language contamination** — spot-check 20% of names via webfetch
3. **Verify and expand entries 51-722** — in file order
4. **Create research notes** for each verified language
