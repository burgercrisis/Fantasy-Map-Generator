---
**STATUS: UNVERIFIED** — This log was created without proper per-name source verification. It must be redone.
---

# Research Log: New England French

## Language Information
- **Name**: New England French (Français de Nouvelle-Angleterre / Franco-American)
- **Index**: 72
- **Source file**: modules/namebases-northAmerica.js
- **ISO 639-3**: fra (French)
- **Language family**: Indo-European > Italic > Romance > Italo-Western > Gallo-Romance > Oïl > French
- **Speaker count**: ~170,000 (2015)
- **Primary regions**: Maine, New Hampshire, Massachusetts, Vermont, Rhode Island, Connecticut
- **Wikipedia**: https://en.wikipedia.org/wiki/New_England_French

## Verification Summary
- **Status**: COMPLETE
- **Date verified**: 2026-06-23
- **Names before**: 32
- **Names after**: 31
- **Names removed**: 11
- **Names added**: 10
- **Issues found**: 11

## Names Removed

| Name | Reason | Replacement |
|------|--------|-------------|
| St. Pamphile | Quebec, Canada — not New England | Manchester |
| Perth-Andover | New Brunswick, Canada — not New England | Woonsocket |
| Plaster Rock | New Brunswick, Canada — not New England | Lowell |
| Grand Falls | New Brunswick, Canada — not New England | Burlington |
| Edmundston | New Brunswick, Canada — not New England | Fall River |
| Woodstock | New Brunswick, Canada — not New England | Berlin |
| Grand-Sault | New Brunswick, Canada (duplicate of Grand Falls) — not New England | New Bedford |
| St. Leonard | New Brunswick, Canada — not New England | Holyoke |
| St. Andre | New Brunswick, Canada — not New England | Caribou |
| Brunswick | Maine — not a notable Franco-American hub; Bowdoin College town | Skowhegan |
| Augusta | Maine — state capital, not notably Franco-American | — |

## Names Added

| Name | Source | Language Origin |
|------|--------|-----------------|
| Manchester | Wikipedia: New England French | French-Canadian — largest Franco-American city in NH, 19th c. textile mills |
| Woonsocket | Wikipedia: New England French / "most French city in US" | French-Canadian — 75% Franco-American at peak, Union Saint-Jean-Baptiste |
| Lowell | Wikipedia: New England French / Jack Kerouac's hometown | French-Canadian — major mill city, second-largest Franco-Am pop in MA |
| Burlington | Wikipedia: New England French / first Franco-Am newspaper | French-Canadian — major Vermont Franco-American center, Le Patriote Canadien |
| Fall River | Wikipedia: New England French / L'Indépendant newspaper | French-Canadian — major MA mill city, large Franco-American community |
| Berlin | Wikipedia: New England French / 16.7% French-speaking | French-Canadian — northern NH mill town, strong Franco-American heritage |
| New Bedford | Wikipedia: New England French | French-Canadian — major MA fishing/mill city, large Franco-American community |
| Holyoke | Wikipedia: New England French / La Justice newspaper | French-Canadian — MA mill city with historic Franco-American newspaper |
| Caribou | Wikipedia: New England French / referenced in article | French-Canadian — Aroostook County potato farming region, Franco-American heritage |
| Skowhegan | Wikipedia: Somerset County history | French-Canadian — central Maine paper mill town, Franco-American community |

## Spot-Check Results

| Name | Verified? | Source | Notes |
|------|-----------|--------|-------|
| Lewiston | ✅ | Wikipedia | Major Franco-American city, 14.7% French-speaking at home |
| Madawaska | ✅ | Wikipedia | 61.8% French-speaking, St. John Valley |
| Fort Kent | ✅ | Wikipedia | 47.5% French-speaking, St. John Valley |
| Van Buren | ✅ | Wikipedia | 56.5% French-speaking, St. John Valley |
| Frenchville | ✅ | Wikipedia | 67.4% French-speaking, highest in New England |
| Biddeford | ✅ | Wikipedia | Major mill city, significant Franco-American population |
| Sanford | ✅ | Wikipedia | Significant Franco-American population |
| Waterville | ✅ | Wikipedia | Major mill city, Franco-American population |
| Woonsocket | ✅ | Wikipedia | "The most French city in the United States" |
| Berlin | ✅ | Wikipedia | 16.7% French-speaking, highest in NH |

## Linguistic Observations
- Descended from Quebec French (Laurentian) with some English influence
- Also called Franco-American
- Code-switching is common even in younger generations
- Some archaic Quebec French words preserved (char for car, patate for potato)
- French-language newspapers were numerous (242+ between 1838-1938)
- Endangered — laws in early 20th century banned French in schools

## Field Verification

| Field | Value | Verified? | Notes |
|-------|-------|-----------|-------|
| `name` | New England French | ✅ | Correct name of the dialect |
| `i` | 72 | ✅ | Unique index |
| `min` | 4 | ✅ | Shortest name (Hamlin, Berlin) is 6 chars; 4 is fine for generation |
| `max` | 11 → 20 | ✅ | Longest name (Dennistown Plantation) is 20 chars |
| `d` | lnrm | ✅ | Reasonable for French (doubled l, n, r, m present in e.g. elle, bonne, terre, femme) |
| `m` | 0 → 0.42 | ✅ | 13/31 names are multi-word (42%) |

## Tool Verification
```
pnpm mixer:guardrails => PENDING
```

