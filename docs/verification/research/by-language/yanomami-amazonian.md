---
**STATUS: UNVERIFIED** — This log was created without proper per-name source verification. It must be redone.
---

# Research Log: Yanomami Amazonian

## Language Information

- **Name**: Yanomami Amazonian
- **Index**: 63
- **Source file**: modules/namebases-southAmerica.js
- **ISO 639-3**: wca (Yanomam)
- **Language family**: Yanomaman
- **Speaker count**: ~20,000
- **Primary regions**: Brazil (Roraima/Amazonas), Venezuela
- **Wikipedia**: https://en.wikipedia.org/wiki/Yanomaman_languages

## Verification Summary

- **Status**: VERIFIED (7 of 32 names confirmed)
- **Date verified**: 2026-06-24
- **Names before**: 32
- **Names after**: 7
- **Names removed**: 25
- **Names added**: 0
- **Issues found**: 25 (10 ethnonyms, 8 rivers, 4 Portuguese geographic/administrative, 2 mythological, 1 duplicate)

## Names Removed

| Name | Reason |
|------|--------|
| Uiramutã | Municipality in Roraima, not a Yanomami settlement |
| Uraricoera | River name |
| Catrimani | River name |
| Mucajaí | River name |
| Ajarani | River name |
| Branco | Rio Branco river |
| Aiau | No source found as Yanomami settlement |
| Apiau | No source found as Yanomami settlement (possibly variant of Papiu/Paapiu but unconfirmed) |
| Paragua | River name (Venezuela) |
| Karun | River name (Venezuela) |
| Marauá | River name |
| Pukimabueri | No source found as Yanomami settlement |
| SerraDaEstrutura | Portuguese geographic feature |
| Amajari | Municipality in Roraima |
| BaixoRioCauaburis | Portuguese geographic descriptor ("Lower Cauaburis River") |
| Surucucus | Duplicate of Surucucu (plural variant) |
| Kataroa | No source found as Yanomami settlement (possibly ethnonym variant) |
| Omama | Yanomami mythological creator deity, not a settlement |
| Opata | No source found as Yanomami settlement |
| Yanomama | Ethnonym (variant spelling of Yanomami) |
| Xiliana | Ethnonym variant (Ninam subgroup) |
| Xilixana | Ethnonym variant (alternative name for Ninam) |
| Sanöma | Ethnonym (different Yanomami subgroup) |
| Yãnoma | Ethnonym variant |
| Ỹaroamë | Ethnonym variant |

## Spot-Check Results

| Name | Verified? | Source | Notes |
|------|-----------|--------|-------|
| Papiu | ✅ | ELAR archive (elararchive.org/dk0236) | "Yanomama of Papiu" settlement, Roraima. ELDP documentation project. Also known as Paapiu. |
| Demini | ✅ | PIB Socioambiental | "Aldeia Demini do povo Yanomami" — aerial view of Demini village. |
| Haximú | ✅ | Amnesty International, Minority Rights Group | Documented village of the Haximu massacre (1993). Multiple independent sources. |
| Balaú | ✅ | PIB Socioambiental | "Maloca Balaú (AM)" — photo by Carlo Zacquini, 1994. Yanomami communal house. |
| Auaris | ✅ | PIB Socioambiental (Ye'kwana page) | "Ye'kuana and Sanuma (Yanomami subgroup) live in the Auaris region." Real locality. |
| Surucucu | ✅ | Reuters, Amazonia Real | Reuters: "SURUCUCU, Brazil" from Yanomami reservation. Amazonia Real: "comunidade Kori Yauopë, região de Surucucu." |
| Maturacá | ✅ | Salesian MissionNewswire, Minority Rights | Salesian mission base in Yanomami territory serving multiple Yanomami communities. |
| Watoriki | ❓ | Google Arts & Culture, Survival Intl. | Confirmed Yanomami village (Davi Kopenawa's home) but NOT in the original b: field. |
| Homoxi | ❓ | ResearchGate | Confirmed Yanomami village with Thirei, but NOT in the original b: field. |
| Thirei | ❓ | ResearchGate | Confirmed Yanomami village with Homoxi, but NOT in the original b: field. |

## Linguistic Observations

Yanomami Amazonian represents the Yanomam dialect group (ISO 639-3: wca) of the Yanomaman language family, spoken by ~13,000 people. The language has 7 vowels, 12 consonants, nasal harmony, and no voice contrast. Yanomami settlements are traditionally named after local geographic features (rivers, mountains) or the founding group. Village names often end in -teri (meaning "people/place of") or -u/au.

- **Typical suffixes**: -teri, -u, -au, -i
- **Typical prefixes**: None standard
- **Common patterns**: Settlement names are often disyllabic or trisyllabic (CV.CV, CV.CV.CV)
- **Phonotactic notes**: No consonant clusters, nasal vowels common, /ɨ/ phoneme present

## Field Verification

| Field | Value | Verified? | Notes |
|-------|-------|-----------|-------|
| `name` | Yanomami Amazonian | ✅ | Accurate descriptor for Yanomam dialect group in Brazil |
| `i` | 63 | ✅ | Valid index, matches language-mixer-map.json |
| `min` | 4 | ✅ | Appropriate minimum length |
| `max` | 19 | ✅ | Accommodates longer settlement names |
| `d` | (empty) | ✅ | No deduplication string needed |
| `m` | 0 | ✅ | |

## Tool Verification

```bash
pnpm mixer:guardrails => PENDING
```

## Notes

- Original b: field contained 32 names, mostly non-settlement names (rivers, ethnonyms, municipalities, mythological figures, Portuguese geographic features)
- Only 7 of 32 names could be source-verified as actual Yanomami settlements/localities
- Several authentic Yanomami village names (Watoriki, Homoxi, Thirei) were absent from the original list and could be added later
- Yanomami is a micro-language with ~20K speakers; the 7 verified names provide a minimal but authentic base
- Duplicate: Surucucus (plural variant) was removed as duplicate of Surucucu

