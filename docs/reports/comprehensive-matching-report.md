# Comprehensive Matching Analysis Report

**Generated:** 2026-01-05T03:43:15.465Z
**Task:** C4d

## Executive Summary

| Metric | Value |
|--------|-------|
| Overall Match Rate | 32.4% |
| Exact Match Rate | 0.0% |
| Coverage Rate | 23.9% |
| Unused Mixer Entries | 76.1% |

## Detailed Statistics

### Totals
- **Continent Entries:** 2,594
- **Mixer Entries:** 3,526
- **Successfully Matched:** 841
- **Missing from Mixer:** 1,753
- **Unused in Mixer:** 2,685

## Naming Pattern Analysis

### Case-Insensitive Match Patterns
- **title_case:** 759 occurrences
- **suffix:an:** 98 occurrences
- **hyphenated:** 85 occurrences
- **suffix:ian:** 50 occurrences
- **suffix:ese:** 48 occurrences
- **suffix:ic:** 20 occurrences
- **suffix:ish:** 11 occurrences
- **suffix:al:** 8 occurrences
- **all_caps:** 2 occurrences

## Recommendations

### 1. Case-insensitive matches detected
**Priority:** MEDIUM

**Description:** Some languages match only when case is ignored

**Recommendation:** Implement case-insensitive matching as fallback

**Affected Entries:** 841

### 2. Unmatched languages with "ese" suffix
**Priority:** MEDIUM

**Description:** 24 languages with ese suffix don't match

**Recommendation:** Implement suffix-stripping logic for ese endings

**Affected Entries:** 24

### 3. Unmatched languages with "ish" suffix
**Priority:** MEDIUM

**Description:** 26 languages with ish suffix don't match

**Recommendation:** Implement suffix-stripping logic for ish endings

**Affected Entries:** 26

### 4. Unmatched languages with "ian" suffix
**Priority:** MEDIUM

**Description:** 30 languages with ian suffix don't match

**Recommendation:** Implement suffix-stripping logic for ian endings

**Affected Entries:** 30

### 5. Unmatched languages with "an" suffix
**Priority:** MEDIUM

**Description:** 57 languages with an suffix don't match

**Recommendation:** Implement suffix-stripping logic for an endings

**Affected Entries:** 57

### 6. Unmatched languages with "ic" suffix
**Priority:** MEDIUM

**Description:** 37 languages with ic suffix don't match

**Recommendation:** Implement suffix-stripping logic for ic endings

**Affected Entries:** 37

### 7. Unmatched languages with "al" suffix
**Priority:** MEDIUM

**Description:** 12 languages with al suffix don't match

**Recommendation:** Implement suffix-stripping logic for al endings

**Affected Entries:** 12

### 8. Low overall match rate
**Priority:** HIGH

**Description:** Only basic string matching implemented

**Recommendation:** Implement ISO code matching and fuzzy matching algorithms

**Affected Entries:** all_unmatched

## Sample Data

### Sample Unmatched Continent Entries
| Name | Index | Continent |
|------|-------|----------|
| Berber | 16 | africa |
| Arabic | 17 | africa |
| Nigerian | 20 | africa |
| Swahili | 27 | africa |
| Bemba-Bembe-Fwe | 81 | africa |
| Berta-Besme | 137 | africa |
| Cameroonian Pidgin | 246 | africa |
| Cameroonian Pidgin English | 247 | africa |
| BoleÎ“Ã‡Ã´Tangale | 248 | africa |
| Tangale | 249 | africa |
| Dangaleat | 250 | africa |
| West African English Creole | 307 | africa |
| Harari-Argobba | 312 | africa |
| Hadza Click | 363 | africa |
| Bauchi Chadic | 385 | africa |

