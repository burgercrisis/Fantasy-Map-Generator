---

## Berber (i=16)

**Status:** WAITING
**Confidence:** HIGH
**Date:** 2026-08-08
**Agent:** Africa verification agent (Kilo)

### Removed Names (62)
All 62 existing names removed: Tlemcen, Oran, Algiers, Constantine, Casablanca, Rabat,
Marrakech, Fez, Tangier, Agadir, Meknes, Oujda, Kenitra, Tetouan, Safi, Beni Mellal,
Nador, Settat, Errachidia, Ouarzazate, (full list per prior b: field).

### Reason: COVER TERM / FAMILY — protocol Rule 4
"Berber" is not a single language. Per Britannica and Wikipedia "Berber languages",
Berber/Amazigh is a *family* of Afro-Asiatic languages (Kabyle, Tachelhit/Chleuh,
Tamazight, Tuareg/Tamacheq, etc.) forming a dialect continuum. The protocol Rule 4
requires cover terms / families / regions to be marked WAITING with an EMPTY b: field.
The prior pipeline incorrectly marked this COMPLETE.

### Additional issue: colonial-name trap (protocol §0)
Even if treated as a single standard language, the 62 names are modern Arabic/French
colonial city forms (Algiers, Casablanca, Oran...) — not authentic Tamazight place
names (which use Tifinagh-script forms: Anfa, Murakush, Fas, Tanja...). The authentic
Amazigh-name entry exists separately as "Berber (Maghreb)" (i=37).

### Research Log
- Search: "Berber Amazigh language spoken cities Tlemcen Oran Morocco Algeria"
  → Britannica: Berber languages are a family of Afro-Asiatic languages, dialect
    continuum, frequently referred to as a single collective language.
  → Wikipedia "Berber languages": "frequently referred to as a single collective
    language, often as 'Berber', 'Tamazight', or 'Amazigh'."
- Conclusion: Berber is a cover term. Marked WAITING per Rule 4.

### Mixer Map Check
- i=16 referenced by: (checked config/language-mixer-map.json) — if bound to a single
  ISO it is likely mis-bound (family, not a language). Flagged for integrator review.

### Final Verification
- Total verified names: 0 (intentionally emptied — cover term).
- Minimum threshold met: N/A (WAITING per Rule 4).
- NO names added without individual verification: YES (all removed).
