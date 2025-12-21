# Mixer Diagnostics Stats Log

## Snapshot 2025-12-20T12:08:00-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`) summary

- Target ISOs: 3425
- Missing mapping: 7
- No globally-unique base index: 974
- Strict unique seeds below threshold (among those with unique base): 1406
- Normalized unique seeds below threshold (among those with unique base): 1406

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3418
- Total distinct base sets (all sizes): 3417
- Clusters with identical base sets (size >= 2): 1
- Total language entries participating in these clusters: 2

### Race coverage (`pnpm run mixer:race-coverage`) summary

- Total catalog languages (excluding family macros): 3425
- Languages eligible for at least one race profile: 3425
- Languages never used by any race profile: 0
- Race-eligible languages with a valid mixer mapping: 3418
- Race-unused languages with a valid mixer mapping: 0

Delta vs 2025-12-20T11:45:00-08:00:

- Target ISOs: 3418 -> 3425 (+7)
- Missing mapping: 0 -> 7 (+7)
- No globally-unique base index: 992 -> 974 (-18)
- Strict below threshold: 1409 -> 1406 (-3)
- Norm below threshold: 1409 -> 1406 (-3)
- Base clusters (>=2): 1 -> 1 (+0)
- Cluster participants: 2 -> 2 (+0)
- Race-unused languages: 0 -> 0 (+0)


## Snapshot 2025-12-20T11:45:00-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`) summary

- Target ISOs: 3418
- Missing mapping: 0
- No globally-unique base index: 992
- Strict unique seeds below threshold (among those with unique base): 1409
- Normalized unique seeds below threshold (among those with unique base): 1409

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3418
- Total distinct base sets (all sizes): 3417
- Clusters with identical base sets (size >= 2): 1
- Total language entries participating in these clusters: 2

### Race coverage (`pnpm run mixer:race-coverage`) summary

- Total catalog languages (excluding family macros): 3418
- Languages eligible for at least one race profile: 3418
- Languages never used by any race profile: 0
- Race-eligible languages with a valid mixer mapping: 3418
- Race-unused languages with a valid mixer mapping: 0

Delta vs 2025-12-17T16:02:21-08:00:

- Target ISOs: 3397 -> 3418 (+21)
- No globally-unique base index: 2074 -> 992 (-1082)
- Strict below threshold: 30 -> 1409 (+1379)
- Norm below threshold: 187 -> 1409 (+1222)
- Base clusters (>=2): 69 -> 1 (-68)
- Cluster participants: 554 -> 2 (-552)
- Race-unused languages: 0 -> 0 (+0)


## Snapshot 2025-12-17T16:02:21-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`) summary

- Target ISOs: 3397
- Missing mapping: 0
- No globally-unique base index: 2074
- Strict unique seeds below threshold (among those with unique base): 30
- Normalized unique seeds below threshold (among those with unique base): 187

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3397
- Total distinct base sets (all sizes): 2912
- Clusters with identical base sets (size >= 2): 69
- Total language entries participating in these clusters: 554

### Race coverage (`pnpm run mixer:race-coverage`) summary

- Total catalog languages (excluding family macros): 3397
- Languages eligible for at least one race profile: 3397
- Languages never used by any race profile: 0
- Race-eligible languages with a valid mixer mapping: 3397
- Race-unused languages with a valid mixer mapping: 0

Delta vs 2025-12-17T14:56:43-08:00:

- No globally-unique base index: 2085 -> 2074 (-11)
- Strict below threshold: 13 -> 30 (+17)
- Norm below threshold: 170 -> 187 (+17)
- Base clusters (>=2): 71 -> 69 (-2)
- Cluster participants: 561 -> 554 (-7)
- Race-unused languages: 0 -> 0 (+0)


## Snapshot 2025-12-17T14:56:43-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`) summary

- Target ISOs: 3397
- Missing mapping: 0
- No globally-unique base index: 2085
- Strict unique seeds below threshold (among those with unique base): 13
- Normalized unique seeds below threshold (among those with unique base): 170

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3397
- Total distinct base sets (all sizes): 2907
- Clusters with identical base sets (size >= 2): 71
- Total language entries participating in these clusters: 561

### Race coverage (`pnpm run mixer:race-coverage`) summary

- Total catalog languages (excluding family macros): 3397
- Languages eligible for at least one race profile: 3397
- Languages never used by any race profile: 0
- Race-eligible languages with a valid mixer mapping: 3397
- Race-unused languages with a valid mixer mapping: 0

Delta vs 2025-12-17T01:50:34-08:00:

- No globally-unique base index: 2167 -> 2085 (-82)
- Strict below threshold: 13 -> 13 (+0)
- Norm below threshold: 170 -> 170 (+0)
- Base clusters (>=2): 85 -> 71 (-14)
- Cluster participants: 616 -> 561 (-55)
- Race-unused languages: 0 -> 0 (+0)


## Snapshot 2025-12-17T01:50:34-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`) summary

- Target ISOs: 3397
- Missing mapping: 0
- No globally-unique base index: 2167
- Strict unique seeds below threshold (among those with unique base): 13
- Normalized unique seeds below threshold (among those with unique base): 170

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3397
- Total distinct base sets (all sizes): 2866
- Clusters with identical base sets (size >= 2): 85
- Total language entries participating in these clusters: 616

### Race coverage (`pnpm run mixer:race-coverage`) summary

- Total catalog languages (excluding family macros): 3397
- Languages eligible for at least one race profile: 3397
- Languages never used by any race profile: 0
- Race-eligible languages with a valid mixer mapping: 3397
- Race-unused languages with a valid mixer mapping: 0

Delta vs 2025-12-17T00:12:49-08:00:

- No globally-unique base index: 2230 -> 2167 (-63)
- Strict below threshold: 14 -> 13 (-1)
- Norm below threshold: 170 -> 170 (+0)
- Base clusters (>=2): 102 -> 85 (-17)
- Cluster participants: 670 -> 616 (-54)
- Race-unused languages: 0 -> 0 (+0)


## Snapshot 2025-12-17T00:12:49-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`) summary

- Target ISOs: 3397
- Missing mapping: 0
- No globally-unique base index: 2230
- Strict unique seeds below threshold (among those with unique base): 14
- Normalized unique seeds below threshold (among those with unique base): 170

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3397
- Total distinct base sets (all sizes): 2829
- Clusters with identical base sets (size >= 2): 102
- Total language entries participating in these clusters: 670

### Race coverage (`pnpm run mixer:race-coverage`) summary

- Total catalog languages (excluding family macros): 3397
- Languages eligible for at least one race profile: 3397
- Languages never used by any race profile: 0
- Race-eligible languages with a valid mixer mapping: 3397
- Race-unused languages with a valid mixer mapping: 0

Delta vs 2025-12-16T23:28:19-08:00:

- No globally-unique base index: 2252 -> 2230 (-22)
- Strict below threshold: 16 -> 14 (-2)
- Norm below threshold: 172 -> 170 (-2)
- Base clusters (>=2): 109 -> 102 (-7)
- Cluster participants: 692 -> 670 (-22)
- Race-unused languages: 18 -> 0 (-18)


## Snapshot 2025-12-16T23:28:19-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`) summary

- Target ISOs: 3397
- Missing mapping: 0
- No globally-unique base index: 2252
- Strict unique seeds below threshold (among those with unique base): 16
- Normalized unique seeds below threshold (among those with unique base): 172

### Base-set clusters (`--min-size=2`) summary

- Considered catalog languages (after filters): 3397
- Total distinct base sets (all sizes): 2814
- Clusters with identical base sets (size >= 2): 109
- Total language entries participating in these clusters: 692

### Race coverage (`pnpm run mixer:race-coverage`) summary

- Total catalog languages (excluding family macros): 3397
- Languages eligible for at least one race profile: 3379
- Languages never used by any race profile: 18
- Race-eligible languages with a valid mixer mapping: 3379
- Race-unused languages with a valid mixer mapping: 18

Delta vs 2025-12-16T22:56:18-08:00:

- No globally-unique base index: 2259 -> 2252 (-7)
- Base clusters (>=2): 109 -> 109 (+0)
- Cluster participants: 692 -> 692 (+0)
- Race-unused languages: 22 -> 18 (-4)


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


## Snapshot 2025-12-16T18:55:27-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`) summary

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


## Snapshot 2025-12-16T17:25:51-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`) summary

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


## Snapshot 2025-12-16T15:43:19-08:00

### Commands

```
node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --limit=1
node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
pnpm run mixer:race-coverage
```

### Seed uniqueness (`--limit=1`) summary

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
