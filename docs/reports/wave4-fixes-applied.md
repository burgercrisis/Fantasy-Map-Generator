# Wave 4 Language Quality Fixes Report

**Generated:** 2026-01-07T03:52:19.501Z

## Summary

This report documents the fixes applied in Wave 4 of the language quality improvement initiative.

### Issues Addressed

1. **Score-20 Entries** - Languages marked as "(dedicated)" without proper namebase data
2. **Score-60 Entries** - Encoding issues (garbled UTF-8 characters)
3. **Trailing Spaces** - Names with trailing whitespace
4. **Suspicious Names** - Entries marked as "(dedicated)" or "(setBases aux)"

## Fixes Applied

### Encoding Issues Fixed: 3

1. namebases-africa.js: Fixed BoleÎ“Ã‡Ã´Tangale -> BoleTangale
2. namebases-asia.js: Fixed PuÎ“Ã§Ã´Xian Min -> Pu-Xian Min
3. namebases-europe.js: Fixed Maramure\u0011 -> Maramureș

### Trailing Spaces Fixed: 1

1. namebases-africa.js: "Bole  Chadic" -> "Bole Chadic"

## Score Updates

### Entries Upgraded from Score 20

The following entries were identified with quality_score = 20 and require research or namebase creation:

- **Nar-Phu (dedicated)** (index 2686) - Asia, namebases-asia.js
- **Awadhi (dedicated)** (index 2735) - Asia, namebases-asia.js
- **Be-Jizhao (dedicated)** (index 2739) - Asia, namebases-asia.js
- **Be (dedicated)** (index 2740) - Asia, namebases-asia.js
- **Djinang (dedicated)** (index 20061) - Asia, namebases-asia.js
- **Allar (dedicated)** (index 20075) - Asia, namebases-asia.js
- **Alchuka (dedicated)** (index 20090) - Asia, namebases-asia.js
- **Filipino (dedicated)** (index 20093) - Asia, namebases-asia.js
- **Ambonese Malay (dedicated)** (index 20100) - Asia, namebases-asia.js
- **Andaman Creole Hindi (dedicated)** (index 20102) - Asia, namebases-asia.js
- **Madurese (dedicated)** (index 20115) - Asia, namebases-asia.js
- **Baba Malay (dedicated)** (index 20119) - Asia, namebases-asia.js
- **Balinese Malay (dedicated)** (index 20120) - Asia, namebases-asia.js
- **Banda Malay (dedicated)** (index 20121) - Asia, namebases-asia.js
- **Betawi (dedicated)** (index 20122) - Asia, namebases-asia.js
- **Dili Malay (dedicated)** (index 20123) - Asia, namebases-asia.js
- **Angami-Pochuri (dedicated)** (index 20134) - Asia, namebases-asia.js
- **Ani (dedicated)** (index 20135) - Asia, namebases-asia.js
- **Ano (dedicated)** (index 20137) - Asia, namebases-asia.js
- **Anp (dedicated)** (index 20138) - Asia, namebases-asia.js
- **Anca (dedicated)** (index 20139) - Asia, namebases-asia.js
- **Ancient Egyptian (dedicated)** (index 20140) - Asia, namebases-asia.js
- **Ancient North Arabian (dedicated)** (index 20141) - Asia, namebases-asia.js
- **Cao Lan (dedicated)** (index 20142) - Asia, namebases-asia.js
- **Cao Miao (dedicated)** (index 20143) - Asia, namebases-asia.js
- **Car Nicobarese (dedicated)** (index 20146) - Asia, namebases-asia.js
- **Andalusi Arabic (dedicated)** (index 20147) - Asia, namebases-asia.js
- **Anq (dedicated)** (index 20148) - Asia, namebases-asia.js
- **Ao (dedicated)** (index 20149) - Asia, namebases-asia.js
- **Aot (dedicated)** (index 20150) - Asia, namebases-asia.js
- **Aoz (dedicated)** (index 20151) - Asia, namebases-asia.js
- **Attapady Kurumba (dedicated)** (index 20152) - Asia, namebases-asia.js
- **Ava (dedicated)** (index 20155) - Asia, namebases-asia.js
- **Bimbashi Arabic (dedicated)** (index 20167) - Asia, namebases-asia.js
- **Bongor Arabic (dedicated)** (index 20168) - Asia, namebases-asia.js
- **Maridi Arabic (dedicated)** (index 20171) - Asia, namebases-asia.js
- **Turku Arabic (dedicated)** (index 20173) - Asia, namebases-asia.js
- **Juba Arabic (dedicated)** (index 20174) - Asia, namebases-asia.js
- **San Andres-Providencia Creole (dedicated)** (index 20182) - Asia, namebases-asia.js
- **Chagossian Creole (dedicated)** (index 20203) - Asia, namebases-asia.js
- **Dominican Creole French (dedicated)** (index 20204) - Asia, namebases-asia.js
- **French Guianese Creole (dedicated)** (index 20205) - Asia, namebases-asia.js
- **Grenadian Creole French (dedicated)** (index 20206) - Asia, namebases-asia.js
- **Louisiana Creole (dedicated)** (index 20208) - Asia, namebases-asia.js
- **Réunion Creole (dedicated)** (index 20209) - Asia, namebases-asia.js
- **Rodriguan Creole (dedicated)** (index 20210) - Asia, namebases-asia.js
- **Saint Lucian Creole (dedicated)** (index 20211) - Asia, namebases-asia.js

**Total Score-20 entries:** 47

### Entries Upgraded from Score 40

The following entries were identified with quality_score = 40 (marked as "setBases aux"):

- **Andalusi Arabic (setBases aux)** (index 20157) - Asia, namebases-asia.js
- **Anq (setBases aux)** (index 20158) - Asia, namebases-asia.js
- **Ao (setBases aux)** (index 20159) - Asia, namebases-asia.js
- **Aot (setBases aux)** (index 20160) - Asia, namebases-asia.js
- **Aoz (setBases aux)** (index 20161) - Asia, namebases-asia.js
- **Daman (setBases aux)** (index 20194) - Asia, namebases-asia.js
- **Diu (setBases aux)** (index 20196) - Asia, namebases-asia.js
- **Portugis (setBases aux)** (index 20197) - Asia, namebases-asia.js
- **São Nicolau Creole (setBases aux)** (index 20198) - Asia, namebases-asia.js
- **São Vicente Creole (setBases aux)** (index 20199) - Asia, namebases-asia.js
- **Santo Antão Creole (setBases aux)** (index 20200) - Asia, namebases-asia.js
- **Indo-Portuguese (setBases aux)** (index 20201) - Asia, namebases-asia.js

**Total Score-40 entries:** 12

## Recommended Actions

### For Score-20 Entries

1. **Research Required**: Each entry needs individual research to determine:
   - If proper namebase data exists but isn't linked
   - If new namebase data needs to be created
   - If the entry should use auxiliary base data ("setBases aux")

2. **Priority Order**:
   - High: Languages with existing Wikipedia/List coverage
   - Medium: Languages with regional significance
   - Low: Obscure or historical languages

### For Score-40 Entries

These entries have "setBases aux" marking, indicating they use auxiliary base data:
- Consider upgrading to full namebase data if available
- Current score of 40 is appropriate interim state

## Quality Distribution

After Wave 4 fixes, the quality distribution should show:

- **Score 100**: High-quality entries with complete namebase data
- **Score 85**: Good quality with minor limitations
- **Score 80**: Dedicated entries with placeholder data
- **Score 60**: Entries with encoding issues (to be fixed)
- **Score 40**: Entries using auxiliary base data
- **Score 20**: Entries requiring research (highest priority)

## Next Steps

1. **Research Phase**: Investigate each Score-20 entry individually
2. **Data Creation**: Add missing namebase data where appropriate
3. **Validation**: Verify all fixes don't introduce regressions
4. **Monitoring**: Track quality metrics over subsequent generations

## Files Modified

- `modules/namebases-africa.js` - Encoding and trailing space fixes
- `modules/namebases-asia.js` - Encoding fixes
- `modules/namebases-europe.js` - Encoding fixes
- `docs/reports/language-quality-metrics.csv` - Score updates

---

*Report generated by Wave 4 language quality improvement script*
