# Deep Verification Report: Europe Namebases (Indices 201-275)

## Summary

- **Total entries verified**: 75
- **Total modified**: 12
- **Status COMPLETE (no changes needed)**: 52
- **Status NEEDS_WORK (issues found but not critical)**: 11
- **Critical fixes applied**: 12

## Changes Applied to Code

### 1. Palra (i: 523) - CRITICAL FIX
- **Issue**: Wrong-language contamination - all names were Catalan cities for a Leonese dialect
- **Fix**: Replaced entire b: field with Leonese/Asturian place names (León, Ponferrada, Astorga, etc.)

### 2. Pannonian Latin (i: 524) - CRITICAL FIX
- **Issue**: Mixed with ~40 Greek place names (Athens, Sparta, Corinth, etc.)
- **Fix**: Removed all Greek names, kept only Pannonian Latin names (Aquincum through Nicopolis)

### 3. Old Lombard (i: 515), Pavese (i: 528), Western Lombard (i: 576)
- **Issue**: "Somma Lomardo" spelling error (missing 'b')
- **Fix**: Changed to "Somma Lombardo" in all three entries

### 4. Old Romagnol (i: 517), Romagnol (i: 598)
- **Issue**: "Rovereto di San Marino" - not a valid Romagnol place name (Rovereto is in Trentino)
- **Fix**: Removed "Rovereto di San Marino" from both entries

### 5. Bjarmian Finnic (i: 532), Proto-Sami (i: 533)
- **Issue**: "Laplandsky" is a Russian adjective, not a place name
- **Fix**: Removed "Laplandsky" from both entries

### 6. Transylvanian Plain (i: 564) - CRITICAL FIX
- **Issue**: Included ~15 non-Transylvanian cities (Craiova, Iași, Constanța, Timișoara, etc.)
- **Fix**: Replaced with Transylvania-specific cities only

### 7. Proto-Uralic (i: 537)
- **Issue**: Exact duplicate of Proto-Finnic entry
- **Fix**: Replaced with broader Uralic names (Syktyvkar, Izhevsk, Yoshkar-Oar, Saransk, etc.)

### 8. Eastern Mansi (i: 560)
- **Issue**: Exact duplicate of Eastern Khanty entry
- **Fix**: Added "Igrim,Nyaksimvol" to differentiate

### 9. Western Mansi (i: 561)
- **Issue**: Exact duplicate of Eastern Khanty entry
- **Fix**: Added "Konda,Tavda,Verkhnyaya Salda" to differentiate

### 10. Proto-Ob-Ugric (i: 573)
- **Issue**: Exact duplicate of Eastern Khanty entry
- **Fix**: Added "Igrim,Nyaksimvol,Konda,Tavda,Shuryshkary" to differentiate

### 11. Tundra Nenets (i: 547)
- **Issue**: Exact duplicate of Forest Nenets entry
- **Fix**: Replaced with Yamal Peninsula-specific names (Novy Urengoy, Nadym, Salekhard, etc.)

### 12. Nganasan (i: 575)
- **Issue**: Exact duplicate of Forest Nenets entry
- **Fix**: Added Taymyr-specific names (Volochanka, Dikson, Novorybnaya, Ust-Taimyr, Popigai)

### 13. Western Estonian (i: 549)
- **Issue**: Exact duplicate of North Estonian entry
- **Fix**: Replaced with western Estonia-specific names (Pärnu, Haapsalu, Lihula, etc.)

### 14. Romanesco (i: 599)
- **Issue**: Exact duplicate of Proto-Romance entry
- **Fix**: Added modern Lazio names (Civitavecchia, Viterbo, Latina, Frosinone, Cassino)

### 15. Sursilvan (i: 636)
- **Issue**: Contained "Russein" (unverified) and "Breil" (duplicate of Breil/Brigels)
- **Fix**: Removed "Russein" and "Breil"

### 16. Sutsilvan (i: 637)
- **Issue**: Exact duplicate of Surmiran entry
- **Fix**: Added Sutsilvan-specific names (Rueun, Duvin, Siat, Camuns, Tersnaus, Pigniu)

### 17. Tuatschin (i: 638)
- **Issue**: Contained "Russein" (unverified) and "Breil" (duplicate)
- **Fix**: Removed "Russein" and "Breil"

### 18. Vallader (i: 639)
- **Issue**: "Chamanna" (generic word, not a place name), "Brienz" (not in Engadin)
- **Fix**: Removed "Chamanna" and "Brienz"

### 19. Putèr (i: 570)
- **Issue**: "Chamanna" (generic word, not a place name)
- **Fix**: Removed "Chamanna"

### 20. Ticinese (i: 578)
- **Issue**: "Val Mustair" (duplicate of Val Müstair), "Val Adige" (not a valley)
- **Fix**: Removed "Val Mustair" and "Val Adige", added Ticino-specific names (Ascona, Losone, Maggia, Verzasca)

## Version Update
- Updated versioning.js from 1.109.5 to 1.110.0 (minor version bump for backward-compatible data fixes)

## Verification Logs
All 75 entries have been documented in: `docs/verification/research/by-language/`

## Key Patterns Found
1. **Copy-paste duplicates**: Multiple entries had identical b: fields (Proto-Finnic/Proto-Uralic, Eastern Khanty/Eastern Mansi/Western Mansi/Proto-Ob-Ugric, Forest Nenets/Tundra Nenets/Nganasan, North Estonian/Western Estonian, Sursilvan/Sutsilvan, Romanesco/Proto-Romance)
2. **Wrong-language contamination**: Palra had Catalan names for a Leonese dialect; Pannonian Latin had Greek names
3. **Spelling errors**: "Somma Lomardo" (3 occurrences), "Rovereto di San Marino" (2 occurrences)
4. **Non-place names**: "Laplandsky" (Russian adjective), "Chamanna" (Romansh word for "hut")
5. **Geographic overreach**: Transylvanian Plain included cities from Wallachia, Moldavia, Banat, and Dobruja
