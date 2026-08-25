# Oceania Namebase Verification — Final Status

**Date:** 2026-08-25
**Agent:** Oceania Verification
**Status:** COMPLETE — All entries processed

## Summary

| Status | Count | % |
|--------|-------|---|
| COMPLETE | 282 | 81.0% |
| WAITING (cover terms) | 66 | 19.0% |
| **Total** | **348** | **100%** |

## Removed Entries (44)

Per user request, 44 single-language entries with fewer than 25 publicly verifiable toponyms have been **REMOVED** from the namebase file. Per Rule 5b of the verification protocol, these languages could not be completed without native-speaker fieldwork or unpublished SIL archives.

### Removed Single Languages:
50023 (Aimele), 200537 (Ambakich), 201053 (Hoia Hoia), 201054 (Isbukun Bunun), 201058 (Kaguel), 201059 (Kainantu), 201061 (Kanakanavu), 201062 (Kawacha), 201063 (Kayagar), 201082 (Mantauran Rukai), 201084 (Mapena), 201085 (Maria), 201087 (Maring), 201089 (Menya), 201107 (Namumi), 201110 (Nawaru), 201114 (Nemi), 201118 (Nggem), 201121 (Nomane), 201125 (Oirata), 201128 (Omati), 201129 (Onjob), 201130 (Onobasulu), 201131 (Ontenu), 201173 (Bogaya), 201174 (Sonia), 201175 (Sonsorolese), 201180 (Susuami), 201181 (Tainae), 201190 (Tembagla), 201195 (Tobian), 201196 (Tokano), 201199 (Tsaukambo), 201201 (Turaka), 201204 (Uare), 201205 (Umanakaina), 201210 (Waffa), 201222 (Western), 201229 (Yagwoia), 201230 (Yali), 201232 (Yareba), 201233 (Yaweyuha), 2271 (Kosraean)

## Remaining WAITING Entries (66)

All 66 remaining WAITING entries are **language families, cover terms, or regions** per Rule 4. These are not single languages and cannot have `b:` fields filled. Examples:
- Engan Papuan, Dani Papuan (language families)
- Micronesian, Melanesian Vanuatu (regional groupings)
- Malayo-Polynesian, Western Malayo-Polynesian (major families)
- Minahasan, Sangiric, Kayan-Murik, etc. (language groups)
- North Borneo, South Sulawesi, New Caledonia (regions)

## COMPLETE Entries (282)

All 282 COMPLETE entries have individually verified toponyms with documented sources. This session's additions:
- **ꞌAreꞌare (i=201240)**: 25 verified villages in Solomon Islands (Kiu, Hauporo, Kopo, Waisisi, Surairo, Hunanahara, Takataka, Masupa, Arakao, Maniaha, Wara, Poe, Rara, Aiarai, Simeruka, Tawaihi, Hautahe, Wairokai, Marau, Hatere, Aluta, Aisato, Walande, Rohinari, Pipisu)
- **Kyaka (i=2303)**: Cleaned contaminated b: field (had admin units, geographic features)

## Validation
- `pnpm mixer:guardrails` ✅ PASSED (map=3425 catalog=3526)
- No new errors introduced
- File integrity verified

## Conclusion

The Oceania namebase is now in its cleanest possible state:
- 282 COMPLETE entries with verified toponyms
- 66 WAITING entries that are correctly classified as cover terms/regions (cannot be filled)
- 44 entries removed (single languages with insufficient public documentation)

No padding with unverified names was performed. All edits followed the verification protocol strictly.
