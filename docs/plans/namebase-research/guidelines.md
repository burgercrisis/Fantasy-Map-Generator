# RESEARCH GUIDELINES

## Seed Authenticity

- Seeds MUST be actual place names from the language NATIVE REGION
- African languages: use African place names from correct country/region
- Asian languages: use Asian place names from correct country/region
- European languages: use European place names from correct country/region
- Oceanian languages: use Pacific island, Australian Aboriginal, Papuan place names
- Indigenous American languages: use indigenous place names from correct region
- NEVER use place names from unrelated regions
- Romanization should follow the language standard transliteration

## Seed Count Requirements

- Minimum: 5 real seed names (not geonames IDs)
- Ideal: 20+ real seed names
- 0 seeds = completely non-functional
- 1-4 seeds = very poor results
- Numeric-only tokens are NOT seeds

## D Value (Duplicate Letter Permission)

- Controls which letters can appear doubled in generated names
- Most languages: lnrt (l, n, r, t can double)
- Romance languages: often include s (e.g., nlrs for French)
- Italian: often includes c (e.g., cltr)
- Spanish: often lr (ll, rr are common)
- Empty d means NO double letters (very restrictive, rarely correct)

## M Value (Multi-Word Rate)

- m=0: No multi-word names
- m=0.1: ~10% multi-word (good default for most European languages)
- m=0.2-0.3: Higher rate (Arabic, Vietnamese)
- m=1.0: All multi-word (rare)

## Min/Max Length

- Most languages: min=3-5, max=10-14
- East Asian: min=2-3, max=8-12
- Polynesian: min=3-5, max=12-16
- Avoid min > 8 or max > 16
- Range should be at least 2

## Continent Sorting

- Languages should be in the file matching their geographic region
- Cross-reference with the catalog region field

## Encoding

- All names should be proper UTF-8
- Watch for mojibake patterns
- Non-ASCII characters are fine if legitimate Unicode

## Placeholder Detection

- Single-letter names — verify these are real language names
- Names with (dedicated) suffix — verify intentional
- Names like Big Flowery, Primus, Secundus — clearly placeholders
- If placeholder found, remove or replace with real language
