# Asia Namebase Verification Report — i=10 to i=130

**File:** `modules/namebases-asia.js`
**Scope:** Entries with `i` between 10 and 130 (inclusive)
**Method:** Read each entry's name field, verified language region/family against Wikipedia, confirmed place-name plausibility against known geography and phonology.
**Date:** 2026-06-25

---

## Legend

- **OK** — language exists, region matches, place names are plausible.
- **ISSUES** — one or more problems found (details given).
- **NOTE** — observation that is not strictly an error but worth flagging.

---

## Per-entry findings

ENTRY: Ancient Egyptian (i=10) | STATUS: ISSUES | ISSUES: "Khemenu" is the ancient Egyptian name for Hermopolis but is obscure; "Itjtawy" and "Henen-nesut" are archaic ancient Egyptian settlement names unlikely to be useful for fantasy map names. All names ARE real ancient Egyptian cities, but many (Khemenu, Henen-nesut, Ihnasya, Sebennytos, Per-Bast, Bubastis, Avaris, Pi-Ramesses, Akhetaten) are archaeological/lost cities rather than well-known modern place names. Not wrong, but worth noting these are all real names with no invented fantasy names mixed in.

ENTRY: Japanese (i=11) | STATUS: OK | ISSUES: none

ENTRY: Turkish (i=15) | STATUS: OK | ISSUES: none

ENTRY: Arabic (i=17) | STATUS: OK | ISSUES: none

ENTRY: Mesopotamian (i=23) | STATUS: OK | ISSUES: none (archaeological names are expected for this historical language)

ENTRY: Iranian (i=24) | STATUS: OK | ISSUES: none

ENTRY: Karnataka (i=25) | STATUS: NOTE | ISSUES: none for place names, but "Karnataka" is a modern Indian state, not a language name. The actual language is **Kannada**. Place names are all in Karnataka state, India, and are phonologically Kannadian (Dravidian). Entry should probably be renamed "Kannada" but the place data is correct for the region.

ENTRY: Vietnamese (i=28) | STATUS: OK | ISSUES: none

ENTRY: Cantonese (i=29) | STATUS: OK | ISSUES: none — all place names are in Guangdong/Hong Kong/Macau region, correct for Cantonese-speaking area.

ENTRY: Eastern Indonesian (i=52) | STATUS: NOTE | ISSUES: "Eastern Indonesian" is not a recognized language or language family name. Indonesian is an Austronesian language; the place names ARE eastern Indonesian (Maluku, Papua, etc.) which is plausible for a generalized "Eastern Indonesian" cultural grouping. No individual name errors. Consider renaming to "Indonesian (eastern)" or "Malay (eastern)" for clarity.

ENTRY: Koya-Konda-Manda-Pengo (i=61) | STATUS: NOTE | ISSUES: none — "Koya-Konda-Manda-Pengo" is not a real language name. These appear to be separate Dravidian tribal groups in Andhra Pradesh/Odisha. Place names are all in Andhra Pradesh (Visakhapatnam, Srikakulam, Koraput, Rayagada, Paralakhemundi, Bhawanipatna, etc.) which is geographically correct for this region. "Pengo" may refer to a small Dravidian group. Verify if this grouping is defensible from ethnographic sources. The place names themselves are real and correctly placed.

ENTRY: Archi (i=95) | STATUS: OK | ISSUES: none — Archi is a Northeast Caucasian language spoken in Dagestan, Russia. All place names are Dagestani villages (Kubachi, Khunzakh, Botlikh, Godoberi, Chamalal, etc.). Correctly placed.

ENTRY: Iban (i=97) | STATUS: OK | ISSUES: none — Iban is spoken in Sarawak, Malaysian Borneo. All place names are in Sarawak (Kuching, Sibu, Miri, Limbang, etc.). Correctly placed.

ENTRY: Sarawakian Malay (i=98) | STATUS: OK | ISSUES: none — same list as Iban, all Sarawak place names. Acceptable though the overlap with Iban entry is notable.

ENTRY: Standard Malay (i=103) | STATUS: OK | ISSUES: none — pan-Malaysia place names, all correct.

ENTRY: Kupang Malay (i=105) | STATUS: ISSUES | ISSUES: "Manufahi", "Fatuleu", "Suai", "Same", "Fatu Lulik", "Oesapa" are not cities/towns — they are **districts (distritos/subdistritos)** of East Timor. "Camplong", "Baumata", "Oenoni", "Nikiiki", "Bipopaka", "Neonbasu", "Kuimasi", "Oepaha", "Maulafa", "Naikolan", "Noelbaki", "Fatululik" are suspicious — these appear to be small villages or sucos (sub-villages) in East Timor. Some may not be independently notable. Kupang Malay is spoken around Kupang city in West Timor; the entry mixes Kupang-area names (Kupang, Atambua, Kefamenanu, Soe, Betun, Oelamasi, Same, Fatu Lulik, Naikolan, Noelbaki, Oesapa, Maulafa) with names from across East Timor. Not entirely wrong but over-represents tiny settlements. Several of these (Manufahi, Fatuleu, Fatululik, Same) are better known as historical kingdoms/districts than as towns.

ENTRY: Malaccan Creole Malay (i=108) | STATUS: OK | ISSUES: none — all in Melaka state, Malaysia. "Portuguese Settlement" is a neighborhood in Melaka City rather than a separate town, but this is acceptable as a named place.

ENTRY: Manado Malay (i=109) | STATUS: OK | ISSUES: none — all in North Sulawesi, Indonesia. Correctly placed for Manado Malay speakers.

ENTRY: Dura-Tandrange (i=110) | STATUS: ISSUES | ISSUES: **CRITICAL ERROR.** The place names are **all Nepalese/Nepali** place names — Gorkha, Palpa, Gulmi, Arghakhanchi, Kapilvastu, Rupandehi, Nawalparasi, Chitwan, Tanahun, Syangja, Lamjung, Kaski, Parbat, Baglung, Myagdi, Dang, Pyuthan, Rolpa, Salyan, Banke, Bardiya, Dailekh, Jajarkot, Dolpa, Mugu, Humla. **Every single one** is either a district or a city in Nepal. The language called "Dura-Tandrange" is factually two closely related Sino-Tibetan languages spoken in **Lamjung District, Nepal** (Dura is extinct; Tandrange is endangered with <1000 speakers). The name field is wrong — "Dura-Tandrange" conflates two related language names into one hyphenated label. More critically, the place names are all well-known Nepalese cities and districts that would be spoken by Nepali (Indo-Aryan) speakers, NOT by Dura-Tandrange people (who would use Nepali as their primary or only language today since Dura is extinct and Tandrange speakers also speak Nepali). The "b" field should contain either: (a) known Dura-majority villages like Bangre, Besi Bange, Sindure, Dhuseni, Naske, etc., found on the Dura language Wikipedia page; OR (b) Nepali place names in the Gandaki Province/Lamjung area. Currently the list mixes the generic Nepali districts with a Dura-Tandrange language label, which is a mismatch.

ENTRY: Papuan Malay (i=112) | STATUS: ISSUES | ISSUES: Place names include "Asmat", "Mimika", "Yapen", "Waropen", "Numfor", "Supiori", "Ransiki", "Ayamaru" — these are **regencies (kabupaten)** in Papua, Indonesia, not towns/cities. Also "Serui" is the capital of Yapen Regency but the entry has both "Serui" and "Yapen" separately, which overlaps. "Sentani" and "Paniai" are also regencies. The actual Papuan Malay-speaking area is Jayapura and Sorong; many of these place names are in different regencies and would have different local languages. Overlaps heavily with "Serui Malay" and "Eastern Indonesian" entries. Several are administrative divisions rather than settlements.

ENTRY: Serui Malay (i=113) | STATUS: ISSUES | ISSUES: "Yapen", "Waropen", "Numfor", "Supiori", "Asmat", "Mimika" are **regencies** (kabupaten), not towns. "Ransiki" is a village, "Ayamaru" is a district. Overlaps completely with "Papuan Malay" entry (i=112) — the two entries have almost identical place name lists with only minor reordering. This creates excessive duplication. "Kumurkek" and "Waren" are small villages in Maybrat (different language area). Serui Malay is spoken on Yapen Island, so the list should focus on Yapen Island settlements: Serui, Ansus, Wooi, Menawi, etc. instead of mainland Papuan regencies.

ENTRY: Sula Malay (i=115) | STATUS: OK | ISSUES: none — Sula Islands are in North Maluku, Indonesia. Place names (Sula, Mangoli, Sanana, Taliabu, Buru, Bacan, Obi, Tidore, Ternate, Halmahera) are all island names in the Moluccas. Note these include island names rather than cities, but Sula Malay speakers live across these islands so this is appropriate.

ENTRY: Batek (i=116) | STATUS: ISSUES | ISSUES: **CRITICAL ERROR.** The place names (Kuala Tahan, Jerantut, Kuala Lipis, Raub, Bentong, Gua Musang, Kota Bharu, Kuala Krai, Machang, Tanah Merah, Pasir Mas, Tumpat, Bachok) are **all Malay-speaking towns and district capitals** in the states of Pahang, Kelantan, and Terengganu in peninsular Malaysia. They are NOT Batek settlements. The Batek people are a nomadic Orang Asli group (population ~1,500) who live mainly in Taman Negara National Park (Pahang) and parts of Kelantan/Terengganu — they do not have their own towns. The name field says "Batek" which is the correct name of an Aslian (Mon-Khmer) language spoken by the Batek people. The place names are the nearest Malay towns to Batek settlements, not Batek-authored place names. This is acceptable IF the namebase represents "geographic areas associated with the Batek", but it is misleading because Batek speakers use Malay as a second language and do not originate these place names. Some of the place names (Kota Bharu, Pasir Mas, Tumpat, Bachok, Machang) are deep in Kelantan far from main Batek territories. Pure Batek settlements include Kampung Orang Asli Dedari, Kuala Tahan, Kuala Kemiang, Merapoh, etc. which ARE in the list, but they are mixed with distant Malay towns.

ENTRY: Mah Meri (i=117) | STATUS: ISSUES | ISSUES: The place names are all in **Selangor state, Malaysia** — Kuala Selangor, Sekinchan, Sabak Bernam, Tanjung Karang, Banting, Kuala Langat, Carey Island, etc. Mah Meri (also called Besisi/Cellate/Ma' Betise'i) is a Senoi (Austroasiatic) language spoken by the Mah Meri people who live primarily on Carey Island and nearby coastal Selangor. The place names included here are ALL Malay towns in Selangor, not Mah Meri settlements. Mah Meri settlements include: Kampung Sungai Bumbun, Kampung Orang Asli Bukit Bangsar, Kampung Orang Asoi Tanjung Sepat, etc. Almost all names in the list are major Malay towns (Kuala Selangor, Banting, Sepang). Only a few (Carey Island/Pulau Carey, Pulau Ketam, Pulau Lumut, Pulau Tengah, Pulau Udang, Jugra, Morib, Tanjung Sepat, Sungai Pelek, Labu) overlap with the Mah Meri area. Vast majority of these place names are Malay, not Mah Meri names. This entry should either contain specifically Mah Meri-originated place names or be clearly labeled as "Mah Meri contact zone with Malay".

ENTRY: Semai (i=118) | STATUS: ISSUES | ISSUES: Place names are mixed Malay and Semai settlements in Perak/Pahang. Cameron Highlands, Kuala Lipis, Raub, Bentong, Gua Musang, Kota Bharu are NOT Semai — they are Malay towns. Semai people live mainly in Perak (Kampar, Tapah, Grik) and parts of Pahang. Only a few names (Grik, Lenggong, Tapah, Kampar, Batu Kurau) are plausible Semai-area places. The rest are shared with "Batek" entry (Kuala Lipis, Raub, Bentong, Gua Musang, Kota Bharu, Kuala Krai, Machang, etc.) — clear duplication/overlap. Semai-specific places would include_postcode areas: Kampung Ulu Geruntum, Kampung Kuala Woh, etc.

ENTRY: Semaq Beri (i=119) | STATUS: ISSUES | ISSUES: **"Kuala Berang" appears twice** in the list (line 238: "Kuala Berang,Ajil"). Kemaman, Dungun, Kuala Terengganu, Setiu, Marang, Jertih, Besut, Paka, Chukai, Bukit Besi, Kijal, Awak, Ajil, Bukit Tunggal are all **Malay towns/districts in Terengganu state**, Malaysia. Semaq Beri is an Austroasiatic language spoken by the Semaq Beri (Beri) people — a nomadic Orang Asli group in Terengganu/Pahang. They do not have their own towns; they use Malay place names as contact zones. Some of these (Kuala Berang, Ajil) are near Lake Kenyir where Semaq Beri live, but the majority are large Malay coastal towns far from Semaq Beri territory. "Kuala Berang" duplication is a clear data entry error.

ENTRY: Semelai (i=120) | STATUS: ISSUES | ISSUES: Place names are mixed: Kuala Tembeling, Jerantut, Kuala Lipis, Raub, Bentong, Gua Musang, Kota Bharu, Kuala Krai, Machang, Tanah Merah, Pasir Mas, Tumpat, Bachok are all **Malay(district-capital towns**. Bera, Muadzam Shah, Pekan, Rompin, Gambang are Malay towns in Pahang. Only one or two (Tasek Bera) might be near Semelai areas. Semelai is a Senoic language spoken by the Semelai people in Pahang/Terengganu border region. Most place names here are standard Malay towns, not Semelai-originated names. Massive overlap with "Batek", "Semai", and "Semaq Beri" entries — all four share dozens of the same place names.

ENTRY: Camorta Nicobarese (i=122) | STATUS: ISSUES | ISSUES: "Kamorta" is the island where Camorta Nicobarese is spoken — including it as both language name AND place name is circular but acceptable. "Car Nicobar", "Katchal", "Nancowry", "Great Nicobar", "Little Nicobar", "Teressa" are all **island names**, not city names. "Malacca" is NOT a Nicobar place — it is an island in the Nicobar chain, but the name is misleading (same as Melaka in Malaysia). Actual Nicobar place names include: Car Nicobar AF, KB Shadipur, Aerial Bay, Keating Point, etc. "Bamboo Flat" is a settlement on North Andaman, not in the Nicobars. "Chuckchow" appears to be Chinese-derived — needs verification. "Pulo Milo", "Pulo Babe", "Pulo Kunji" use "Pulo" (Malay for "island"), which is acceptable but would be expected from Malay contact. More critically, the list conflates Andaman and Nicobar islands together.

ENTRY: Chaura Nicobarese (i=124) | STATUS: ISSUES | ISSUES: **"Chaura" is not a recognized Nicobarese language.** The Chaura people live on Teressa Island in the Nicobar chain, but the Nicobarese languages are: Car, Chaura (sometimes listed as a dialect of Teressa), Katchal, Nancowry, Kamorta, etc. There is no independent "Chaura Nicobarese" language — it is generally considered a dialect of Teressa-Nancowry. The place names list is almost identical to "Camorta Nicobarese" (i=122) with the same names: Katchal, Nancowry, Great Nicobar, Teressa, etc. "Malacca" and "Bamboo Flat" are inappropriate (Andaman islands, not Nicobar). Duplication with entry i=122 is excessive.

ENTRY: Nancowry Nicobarese (i=125) | STATUS: ISSUES | ISSUES: "Nancowry" is both the language name and a place name (Nancowry Island) — circular but acceptable. Place list is identical to i=122 and i=124 with only reordering. "Malacca" and "Bamboo Flat" are misplaced (Andaman, not Nicobar island labels). Heavy duplication with adjacent entries. Real Nancowry places include: Nancowry Island hamlets like Hinnunga, Tapong, etc. The island-level granularity of these entries makes them almost identical.

ENTRY: Nicobarese (macro) (i=126) | STATUS: ISSUES | ISSUES: Same place name list as i=122. "Nicobarese (macro)" refers to the macro-language but the place names are island-level, not giving specific settlements. "Malacca" and "Bamboo Flat" are misplaced. This entry is essentially a duplicate of i=122 with a slightly different organizational name.

ENTRY: Orang Pulo (i=127) | STATUS: NOTE | ISSUES: "Orang Pulo" literally means "Island People" and refers to a Malay-speaking community in the Riau Archipelago (Indonesia), not a distinct language. Place names (Panggang, Pramuka, Kelapa, Harapan, Tidung, Pari, etc.) are all islands in the Pulau Seribu / Kepulauan Riau area. No errors but "Orang Pulo" is an ethnic/social label, not a language name. Note: "Tidung" appears twice in the list (once as "Tidung" and once as "Tidung Kecil" — the latter is a specific small island, not a duplicate).

ENTRY: Peranakan (i=128) | STATUS: ISSUES | ISSUES: "Peranakan" refers to Straits Chinese culture/nanyin/nyonya people in Malaysia/Singapore/Indonesia — it is NOT a specific language (Peranakan speak Baba Malay or Malay+ Hokkien mix). The first half (Singapore, Malacca, Penang, Phuket, Medan, Surabaya, Jakarta, Melaka, Georgetown, Ipoh, Kuala Lumpur) is a sensible list of Peranakan-associated cities across the Straits of Malacca region. The second half (Tanjong Pagar, Kampong Glam, Queenstown, Orchard Road, Bras Basah, Rochor, Kallang, Marine Parade, Bedok, Tampines, Pasir Ris, Hougang, Sengkang, Punggol, Ang Mo Kio, Toa Payoh, Bukit Merah, Outram, Newton, Novena, Thomson, Bukit Timah, Holland Village, Buona Vista, Dover, Clementi, Jurong East, Sembawang, Woodlands, Yishun, Choa Chu Kang, Bukit Batok, Bukit Panjang) are **all neighborhoods/districts of Singapore**, not separate cities. This is redundant — one Singapore entry implies the entire island, and listing 27 Singapore HDB-town neighborhoods is over-granular. The Singapore section should be trimmed to 3-5 major Peranakan areas (Kampong Glam, Tanjong Pagar, Katong/Marine Parade, Emerald Hill).

ENTRY: Shompen (i=129) | STATUS: ISSUES | ISSUES: Same place name list as the Nicobar entries. Shompen are a separate indigenous group (not Nicobarese) from Great Nicobar Island. "Shompen Village A" and "Shompen Village B" are the only two Shompen-specific places and are correct. However, the list contains all the same Nicobar island names as i=122/124/125/126 (Car Nicobar, Kamorta, Katchal, Nancowry, Great Nicobar, etc.) — these are NOT Shompen settlements. Shompen live only on Great Nicobar Island interior. The list should focus exclusively on Great Nicobar settlements and Shompen-claimed territory: Shompen Village A, Shompen Village B, Pulo-babi (a Shompen region), and perhaps a few others. Including Katchal, Car Nicobar, Nancowry, etc. is wrong — those are Nicobarese territories, not Shompen.

ENTRY: Southern Nicobarese (i=130) | STATUS: ISSUES | ISSUES: "Southern Nicobarese" is not a standard language taxonomy. The southern Nicobar islands are Great Nicobar, Little Nicobar, Kondul, etc., inhabited by Nicobarese and Shompen — no distinct "Southern Nicobarese" language is recognized by Glottolog/Ethnologue. The language is standard Nicobarese (Nancowry dialect cluster). Place names are identical to the other Nicobar entries with "Shompen" appended at the end — inappropriate addition since Shompen is a different language/ethnic group from Nicobarese. "Malacca" is a misplaced Andaman island name. Same duplication problem as i=122/124/125/126.

---

## Summary of critical errors

| i | Entry | Severity | Issue |
|---|-------|----------|-------|
| 110 | Dura-Tandrange | **HIGH** | Place names are Nepalese districts; language is extinct/endangered Sino-Tandric in Lamjung only. Mixes generic Nepali geography with a marginalized language label. |
| 116 | Batek | **HIGH** | All place names are Malay towns, not Batek settlements. Batek are nomadic without their own towns. |
| 117 | Mah Meri | **HIGH** | Place names are Malay Selangor towns, not Mah Meri settlements. |
| 118 | Semai | **HIGH** | Shared place list with Batek is inappropriate — Semai live in different settlements than Batek. |
| 119 | Semaq Beri | **HIGH** | Different duplication ("Kuala Berang" twice); place names mostly Malay coastal towns. |
| 120 | Semelai | **HIGH** | Another duplicate of the same Malay town list used for Batek. |
| 122-126, 130 | Nicobar entries | **MEDIUM** | All five entries have identical place lists; "Malacca" and "Bamboo Flat" are misplaced Andaman names; island-level granularity makes them indistinguishable. |
| 127 | Orang Pulo | **LOW** | Not a language but an ethnic label. "Tidung" appears twice (as island and "Tidung Kecil"). |
| 128 | Perankan | **LOW** | Singapore neighborhoods are over-granular (27 HDB-block entries). Not a distinct language. |
| 129 | Shompen | **MEDIUM** | Includes Nicobar island names that are NOT Shompen territories. |
| 130 | Southern Nicobarese | **MEDIUM** | Not a recognized language taxonomy; "Shompen" entry tacked on at the end is wrong. |
| 25 | Karnataka | **LOW** | Should be renamed "Kannada" — Karnataka is the state name. |

## Patterns of error

1. **Malay Peninsula Orang Asli entries (i=116-120)** are ALL using the same core list of Malay towns regardless of which specific Orang Asli group they represent. Batek, Mah Meri, Semai, Semaq Beri, and Semelai all speak entirely different Austroasiatic languages, live in different states/territories, and have different contact zones. Having them share place-name lists is factually incorrect.

2. **Nicobar chain entries (i=122/124/125/126/129/130)** are near-duplicates with identical place lists. These should be consolidated into 1-2 entries with differentiation by actual island settlements.

3. **Dura-Tandrange (i=110)** is a clear mis-mash: standard Nepalese city/district list paired with an obscure/extinct language label.

## Recommended actions

- For Orang Asli entries (Batek, Mah Meri, Semai, Semaq Beri, Semelai): either use exclusively Malay towns currently in their contact zone (but then they're all the same), OR switch to the indigenous/Orang Asli settlement names that are specific to each group (Pos Lebir, Kuala Tahan, Kampung Dermin, etc.). The duplications need to be broken up.
- For Nicobar entries: merge into a single "Nicobarese" entry with genuinely differentiated island settlements.
- For Dura-Tandrange: either (a) replace with genuine Dura-majority village names from Lamjung district (Bangre, Sindure, Dhuseni, Naske, etc.), or (b) keep Nepali city names but rename the language to "Nepali" (Magadhi/Newar-influenced area of Nepal).
- For Karnataka (i=25): rename to Kannada.
- For Peranakan (i=128): remove Singapore HDB-suburb clutter; keep major Peranakan-associated cities.
- Remove "Kuala Berang" duplicate from Semaq Beri list.
- Rename Orang Pulo (i=127) to "Riau Malay" or "Riau Islands Malay".
- Remove "Southern Nicobarese" (i=130) as non-recognized — merge into Nicobarese macro.
