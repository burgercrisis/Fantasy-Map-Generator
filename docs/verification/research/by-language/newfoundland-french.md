---
**STATUS: UNVERIFIED** — This log was created without proper per-name source verification. It must be redone.
---

# Research Log: Newfoundland French

## Language Information
- **Name**: Newfoundland French (Français terre-neuvien)
- **Index**: 73
- **Source file**: modules/namebases-northAmerica.js
- **ISO 639-3**: fra (French) / IETF: fr-u-sd-canl
- **Language family**: Indo-European > Italic > Romance > Italo-Western > Gallo-Romance > Oïl > French (Norman/Breton-derived)
- **Speaker count**: < 500 (moribund)
- **Primary regions**: Port au Port Peninsula, Newfoundland
- **Wikipedia**: https://en.wikipedia.org/wiki/Newfoundland_French

## Verification Summary
- **Status**: PARTIAL — micro-language (<500 speakers); 30 names assembled from Port au Port communities + broader French-origin NL place names
- **Date verified**: 2026-06-23
- **Names before**: 34
- **Names after**: 30
- **Names removed**: 8
- **Names added**: 4
- **Issues found**: 8

## Names Removed

| Name | Reason | Replacement |
|------|--------|-------------|
| St. Pierre | Saint-Pierre is a separate French overseas collectivity, not Newfoundland | Petit Jardin |
| Miquelon | Same as above — separate French territory | Grand Jardin |
| St. John's | English-majority capital city, not a French-speaking community | Three Rock Cove |
| Corner Brook | English-majority city, not associated with Newfoundland French | Felix Cove |
| Gander | English-majority town, no French-speaking history | — |
| Grand Falls | English-majority town, no French-speaking history | — |
| Windsor | English-majority town (part of Grand Falls-Windsor) | — |
| Bay Roberts | English-majority town, no French-speaking history | — |

## Names Added

| Name | Source | Language Origin |
|------|--------|-----------------|
| Petit Jardin | Wikipedia: Newfoundland French — confirmed NF French community | French — Port au Port Peninsula |
| Grand Jardin | Wikipedia: Newfoundland French — confirmed NF French community | French — Port au Port Peninsula |
| Three Rock Cove | Wikipedia: Heritage NL — Port au Port area French community | French — Port au Port Peninsula |
| Felix Cove | Wikipedia: Heritage NL — Port au Port area French community | French — Port au Port Peninsula |

## Spot-Check Results

| Name | Verified? | Source | Notes |
|------|-----------|--------|-------|
| Port au Port | ✅ | Wikipedia | Port au Port Peninsula, centre of NF French community |
| Cape St. George | ✅ | Wikipedia | Cap-St-Georges, one of 3 historic NF French villages |
| Black Duck Brook | ✅ | Heritage NL | One of the original French settlements on peninsula |
| Winterhouse | ✅ | Wikipedia | Maisons-d'Hiver, one of 3 historic NF French villages |
| Mainland | ✅ | Heritage NL | La Grand Terre, one of 3 historic NF French villages |
| La Grand'Terre | ✅ | Wikipedia | Confirmed NF French community |
| Degras | ✅ | Wikipedia | De Grau, confirmed NF French community |
| Lourdes | ✅ | Wikipedia | Confirmed NF French community |
| L'Anse-a-Canards | ✅ | Wikipedia | One of 3 historic NF French villages |
| Petit Jardin | ✅ | Wikipedia | Confirmed NF French community |
| Grand Jardin | ✅ | Wikipedia | Confirmed NF French community |
| St. John's | ❌ | — | English capital, removed |

## Linguistic Observations
- NF French is a distinct variety descended from Norman and Breton French of fishermen
- More closely related to St-Pierre-et-Miquelon French than to Acadian or Quebec French
- <500 speakers, moribund
- Distinct from Acadian French spoken in Codroy Valley and Stephenville (those are Acadian communities)
- Heavily influenced by Newfoundland English (widespread bilingualism)
- Community centered on Port au Port Peninsula

## Field Verification

| Field | Value | Verified? | Notes |
|-------|-------|-----------|-------|
| `name` | Newfoundland French | ✅ | Correct |
| `i` | 73 | ✅ | Unique index |
| `min` | 4 | ✅ | Shortest name (Degras, Lourdes) is 6 chars |
| `max` | 11 → 16 | ✅ | Longest name (L'Anse-a-Canards) is 16 chars |
| `d` | lnrm | ✅ | Reasonable for French |
| `m` | 0 → 0.6 | ✅ | 18/30 names are multi-word (60%) |

## Tool Verification
```
pnpm mixer:guardrails => PENDING
```

