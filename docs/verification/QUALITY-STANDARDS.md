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

**CRITICAL DISTINCTION — Native name vs. English exonym:**
Even when a name is "from the right language," it must be the form that speakers of that language actually use — NOT an English transliteration or exonym.

| Language | ❌ WRONG (English exonym) | ✅ CORRECT (Native name) |
|----------|--------------------------|--------------------------|
| Hindi | Mumbai, Delhi, Kolkata | मुंबई, दिल्ली, कोलकाता |
| Bengali | Dhaka, Chittagong | ঢাকা, চট্টগ্রাম |
| Urdu | Karachi, Lahore | کراچی, لاہور |
| Persian | Tehran, Isfahan | تهران, اصفهان |
| Arabic | Cairo, Alexandria | القاهرة, الإسكندرية |
| Thai | Bangkok, Chiang Mai | กรุงเทพ, เชียงใหม่ |
| Korean | Seoul, Busan | 서울, 부산 |
| Japanese | Tokyo, Osaka | 東京, 大阪 |
| Chinese | Beijing, Shanghai | 北京, 上海 |
| Punjabi | Ludhiana, Amritsar | ਲੁਧਿਆਣਾ, ਅੰਮ੍ਿਤਸਰ |
| Gujarati | Ahmedabad, Surat | અમદાવાદ, સુરત |
| Sinhala | Colombo, Kandy | කොළඹ, මහනුවර |
| Khmer | Phnom Penh, Siem Reap | ភ្នំពេញ, សៀមរាប |
| Pashto | Kabul, Kandahar | کابل, قندهار |

**The test:** Ask yourself "What do speakers of [language] call this place?" If the answer is different from what you've written, fix it.

### 1.3 Names MUST match the language's naming conventions

Names should follow the morphological patterns of the language:
- **Turkish** names should look Turkish (İstanbul, Ankara, İzmir, Bursa, Antalya)
- **Arabic** names in Arabic script (القاهرة, الإسكندرية, الرياض)
- **German** names should look German (München, Köln, Düsseldorf, Hamburg)
- **Hindi** names in Devanagari (मुंबई, दिल्ली, कोलकाता)
- **Japanese** names in Kanji/Kana (東京, 大阪, 京都)
- **Chinese** names in Hanzi (北京, 上海, 广州)

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
- ❌ **English/French/Spanish colonial names in indigenous language entries** — if the name was coined by a colonial language, it does NOT belong in an indigenous entry, even if the place is in that language's territory

### 1.5 Self-Check Before Submitting

Before finalizing ANY entry, answer these questions:

1. **"What do speakers of [language] call this place?"** — If you can't answer this for every name in the `b:` field, you haven't verified it.
2. **"Would a native speaker recognize this as a name from their language?"** — If the answer is no, remove it.
3. **"Am I using the language's native script?"** — If the language uses Devanagari, Arabic, Bengali, etc., the names MUST be in that script. Latin exonyms are not acceptable.
4. **"Am I confusing geography with linguistics?"** — A place being located in a country does NOT mean the name belongs to that language. "Mumbai" is an English name, not a Hindi name. "Delhi" is an English transliteration, not the Hindi name.

**If you cannot answer YES to all four questions, STOP and research more.**

### 1.6 Language family entries

For entries that represent language families or groups (e.g., "Lolo-Burmese", "Kho-Bwa",
"Tamangic", "Qiangic", "Tani", "West Himalayish"):

- Select ONE representative language within the family
- Use that language's native toponyms in the `b:` field
- Do NOT use English names of places in the region
- Do NOT mix names from multiple unrelated languages within the family
- The test is: "Would speakers of [representative language] recognize these as names from their language?"

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

## 3. Script and Name Form Requirements

### 3.1 Names must be in the language's native form

**This is critical.** Names in the `b:` field must be the names that speakers of the language
actually use — NOT English exonyms or transliterations designed for English speakers.

The Markov name generator operates on the characters in the `b:` field. If you put English
names in, the generator will produce English-sounding names. If you put native-script names in,
the generator will produce names that actually sound like the language.

### 3.2 Native script is REQUIRED for non-Latin-script languages

For languages that use a non-Latin script, the `b:` field MUST contain names in the language's
own script. This is not optional.

| Language | Script | ✅ Correct | ❌ Wrong |
|----------|--------|---------|---------|
| Hindi | Devanagari | मुंबई, दिल्ली, कोलकाता | Mumbai, Delhi, Kolkata |
| Bengali | Bengali | ঢাকা, চট্টগ্রাম, খুলনা | Dhaka, Chittagong, Khulna |
| Urdu | Nastaliq/Arabic | کراچی, لاہور, اسلام‌آباد | Karachi, Lahore, Islamabad |
| Punjabi | Gurmukhi | ਲੁਧਿਆਣਾ, ਅੰਮ੍ਿਤਸਰ | Ludhiana, Amritsar |
| Gujarati | Gujarati | અમદાવાદ, સુરત | Ahmedabad, Surat |
| Sinhala | Sinhala | කොළඹ, මහනුවර | Colombo, Kandy |
| Khmer | Khmer | ភ្នំពេញ, សៀមរាប | Phnom Penh, Siem Reap |
| Persian | Perso-Arabic | تهران, اصفهان, شیراز | Tehran, Isfahan, Shiraz |
| Pashto | Pashto | کابل, قندهار, هرات | Kabul, Kandahar, Herat |
| Kurdish | Arabic/Latin | هەولێر, سلۭمانی, دهۆک | Erbil, Sulaymaniyah, Duhok |
| Arabic | Arabic | القاهرة, الإسكندرية, الرياض | Cairo, Alexandria, Riyadh |
| Thai | Thai | กรุงเทพ, เชียงใหม่ | Bangkok, Chiang Mai |
| Burmese | Burmese | ရန်ကုန်, မန္တလေး | Yangon, Mandalay |
| Korean | Hangul | 서울, 부산, 인천 | Seoul, Busan, Incheon |
| Japanese | Kanji/Kana | 東京, 大阪, 京都 | Tokyo, Osaka, Kyoto |
| Chinese | Hanzi | 北京, 上海, 广州 | Beijing, Shanghai, Guangzhou |
| Tamil | Tamil | சென்னை, மதுரை | Chennai, Madurai |
| Telugu | Telugu | హైదరాబాద్, విశాఖాపట్నం | Hyderabad, Visakhapatnam |
| Turkish | Latin (Turkish) | İstanbul, Ankara, İzmir | (same — Turkish uses Latin script) |

### 3.3 Latin-script languages

For languages that already use Latin script (English, Spanish, French, German, Turkish,
Indonesian, Vietnamese, etc.), names should be written in the language's own orthography
(including diacritics): München (not Munich), São Paulo (not Sao Paulo), etc.

### 3.4 Romanization is ONLY acceptable when:

- The language has no standardized native-script orthography (rare)
- The language is exclusively written in Latin script (Turkish, Indonesian, etc.)
- The romanization IS the official orthography (e.g., Turkish: İstanbul, not استانبول)

When in doubt, use the native script. The generator can handle Unicode.

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
