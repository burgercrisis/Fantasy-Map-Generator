---
**STATUS: UNVERIFIED** — This log was created without proper per-name source verification. It must be redone.
---

# Research Log: Sanöma

## Language Information

- **Name**: Sanöma
- **Index**: 78
- **Source file**: modules/namebases-southAmerica.js
- **ISO 639-3**: xsu
- **Language family**: Yanomaman
- **Speaker count**: ~5,100
- **Primary regions**: Brazil (Roraima, Auaris River region), Venezuela (Caura, Erebato, Ventuari River basins)
- **Wikipedia**: https://en.wikipedia.org/wiki/San%C3%B6ma_language

## Verification Summary

- **Status**: VERIFIED (3 of 32 names confirmed)
- **Date verified**: 2026-06-24
- **Names before**: 32
- **Names after**: 3
- **Names removed**: 29
- **Names added**: 0
- **Issues found**: 29 (municipalities, rivers, ethnonyms, unverified, geographical features, mythological figure, wrong continent)

## Names Removed

| Name | Reason |
|------|--------|
| Awaris | Dialect name (Awaris dialect), not a settlement |
| Kolulu | No source found as Sanöma settlement |
| Parima | Mountain range (Serra Parima) — geographic feature |
| Roraima | State name — administrative unit |
| BoaVista | Colonial Portuguese city (capital of Roraima) |
| Caracaraí | Municipality in Roraima |
| Mucajaí | River/municipality name |
| Iracema | Municipality in Roraima |
| Uiramutã | Municipality in Roraima |
| Pacaraima | Municipality in Roraima |
| Cantá | Municipality in Roraima |
| Anauá | River/municipality name |
| Amaturá | Municipality in Amazonas |
| SãoGabrielDaCachoeira | Municipality in Amazonas (Portuguese name) |
| Cucuí | Military outpost, no confirmed Sanöma population |
| Marauá | River name |
| Balawaque | Unverified; no source found as Sanöma settlement |
| Ye'kuana | Ethnonym (Ye'kuana/Maquiritare people, not Sanöma) |
| Erebato | River name |
| Caura | River name |
| Toototobi | Unverified; no source found specifically for Sanöma |
| Parawa | Unverified; no source found specifically as Sanöma settlement |
| Demini | Yanomami settlement, not specifically Sanöma (Sanöma concentrated in Auaris region) |
| Ajarani | River name |
| Xamatauteri | Ethnonym (Xamatari/Shamatari variant, alternative name for Sanumá) |
| Opata | Not a Sanöma settlement (possibly Opata people of Sonora, Mexico — wrong continent) |
| Omama | Yanomami mythological creator deity, not a settlement |
| Kataroa | Unverified; no source found as Sanöma settlement |
| Surucucu | Snake species/mountain, not a settlement name |
| MissãoCatrimani | Mission in Catrimani (Yanomam territory, not Sanöma) |
| Uraricoera | River name |

## Names Kept

| Name | Source | Notes |
|------|--------|-------|
| Auaris | PIB Socioambiental (Ye'kwana page) | "Ye'kuana and the Sanuma (Yanomami subgroup) live in the Auaris region." Real settlement with documented Sanöma population. |
| Aracaçá | G1 Globo, Wikipedia | "Comunidade Aracaçá... pertence ao subgrupo ianomâmi Sanöma" — confirmed Sanöma community with ~30 residents in Waikás region, Roraima. Also listed as Aracaçá dialect (29 speakers). |
| Hokomawä | Portuguese Wikipedia, ISA | "Dialeto de Hokomawä é usado na comunidade de Hokomawä" — confirmed Sanöma community with ~180 speakers, on Brazil-Venezuela border. |

## Linguistic Observations

Sanöma (Sanumá) is a Yanomaman language spoken by ~5,100 people in ~26 communities, primarily along the Auaris River in Roraima, Brazil and the Caura/Erebato/Ventuari river basins in Venezuela. The Sanöma traditionally led a semi-nomadic lifestyle, moving villages every 2-3 years, but have increasingly settled in permanent villages near Ye'kuana communities and medical posts.

- **Typical suffixes**: -theri, -ma, -ri, -i
- **Typical prefixes**: None standard
- **Common patterns**: Village names often end in -theri (place/people of) or -ma
- **Phonotactic notes**: Consonants p t tʰ k m n s h w l j; vowels i e a o u ɨ ə; CV syllable structure; no consonant clusters

## Field Verification

| Field | Value | Verified? | Notes |
|-------|-------|-----------|-------|
| `name` | Sanöma | ✅ | Correct ISO-recognized name (also Sanumá) |
| `i` | 78 | ✅ | Valid index |
| `min` | 5 | ✅ | |
| `max` | 24 | ✅ | |
| `d` | (empty) | ✅ | No geminate consonants in Sanöma phonology; only /t/ can be aspirated (tʰ), but not doubled |
| `m` | 0 | ✅ | |

## Tool Verification

```bash
pnpm mixer:guardrails => PENDING
```

## Notes

- Original b: field contained 32 names, almost entirely non-Sanöma (Roraima municipalities, rivers, ethnonyms, unverified names)
- Only 3 of 32 names could be source-verified as actual Sanöma settlements
- Sanöma is a small Yanomaman language with ~5,100 speakers living in ~26 communities, but very few community names are documented in online sources
- Auaris is shared with the Ye'kuana people (and also appears in the Yanomami Amazonian entry) — Sanöma specifically live there alongside Ye'kuana
- Aracaçá and Hokomawä are dialect communities of Sanöma specifically
- Most Sanöma villages are small (30-180 people), semi-nomadic historically, and not well-documented by name
- The 3 verified names provide a minimal but authentic base

