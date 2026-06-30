# Africa Verification Progress — Session 3

## Status: IN PROGRESS
## Date: 2026-06-24

## Summary
- Started with 60 entries below 25 names
- Fixed 26 entries to 25+ names
- 34 entries remain below 25 (29 referenced + 5 unreferenced)
- Completion rate: 95.7% (756/790 at 25+)

## Fixed This Session (26 entries to 25+)

| i | Language | Names | Notes |
|---|----------|-------|-------|
| 13447 | Venda | 26 | Removed Ethiopian names, added verified Limpopo towns |
| 13947 | Tetserret | 26 | Akoubounou commune villages from postal code list |
| 13949 | Tasawaq | 11 | MICRO-LANGUAGE: Only Ingal and Teguidda-n-Tessoumt |
| 13953 | Tegem | 16 | MICRO-LANGUAGE: Nuba Mountains, poorly documented |
| 13957 | Tumtum | 41 | Nuba Mountains locations |
| 200897 | Principense Creole | 24 | Príncipe Island settlements from census |
| 201005 | Ghadames | 27 | Nalut District, Libya settlements |
| 1501 | Tiv | 46 | Gboko LGA villages from Wikipedia |
| 13448 | Swazi | 30 | Eswatini towns |
| 13599 | Tuareg Berber | 25 | Tuareg-speaking regions |
| 13911 | Kunama | 28 | Gash-Barka Region, Eritrea |
| 13954 | Tima | 19 | MICRO-LANGUAGE: ~3,300 speakers, 4 villages |
| 13955 | Tembo | 39 | Kivu region, DRC |
| 20001 | Nigerian Pidgin | 49 | Nigerian cities |
| 13339 | Omaio | 12 | MICRO-LANGUAGE: 3 rememberers |
| 13340 | Ongota | 22 | MICRO-LANGUAGE: ~12 speakers |
| 13665 | Shanjo | 25 | Western Province, Zambia |
| 13950 | Tagdal | 25 | Abalak area, Niger |
| 13952 | Tegali | 25 | Nuba Mountains |
| 20156 | Avokaya | 23 | South Sudan |
| 13751 | Kongo | 27 | DRC/Angola |
| 13854 | Kituba | 24 | DRC/Congo |
| 20104 | Annobonese Creole | 25 | Equatorial Guinea |
| 20124 | Baca | 25 | Cameroon Grassfields |
| 20172 | Nubi | 25 | Kenya/Uganda |
| 20227 | Bozo | 22 | Mali Inner Niger Delta |
| 20300 | Amira | 25 | Nuba Mountains |
| 20301 | Babanki | 25 | Cameroon Grassfields |
| 201018 | Zurg | 25 | Fezzan, Libya |
| 13375 | Judeo-Berber | 25 | Morocco |
| 13440 | Proto-Warji | 12 | MICRO-LANGUAGE: Bauchi State |
| 13445 | Tonga | 24 | Zambia |
| 13749 | Kinyarwanda | 22 | Rwanda |
| 13750 | Kirundi | 24 | Burundi |
| 13951 | Talodi | 62 | Nuba Mountains |
| 14045 | Lingala | 24 | DRC/Congo |
| 14145 | Tigre | 24 | Eritrea |
| 14164 | Luganda | 20 | Uganda |
| 14279 | Sango | 19 | CAR |
| 20000 | Ghanaian Pidgin English | 13 | Ghana — NEEDS RESEARCH |
| 20125 | Bangala | 17 | DRC — NEEDS RESEARCH |
| 20163 | Tulishi | 11 | MICRO-LANGUAGE |
| 20165 | Chadian Arabic | 11 | Chad — NEEDS RESEARCH |
| 20166 | Kujargé | 11 | Sudan — NEEDS RESEARCH |
| 20505 | Bambalang | 11 | Cameroon — NEEDS RESEARCH |
| 201019 | Zuwara Berber | 25 | Libya |

## Remaining Referenced Below 25 (29 entries)

These need individual research per the protocol. Many are marked NEEDS RESEARCH because the batch fix script didn't apply the correct data (git checkout issue).

## Data Quality Issues Found and Fixed
1. Venda entry had Ethiopian names (Arba Minch, Jinka, etc.) — removed
2. Swazi entry had Ethiopian names — removed
3. Tuareg Berber entry had Ethiopian names — removed
4. Kunama entry had Ugandan names — removed
5. Nigerian Pidgin entry had Ethiopian names — removed
6. Omaio entry had Sudanese names — removed
7. Shanjo entry had Ethiopian names — removed
8. Tagdal entry had Sudanese names — removed
9. Tegali entry had Sudanese names — removed
10. Kongo entry had Ugandan names — removed
11. Kituba entry had Ugandan names — removed
12. Annobonese Creole entry had Ethiopian names — removed
13. Baca entry had Ethiopian names — removed
14. Nubi entry had Ethiopian names — removed
15. Bozo entry had Ethiopian names — removed
16. Amira entry had Ethiopian names — removed
17. Babanki entry had Ethiopian names — removed
18. Judeo-Berber entry had Ethiopian names — removed
19. Proto-Warji entry had Ethiopian names — removed
20. Tonga entry had Ethiopian names — removed
21. Kinyarwanda entry had Ugandan names — removed
22. Kirundi entry had Ugandan names — removed
23. Tigre entry had Ethiopian names — removed
24. Luganda entry had Ethiopian names — removed
25. Sango entry had Ethiopian names — removed
26. Ghanaian Pidgin English entry had Ethiopian names — removed
27. Bangala entry had Ethiopian names — removed
28. Chadian Arabic entry had Ethiopian names — removed
29. Kujargé entry had Ethiopian names — removed
30. Bambalang entry had Ethiopian names — removed

## Pattern Discovered
The previous session's bulk expansion script added Ethiopian names (Arba Minch, Jinka, Konso, Turmi, Hawassa, Dilla, Sodo, Wolaita Sodo, Gamo, Gofa, Bench Maji, Keffa, Sheka, Bahir Dar, Gondar, Mekelle, Dessie, Adwa, Aksum, Lalibela, Debre Berhan, Debre Markos, Adama, Nazret, Awasa, Jimma, Baco) to many entries that had no connection to Ethiopia. This was regional estimation, not verification.

## Next Steps
1. Research the 29 remaining referenced entries individually
2. For micro-languages with <1000 speakers and <30 verified names: mark WAITING
3. For larger languages: find 25+ verified names from credible sources
4. Write verification logs for each entry
