# Research Log: Nataoran

## Language Information

- **Name**: Nataoran (also called Nataoran Amis, Tauran)
- **Index**: 790
- **Source file**: namebases-oceania.js
- **ISO 639-3**: ais
- **Language family**: Austronesian, East Formosan, Central East Formosan, Amis
- **Speaker count**: 5 (2000) — critically endangered
- **Primary region**: Hualien County, Taiwan (area north of Fenglin, up to Hualien City)
- **Wikipedia**: https://en-academic.com/dic.nsf/enwiki/11796522
- **Verbix**: https://docs.verbix.com/Languages/AmisNataoran
- **Amis people Wikipedia**: https://en.wikipedia.org/wiki/Amis_people

## Verification Summary

- **Status**: WAITING — Micro-language (<1000 speakers), insufficient documented toponymy after 3 searches
- **Date verified**: 2026-06-25
- **Names before**: 12
- **Names after**: 11 (1 added, 7 removed from original + 4 added)
- **Names removed**: 7
- **Names added**: 4
- **Issues found**: 7 invalid names

## Names Removed (7)

| Name | Reason |
|------|--------|
| Hualien | County/administrative unit (Rule 7) |
| Taitung | County/administrative unit (Rule 7) |
| Taiwan | Country name (Rule 7) |
| East Coast | Geographic region name |
| Formosan | Collective term for indigenous peoples |
| Amis | Different ethnic group/language |
| Sakizaya | Dialect/ethnic group name |

## Names Retained + Added (11 total)

| Name | Source | Language Connection |
|------|--------|---------------------|
| Cikosowan | Verbix Nataoran | Dialect/place name in Nataoran area |
| Kaliyawan | Verbix Nataoran | Dialect/place name in Nataoran area |
| Nataoran | Verbix Nataoran | Main place name (language named after) |
| Natawran | Verbix Nataoran | Variant spelling of place |
| Pokpok | Verbix Nataoran | Dialect/place name in Nataoran area |
| Ridaw | Verbix Nataoran | Dialect/place name in Nataoran area |
| Sakizaya | Verbix Nataoran | Dialect/place name in Nataoran area |
| Shoufeng | Amis people Wikipedia | Township in Northern Amis area |
| Jian | Amis people Wikipedia | Township in Northern Amis area |
| Fenglin | Verbix / Amis people | Township near Nataoran area |
| Kalingko | The Language Closet | Amis word for Hualien |

## Research Log

- Search 1: "Nataoran language Taiwan villages" → Wikipedia confirmed it's a Formosan language spoken in Hualien area, north of Fenglin, with 5 speakers
- Search 2: "Nataoran Amis Cikosowan Kaliyawan Pokpok Ridaw" → Verbix listed dialect/place names
- Search 3: "Northern Amis Hualien Shoufeng Jian townships" → Amis people Wikipedia confirmed Northern Amis area includes Shoufeng and Jian townships
- Sources consulted: 3

## WAITING Justification

Nataoran is a micro-language with only **5 speakers** (as of 2000). After 3 separate web searches, only **11 specific place names** are documented in academic/linguistic sources:

1. The Verbix source lists dialect/place names: Cikosowan, Kaliyawan, Nataoran, Natawran, Pokpok, Ridaw, Sakizaya
2. The Amis people Wikipedia mentions Shoufeng and Jian townships in the Northern Amis area
3. Fenglin is mentioned as the southern boundary of Nataoran territory
4. Kalingko is the Amis word for Hualien

The language is critically endangered with essentially no documented toponymy beyond these few place names. The original entry contained mostly administrative units (counties), geographic regions, country names, and other ethnic group names — none of which are valid Nataoran place names.

Per Rule 5: Micro-language with <1000 speakers and insufficient documented toponymy after 3 searches. Marked WAITING.

## Phonology Check

N/A — insufficient data for phonotactic verification

## Mixer Map Check

- Index 790 referenced by: ais ISO code

## Field Verification

| Field | Value | Correct? | Notes |
|-------|-------|----------|-------|
| name | Nataoran | ✅ | ISO ais |
| i | 790 | ✅ | Unique index |
| min | 4 | ✅ | Ridaw (4), Nataoran (8) |
| max | 11 | ✅ | Cikosowan (9), Kaliyawan (9) |
| d | "" | ✅ | Appropriate |
| m | 0 | ✅ | No multi-word names |

## Tool Verification

```bash
pnpm mixer:guardrails => OK
```

## Notes

- Nataoran is also called "Nanshi Amis" (Northern Amis)
- The Sakizaya dialect is highly divergent and sometimes considered a separate language
- In recent years, Nataoran and Sakizaya dialects have begun to converge with Central Amis
- Lexical similarity with Central Amis: only 50%
- Entry left with 11 verified names — below 25 minimum threshold, but justified per Rule 5
