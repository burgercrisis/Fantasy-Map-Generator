# Quality Standards — Non-Negotiable Requirements

These standards apply to EVERY language namebase entry. No exceptions. No shortcuts.

## 1. Place Name Authenticity

### 1.1 Every name MUST be a real place

Every single name in the `b:` field MUST be a verifiable real-world place name:
- City, town, village, hamlet
- Natural geographic feature (river, mountain, lake, island)
- Historic place (ruins, ancient city, archaeological site)

### 1.2 Names MUST come from the correct LANGUAGE

**This is the single most important rule in this document.** A name belongs to a language if speakers of that language coined it — regardless of where the place is located on a map.

- **Swahili** → names coined by Swahili speakers (East African coast: Kenya, Tanzania, Uganda, etc.)
- **Japanese** → names coined by Japanese speakers (Japan, Japanese communities abroad)
- **Quechua** → names coined by Quechua speakers (Andes region: Peru, Bolivia, Ecuador, etc.)
- **Spanish** → names coined by Spanish speakers ANYWHERE in the world (Spain, Latin America, the Philippines, etc.)
- **English** → names coined by English speakers ANYWHERE in the world (UK, US, Australia, India, etc.)
- **NOT** names from unrelated languages, even if they're from the same geographic region

**Key principle:** If Spanish speakers named a place in Japan, it's Spanish, not Japanese. Language determines name origin, not geography.

### 1.3 Names MUST match the language's naming conventions

Names should follow the morphological patterns of the language:
- **Turkish** names should look Turkish (İstanbul, Ankara, İzmir, Bursa, Antalya)
- **Arabic** names in Arabic-script romanization (Cairo, Alexandria, Khartoum)
- **German** names should look German (München, Köln, Düsseldorf, Hamburg)

### 1.4 Prohibited name types

NEVER include:
- ❌ Administrative units (provinces, states, districts, counties)
- ❌ Colors or common nouns standing alone
- ❌ Modern shopping centers or commercial developments
- ❌ Post-1900 city foundations in historical namebases
- ❌ Encoding-corrupted text (mojibake)
- ❌ Placeholder text or fake names
- ❌ Names from the wrong language (even if from the same region)
- ❌ Names from the wrong language family

## 2. Name Count Requirements

### 2.1 Minimum counts

| Language Size | Minimum Names | Target Names |
|---------------|---------------|--------------|
| Major (>20M speakers) | 80 | 100+ |
| Medium (1M-20M) | 50 | 75+ |
| Small (<1M) | 30 | 50+ |
| All languages | **25 (hard minimum)** | **50+ preferred** |

### 2.2 Language coverage diversity

Names must span the language's full naming range:
- NOT all from one city or province
- Include places named by speakers across all areas where the language has been spoken
- For widespread languages, include places from multiple countries/regions where the language has naming influence
- For colonial languages, include places named by speakers in colonies (e.g., Spanish names throughout Latin America are still Spanish)

### 2.3 Name quality over quantity

50 authentic names are worth more than 200 questionable ones. If in doubt about a name,
RESEARCH it. If you can't verify it, REMOVE it and replace it with a verified one.

## 3. Script Requirements

### 3.1 Romanized Latin script only

All names must use the Latin (Roman) alphabet. This is a hard constraint because the
Markov name generator operates on Latin characters.

### 3.2 Acceptable characters

- Basic Latin: A-Z, a-z
- Common diacritics used in romanization:
  - Accented vowels: á, é, í, ó, ú, à, è, ì, ò, ü, ö, ä, ë, ï
  - Nasal vowels: ã, õ, ñ
  - Special consonants: ç, ø, ß, ð, þ, ł, ő, ű
  - Other: č, š, ž, ř, ă, ș, ţ, ğ

### 3.3 Prohibited scripts

- ❌ Cyrillic (Київ → use Kyiv)
- ❌ Arabic script (القاهرة → use Cairo/al-Qahira)
- ❌ CJK characters (北京 → use Beijing)
- ❌ Devanagari (मुंबई → use Mumbai)
- ❌ Chinese characters
- ❌ Japanese kanji/kana
- ❌ Korean hangul
- ❌ Thai, Burmese, Khmer, etc.
- ❌ Ge'ez/Ethiopic script
- ❌ Tamil, Telugu, Kannada, etc.

### 3.4 Romanization standards

Use the most common/standard romanization:
- Chinese: Pinyin (Beijing, Shanghai, Guangzhou)
- Japanese: Hepburn (Tokyo, Osaka, Kyoto)
- Korean: Revised Romanization (Seoul, Busan, Incheon)
- Arabic: Common transliteration (Cairo, Alexandria, Riyadh)
- Turkish: Modern Turkish Latin script (Istanbul, Ankara)
- Use the form most commonly found in English-language sources

## 4. Language Uniqueness

### 4.1 Every language must be distinct

Each language entry must produce names that are recognizably from that language:
- **Spanish** and **Portuguese** should produce different-sounding names
- **German** and **Dutch** should produce different-sounding names
- **Hindi** and **Urdu** should produce different-sounding names

### 4.2 Unique base requirement

Every language must have at least ONE unique base index that no other language uses.
This ensures the language has at least some names that are distinctly its own.

### 4.3 Dialect handling

Closely related dialects (e.g., Castilian vs. Spanish) should have measurably different
name sets reflecting real dialectal variation, not identical lists.

## 5. Entry Field Requirements

### 5.1 `name` field
- Must be a real language/dialect name
- Not a language family name (e.g., "Bantu" is a family, not a language)
- Not a geographic descriptor (e.g., "African" is not a language)
- Use the most common English name for the language

### 5.2 `i` field (index)
- Must be a unique positive integer
- Must not collide with any other entry's index
- Must match all references in `config/language-mixer-map.json`

### 5.3 `min` / `max` fields
- `min`: Minimum generated name length (typically 3-6)
- `max`: Maximum generated name length (typically 10-16)
- Range should be at least 2
- Must be reasonable for the language's actual name lengths

### 5.4 `d` field (doubled-letter permission)
- String of letters that CAN appear doubled in generated names
- Must match the language's actual phonotactic patterns
- Common patterns:
  - Romance: `nlrs` (ll, nn, rr, ss)
  - Germanic: `lnrt` (ll, nn, rr, tt)
  - Slavic: `lnrs` or similar
  - Empty string means NO doubled letters (very restrictive)

### 5.5 `m` field (multi-word rate)
- 0 = no multi-word names
- 0.1 = ~10% multi-word (good default)
- Higher values for languages that commonly use multi-word place names

### 5.6 `b` field (seed names)
- Comma-separated list of authentic place names
- Minimum 25 names (target 50-100+)
- All names must pass authenticity checks
- No duplicates
- No empty entries

## 6. File Assignment

Each language must be in the correct file. Files are organized by continent for **organizational convenience only** — the file a language is in does NOT define what names belong to that language. A language's names are defined by the language itself, not by the region.

| File | Region |
|------|--------|
| namebases-africa.js | African languages |
| namebases-asia.js | Asian languages |
| namebases-europe.js | European languages |
| namebases-northAmerica.js | North/Central American indigenous languages |
| namebases-southAmerica.js | South American indigenous languages |
| namebases-oceania.js | Pacific, Australian, Papuan languages |
| namebases-unknown.js | Languages with unclear classification |
| namebases-fantasy.js | Fictional languages |
| namebases-dedicated.js | High-priority languages with unique bases |

**Note**: Some languages span multiple continents (e.g., Arabic, English, Spanish).
Place them in the file that best matches their historical/origin region, or in
`namebases-dedicated.js` if they have dedicated entries. The key thing is that the names must be from the LANGUAGE, not from the continent.

## 7. Research Standards

### 7.1 Source hierarchy (in order of reliability)

1. **Wikipedia** — Language articles, place name lists, toponymy sections
2. **Ethnologue** — Speaker counts, classification, dialect lists
3. **GEOnet Names Server** — Official geographic name database
4. **GeoNames.org** — Useful for smaller places
5. **Academic papers** — On toponymy and language-specific naming
6. **Official government databases** — Geographic name registries

### 7.2 Search patterns

For each language, search:
- `"<Language>" language Wikipedia`
- `<Language> place names toponymy`
- `<Language> cities towns villages`
- `<Language> geographic distribution`
- For each questionable name: `"<name>" <language> place`

### 7.3 Red flags (remove immediately)

- Non-place words (colors, common nouns)
- Administrative units (provinces, states, districts)
- Post-1900 foundations in historical bases
- Encoding-corrupted diacritics (mojibake)
- Names from wrong language (even if from the same region/continent)
- Names that don't follow the language's phonotactic patterns

## 8. Verification Tools

### 8.1 Required tool runs

After ANY changes to namebase files:
```bash
pnpm mixer:guardrails
```

After completing a batch of changes:
```bash
pnpm mixer:health
pnpm mixer:qa
```

After ALL changes are complete:
```bash
pnpm mixer:doctor
node tools/tracking/consolidated-quality-tracker.js
```

### 8.2 Bundle regeneration

After ANY changes to config files:
```bash
node tools/mixer-core/generate-language-mixer.js
```

## 9. Commit Standards

### 9.1 Commit frequency

- After completing each language (preferred)
- After every 5-10 languages (maximum batch)
- After any structural changes (index repairs, etc.)

### 9.2 Commit message format

```
verify(namebase): <action> <language> (<index>)

- <specific change 1>
- <specific change 2>
- <verification evidence>

Verification: <tool> => <result>
```

Example:
```
verify(namebase): expand and verify Swahili (i:27)

- Added 34 new authentic East African place names
- Removed 3 names from wrong region (Dubai, Sharjah, Abu Dhabi)
- Verified all 58 names against Wikipedia and GeoNames
- Updated min/max to reflect actual name length distribution

Verification: pnpm mixer:guardrails => OK
```
