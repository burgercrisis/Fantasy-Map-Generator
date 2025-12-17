# Mixer Diagnostics Stats Log

## Snapshot 2025-12-16T15:43:19.9871389-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`)

Sample row (limit=1):

```
awjila-language | Awjila language | map |NO_UNIQ_BASE |strict<1 |norm<10                                   uniqueBases=[] strictUniqueSeeds=0 normUniqueSeeds=0
```

Summary:

- Target ISOs: 3377
- Missing mapping: 0
- No globally-unique base index: 2383
- Strict unique seeds below threshold (among those with unique base): 16
- Normalized unique seeds below threshold (among those with unique base): 172

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3377
- Total distinct base sets (all sizes): 2750
- Clusters with identical base sets (size >= 2): 140
- Total language entries participating in these clusters: 767

### Race coverage (`pnpm run mixer:race-coverage`) summary

- Total catalog languages (excluding family macros): 3377
- Languages eligible for at least one race profile: 3355
- Languages never used by any race profile: 22
- Race-eligible languages with a valid mixer mapping: 3355
- Race-unused languages with a valid mixer mapping: 22

Race-unused ISO list (22):

- akm
- akj
- anq
- oon
- ite
- cbg
- noa
- ona
- enl
- moc
- tob
- jiv
- cag
- sonsorolese
- tobian
- zoq
- caw
- cho
- mik
- mus
- pbb
- ayo

## Snapshot 2025-12-16T22:56:18-08:00

### Commands

```
pnpm run mixer:guardrails
pnpm run mixer:check-deltas
pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=300
pnpm exec -- node tools/mixer-core/check-language-mixer-coverage.js
pnpm exec -- node tools/mixer-core/check-language-mixer-failures.js
pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
```

### Seed uniqueness (`--only-failures --limit=300`) summary

- Target ISOs: 3397
- Missing mapping: 0
- No globally-unique base index: 2259
- Strict unique seeds below threshold (among those with unique base): 16
- Normalized unique seeds below threshold (among those with unique base): 172

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3397
- Total distinct base sets (all sizes): 2814
- Clusters with identical base sets (size >= 2): 109
- Total language entries participating in these clusters: 692

## Status 2025-12-16T19:22:12-08:00

- Restored observable output for `pnpm exec -- node tools/mixer-diagnostics/no-uniq-base-claim.js --dashboard` (was exiting 0 with no output). Verified it now prints the dashboard summary.


## Snapshot 2025-12-16T18:55:27.3557754-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`)

Sample row (limit=1):

```
bana-language | Bana language | map |NO_UNIQ_BASE |strict<1 |norm<10    uniqueBases=[] strictUniqueSeeds=0 normUniqueSeeds=0
```

Summary:

- Target ISOs: 3377
- Missing mapping: 0
- No globally-unique base index: 2315
- Strict unique seeds below threshold (among those with unique base): 16
- Normalized unique seeds below threshold (among those with unique base): 172

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3377
- Total distinct base sets (all sizes): 2779
- Clusters with identical base sets (size >= 2): 117
- Total language entries participating in these clusters: 715

### Race coverage (`pnpm run mixer:race-coverage`) summary

- Total catalog languages (excluding family macros): 3377
- Languages eligible for at least one race profile: 3355
- Languages never used by any race profile: 22
- Race-eligible languages with a valid mixer mapping: 3355
- Race-unused languages with a valid mixer mapping: 22

Race-unused ISO list (22):

- akm
- akj
- anq
- oon
- ite
- cbg
- noa
- ona
- enl
- moc
- tob
- jiv
- cag
- sonsorolese
- tobian
- zoq
- caw
- cho
- mik
- mus
- pbb
- ayo
## Snapshot 2025-12-16T17:25:51.9946972-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`)

Sample row (limit=1):

```
bahraini-gulf-arabic | Bahraini Gulf Arabic | map |NO_UNIQ_BASE |strict<1 |norm<10                         uniqueBases=[] strictUniqueSeeds=0 normUniqueSeeds=0
```

Summary:

- Target ISOs: 3377
- Missing mapping: 0
- No globally-unique base index: 2358
- Strict unique seeds below threshold (among those with unique base): 16
- Normalized unique seeds below threshold (among those with unique base): 172

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3377
- Total distinct base sets (all sizes): 2758
- Clusters with identical base sets (size >= 2): 138
- Total language entries participating in these clusters: 757

### Race coverage (`pnpm run mixer:race-coverage`) summary

- Total catalog languages (excluding family macros): 3377
- Languages eligible for at least one race profile: 3355
- Languages never used by any race profile: 22
- Race-eligible languages with a valid mixer mapping: 3355
- Race-unused languages with a valid mixer mapping: 22

Race-unused ISO list (22):

- akm
- akj
- anq
- oon
- ite
- cbg
- noa
- ona
- enl
- moc
- tob
- jiv
- cag
- sonsorolese
- tobian
- zoq
- caw
- cho
- mik
- mus
- pbb
- ayo
