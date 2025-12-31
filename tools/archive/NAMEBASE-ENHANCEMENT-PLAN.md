# Namebases-Real.js Enhancement Plan

## Issues Identified

### 1. Duplicate Namebases
- **Berber** (i: 16 and i: 37) - duplicate entries that need merging
- **Kikai** (i: 294 and i: 305) - duplicate entries
- **Kunigami** (i: 295 and i: 306) - duplicate entries
- Other potential duplicates likely exist in the 2750 entries

### 2. Encoding Issues (Mangled UTF-8 Characters)
Common patterns found that need fixing:
- `â"œâŒ` → `ã`, `ão`, `ê`, etc.
- `â"œÃº` → `ão`
- `â"œâ"` → `ô`
- `Ã©` → `é`
- `Ã¨` → `è`
- `Ã­` → `í`
- `Ã¯` → `ï`
- `Ã³` → `ó`
- `Ãº` → `ú`
- `Ã¡` → `á`
- `Ã§` → `ç`

Examples requiring fixes:
- "Purâ"œâŒpecha" → "Purepecha"
- "Angolar Sâ"œÃºo Tomâ"œâŒ" → "Angolar Sao Tome"
- "Forro Sâ"œÃºo Tomâ"œâŒ" → "Forro Sao Tome"
- "Annobonese Palâ"œâŒ" → "Annobonese Pale"
- "Kwaza-Xocâ"œâ"‚ Amazonian" → "Kwaza-Xoco Amazonian"

### 3. Trailing Spaces in Name Fields
- "Tetuañ " (line 648)
- "Taluá " (line 666)
- "Tuscan " (line 691)
- "Vori " (line 721, 722, 723)
- "Voro " (line 723)
- "Wali Ghana " (line 724)
- "Cree " (line 725)
- "Ojibwe " (line 726)
- "Southeast Ijo " (line 711)
- "Southern Birifor " (line 712)
- "Susu " (line 713)
- "Tagwana " (line 714)
- "Talni " (line 715)
- "Tikar " (line 716)

### 4. Geographic Terms in Names
Geographic terms that should be removed from "b" fields:
- "City", "River", "Port", "Lake", "Bay", "Island", "Islands", "Porto", "Ponta", "Praia"
- Examples found: "Morgan City" (should be "Morgan"), "Porto Alegre" (should be "Alegre" or kept depending on context)

### 5. Low Count Entries (<20 examples)
Need to identify and expand entries with insufficient variety

## Fixes Applied So Far

1. ✅ Removed duplicate "Berber" entry (i: 37)
2. ✅ Merged unique names from duplicate into original (i: 16)
3. ✅ Fixed encoding in "Purepecha" entry
4. ✅ Fixed encoding in "Angolar Sao Tome" entry
5. ✅ Fixed encoding in "Forro Sao Tome" entry
6. ✅ Fixed encoding in "Annobonese Pale" entry
7. ✅ Removed "City" term from "Morgan City" → "Morgan"
8. ✅ Removed duplicate "Kikai" entry (i: 305)
9. ✅ Fixed "Lafayette" (was "Lafayette")
10. ✅ Fixed "Shreveport" (was "Shreveport")

## Recommended Actions

### For Manual Fixing:
1. Use search-and-replace for common encoding patterns:
   - `â"œâŒ` → `ã`
   - `â"œÃº` → `ão`
   - `Ã©` → `é`
   - `Ã³` → `ó`
   - `Ãº` → `ú`
   - `Ã¡` → `á`

2. Remove trailing spaces from "name" fields:
   - Search for `"name": "SomeName ",`
   - Replace with `"name": "SomeName",`

3. Review and merge duplicate namebases:
   - Identify by searching same name values
   - Merge "b" arrays, removing duplicates
   - Remove extra entry
   - Renumber "i" values sequentially

4. Expand low-count entries:
   - Identify entries with <20 names in "b" field
   - Research additional culturally appropriate names
   - Add to maintain 20-30 minimum

5. Remove or modify geographic terms:
   - Search for "City", "River", "Port", etc. in "b" fields
   - Replace with alternative form or remove term

### For Node.js Script Execution:
The fix-namebases.js script has been created. To run it:

```bash
cd "E:\code\Fantasy-Map-Generator"
node fix-namebases.js
```

This script will:
1. Detect and merge all duplicate namebases by "name" field
2. Fix common encoding issues automatically
3. Remove trailing spaces from "name" fields
4. Identify entries with <20 examples (report only)
5. Remove geographic terms from "b" fields
6. Renumber "i" values sequentially after removals
7. Output detailed statistics of all changes

## Validation Requirements

After fixes, validate:
1. ✅ No duplicate "name" fields
2. ✅ All "name" fields have no trailing spaces
3. ✅ UTF-8 encoding is correct throughout
4. ✅ Each entry has 20-30+ diverse names
5. ✅ No geographic terms (city, river, port, lake, bay, island)
6. ✅ Names are pronounceable and phonetically appropriate
7. ✅ No duplicate names within each language set
8. ✅ "i" values are sequential from 0 to N-1
9. ✅ Min/max/d/m fields are appropriate for each language

## Priority Order

1. **HIGH**: Merge all duplicate namebases
2. **HIGH**: Fix encoding issues (affects usability)
3. **MEDIUM**: Remove trailing spaces
4. **MEDIUM**: Remove geographic terms
5. **MEDIUM**: Expand low-count entries
6. **LOW**: Renumber "i" values (can be done automatically)

## Notes

- Total entries: ~2750 namebases
- Manual fixes applied: 10
- Estimated encoding fixes needed: 50+
- Estimated duplicate merges needed: 5-10
- Estimated trailing spaces to fix: 15+
- Estimated low-count entries to expand: 20-30
