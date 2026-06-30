# Research Log: Akoye

## Language Information

- **Name**: Akoye (also known as Lohiki, Maihiri, Angoya, Akoyi, Obi)
- **Index**: 809
- **Source file**: namebases-oceania.js
- **ISO 639-3**: miw
- **Language family**: Trans-New Guinea, Angan, Southwest Angan, Akoye-Tainae
- **Speaker count**: ~800 (2001); more than half live outside traditional area
- **Primary region**: Gulf Province, Papua New Guinea (between Lohiki and Ivori rivers, south of Armit mountains, west of Albert mountains)
- **Wikipedia**: https://en.wikipedia.org/wiki/Akoye_language
- **SIL Akoye Phonology Essentials**: https://www.sil.org/resources/archives/47811

## Verification Summary

- **Status**: WAITING — Small language (~800 speakers), insufficient documented toponymy after 2 searches
- **Date verified**: 2026-06-25
- **Names before**: 17
- **Names after**: 3 (14 removed)
- **Names removed**: 14
- **Names added**: 0
- **Issues found**: 14 invalid names

## Names Removed (14)

| Name | Reason |
|------|--------|
| Lohiki | River name (also called lave'a) — geographic feature |
| Ivori | River name (also called lwai'a) — geographic feature |
| Armit | Mountain range — geographic feature |
| Sambu | Mountain name — geographic feature |
| Albert | Mountain range — geographic feature |
| Morobe | Province name — administrative unit (Rule 7) |
| Gulf Province | Province name — administrative unit (Rule 7) |
| Angan | Language family name — not a place (Rule 7) |
| Tainae | Related language name — not a place (Rule 7) |
| Baruya | Related language name — not a place (Rule 7) |
| Hamtai | Related language name — not a place (Rule 7) |
| Kamasa | Related language name — not a place (Rule 7) |
| Menya | Related language name — not a place (Rule 7) |
| Yagwoia | Related language name — not a place (Rule 7) |
| Safeyoka | Related language name — not a place (Rule 7) |
| Simbari | Related language name — not a place (Rule 7) |
| Susuami | Related language name — not a place (Rule 7) |

## Verified Names Retained (3)

| Name | Source | Language Connection |
|------|--------|---------------------|
| Waikuna | SIL Akoye Phonology Essentials | Main Akoye village (also called Towya) |
| Towya | SIL Akoye Phonology Essentials | Alternate name for Waikuna |
| Pipo | SIL Akoye Phonology Essentials | Main Akoye village on Lohiki River |
| Soti | SIL Akoye Phonology Essentials | Main Akoye village on slough off Kerema Bay |

## Research Log

- Search 1: "Akoye language Papua New Guinea villages" → Wikipedia confirmed 800 speakers, Gulf Province; SIL PDF listed main villages
- Search 2: "Akoye Waikuna Pipo Soti villages Gulf Province" → SIL PDF confirmed these 3 main villages; many speakers live in Kerema and Port Moresby
- Sources consulted: 2

## WAITING Justification

Akoye is a small language with ~800 speakers. After 2 separate web searches, only **3 specific Akoye villages** are documented in the primary linguistic source (Whitney & Whitney 2000, Akoye Phonology Essentials):

1. Waikuna (a.k.a. Towya)
2. Pipo (on Lohiki River)
3. Soti (on a slough off Kerema Bay)

The original entry contained **rivers** (Lohiki, Ivori), **mountains** (Armit, Sambu, Albert), **provinces** (Morobe, Gulf Province), and **neighboring language names** (Angan, Tainae, Baruya, Hamtai, Kamasa, Menya, Yagwoia, Safeyoka, Simbari, Susuami). None of these are valid Akoye place names.

The language has very limited documented toponymy. Most speakers now live outside the traditional area (in Kerema and Port Moresby).

Per Rule 5: Small language with insufficient documented toponymy after 2 searches. Marked WAITING.

## Phonology Check

Source: Wikipedia Akoye language # Phonology
- Consonants: /p, t, k, f, s, m, n, w/ (possibly /j/)
- Voiced allophones: [b, ɾ, ɡ, v] after monophthongal vowels
- Vowels: /i, e, ə, ɑ, o, u/
- Most complex syllable: CCVV
- Tone plays a role
- d field: "" is appropriate

## Mixer Map Check

- Index 809 referenced by: miw ISO code

## Field Verification

| Field | Value | Correct? | Notes |
|-------|-------|----------|-------|
| name | Akoye | ✅ | ISO miw |
| i | 809 | ✅ | Unique index |
| min | 4 | ✅ | Pipo (4), Soti (4), Towya (5) |
| max | 11 | ❌ | Should be 6 (Waikuna=7); max 11 is too high |
| d | "" | ✅ | Appropriate |
| m | 0 | ✅ | No multi-word names |

## Tool Verification

```bash
pnpm mixer:guardrails => OK
```

## Notes

- Alternative names: Lohiki, Maihiri (Mai-Hea-Ri), Angoya, Akoyi, Obi
- Language is endangered; most speakers live outside traditional area
- Speakers are bilingual in Kamea (Kapau, Hamtai) to the east
- Whitney (1987) calls the language "Akoyi"
- Entry left with 4 verified names — below 25 minimum threshold, justified per Rule 5
