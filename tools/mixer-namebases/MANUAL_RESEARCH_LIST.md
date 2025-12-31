# Manual Research List - Language Authenticity Verification

Generated: 2025-12-24

## Executive Summary

- **Total Languages Analyzed**: 2,499
- **High Priority**: 101 languages (Immediate Action Required)
- **Medium Priority**: 68 languages (Review Recommended)
- **Likely Legitimate**: 2,330 languages (Filtered Out)

---

## 🔴 High Priority - Immediate Action Required

### Issue: Primus Placeholders (101 languages)

These languages contain only "Primus" placeholder placenames and need authentic placenames added from their actual geographic ranges.

#### Research Priority Categories:

**Well-documented languages (quick wins):**
- Nahuatl, Mayo, O'odham, Pima Bajo, Tarahumara - Mexican indigenous languages
- Chakato - Southeastern US
- Chaldean Neo-Aramaic - Iraq/Middle East
- Chamdo, Tibeto-Kanauri, Western Himalayas - Himalayan region

**Asian language varieties (need geographic research):**
- Japanese regional lects, Amami, Okinoerabu, Tokunoshima, Miyakoan, Ryukyuan - Japan
- Mao-Omotic, North Omotic, Ometo - Ethiopia/Africa

**African languages (need verification + geographic data):**
- Piapoco, Ter├¬na, Wapishana - South America
- Chepangic, Chhattisgarhi, Chiang Saen - South/SE Asia

**Possible typo/fake (verify first):**
- Chichewa, Chimbu - May be legit (Chewa, Chimbu)
- Fut - Too generic, verify authenticity
- Soninke, Chung, Dciriku - Verify on Glottolog

**D-series languages (suspicious single letters + D):**
- Daba, Dadanitic, Daga, Dagur, Dahalik, Dai Zhuang, Damu, Dani, Dano, Dao, Dap, Dargwa, Dari, Darkhad, Dass language, Daza, Dazawa language, Ddo, Deh

#### Action Plan:

1. **Batch 1 - Quick Wins (Day 1)**: Research well-documented languages on Wikipedia and add 8-12 authentic placenames each
2. **Batch 2 - Asian Varieties (Day 2-3)**: Use Japanese/Asian geographic databases to add regional placenames
3. **Batch 3 - African Languages (Day 4)**: Verify authenticity on Glottolog, then research geographic ranges
4. **Batch 4 - D-series (Day 5)**: Verify authenticity - delete obvious typos, research legit ones

#### Research Sources:
- Wikipedia: "List of [language] placenames" or "[Language] language"
- Ethnologue: https://www.ethnologue.com/
- Glottolog: https://glottolog.org/
- GeoNames: https://www.geonames.org/

---

## 🟡 Medium Priority - Review Recommended

### Issue: UTF-8 Encoding Issues (40+ languages)

These languages have Mojibake (encoding corruption) in placenames or language names.

**Examples:**
- "Cavineña" → "Cavineña" (Latin characters with accents)
- "Yuracaré" → "Yuracaré"
- "Dür-gurgurri" → "Dür-gurgurri" (Mesopotamian)
- Click languages: ╟éx├áa, ╟éx├ía, ╟éx├óa (need proper Unicode)

**Action:**
1. Manually fix UTF-8 encoding issues in `namebases-real.js`
2. For click languages, use proper IPA/Unicode characters
3. Test rendering in browser after fixes

### Issue: Unknown Patterns (20+ languages)

Languages without clear geographic patterns or obvious issues - need manual verification.

**Examples:**
- Newfoundland French - Verify region and authentic placenames
- Besme - Check if real African language
- Judeo-Berber - May be legitimate, verify
- Jamaican Maroon Creole - Likely legit, verify range
- Qau - Too short, verify authenticity

**Action:**
1. Cross-reference with Glottolog/Ethnologue
2. If not found, mark for deletion
3. If found, add to geographic database

---

## 🟢 Likely Legitimate - Low Priority

**2,330 languages filtered out** because they have clear, legitimate placename patterns:

### Examples with Authentic Patterns:

**Germanic Europe (German, Nordic, Lechitic, etc.):**
- Suffixes: -berg, -burg, -heim, -dorf, -hausen, -stadt, -tal, -wald
- Example: Aichhalden, Albbruck, Alpirsbach (German)

**Celtic/English (English, Irish Gaelic, Scottish Gaelic):**
- Suffixes: -bury, -ford, -ham, -ton, -wich, -wick, -pool, -mouth
- Example: Abingdon, Albrighton, Alcester (English)

**Romance (French, Italian, Spanish, Portuguese):**
- French/Italian: -ville, -ano, -iano, -eto, -elle, -ello
- Spanish/Portuguese: -a, -o, -al, -ar, -illo, -eda
- Example: Abrigada, Afonsoeiro (Portuguese), Aillant, Amilly (French)

**Slavic (Czech-Slovak, Bulgarian, Ukrainian):**
- Suffixes: -ow, -ovo, -ice, -any, -w, -ca, -grad, -sk
- Example: Warszawa, Poznan, Gdansk (Polish/Lechitic)

**East Asian (Chinese, Japanese, Korean, Vietnamese):**
- Chinese: -zhou, -ning, -shan, -jiang, -an
- Japanese: -mura, -machi, -kawa, -yama, -zawa
- Korean: -ri, -san, -gun, -myeon, -eup, -si
- Vietnamese: Multi-word province/district names
- Example: Anding, Anlu, Anqing (Chinese)

**African (Nigerian, Swahili, Berber):**
- Niger-Congo: -ka, -na, -wa, -ro, -go, -pe
- Berber: -gar, -ara, -ama, -la, -za, -ou
- Swahili: -a, -i, -u, -o, -ea, -ko
- Example: Abadogo, Adealesu (Nigerian)

**These languages DO NOT need verification.** Their placenames follow authentic linguistic patterns for their regions.

---

## Research Action Plan

### Phase 1: High Priority (Days 1-5)

| Batch | Languages | Est. Time | Action |
|-------|-----------|------------|--------|
| 1 | 20 quick wins | 3 hrs | Add placenames from Wikipedia lists |
| 2 | 30 Asian varieties | 6 hrs | Research Japanese/Asian regional databases |
| 3 | 30 African languages | 6 hrs | Verify + research on Glottolog |
| 4 | 21 D-series | 3 hrs | Verify authenticity, delete typos |

### Phase 2: Medium Priority (Days 6-7)

| Task | Est. Time | Action |
|------|------------|--------|
| Fix UTF-8 Mojibake | 2 hrs | Manual encoding repair |
| Verify unknown patterns | 4 hrs | Cross-reference with language databases |

### Phase 3: Quality Check (Day 8)

- Run verification script again
- Confirm all Primus placeholders replaced
- Verify no encoding issues remain
- Test map generation

---

## Tools and Resources

### Verification Scripts

1. **generate-manual-research-list.js** - Generates this prioritized list
2. **verify-language-geographic-simple.js** - Verifies placenames against geographic ranges
3. **verify-language-authenticity.js** - Original authenticity checker

### Language Databases

- **Glottolog**: https://glottolog.org/ - Linguistic database
- **Ethnologue**: https://www.ethnologue.com/ - Language classification
- **ISO 639**: https://www.sil.org/iso639-3/ - Language codes
- **Wikipedia**: Comprehensive language and geographic information

### Geographic Databases

- **GeoNames**: https://www.geonames.org/ - 11M+ place names
- **OpenStreetMap**: https://www.openstreetmap.org/ - Open mapping data
- **Wikipedia**: "List of [region] cities/towns/villages"

---

## Decision Tree for Suspect Languages

```
Is language in Glottolog?
├─ NO → DELETE (likely fake/typo)
└─ YES
    ├─ Has legitimate placename patterns? → KEEP, verify geography
    └─ No placenames (Primus only)? → ADD authentic placenames
```

---

## Output Files

- **manual-research-list.json** - Full structured data (JSON)
- **MANUAL_RESEARCH_LIST.md** - This human-readable summary

---

## Notes

- 93% of languages (2,330/2,499) are **likely legitimate** and don't need verification
- Focus research efforts on the 4% high-priority and 3% medium-priority items
- Most "suspicious" flags are actually Primus placeholders, not fake languages
- Encoding issues are technical problems, not authenticity issues
