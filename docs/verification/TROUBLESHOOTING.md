# Troubleshooting Guide

## Common Issues and Resolutions

### 1. `pnpm mixer:guardrails` fails after editing a namebase file

**Symptoms**: Guardrails reports missing indices, duplicate indices, or invalid references.

**Resolution**:
1. Check the error message for the specific index causing the issue
2. Search `config/language-mixer-map.json` for references to that index
3. Verify the index exists in the namebase file
4. If you changed an `i` value, update ALL references in the mixer map
5. Run `pnpm mixer:guardrails` again

### 2. Can't find enough authentic place names for a language

**Symptoms**: A language has very few documented place names (e.g., small indigenous language).

**Resolution**:
1. Search for the language's speakers' region/country on Wikipedia
2. Look for lists of cities, towns, and villages named by speakers of that language
3. Include geographic features (rivers, mountains, lakes) — these often retain names from the language
4. Include historical place names if modern ones are scarce
5. Include community/village names from tribal government websites
6. For colonial languages, include places named by speakers anywhere in the world (e.g., Spanish names in Latin America, the Philippines, etc.)
7. Document the difficulty in the research log

### 3. Unsure if a name is authentic

**Symptoms**: Can't verify a specific place name.

**Resolution**:
1. Search Wikipedia: `"<name>" place`
2. Search Google: `"<name>" <language> <country>`
3. Check GEOnames: `https://www.geonames.org/search.html?q=<name>`
4. Check GEOnet: `https://geonames.nga.mil/`
5. If still unsure, REMOVE the name and replace with a verified one
6. When in doubt, leave it out

### 4. Language appears to be in the wrong file

**Symptoms**: An Asian language is in the Europe file, etc.

**Resolution**:
1. FLAG the issue in `reports/cross-continent-audit.md`
2. DO NOT move the entry yourself (this would shift indices)
3. Let the coordinator decide on resolution
4. Continue verifying the entry where it is

### 5. Entry has non-Romanized names

**Symptoms**: Names in Cyrillic, Arabic script, CJK characters, etc.

**Resolution**:
1. Convert ALL names to standard romanization
2. Use the most common English-language romanization:
   - Chinese: Pinyin
   - Japanese: Hepburn
   - Korean: Revised Romanization
   - Arabic: Common English transliteration
   - etc.
3. Document the romanization standard used

### 6. Entry has clearly wrong names (e.g., Arabic names in European language base)

**Symptoms**: Names from completely wrong language, even if from the same region.

**Resolution**:
1. Remove ALL wrong-language names
2. Research the actual language
3. Replace with verified authentic names from the correct language
4. Document the changes in the research log
5. This is a CRITICAL fix — don't skip it

### 7. Two entries have identical name sets

**Symptoms**: Two different languages have the same or nearly the same `b:` field.

**Resolution**:
1. Determine if these are truly different languages or duplicates
2. If different languages: ensure each has distinct names reflecting its own region
3. If duplicates: flag for coordinator review
4. Update the mixer map if needed

### 8. `mixer:health` reports failures

**Symptoms**: Health check shows coverage gaps, failures, or other issues.

**Resolution**:
1. Read the full health report carefully
2. Identify which languages are failing
3. Fix the specific issues (usually missing names, wrong indices, etc.)
4. Re-run `mixer:health`
5. Repeat until clean

### 9. Agent is stuck on a language

**Symptoms**: Can't find information about a language.

**Resolution**:
1. Search Wikipedia with different spellings
2. Search Ethnologue: `https://www.ethnologue.com/`
3. Search Glottolog: `https://glottolog.org/`
4. Try searching for the language family instead
5. If truly unfindable, mark as BLOCKED in the progress log
6. Move to the next language
7. Flag for coordinator review

### 10. Encoding issues (mojibake)

**Symptoms**: Names like "ProvenÃ§al", "Ã©", "Ã¼", etc.

**Resolution**:
1. These are UTF-8 bytes interpreted as Latin-1
2. Fix by converting to proper UTF-8:
   - "ProvenÃ§al" → "Provençal"
   - "Ã©" → "é"
   - "Ã¼" → "ü"
3. Use the correct Unicode character
4. Document the fix

## Emergency Procedures

### If you accidentally break the mixer:
1. STOP all work
2. Run `git diff` to see what changed
3. Revert the problematic changes
4. Re-run `pnpm mixer:guardrails`
5. Investigate the root cause
6. Fix properly
7. Verify again

### If you accidentally change an `i` value:
1. STOP immediately
2. Search `config/language-mixer-map.json` for the OLD index
3. Update all references to the NEW index
4. Run `pnpm mixer:guardrails`
5. If the old index is still referenced somewhere, you have a problem — fix it

### If you accidentally delete an entry:
1. STOP immediately
2. Restore from git: `git checkout -- modules/namebases-<continent>.js`
3. Re-run `pnpm mixer:guardrails`
4. Be more careful next time
