# Europe Namebase — Contamination Findings (2026-07-19)

## Summary
The `modules/namebases-europe.js` file (719 entries) contains SYSTEMATIC, large-scale contamination
injected across hundreds of entries, in addition to the cover-term/region entries cleared earlier.
This document records what was found and what was done.

## Contamination patterns identified

### 1. Machine-generated `<Language>+suffix` placeholders (UNambiguous synthetic — REMOVED)
Each entry had a trailing block of tokens formed by concatenating the entry's language name with
random/sequential suffixes: `Italianow, Italianitz, Italianek, Italianov, Italianak`,
`Castilliank, Castillianp, Castillianm, Castilliann, Castillians, Castillianr`,
`Romank, Romanp, Romanm, ...`, `Nenetssk, Nenetsvsk, Nenetsinsk, ...`, `Bareseow, ...`,
`Castelmezzanoow, ...`, `MalteseItalianj, ...`, `ProtoGeorgianZantown, ...`, etc.
These are NOT real places. **941 such tokens removed across 225 entries** via a safe detector
(`<LangRoot>+generated-suffix`), with a whitelist protecting real places whose spelling embeds a
language-name fragment (Latina, Tuscania, Romanengo, Sicilia, Romania, Kemi, Keminmaa, Liguria,
Gallocanta, Akureyri, Argentan, Andoain, Aalborg, ...). The entire Roman/Latin entry is whitelisted.

### 2. Estonian place-name dump (real places, WRONG entries — REMOVED from non-Uralic entries)
A block of real Estonian towns (Otepaa, Pikknurme, Elva, Triigi, Tartu, Narva, Valga, Saue, ...)
was pasted into hundreds of non-Uralic entries (French, Italian, Spanish, Portuguese, Hungarian,
Jersey French, Aragonese, ...). These are real Estonian places but do not belong in those entries.
**Removed from all non-Uralic (finno) entries.** Retained in Estonian/Finnic/Uralic entries.

### 3. Finnish / Russian(Siberian) / Kyrgyz place-name dumps (real places, WRONG entries — NOT YET REMOVED)
The most pervasive remaining contamination: real Finnish towns (Turku, Tampere, Helsinki, Oulu,
Lahti, ...), Russian/Siberian towns (Tyumen, Surgut, Tobolsk, Khanty-Mansiysk, Nizhnevartovsk,
...), and Kyrgyz towns (Karakol, Naryn, Kochkor, CholponAta, Bishkek, ...) were injected into ~225
entries spanning many unrelated languages (Italian, French, Galician, Portuguese, Catalan,
Hungarian, Daco-Romanian, Tarantino, ...). These are REAL places but wrongly placed.

These were deliberately LEFT in place because safe automated removal risks deleting legitimate
Uralic/Slavic places that genuinely belong in Finnish/Estonian/Russian/Kyrgyz entries. They require
**per-entry verification** (the core protocol task): for each affected entry, confirm which names
actually belong to that entry's language and remove the rest. This is a large, multi-session effort.

## Verification status
- Italian (i=3): VERIFIED — 87 real Italian comuni (Wikipedia "List of cities in Italy" + Sicilian
  comune pages). Log: by-language/Italian.md.
- English (i=1), French (i=2): prior agent's work; RE-CHECK advised (synthetic blocks removed, but
  foreign-pool dumps may remain).
- Remaining 716 entries: NOT individually verified this session.

## Safety notes
- A corruption bug (doubled `"b": ""b":` prefix) was introduced during cleanup and FIXED; verified
  0 doubled lines, 0 empty entries, 0 structurally-bad lines afterward. Guardrails pass
  (map=3425 catalog=3526).
- No administrative/geographic/generic tokens were added. Only synthetic + misplaced-Estonian
  tokens were removed.
