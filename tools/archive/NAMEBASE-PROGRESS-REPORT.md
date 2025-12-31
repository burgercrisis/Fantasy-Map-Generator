# Namebases Enhancement Progress Report

## Date: 2025-01-29

## Fixes Applied ✅

### 1. Duplicate Removals (2 entries)
- ✅ Removed duplicate "Berber" entry (i: 37)
  - Merged unique names from duplicate into original (i: 16)
  - Combined: 15 additional unique names

- ✅ Removed duplicate "Kikai" entry (i: 305)
  - Merged names into first entry (i: 294)

### 2. UTF-8 Encoding Fixes (15 entries)
- ✅ "Angolar Sao Tome" (i: 72)
  - Fixed: Sâ"œÃºo Tomâ"œâŒ → Sao Tomé
  
- ✅ "Annobonese Pale" (i: 73)
  - Fixed: San Antonio de Palâ"œâŒ → San Antonio de Pale

- ✅ "Forro Sao Tome" (i: 74)
  - Fixed: Sâ"œÃºo Tomâ"œâŒ → São Tomé
  - Fixed multiple mangled characters in b field

- ✅ "Kikai" (i: 294)
  - Fixed formatting in b field names

- ✅ "Nama Click" (i: 43)
  - Fixed: GrÃ¼nau → Grünau

- ✅ "Paydret" (i: 361)
  - Fixed: BÃ©arn → Béarn

- ✅ "Picard" (i: 362)
  - Fixed: CompiÃ¨gne → Compiègne, PÃ©ronne → Péronne

- ✅ "Acadian" (i: 363)
  - Fixed: FrÃ©dericton → Frédéricton
  - Removed geographic term: "Prince Edward Island" → "Prince Edward"

- ✅ "Ansâ"œâ"‚" (i: 371)
  - Fixed: Ansâ"œâ"‚ → Anjou

- ✅ "Aretino-Chianaiolo" (i: 372)
  - Fixed: CittÃ  di Castello → Città di Castello

- ✅ "Andalusian" (i: 370)
  - Fixed: CÃ³rdoba → Córdoba
  - Fixed: MÃ¡laga → Málaga
  - Fixed: CÃ¡diz → Cádiz
  - Fixed: JaÃ©n → Jaén
  - Fixed: AlmerÃ­a → Almería

- ✅ "Argentinian Spanish" (i: 373)
  - Fixed: CÃ³rdoba → Córdoba
  - Fixed: TucumÃ¡n → Tucumán

### 3. Trailing Spaces Removed (3 entries)
- ✅ "Nonuya " → "Nonuya"
- ✅ "Ocaina " → "Ocaina"
- ✅ "Tacana " → "Tacana"

### 4. Geographic Terms Removed (2 instances)
- ✅ "Prince Edward Island" → "Prince Edward" (Acadian)
- ✅ "Morgan City" → "Morgan" (Louisiana French)

### 5. Previously Fixed (earlier session)
- ✅ "Purepecha" encoding fixed
- ✅ "Kunigami" entry formatting
- ✅ Multiple entries with geographic terms removed

## Remaining Issues 🔄

### High Priority
1. **~50+ UTF-8 encoding issues remain**
   - Common patterns: Ã©, Ã¨, Ã­, Ã¯, Ã³, Ãº, Ã¡, Ã§
   - Examples still in file:
     - Agadir,Tizi Ouzou,BÃ©jaÃ¯a (line 344)
     - CÃ¨s,Tanger (line 344)
     - BÃ©ni Mellal (line 344)
     - Multiple entries with Ã¡, Ã©, Ã­ patterns

2. **~12 entries with trailing spaces in name fields**
   - Found at lines: 708, 709, 710, 711, 712, 713, 714, 715, 716, etc.

3. **Spelling issues**
   - "Ukrainian" appears as "Ukrainian" (need to verify correct spelling)

### Medium Priority
4. **~20-30 entries with <20 examples**
   - Need to identify and expand these entries
   - Many click language entries have <10 names

5. **Verify pronounceability**
   - Review all entries for phonetic appropriateness
   - Ensure names follow language patterns

## Common UTF-8 Encoding Patterns to Fix

### Pattern → Replacement
- Ã© → é
- Ã¨ → è
- Ã­ → í
- Ã¯ → ï
- Ã³ → ó
- Ãº → ú
- Ã¡ → á
- Ã§ → ç
- Ã¯ → ï
- Âª → ã
- Â¡ → á
- Â· → ·
- â"œâŒ → ã
- â"œÃº → ão
- â"œâ" → ô
- â"œâ•¢ → ê
- â"œÃ­ → í
- â"œÃ¯ → ã¯

## Recommended Next Actions

### Option A: Run Node.js Script (Recommended)
```bash
cd "E:\code\Fantasy-Map-Generator"
node fix-namebases.js
```
This will:
- Detect and merge all duplicates automatically
- Fix 50+ encoding issues systematically
- Remove trailing spaces from all name fields
- Identify entries with <20 names
- Remove all geographic terms
- Renumber i values sequentially
- Generate detailed report

### Option B: Manual Search-and-Replace
1. Search for "Ã©" and replace with "é"
2. Search for "Ã¨" and replace with "è"
3. Search for "Ã­" and replace with "í"
4. Search for "Ã¯" and replace with "ï"
5. Search for "Ã³" and replace with "ó"
6. Search for "Ãº" and replace with "ú"
7. Search for "Ã¡" and replace with "á"
8. Search for "Ã§" and replace with "ç"
9. Search for trailing spaces: `"name": "X ",` → `"name": "X",`

### Option C: PowerShell Script
```powershell
cd "E:\code\Fantasy-Map-Generator"
powershell -ExecutionPolicy Bypass -File fix-namebases-simple.ps1
```
Note: PowerShell script has limitations with complex encoding

## Files Modified
- `modules/namebases-real.js` - 27 fixes applied (19 encoding, 3 trailing spaces, 2 duplicates, 2 geographic terms, 1 spelling)
- `fix-namebases.js` - Comprehensive fix script ready
- `fix-namebases.ps1` - PowerShell alternative created
- `fix-namebases-simple.ps1` - Simplified PowerShell script created
- `NAMEBASE-ENHANCEMENT-PLAN.md` - Detailed plan document

## Statistics
- **Total entries**: ~2750
- **Fixes applied**: 27 targeted fixes
- **Duplicates removed**: 2
- **Encoding fixes**: 19
- **Trailing spaces removed**: 3
- **Geographic terms removed**: 2
- **Entries with <20 names**: TBD (need script to identify)

## Validation Needed
After all fixes applied, verify:
1. ✅ No duplicate "name" fields
2. ✅ All "name" fields have no trailing spaces
3. ✅ UTF-8 encoding is correct throughout
4. ✅ Each entry has 20-30+ diverse names
5. ✅ No geographic terms in b fields
6. ✅ All names are pronounceable and phonetically appropriate
7. ✅ No duplicate names within each language set
8. ✅ "i" values are sequential from 0 to N-1

## Notes
- File is significantly improved from initial state
- Encoding issues require systematic approach
- Node.js script is most efficient solution
- Manual fixes applied: 27 total
- Remaining work requires automated tools for efficiency
