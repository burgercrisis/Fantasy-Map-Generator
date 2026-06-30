# Verification Summary Report: Europe Namebases Indices 51-100

## Overview
- **Entries processed**: 50 (indices 51-100)
- **Status COMPLETE**: 45 entries
- **Status NEEDS_WORK**: 5 entries
- **Entries requiring modifications**: 7

## Summary Table

| Index | Name | Status | Issues |
|-------|------|--------|--------|
| 51 | Jersey Legal French | NEEDS_WORK | Parish names used as place names; some French forms should be used |
| 52 | Aragonese | COMPLETE | Minor: some names not in Wikipedia's limited list but are real towns |
| 53 | Central Aragonese | COMPLETE | Same names as Aragonese entry - minor duplication concern |
| 54 | Castilian | COMPLETE | Note: same as existing "Castillian" entry at index 4 |
| 55 | Castelmezzano | COMPLETE | All names verified |
| 56 | Central Italian | COMPLETE | All names verified |
| 57 | Central Marchigiano | COMPLETE | All names verified |
| 58 | Central Metafonetica | NEEDS_WORK | Name appears truncated in b: field (last entry cut off) |
| 59 | Central-Southern Calabrian | COMPLETE | All names verified |
| 60 | Butler English | NEEDS_WORK | NOT EUROPEAN - Indian English dialect. Should be removed |
| 61 | Angevin | COMPLETE | All names verified |
| 62 | Burgundian | COMPLETE | All names verified |
| 63 | Champenois | COMPLETE | Minor: min should be 5 not 4 |
| 64 | Poitevin | COMPLETE | All names verified |
| 65 | Saintongeais | COMPLETE | All names verified |
| 66 | Aas-whistled | NEEDS_WORK | NOT a language - whistled register. Should be removed |
| 67 | Aranese | COMPLETE | All names verified |
| 68 | B-arnese (Béarnese) | COMPLETE | Minor: min should be 5 not 4 |
| 69 | Abruzzese | COMPLETE | All names verified |
| 70 | Arianese | COMPLETE | All names verified |
| 71 | Barese | COMPLETE | All names verified |
| 72 | Basilicatine | COMPLETE | All names verified |
| 73 | Benevento | COMPLETE | All names verified |
| 74 | Cilentan | COMPLETE | All names verified |
| 75 | Cosentino | COMPLETE | All names verified |
| 76 | Irpino | COMPLETE | Minor: Ventotene is geographically not in Irpinia |
| 77 | Northern Calabrian | COMPLETE | Near-duplicate of Cosentino (same b: field) |
| 78 | Pugliese | COMPLETE | Near-duplicate of Barese (similar b: field) |
| 79 | South Lucanian | COMPLETE | Near-duplicate of Basilicatine (same b: field) |
| 80 | Southern Latian | COMPLETE | All names verified |
| 81 | Southern Laziale | COMPLETE | Near-duplicate of Southern Latian (same b: field) |
| 82 | Tarantino | COMPLETE | All names verified |
| 83 | Vastese | COMPLETE | All names verified |
| 84 | Ardennais | COMPLETE | All names verified |
| 85 | Berrichon | COMPLETE | All names verified |
| 86 | Bourbonnais | COMPLETE | All names verified |
| 87 | French (fra) | COMPLETE | Duplicate of "French" entry at index 1 |
| 88 | Frainc-Comtou | COMPLETE | All names verified |
| 89 | Gallo | COMPLETE | All names verified |
| 90 | Gaumais | COMPLETE | All names verified |
| 91 | Law French | NEEDS_WORK | Not a geographic language - legal register. Should be removed |
| 92 | Lorrain | COMPLETE | All names verified |
| 93 | Mayennais | COMPLETE | All names verified |
| 94 | Meridional French | NEEDS_WORK | max=16 too low (Charleville-Mézières=19); some northern contamination |
| 95 | Orleanais | COMPLETE | b: field is extremely long (hundreds of entries) |
| 96 | Paydret | COMPLETE | All names verified |
| 97 | Picard | COMPLETE | All names verified |
| 98 | Aeolian | COMPLETE | All names verified |
| 99 | Alentejan | COMPLETE | All names verified |
| 100 | Algherese | COMPLETE | All names verified |

## Critical Issues Requiring Fixes

### 1. Entries that should be REMOVED entirely:
- **Index 60: Butler English** - This is an Indian English dialect, NOT European. All place names are Indian cities.
- **Index 66: Aas-whistled** - This is NOT a language but a whistled speech register. Not suitable for place name generation.
- **Index 91: Law French** - This is a legal/technical register, not a geographic language. Its place names are English cities in French spelling, creating ambiguity.

### 2. Entries with incorrect min/max:
- **Index 94: Meridional French** - max=16 but "Charleville-Mézières" (19) and "Châlons-en-Champagne" (18) are in the b: field. Should be max=19 minimum.
- **Index 63: Champenois** - min=4 but shortest name is 5 chars. Should be min=5.
- **Index 68: B-arnese** - min=4 but shortest name is 5 chars. Should be min=5.

### 3. Duplicate/near-duplicate entries:
- Index 54 "Castilian" uses different name from index 4 "Castillian" but appears to be the same language
- Index 87 "French (fra)" is identical to index 1 "French"
- Indices 77/75 "Northern Calabrian"/"Cosentino" have identical b: fields
- Indices 78/71 "Pugliese"/"Barese" have nearly identical b: fields
- Indices 79/72 "South Lucanian"/"Basilicatine" have identical b: fields
- Indices 80/81 "Southern Latian"/"Southern Laziale" have identical b: fields

### 4. Geographic contamination:
- **Index 94: Meridional French** includes northern French cities (Arras, Lens, Béthune, Douai, Cambrai, Maubeuge) not in the Meridional zone
- **Index 76: Irpino** includes Ventotene which is in Lazio, not Irpinia

## Recommended Actions (Priority Order)

1. **Remove**: Butler English (60), Aas-whistled (66), Law French (91)
2. **Fix max**: Meridional French (94) - change max from 16 to 19
3. **Fix min**: Champenois (63) - change min from 4 to 5; B-arnese (68) - same
4. **Review duplicates**: Decide whether to merge or keep separate the near-duplicate pairs
5. **Remove contamination**: Move northern French names (Arras, Lens, etc.) from Meridional French to Picard entry

## Files Created
All verification logs are in: `docs/verification/research/by-language/`

Total: 50 verification log files created.
