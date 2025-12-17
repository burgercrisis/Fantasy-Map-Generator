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
