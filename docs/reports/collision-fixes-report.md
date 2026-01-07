# Collision Fixes Report

Generated: 2026-01-07T02:48:01.167Z

## Summary

- **Collisions Fixed:** 1
- **Duplicates Removed:** 1
- **Additional Issues Discovered:** 0

## Fixes Applied

### 1. Duplicate "Língua Geral Paulista" Entry

**Issue:** The name "Língua Geral Paulista" appeared twice in `modules/namebases-southAmerica.js`:
- First occurrence at index 13927 (line ~1832)
- Duplicate at index 14013 (line ~1841)

**Fix Applied:** Removed the duplicate entry at index 14013.

**File:** `modules/namebases-southAmerica.js`

**Reason:** Duplicate name found in namebase file. Both entries had identical configurations:
- Same name: "Língua Geral Paulista"
- Same base cities: "São Paulo,Campinas,São Bernardo do Campo,Santo André,São José dos Campos,Sorocaba,Santos,Osasco,Ribeirão Preto,São José do Rio Preto"
- Same parameters: min: 4, max: 11, d: "nic-GH", m: 0

**Why Index 14013 Was Problematic:**
The index 14013 was previously assigned to the Lezgin language in `config/language-mixer-map.js`. Having two different namebases with the same index would cause:
1. Name collision in the language mixer system
2. Potential incorrect name generation when mixing languages that reference index 14013
3. Data integrity issues in the language-mixer-map.json

**Resolution:** The duplicate "Língua Geral Paulista" entry was removed, keeping only the first occurrence at index 13927. The Lezgin language's reference to base 14013 in the mixer map remains unchanged and valid.

## Why This Fix Was Needed

### Name Collision Impact
When generating fantasy place names, the language mixer system uses indices from the namebase files to determine:
- Which language's city names to use as a base
- How to blend characteristics between languages
- The phonetic patterns for generated names

A name collision where two different languages claim the same index would cause:
- Unpredictable name generation behavior
- Cities being named with the wrong language's characteristics
- Breaking of language mixing logic

### Geographic Authenticity
"Língua Geral Paulista" is a historically significant language/linguistic variety from São Paulo state, Brazil. The entry provides authentic Brazilian Portuguese-influenced place names for the São Paulo region. Keeping this single entry ensures:
- Consistent regional naming patterns
- Historical accuracy in generated place names
- Proper integration with other Brazilian Portuguese variants

## Verification Steps

1. **Run the language mixer:** Execute `pnpm mixer:health` to verify no errors occur
2. **Check the duplicate is removed:** Search for "Língua Geral Paulista" in `modules/namebases-southAmerica.js` - should appear only once
3. **Verify Lezgin mappings:** Check that `config/language-mixer-map.js` correctly references index 14013 for Lezgin
4. **Test map generation:** Generate a new map with South America selected to verify names work correctly

## Related Files

- `modules/namebases-southAmerica.js` - Contains the fixed entries
- `config/language-mixer-map.js` - References indices for language mixing
- `tools/fixes/fix-collisions-and-duplicates.js` - The fix script used

## Future Recommendations

1. **Add uniqueness validation:** Implement CI checks to prevent duplicate indices being assigned
2. **Name collision detection:** Add automated checks for duplicate names across all namebase files
3. **Index reservation system:** Consider implementing a reservation system for high-index values to avoid conflicts with mixer map entries
