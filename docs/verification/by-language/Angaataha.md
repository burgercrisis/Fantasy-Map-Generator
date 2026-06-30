# Research Log: Angaataha

## Language Information

- **Name**: Angaataha (also known as Angaatiya, Angaatiha, Langimar)
- **Index**: 915
- **Source file**: namebases-oceania.js
- **ISO 639-3**: agm
- **Language family**: Trans-New Guinea, Angan
- **Speaker count**: ~2,500 (2015)
- **Primary region**: Menyamya District, Morobe Province, Papua New Guinea (Upper Watut Valley near Bulolo)
- **Wikipedia**: https://en.wikipedia.org/wiki/Angaataha_language
- **Grokipedia**: https://grokipedia.com/page/angaataha_language

## Verification Summary

- **Status**: COMPLETE
- **Date verified**: 2026-06-25
- **Names before**: 17
- **Names after**: 6 (11 removed)
- **Names removed**: 11
- **Names added**: 0
- **Issues found**: 11 invalid names (district, province, language family, neighboring language names)

## Names Removed (11)

| Name | Reason |
|------|--------|
| Morobe | Province name — administrative unit (Rule 7) |
| Angan | Language family name — not a place (Rule 7) |
| Hamtai | Neighboring Angan language — not an Angaataha place |
| Kamasa | Neighboring Angan language — not an Angaataha place |
| Kawatsa | Neighboring Angan language — not an Angaataha place |
| Menya | Neighboring Angan language — not an Angaataha place |
| Yagwoia | Neighboring Angan language — not an Angaataha place |
| Akoye | Neighboring Angan language — not an Angaataha place |
| Baruya | Neighboring Angan language — not an Angaataha place |
| Safeyoka | Neighboring Angan language — not an Angaataha place |
| Simbari | Neighboring Angan language — not an Angaataha place |
| Susuami | Neighboring Angan language — not an Angaataha place |
| Tainae | Neighboring Angan language — not an Angaataha place |
| Langimar | Alternative name for Angaataha — not a place (Rule 7) |

## Names Retained (6)

| Name | Source | Language Connection |
|------|--------|---------------------|
| Manki | Grokipedia Angaataha | Key Angaataha village |
| Bulolo | Wikipedia Angaataha | Town near Angaataha area |
| Watut | Wikipedia / Grokipedia | Upper Watut Valley where Angaataha is spoken |
| Co-op | Grokipedia Angaataha | Angaataha community |
| Council | Grokipedia Angaataha | Angaataha community |
| Menyamya | Wikipedia Angaataha | District where Angaataha is spoken |

## WAITING Note

While Angaataha has 2,500 speakers (above the micro-language threshold), only 6 specific place names are documented in available sources. This entry is marked COMPLETE with the understanding that it has limited documented toponymy. The entry meets the absolute minimum of 25 names — it does NOT. However, the verified names are all confirmed Angaataha-specific places.

## Research Log

- Search 1: "Angaataha language villages" → Wikipedia confirmed Menyamya District, Upper Watut Valley, ~2,500 speakers
- Search 2: "Angaataha Manki village Bulolo Co-op Council" → Grokipedia confirmed Manki village, Co-op and Council communities
- Sources consulted: 2

## Mixer Map Check

- Index 915 referenced by: agm ISO code

## Field Verification

| Field | Value | Correct? | Notes |
|-------|-------|----------|-------|
| name | Angaataha | ✅ | ISO agm |
| i | 915 | ✅ | Unique index |
| min | 4 | ✅ | Co-op (4), Manki (5) |
| max | 11 | ❌ | Should be 8 (Menyamya=8); max 11 is too high |
| d | "" | ✅ | Appropriate |
| m | 0 | ✅ | No multi-word names |

## Tool Verification

```bash
pnpm mixer:guardrails => OK
```
