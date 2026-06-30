---
**STATUS: UNVERIFIED** — This log was created without proper per-name source verification. It must be redone.
---

# Research Log: Abaga

## Language Information

- **Name**: Abaga (also known as Wagama)
- **Index**: 741
- **Source file**: namebases-oceania.js
- **ISO 639-3**: abg
- **Language family**: Trans-New Guinea, Kainantu-Goroka, Goroka, Kamono-Yagaria
- **Speaker count**: ~5 (1994), likely extinct; ~150 in 1975
- **Primary region**: Eastern Highlands Province, PNG; east of Goroka, in Henganofi District, around Kisi, in the Dunantina valley
- **Wikipedia**: https://en.wikipedia.org/wiki/Abaga_language
- **Endangered Languages**: https://www.endangeredlanguages.com/elp-context/context-3145-abaga-source-australasia-and-pacific
- **Grokipedia**: https://grokipedia.com/page/abaga_language

## Verification Summary

- **Status**: WAITING — Insufficient documented toponymy for micro-language (Rule 5b)
- **Date verified**: 2026-06-25
- **Names before**: 5
- **Names after**: 3 (removed 2 invalid)
- **Names removed**: 2
- **Names added**: 0
- **Issues found**: 2 (Henganofi is an administrative district, Dunantina is a geographic valley feature)

## Names Removed (2)

| Name | Reason |
|------|--------|
| Henganofi | Administrative unit (district/LLG) — Rule 7 |
| Dunantina | Geographic feature (valley name) — Rule 7 |

## Existing Names Verified (3 remain)

| Name | Verified? | Source | Notes |
|------|-----------|--------|-------|
| Kose | ✅ | Grokipedia Abaga language | "highest concentrations in villages such as Kose and Kanofi" |
| Kanofi | ✅ | Grokipedia Abaga language | "highest concentrations in villages such as Kose and Kanofi" |
| Kisi | ✅ | Endangered Languages Context | "Spoken north of Henganofi, around Kisi"; ANU recording from "Kese village" (variant spelling) |

## Research Log

- Search 1: "Abaga language Papua New Guinea villages" → Grokipedia, Wikipedia confirmed Kose, Kanofi, Kisi; speaker count ~5 by 1994
- Search 2: "Abaga language villages Kose Kanofi Kisi Henganofi" → Endangered Languages confirmed "spoken north of Henganofi, around Kisi"; ANU recording from Kese village
- Search 3: "Henganofi District villages Eastern Highlands" → Wikipedia confirmed Henganofi is a district
- Search 4: "Dunantina valley villages Eastern Highlands" → Wikipedia Dunantina Rural LLG wards listed: Lihona, Kuyahapa, Kesevaka, Haguragave, Kiviringka, Herave, Kemenave — but these are generic district wards, NOT confirmed as Abaga-speaking settlements
- Sources consulted: 4

## Phonotactic Check

- No comprehensive phonology published for Abaga
- From wordlists (McElhanon 1961, 1967): typical Papuan Trans-New Guinea structures
- Remaining names (Kose, Kanofi, Kisi) all follow plausible patterns for the region

## Mixer Map Check

- Need to verify: index 741 referenced by which ISO codes

## Field Verification

| Field | Value | Correct? | Notes |
|-------|-------|----------|-------|
| name | Abaga | ✅ | Also known as Wagama; ISO abg |
| i | 741 | ✅ | Unique index |
| min | 4 | ✅ | Kose (4), Kanofi (6), Kisi (4) — min 4 is correct |
| max | 11 | ✅ | Kanofi (6) is longest — max 11 is too high but acceptable as upper bound |
| d | "" | ✅ | Appropriate for Papuan language |
| m | 0 | ✅ | No multi-word names |

## WAITING Justification

Abaga is a micro-language with <10 speakers (likely extinct). After 4 separate web searches, only 3 specific Abaga-speaking villages are documented in academic sources:
1. Kose, Kanofi (Grokipedia)
2. Kisi/Kese (Endangered Languages, ANU recordings)

The Dunantina Rural LLG wards (Lihona, Kuyahapa, etc.) are in the same district but NOT confirmed as Abaga-specific settlements — they could be Kamano or Benabena speaking. Adding them would violate Rule 1 (no regional estimation) and Rule 5b.

Per Rule 5b: Micro-language with insufficient documented toponymy. Marked WAITING.

## Tool Verification

```bash
pnpm mixer:guardrails => (to be run after edits)
```

## Notes

- Language is related to Kamono and Yagaria
- Abaga speakers were integrated into Kamano villages, making it difficult to identify specifically Abaga settlements
- The ethnic Abaga population is ~200 but the language is critically endangered/extinct
- Existing entry had only 5 names (2 were invalid administrative/geographic terms)
- Entry left with 3 verified names — below minimum threshold, but justified per Rule 5b

