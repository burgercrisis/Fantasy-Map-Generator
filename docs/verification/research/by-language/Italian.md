# Italian (i=3)

**Status:** COMPLETE (legitimate names confirmed; synthetic + Estonian-dump contamination removed)
**Confidence:** HIGH
**Date:** 2026-07-19
**Agent:** Europe verification agent

### Removed Names (synthetic + Estonian-dump contamination)
Removed during this session's bulk de-contamination pass (applied to all entries):
- Synthetic `<Lang>+suffix` placeholder tokens: `Italianow, Italianitz, Italianek, Italianov, Italianak` (machine-generated, not real places).
- Estonian-dump block (real Estonian places wrongly injected into the Italian entry): `Kose, Valga, Pikknurme, Otepaa, Pihla, Kehra, Sindi, Imavere, Puka, Kaarmise, Kiiu, Tori, Pikkjarve, Torva, Kaeru, Alomak, Akasek, Aliak, Amakow, Apodow, Afemak, Anasek, Afugak, Abunow, Apubow, Apulak, Apatek, Afomow, Amasow, Anarek`.

### Added Names (N)
None — the 87 retained names are the original legitimate Italian comuni.

### Research Log
- Search: "List of cities in Italy" (Wikipedia) → confirms Roma, Milano, Napoli, Torino, Palermo, Genova, Bologna, Firenze, Bari, Catania, Verona, Venezia, Padova, Trieste, Parma, Modena, etc. are Italian municipalities (comuni).
- Search: "Mazara del Vallo" (Wikipedia + comune site) → city and comune in Province of Trapani, Sicily, Italy. CONFIRMED real.
- Search: "Sciacca" / "Licata" / "Acireale" / "Paternò" → all confirmed Sicilian/Italian comuni.
- Source: https://en.wikipedia.org/wiki/List_of_cities_in_Italy
- Sources consulted: 2 (Wikipedia list-of-cities; individual comune pages for Sicily names).

### Phonology Check
- Italian place names use standard Italian orthography (vowels a-e-i-o-u, consonants including gli/gl/sc/ch/ghi). All retained names conform.
- No phonotactic violations among retained names.

### Mixer Map Check
- Index `i=3` referenced by Italian-related ISO codes (it, it-*). Intentional. No mismatch found.

### Final Verification
- Total verified names: 87 (all confirmed real Italian comuni via Wikipedia "List of cities in Italy" + individual comune pages).
- Minimum threshold met: YES (87 >> 25 absolute minimum; 50 medium target exceeded).
- NO names added without individual verification: N/A (no names added; all retained verified against sources).
- Synthetic/foreign contamination: REMOVED (the `<Lang>+suffix` placeholder block `Italianow...Italianak` and the Estonian-dump block `Kose,Valga,Pikknurme,...Anarek` were stripped by the session's bulk de-contamination pass; see europe-findings.md).
