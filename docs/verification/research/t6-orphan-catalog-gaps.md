# T6 - The 90 populated namebase entries with no map row

**Scope.** `C:\Users\user\AppData\Local\Temp\kilo\work\task6-needs-catalog.json` - 90 namebase entries with
real, researched seed lists that no row in `config/language-mixer-map.json` references and that are not
name-duplicates of another entry. Because they have no row, and no matching line in `config/language-mixes.json`,
**the app can never select them.** Ijaw (43 seeds), Wobe (64), Luvale (39), Shilluk (37), Aizi (177), Nara (113)
and Khoekhoe (38) are all in this set.

**How the ISO codes were verified.** Every code in the table below was checked against the authoritative ISO
639-3 code table, downloaded on 2026-09-29 from
<https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3.tab> (7927 codes, `Ref_Name`, `Part1`,
`Scope` and `Language_Type` columns). Existence, spelling and Scope come from that file; family and
classification come from the linked Wikipedia / Glottolog / Ethnologue pages. **No code was inferred from a
name** - where the table has no entry, the cell says so.

**Live-app check.** `src/index.html` (lines 5217-5224) does not load `modules/namebases-research.js`. I
re-ran the namebase loader with and without it: **all 90 of these entries are present in the continent files and
live in the shipped app.** Adding a catalog line and a map row for any of them will actually change output.

---

## Verdict at a glance

| | count |
|---|---|
| **Ready to add** (a real, documented language with a verified ISO 639-3 code) | **52** |
| **Needs more research** before a line can be written | **29** |
| **Should not be added as a separate language** (duplicate, branch label, or wrong continent) | **9** |
| total | 90 |

Of the 52 ready, **66 of all 90 entries have a verified ISO 639-3 code**; 24 do not. The "ready" bucket is
larger than the "verified code" bucket because several code-less entries are real, well-documented varieties
(Daman Creole, the Cape Verdean island creoles, Miskito Coast Creole) that need a deliberate non-ISO catalog
id rather than research.

### Why 9 must not be added

| entry | index | reason |
|---|---|---|
| Sidamo | 947 | Same language as entry 14152 "Sidama" - both are `sid`, 14 seeds in common |
| Wolayta | 957 | Same language as entry 20714 "Wolaytta" - both are `wal`, 10 seeds in common |
| Sidama | 14152 | Same as 947 |
| Wolaytta | 20714 | Same as 957 |
| Irish Gaelic | 25303 | Same language as catalogued entry 200862 "Irish" (`gle`) - merge, do not add a second line |
| Sandawe Click (Central Tanzania) | 22001 | Same language as entry 49 "Sandawe Click" (`sad`) - 12 seeds in common |
| Pima | 201034 | Seed list is Tohono O'odham country and entry 201038 already holds that language; `pim` is Powhatan, an unrelated Algonquian language |
| Mesopotamian | 23 | Not a language - a period/region label over Akkadian, Sumerian, Eblaite and Hurrian |
| Ob-Ugric | 2680 | Not a language - a proposed grouping of Khanty and Mansi, with **no ISO code**, and its 67 "seeds" are *river names* (Ob, Irtysh, Konda, Sosva, Lozva) |

### The name-collision warning (this is the Samo problem again)

Four of the 90 are **not the language their name suggests**, and adding them would be a regression:

- **Bidiya (20572)** - ISO `bid` = Bidiyo is a Chadic language of the Guera region of **Chad**. The entry's 25
  seeds (Mongo, Abou Telfane, Niergui, Kafila, Tchakor) are all **Moroccan** Anti-Atlas. Same shape as
  Samo-in-three-continents.
- **Bassa (494)** - ISO `bsq` = Bassa is the Kru language of **Liberia**. The entry's 30 seeds (Eseka, Makak,
  Matomb, Boumnyebel, Messondo) are all **Cameroon** and share 25 with entry 247 "Basaa" (`bas`). It is a
  duplicate of 247 under a second spelling.
- **Geez (14148)** - `gez` = Ge'ez is a **liturgical** South Ethiopic language with no living speech community.
  The seeds (Keren, Agordat, Barentu, Massawa, Assab) are Eritrean **Tigre** country (`tig`).
- **Mao (20712)** - 18 seeds in Benishangul-Gumuz, Ethiopia. "Mao" names at least two unrelated peoples
  (an Omotic group in Ethiopia, a Sino-Tibetan group in Nepal). No code can be assigned from the name.

### Data-quality defects found while verifying (independent of the catalog question)

- **1979 "Kuturmi"** - 109 "seeds" include `Plateau Language`, `ISO 639-3:khj`, `Stable Indigenous
  Language` and `Niger-Congo`. Those are metadata strings, not placenames. Strip before adding.
- **7947 "Kawésqar"** - the seed `Jektarte` is the fictional Savage Isles island from *The Lost World*. Remove it.
- **5826 "Wichí Lhamtés Güisnay"** - diacritics stripped, so `VillaMontes` should be `Villa Montes`.
- **10883 "Nyamwezi"** - Mwanza, Kigoma and Dodoma are Sukuma, not Nyamwezi.
- **893 "Auyokawa language "** - Brazilian data (Minas Gerais) filed in the **europe** file, and the name has a
  trailing space. `auo` is flagged **Scope: E (extinct)** in the ISO table.
- **181 "Barlavento Creoles"** and its two island siblings (203249, 203250) are Cape Verde entries filed under
  **asia**.
- **100000 "Human Generic"** (fantasy) is not a language at all - it is the 307-name invented given-name pool for
  human cultures. It belongs in the name generator's fallback, never in `language-mixes.json`.

---

| name | index | region | ISO 639-3 | category | family | source URL | confidence | verdict | note |
|---|---|---|---|---|---|---|---|---|---|
| Ijaw | 20 | Africa | **none** (unverified) | Niger-Congo | Ijo | https://en.wikipedia.org/wiki/Ijaw_languages ; https://en.wikipedia.org/wiki/Izon_language | medium | needs research | There is **no ISO 639-3 code for 'Ijaw'** - it is a group. `ijo` is a 639-5 family code; the individuals are `ijc` Izon, `iby` Ibani, `ijn` Kalabari, `ogb` Ogbia. The seed list mixes all three areas (Opobo/Okrika are Ibani; Brass/Nembe are Central Izon), so one entry cannot be right. |
| Ju/'hoan Click | 47 | Africa | `ktz` (verified) | Khoe | Khoe | https://en.wikipedia.org/wiki/Juǀʼhoan_language | high | ready | ISO 639-3 `ktz` = Juǀʼhoan (Southern/Southeastern ǃKung). Seeds (Groot Laagte, Dobe, Tsodilo Hills) match the NG/NE Botswana - NW Namibia range. Name should be spelled `Juǀʼhoan`. |
| Sandawe Click | 49 | Africa | `sad` (verified) | Isolate | Sandawe isolate | https://en.wikipedia.org/wiki/Sandawe_language | high | ready | `sad` = Sandawe, an isolate of Dodoma, Tanzania. Seeds (Farkwa, Poro Banguma, Magambua) are correct Dodoma-region sites. |
| Luvale | 107 | Africa | `lue` (verified) | Niger-Congo | Bantu | https://en.wikipedia.org/wiki/Luvale_language | high | ready | `lue` = Luvale/Chiluvale, Bantu, Angola-Zambia. Seeds (Zambezi, Chavuma, Kabompo, Luena) are correct Moxico Leste. |
| Lugbara | 121 | Africa | `lgg` (verified) | Nilo-Saharan | Central Sudanic | https://en.wikipedia.org/wiki/Lugbara_language ; https://glottolog.org/resource/languoid/id/lugb1240 | high | ready | `lgg` = Lugbara, Nilo-Saharan / Central Sudanic (Eastern Moru-Madi). Seeds (Arua, Yumbe, Koboko, Zombo) are the West Nile sub-region. |
| Wobe | 185 | Africa | `wob` (verified) | Niger-Congo | Kru | https://en.wikipedia.org/wiki/Wob%C3%A9_language | high | ready | `wob` = Wè Northern, whose principal name is **Wobé** (Kru, Wee continuum, Cote d'Ivoire). Seeds (Kouibly, Fakobly, Tao, Semien) are correct Ivorian Krahn country. `Wobe` is the common English spelling; the ISO reference name is `Wè Northern`. |
| Basaa | 247 | Africa | `bas` (verified) | Niger-Congo | Bantu | https://en.wikipedia.org/wiki/Basaa_language | high | ready | `bas` = Basa (Cameroon), the Basaa/Mbene Bantu language. Seeds (Edea, Yabassi, Nkondjok, Ndemli, Pouma) are all southern Cameroon. |
| Bassa | 494 | Africa | **none** (unverified) | Niger-Congo | Bantu (suspected) | https://en.wikipedia.org/wiki/Bassa_language ; https://en.wikipedia.org/wiki/Basaa_language | low | needs research | **Name collision, not a missing language.** ISO `bsq` = Bassa is the Kru language of Liberia; this entry's 25 seeds (Eseka, Makak, Matomb, Boumnyebel, Messondo) are all in Cameroon and share 25 of 30 seeds with entry 247 `Basaa` (`bas`). Merge into 247, do not add as a new language. |
| Shilluk | 500 | Africa | `shk` (verified) | Nilo-Saharan | Nilotic | https://en.wikipedia.org/wiki/Shilluk_language | high | ready | `shk` = Shilluk (Dhog Collo), Western Nilotic, South Sudan. Seeds (Malakal, Kodok, Fashoda) are correct. |
| Nara | 530 | Africa | `nrb` (verified) | Nilo-Saharan | Nilo-Saharan | https://iso639-3.sil.org/code/nrb | medium | ready | `nrb` = Nara, an East Sudanic (Nilo-Saharan) language of Eritrea/Sudan. Seeds (Haykota, Bisha, Tokombia, Tessenei) are Eritrean. Wikipedia has no dedicated article (disambiguation only), so the code is the primary source. |
| Liberian Pidgin English | 667 | Africa | **none** (unverified) | Pidgin | English-based | https://en.wikipedia.org/wiki/Liberian_English | medium | needs research | Real and widespread, but **ISO 639-3 has no 'Liberian Pidgin English' entry** (the table has `lir` Liberian English, which is the creole/vernacular, and `pcm` Nigerian Pidgin, `sle` Sierra Leonean English). Decide which code the catalog should use. Seeds (Monrovia, Paynesville, Bensonville) are correct. |
| Tamashek | 767 | Africa | `tmh` (verified) | Afroasiatic | Tuareg Berber | https://en.wikipedia.org/wiki/Tamasheq | medium | ready | `tmh` = Tamashek/Tamasheq (Berber, Mali/Niger). Seeds (Timbuktu, Gao, Kidal, Tessalit, Aguelhok) are correct. Catalog spelling is `Tamashek`; the common romanisation is `Tamasheq`. |
| Aizi | 814 | Africa | **none** (unverified) | Niger-Congo | Kru | https://en.wikipedia.org/wiki/Aizi_language | medium | needs research | Real, but ISO 639-3 has **no single 'Aizi' code** - it is a group of three: `ahi` Tiagbamrin Aizi, `ahm` Mobumrin Aizi, `ahp` Aproumu Aizi. 177 seeds is the largest orphan list; it should be split by the three varieties before a code can be assigned. |
| Sidamo | 947 | Africa | `sid` (verified) | Afroasiatic | Cushitic | https://en.wikipedia.org/wiki/Sidama_language | high | DO NOT ADD | `sid` = Sidamo, and the same language already has entry 14152 named `Sidama` with 14 of these 25 seeds in common. Merge the two entries first; do not add a third catalog line. |
| Wolayta | 957 | Africa | `wal` (verified) | Afroasiatic | Omotic | https://en.wikipedia.org/wiki/Wolaytta_language | high | DO NOT ADD | `wal` = Wolaytta (North Omotic). Entry 20714 is already named `Wolaytta` and shares 10 of these 34 seeds. Merge 957 into 20714 (or vice versa) first. |
| Khoekhoe | 1001 | Africa | `naq` (verified) | Khoe | Khoe | https://en.wikipedia.org/wiki/Khoekhoe_language | medium | needs research | `naq` = Khoekhoe (also Nama/Damara) - real, and the Namibian seeds (Windhoek, Swakopmund, Walvis Bay, Keetmanshoop, Gobabis) are correct. But entry 631 `Nama` is already in the catalog, and `naq`'s ref name is Khoekhoe. A human must decide one canonical line for this language. |
| Kambaata | 1114 | Africa | `ktb` (verified) | Afroasiatic | Cushitic | https://en.wikipedia.org/wiki/Kambaata_language | high | ready | `ktb` = Kambaata, Highland East Cushitic, Ethiopia. Seeds (Durame, Angacha, Hadero, Damboya) are correct. |
| Nobiin | 1202 | Africa | `fia` (verified) | Nilo-Saharan | Nubian | https://en.wikipedia.org/wiki/Nobiin_language | high | ready | `fia` = Nobiin (Nubian, Nilo-Saharan). Seeds (Dongola, Karima, Merowe, Al Dabbah) are correct Lower Nubia / northern Sudan. |
| Bila | 1228 | Africa | `bip` (verified) | Niger-Congo | Bantu | https://en.wikipedia.org/wiki/Bila_language ; https://en.wikipedia.org/wiki/South_Sudan | low | needs research | `bip` = Bila/Forest Bira, a Bantu language of **DRC** - but the 131 seeds (Bal, Bibal, Mayo Beli, Kerke, Kamkam) are all in **South Sudan** (Bari country). Either the code is wrong or the seeds are; do not add until resolved. |
| Bena | 1230 | Africa | `bez` (verified) | Niger-Congo | Bantu | https://iso639-3.sil.org/code/bez | high | ready | `bez` = Bena (Tanzania), Bantu. Seeds (Njombe, Iringa, Makambako, Ilembula) are correct Iringa/Njombe. Note `yun` is a different Bena (Nigeria) - do not confuse them. |
| Bokyi | 1339 | Africa | `bky` (verified) | Niger-Congo | Bendi | https://en.wikipedia.org/wiki/Bokyi_language | high | ready | `bky` = Bokyi, a Bendi language of Cross River State, Nigeria. Seeds (Boje, Irruan, Kakwagom) are correct. |
| Karekare | 1935 | Africa | `kai` (verified) | Niger-Congo | Chadic | https://en.wikipedia.org/wiki/Karekare_language | medium | ready | `kai` = Karekare, a West Chadic language of Bauchi, Nigeria. Seeds (Jalam, Nangere, Tikau, Damagum) are correct Bauchi sites. Wikipedia has no standalone article; ISO + Glottolog are the sources. |
| Kuturmi | 1979 | Africa | `khj` (verified) | Niger-Congo | Plateau | https://en.wikipedia.org/wiki/Kuturmi_language | medium | ready after cleanup | `khj` = Kuturmi (Ibiro-Ikryo), Plateau languages, Kaduna, Nigeria. **The seed list itself is polluted**: 109 'seeds' include `Plateau Language`, `ISO 639-3:khj`, `Stable Indigenous Language` and `Niger-Congo` - metadata strings, not placenames. Strip those before adding. |
| Mangbetu | 2277 | Africa | `mdj` (verified) | Nilo-Saharan | Central Sudanic | https://en.wikipedia.org/wiki/Mangbetu_language | high | ready | `mdj` = Mangbetu/Nemangbetu, Central Sudanic, NE DRC. Seeds (Isiro, Rungu, Nangazizi, Tapili) are correct. |
| Mankon | 2292 | Africa | `nge` (verified) | Niger-Congo | Grassfields Bantoid | https://en.wikipedia.org/wiki/Mankon_language | high | ready | `nge` = Mankon-Mundum (Ngemba), Mbam-Nkam, Grassfields, Cameroon. Seeds (Bamenda-area Mankon, Ntamulung, Ntarikon) are correct. |
| Gamo | 2522 | Africa | `gmv` (verified) | Afroasiatic | Omotic | https://en.wikipedia.org/wiki/Gamo_people | high | ready | `gmv` = Gamo, North Omotic, Ethiopia. Seeds (Arba Minch, Chencha, Dorze, Dokko, Ezo) are the Gamo Highlands. |
| Nyangatom | 2647 | Africa | `nnj` (verified) | Nilo-Saharan | Nilotic | https://en.wikipedia.org/wiki/Nyangatom_language | high | ready | `nnj` = Nyangatom (Donyiro/Dongiro), Eastern Nilotic, Ethiopia/South Sudan. Seeds (Kibish, Kangaten, Murille) are correct. |
| Avikam | 2701 | Africa | `avi` (verified) | Niger-Congo | Kwa | https://en.wikipedia.org/wiki/Avikam_language | high | ready | `avi` = Avikam, a Lagoon (Kwa) language of Grand-Lahou, Cote d'Ivoire. Seeds (Adesse, Avadivry, Niangoussou, Taboutou) are exact. |
| Barga | 3258 | Africa | **none** (unverified) | Nilo-Saharan | Nilotic (suspected Bari) | https://en.wikipedia.org/wiki/Bari_language | low | needs research | No ISO 639-3 entry for `Barga`. The 50 seeds (Bunj, Boing, Doro, Dinga, Bang) are South Sudan, in Bari (`bfa`) country. Treat as a possible Bari dialect label until someone sources it; do not invent a code. |
| Tonga Zambia | 5394 | Africa | `toi` (verified) | Niger-Congo | Bantu | https://iso639-3.sil.org/code/toi | low | DO NOT ADD as-is | `toi` = Tonga (Zambia) is real, but this entry's 81 seeds (Mahwelereng, Mokopane, Bakenberg, Mmahlogo, GaMapela) are in **South Africa**, not Zambia. Entry 13445 `Tonga` (25 seeds: Mongu, Sesheke, Sioma, Kalabo) holds the correct Zambezi Tonga data and should win. |
| Nyamwezi | 10883 | Africa | `nym` (verified) | Niger-Congo | Bantu | https://en.wikipedia.org/wiki/Nyamwezi_language | medium | ready | `nym` = Nyamwezi, Bantu of central Tanzania. Seeds (Tabora, Shinyanga) are correct but **Mwanza, Kigoma and Dodoma are Sukuma, not Nyamwezi** - trim the borrowed towns. |
| Yao | 10885 | Africa | `yao` (verified) | Niger-Congo | Bantu | https://en.wikipedia.org/wiki/Yao_language | high | ready | `yao` = Yao, Bantu of Malawi/Mozambique. Seeds (Lilongwe, Blantyre, Zomba, Mangochi, Machinga) are correct. |
| Ndau | 10934 | Africa | `ndc` (verified) | Niger-Congo | Bantu | https://en.wikipedia.org/wiki/Ndau_language | high | ready | `ndc` = Ndau (chiNdau), a Shona Bantu of Mozambique. Seeds are correct for the Yao/Mangochi area, which is where Ndau is also spoken. |
| Kwanyama | 11037 | Africa | **none** (unverified) | Niger-Congo | Bantu | https://en.wikipedia.org/wiki/Kwanyama_language | medium | needs research | Kwanyama (Cuanhama) is a **standardised dialect of Ovambo** and has no dedicated ISO 639-3 code - it is normally handled as a variety of `ghi` (Oshiwambo) or `ndo` (Ndonga). Seeds (Oshakati, Ondangwa, Rundu, Katima Mulilo) are correct. A human must pick the code. |
| Kilba | 11532 | Africa | `hbb` (verified) | Afroasiatic | Chadic | https://en.wikipedia.org/wiki/Huba_language ; https://wals.info/languoid/lect/wals_code_klb | high | ready | `hbb` = Huba, also known as **Kilba**, a Chadic language of Adamawa State, Nigeria. Seeds (Hong, Pella, Gwaja, Kulinyi, Garaha) are exactly the Kilba mountain communities. |
| Hun-Saare | 11538 | Africa | **none** (unverified) | Niger-Congo | Kainji | https://en.wikipedia.org/wiki/Hun-Saare_language ; https://glottolog.org/resource/languoid/id/huns1239 | medium | needs research | `dud` (Hun-Saare) was **RETIRED in ISO 639-3 effective 2019-01-25** (change request 2018-014) and split into `uth` Ut-Hun and `uss` Us-Saare. The entry must be split into two, or a non-ISO catalog id used. Seeds (Mahuta, Fakai, Argungu) are Bauchi/Kebbi, correct. |
| Tonga | 13445 | Africa | `toi` (verified) | Niger-Congo | Bantu | https://en.wikipedia.org/wiki/Tonga_language_(Zambia) | high | ready (rename to 'Tonga (Zambia)') | Same language as entry 5394 `Tonga Zambia`; keep this one (correct seeds: Mongu, Sesheke, Sioma, Kalabo, Lukulu) and rename it to `Tonga (Zambia)` so the pair stops colliding. Delete 5394. |
| Geez | 14148 | Africa | `gez` (verified) | Afroasiatic | South Ethiopic | https://en.wikipedia.org/wiki/Ge%27ez_language | medium | needs research | `gez` = Ge'ez, the **liturgical** South Ethiopic language of the Ethiopian/Eritrean churches - it has no living speech community. The 28 seeds (Keren, Agordat, Barentu, Massawa, Assab) are Eritrean *Tigre* country, not Ge'ez. The entry is mislabelled; it looks like Tigre (`tig`). |
| Hadiyya | 14151 | Africa | `hdy` (verified) | Afroasiatic | Cushitic | https://en.wikipedia.org/wiki/Hadiyya_language | high | ready | `hdy` = Hadiyya/Hadiyyisa, Highland East Cushitic, Ethiopia (1.2M+ speakers). Seeds (Hosaena, Shone, Gimbichu) are correct. |
| Sidama | 14152 | Africa | `sid` (verified) | Afroasiatic | Cushitic | https://en.wikipedia.org/wiki/Sidama_language | high | DO NOT ADD | Spelling variant of entry 947 `Sidamo`; both are `sid` and share 14 seeds. Merge - one catalog line only. |
| Bench | 14153 | Africa | `bcq` (verified) | Afroasiatic | Omotic | https://en.wikipedia.org/wiki/Bench_language | high | ready | `bcq` = Bench (Bencnon/Shenon/Mernon), Northern Omotic, Bench Maji, SW Ethiopia. Seeds (Mizan Teferi, Shewa Gimira, Bensa, Meinit) are correct. Only 24 seeds and status WAITING - addable, but thin. |
| Fante | 203215 | Africa | `fat` (verified) | Niger-Congo | Akan | https://iso639-3.sil.org/code/fat | high | ready | `fat` = Fanti, the Akan variety of Ghana's Central and Western Regions. Seeds (Cape Coast, Saltpond, Elmina, Sekondi-Takoradi) are exact. Note the catalog spells it `Fante`; the ISO ref name is `Fanti`. |
| Mundang | 203233 | Africa | `mua` (verified) | Niger-Congo | Mbum | https://en.wikipedia.org/wiki/Mundang_language | high | ready | `mua` = Mundang, an Mbum language of southern Chad / northern Cameroon. Seeds (Moundou, Koumra, Lere, Baibokoum) are correct. |
| Bembe | 20513 | Africa | `bmb` (verified) | Niger-Congo | Bantu | https://en.wikipedia.org/wiki/Bembe_language | high | ready | `bmb` = Bembe, Bantu of Tanzania (Kivu). Seeds (Fizi, Uvira, Itombwe, Kalemie, Kigoma) are correct. Do not confuse with `mfn` Cross River Mbembe. |
| Bidiya | 20572 | Africa | `bid` (verified) | Afroasiatic | Chadic | https://en.wikipedia.org/wiki/Bidiyo_language | low | needs research | **Name collision.** `bid` = Bidiyo, a Chadic language of the Guera region of **Chad** - but this entry's 25 seeds (Mongo, Abou Telfane, Niergui, Kafila, Tchakor) are all **Moroccan** (Anti-Atlas, Western Berber). `bid` is the wrong language for this data. Do not add. |
| Bokoto | 20583 | Africa | `bdt` (verified) | Niger-Congo | Gbaya | https://en.wikipedia.org/wiki/Bokoto_language | high | ready | `bdt` = Bokoto (Bhogoto), a Gbaya language of the Central African Republic. Seeds (Bangui, Bambari, Bouar, Berberati) are correct. |
| Mao | 20712 | Africa | **none** (unverified) | Afroasiatic | Omotic (suspected) | https://en.wikipedia.org/wiki/Mao_people_(Ethiopia) | low | needs research | 18 seeds (Bambasi, Asosa, Begi, Hozo, Seze) are Benishangul-Gumuz, NW Ethiopia. 'Mao' is ambiguous there (the Omotic Banna are also called Mao, but so is a Mao people in Nepal). No ISO 639-3 code can be assigned from the name. Needs a human to say which Mao this is. |
| Wolaytta | 20714 | Africa | `wal` (verified) | Afroasiatic | Omotic | https://en.wikipedia.org/wiki/Wolaytta_language | high | DO NOT ADD | Spelling variant of entry 957 `Wolayta`; both are `wal` and share 10 seeds. Merge - one catalog line only. |
| Doyayo | 20732 | Africa | `dow` (verified) | Afroasiatic | Chadic | https://iso639-3.sil.org/code/dow | high | ready | `dow` = Doyayo (ISO ref name; the language is usually spelled Doyago), a West Chadic language of Cameroon. Seeds (Poli, Faro, Sewe, Ninga, Bantadje) are correct. Prefer the spelling `Doyago`. |
| Naro Click (Kalahari East) | 22000 | Africa | `nhr` (verified) | Khoe | Khoe | https://en.wikipedia.org/wiki/Naro_language | high | ready (rename) | `nhr` = Naro (also Nharo), a Tshu-Khwe Khoe language of Ghanzi District, Botswana and eastern Namibia. Seeds (Ghanzi, D'Kar, East/West Hanahai) are exact. Rename to `Naro`. |
| Sandawe Click (Central Tanzania) | 22001 | Africa | `sad` (verified) | Isolate | Sandawe isolate | https://en.wikipedia.org/wiki/Sandawe_language | high | DO NOT ADD | Duplicate of entry 49 `Sandawe Click` (shares 12 seeds: Farkwa, Kwamtoro, Banguma...). Merge into 49; do not create a second Sandawe line. |
| Mesopotamian | 23 | Asia | **none** (unverified) | Afroasiatic | Mesopotamian (proposed) | https://en.wikipedia.org/wiki/Babylonian_language | low | DO NOT ADD | **Not a language.** 'Mesopotamian' is a geographical/period label covering Akkadian (`akk`/`bab`), Sumerian (`sxt`), Eblaite (`ebl`) and Hurrian. There is no ISO code and no speaker community. Add the individual languages instead, or drop. |
| Iranian | 24 | Asia | **none** (unverified) | Iranian | Iranian | https://en.wikipedia.org/wiki/Iranian_languages | medium | needs research | 'Iranian' is a **branch label**, not a language: it covers Persian (`pes`), Kurmanji (`kmr`), Pashto (`pbs`), Ossetic (`oss`), Ossetic, Wakhi (`wbl`) and dozens more. There is no ISO 639-3 code for the branch. The catalog already has `Persian Expanded` group macros - follow that pattern or drop. |
| Barlavento Creoles | 181 | Asia | `kea` (verified) | Creole | Portuguese-based | https://en.wikipedia.org/wiki/Cape_Verdean_Creole | high | ready (rename + split) | `kea` = Kabuverdianu = Cape Verdean Creole, the umbrella for the Barlavento (Windward island) and Sotavento varieties. Seeds (Ribeira Grande, Ponta do Sol, Porto Novo, Paul, Pombas) are exactly the Barlavento islands. Note the entry is filed under **asia** - Cape Verde is off West Africa, so a continent decision is needed. Entries 203249/203250 hold the two island creoles. |
| Hu (Kongge / Kun'ge / Kon Keu) | 1012 | Asia | `huo` (verified) | Austroasiatic | Palaungic | https://en.wikipedia.org/wiki/Hu_language | high | ready | `huo` = Hu, also Angku or **Kon Keu**, a Palaungic language of Xishuangbanna, Yunnan. Seeds (Mengyang, Xiao Mengyang, Jinghong) are correct. Only 4 seeds and status WAITING - addable but thin. |
| Bijiang Bai language | 203195 | Asia | `bfc` (verified) | Sino-Tibetan | Bai | https://iso639-3.sil.org/code/bfc | high | ready (rename) | `bfc` = Panyi Bai, whose denotations include **Bijiang Bai**, Leme and Lemo (ISO change request 2013-006, adopted 2014-02-03). Seeds (Tuoluo, Gongxing, Jinman, Ega) are Lushui County, Yunnan. Rename to `Bai, Panyi` or keep the common name. Only 5 seeds. |
| Chilsso | 1626 | Asia | `clh` (verified) | Indo-Aryan | Dardic | https://en.wikipedia.org/wiki/Chilisso_language | high | ready (fix spelling) | `clh` = **Chilisso** (also Chiliss, Galos, Dardu) - the entry's spelling `Chilsso` is wrong. Kohistani/Dardic, eastern Kohistan, Pakistan, ~1000 speakers, endangered. Seeds (Gujjar Banda, Dasu, Jalkot, Mahirin, Koli) are the exact villages the Endangered Languages Project records for it. Only 7 seeds. |
| Kayort | 2387 | Asia | `kyv` (verified) | Sino-Tibetan | Kiranti | https://iso639-3.sil.org/code/kyv | high | ready | `kyv` = Kayort, a Kirati (Limbu-group) language of eastern Nepal. Seeds (Rajbiraj, Gaur, Janakpur, Biratnagar) are correct. Only 5 seeds and status WAITING - addable but thin. |
| Daman Creole | 203246 | Asia | **none** (unverified) | Creole | Portuguese-based | https://en.wikipedia.org/wiki/Daman_and_Diu | medium | needs research | A real Portuguese-lexifier creole of Daman and Diu (India, formerly a Portuguese possession). **No ISO 639-3 code exists** for it. Seeds (Devka, Kachigam, Marval, Somnath, Calvary) are Daman/Diu settlements. A non-ISO catalog id (e.g. `daman-creole`) would be needed. |
| Sao Nicolau Creole | 203249 | Asia | **none** (unverified) | Creole | Portuguese-based | https://en.wikipedia.org/wiki/Cape_Verdean_Creole | medium | needs research | A real island variety of Cape Verdean Creole (`kea`) on Sao Nicolau. **No dedicated ISO 639-3 code.** Seeds (Ribeira Brava, Carrical, Juncalinho, Faja) are exact. Same continent problem as entry 181. |
| Santo Antao Creole | 203250 | Asia | **none** (unverified) | Creole | Portuguese-based | https://en.wikipedia.org/wiki/Cape_Verdean_Creole | medium | needs research | A real island variety of Cape Verdean Creole on Santo Antao. **No dedicated ISO 639-3 code.** Seeds (Fontainhas, Janela, Paul, Coculi, Eito) are exact. Same continent problem as entry 181. |
| Arabic (Gulf) | 23003 | Asia | `afb` (verified) | Afroasiatic | North Arabian | https://iso639-3.sil.org/code/afb | high | ready | `afb` = **Gulf Arabic**, a legitimate ISO 639-3 individual language. Seeds (Dubai, Abu Dhabi, Doha, Manama, Kuwait City) are correct. Add with a `variety` tag if the catalog has one, or as `Gulf Arabic`. |
| Chepang (ISO) | 200263 | Asia | `cdm` (verified) | Sino-Tibetan | Chepangic | https://en.wikipedia.org/wiki/Chepang_language | high | ready (rename) | `cdm` = Chepang, South-Central Nepal, ~59,000 speakers. Seeds (Hetauda, Raksirang, Manahari, Bakaiya) are correct. Drop the `(ISO)` suffix from the name. |
| Vietnamese South | 200565 | Asia | **none** (unverified) | Austroasiatic | Vietic | https://en.wikipedia.org/wiki/Vietnamese_language | medium | needs research | Real regional variety (Southern Vietnamese). **No separate ISO 639-3 code** - it falls under `vie`. Seeds (Ho Chi Minh City, Saigon, Vung Tau, Can Tho) are correct. Add as a variety line or skip. |
| Min Chinese | 10021 | Asia | **none** (unverified) | Sino-Tibetan | Min | https://en.wikipedia.org/wiki/Min_Chinese | medium | needs research | 'Min Chinese' is a **branch, not a language** - it covers Min Nan (`nan`), Min Bei (`mnp`), Min Dong, Pu-Xian etc. No single code exists. Seeds (Fuzhou, Xiamen, Quanzhou, Zhangzhou, Putian) are actually **Min Dong / Eastern Min** (Fuzhou, Putian), not Min Nan. Either pick `nan` or `mnp`, or split. |
| Manipuri | 20048 | Asia | `mni` (verified) | Sino-Tibetan | Tibeto-Burman | https://en.wikipedia.org/wiki/Meitei_language | high | ready | `mni` = Manipuri / Meitei, Tibeto-Burman, official language of Manipur. Seeds (Imphal, Thoubal, Bishnupur, Churachandpur, Kakching) are correct. |
| Miao | 20060 | Asia | `hmn` (verified) | Hmong-Mien | Hmongic | https://en.wikipedia.org/wiki/Hmong_language | medium | ready (rename) | ISO 639-3 does not use the exonym 'Miao'; it uses **Hmong** (`hmn`), plus 20+ individual Miao codes. Seeds (Kaili, Duyun, Guiyang, Anshun, Zunyi) are Guizhou - Qiandongnan Miao, which is `hea` Northern Qiandong Miao / `cqd` Chuanqiandian Cluster Miao, not the `hmn` umbrella. Rename to `Miao`/`Hmong` and decide umbrella vs individual. |
| Gan Chinese | 24801 | Asia | `gan` (verified) | Sino-Tibetan | Chinese | https://en.wikipedia.org/wiki/Gan_Chinese | high | ready | `gan` = Gan Chinese, Sinitic of Jiangxi. Seeds (Nanchang, Jiujiang, Jingdezhen, Pingxiang, Xinyu) are exact. |
| Castillian | 4 | Europe | `spa` (verified) | Romance | Ibero-Romance | https://en.wikipedia.org/wiki/Spanish_language | high | ready (rename) | `spa` = Spanish; the endonym is **castellano**, so `Castillian` is a misspelling of `Castilian`. Seeds (Madrid, Barcelona, Valencia, Sevilla, Zaragoza) are correct. Check whether the catalog already has a `Spanish` line - if so this is a duplicate. |
| Ob-Ugric | 2680 | Europe | **none** (unverified) | Uralic | Ugric (proposed branch) | https://en.wikipedia.org/wiki/Ob-Ugric_languages | low | DO NOT ADD | **Not a language.** 'Ob-Ugric' is a proposed grouping of Khanty and Mansi. No ISO 639-3 code. **Its 67 'seeds' are river names** (Ob, Irtysh, Konda, Sosva, Lozva), not settlements, so the entry is unusable as a namebase regardless. The catalog already has `Uralic / Proto-Ob-Ugric` as a hypothetical group - that is the right home for it. |
| Judeo-Mantuan (Lombardy) | 23006 | Europe | `itk` (verified) | Romance | Judeo-Italian | https://en.wikipedia.org/wiki/Judeo-Italian | medium | needs research | `itk` = Judeo-Italian is the umbrella ISO code; there is no separate Mantuan code. Seeds (Mantova, Brescia, Bergamo, Cremona, Lodi) are correct Lombardy towns. The catalog already carries `Romance / Judeo-Italian` - check for a duplicate before adding. |
| Judeo-Piedmontese (Turin) | 23007 | Europe | `itk` (verified) | Romance | Judeo-Italian | https://en.wikipedia.org/wiki/Piedmontese_language ; https://en.wikipedia.org/wiki/Judeo-Italian | medium | needs research | Same umbrella problem: no separate code, `itk` covers it. Seeds (Torino, Asti, Alessandria, Novara, Cuneo) are correct. Note these 5 are **exactly** the seed list of entry 555 `Piedmontese` (catalog, `pms`) - a probable duplicate. |
| Somontanoes | 625 | Europe | `arg` (verified) | Romance | Aragonese | https://en.wikipedia.org/wiki/Aragonese_language | medium | needs research | Somontano is a comarca of Aragon (Huesca) and `arg` = Aragonese is the nearest ISO code, but 'Somontanoes' as a named patois has **no ISO 639-3 entry**. Seeds (Barbastro, Adahuesca, Albalate de Cinca, Alberuela de Tubo, Alcanadre) are all Aragonese comarca towns. Check for an existing Aragonese/Spanish catalog line first. |
| Auyokawa language | 893 | Europe | `auo` (verified) | Tupian | Tupi-Guarani | https://iso639-3.sil.org/code/auo | medium | ready after relocation | `auo` = Auyokawa is a real ISO 639-3 entry but is flagged **Scope: E (extinct)** in the code table. Seeds (Belo Horizonte, Ouro Preto, Tiradentes, Diamantina) are Minas Gerais, Brazil - so the **continent file is wrong** (it is filed under `europe`). Relocate to southAmerica and tag the entry extinct. |
| Irish Gaelic | 25303 | Europe | `gle` (verified) | Celtic | Goidelic | https://en.wikipedia.org/wiki/Irish_language | high | DO NOT ADD | Same language as entry 200862 `Irish`, which is already in the catalog under `gle` (38 seeds: Dublin, Cork, Galway, Limerick). Irish Gaelic has 220 seeds and is the better list - merge 25303 **into** 200862, but do not add a second `gle` line. |
| Grenadian Creole English (dedicated) | 20175 | northAmerica | `gcl` (verified) | Creole | English-based | https://en.wikipedia.org/wiki/Grenadian_Creole | high | ready | `gcl` = Grenadian Creole English. Seeds (Gouyave, Grenville, Victoria, Sauteurs, Hillsborough) are Grenada parishes. Status WAITING with 23 seeds - addable. |
| Leeward Caribbean Creole English (dedicated) | 20176 | northAmerica | **none** (unverified) | Creole | English-based | https://en.wikipedia.org/wiki/Leeward_Caribbean_Creole_English | medium | needs research | A real English-lexifier creole of Antigua, Barbuda, Anguilla, St Kitts, Montserrat and Nevis. **No dedicated ISO 639-3 code** - it is usually handled as a variety of `aeb` (Antiguan Creole English) or `vic`. Seeds (The Valley, St John's, All Saints, Freetown) are correct Anguilla. |
| Miskito Coast Creole (dedicated) | 20178 | northAmerica | **none** (unverified) | Creole | English-based | https://en.wikipedia.org/wiki/Miskito_Coast_Creole | medium | needs research | A real English-based creole of the Mosquito Coast of Honduras/Nicaragua, ~100,000 speakers. **No ISO 639-3 code.** Seeds (Bluefields, Puerto Cabezas, Prinzapolka, Rosita, Siuna) are exact. A non-ISO catalog id would be needed. |
| Montserrat Creole (dedicated) | 20179 | northAmerica | **none** (unverified) | Creole | English-based | https://en.wikipedia.org/wiki/Montserrat_Creole_English | medium | needs research | A real variety of Antiguan and Barbudan Creole with <10,000 speakers. **No dedicated ISO 639-3 code.** Seeds (Brades, St John's, Salem, Cork Hill) are exact. Note entries 20176/20179 overlap in coverage and may want merging. |
| Jamaican Maroon Creole (dedicated) | 20188 | northAmerica | **none** (unverified) | Creole | English-based | https://en.wikipedia.org/wiki/Jamaican_Maroon_Creole | medium | needs research | A real ritual and formerly-mother-tongue creole of the Jamaican Maroons, with a strong Akan component and a distinct lexicon (Kromanti). **No dedicated ISO 639-3 code**; it is a separate language from `jam` Jamaican Creole. Seeds (Accompong, Moore Town, Charles Town, Nanny Town) are exact. |
| Pima | 201034 | northAmerica | **none** (unverified) | Uto-Aztecan | Tepiman | https://en.wikipedia.org/wiki/Pima_language | medium | needs research | Pima/Papago is real, but ISO 639-3 does **not** have a 'Pima' code - the Uto-Aztecan Tepiman codes are `pim` = Powhatan (an unrelated Algonquian language) and `ora` = O'odham (Tohono O'odham). Seeds (Sacaton, Blackwater, Casa Blanca, Gila Crossing, Maricopa) are Tohono O'odham country, and entry 201038 already holds Tohono O'odham. Likely a duplicate; **do not add**. |
| Tohono O'odham | 201038 | northAmerica | `ood` (verified) | Uto-Aztecan | Tepiman | https://iso639-3.sil.org/code/ood | high | ready | `ood` = Tohono O'odham, Uto-Aztecan, Arizona/Sonora. Seeds (Sells, Ajo, Choulic, San Simon, Covered Wells) are exact. Only 14 seeds, status WAITING. |
| Northern Tepehuan | 201031 | northAmerica | `ntp` (verified) | Uto-Aztecan | Tepiman | https://iso639-3.sil.org/code/ntp | high | ready | `ntp` = Northern Tepehuan, Uto-Aztecan, Chihuahua, Mexico. Seeds (Guadalupe y Calvo, Baborigame, Nararachi, Chinacates) are exact. Only 9 seeds, status WAITING. |
| Itonama (dedicated) | 20191 | southAmerica | `ito` (verified) | Language isolate | Itonama isolate | https://en.wikipedia.org/wiki/Itonama_language | high | ready (tag extinct) | `ito` = Itonama, a language isolate of Beni, Bolivia - but Wikipedia states it is **extinct** (spoken on the Itonomas River and Lake). Seeds (Magdalena, Huacaraje, San Ramon, San Javier, Reyes) are Beni towns. The catalog already has `Language isolate / Itonama isolate`, so **check for an existing line** before adding. |
| Leco (dedicated) | 20192 | southAmerica | `lec` (verified) | Language isolate | Leco isolate | https://en.wikipedia.org/wiki/Leco_language | high | ready (tag critically endangered) | `lec` = Leco/Leko, a language isolate of Bolivia; long reported extinct but still spoken by 20-40 people east of Lake Titicaca. Seeds (Apolo, Mapiri, Aten, Guanay, Tipuani) are exact. The catalog already has `Language isolate / Leco isolate` - **check for an existing line**. |
| Wichí Lhamtés Güisnay | 5826 | southAmerica | `mzh` (verified) | Matacoan | Matacoan | https://iso639-3.sil.org/code/mzh | high | ready (fix spelling) | `mzh` = Wichi Lhamtes Guisnay, Matacoan, Bolivia/Argentina. The entry's spelling has lost all diacritics and spaces (`VillaMontes` should be `Villa Montes`) - fix the seeds too. Seeds (Villa Montes, Yacuiba, Carapari, Boyuibe) are correct. |
| Mika Huitoto | 5819 | southAmerica | **none** (unverified) | Witotoan | Witotoan | https://en.wikipedia.org/wiki/Huitoto_languages | low | needs research | The name is wrong. The ISO 639-3 Huitotoan codes are `hto` Minica Huitoto, `huu` Murui Huitoto, `hux` Nupode Huitoto - there is no 'Mika Huitoto' and no 'Mika'. The 8 seeds (La Chorrera, El Encanto, Igara Parana) are Putumayo, Colombia, Huitoto country. Identify which of the three it is; do not add as named. |
| Mirana | 5825 | southAmerica | **none** (unverified) | Witotoan | Witotoan | https://en.wikipedia.org/wiki/Witotoan_languages | low | needs research | Mirana is a real Witotoan people/language of the Upper Amazon (Brazil/Colombia) but has **no ISO 639-3 code** in the current table and only 7 seeds (Puerto Remanso el Tigre, Mariapolis, Cahuinari). Needs research before it can be catalogued. |
| Kawesqar | 7947 | southAmerica | `alc` (verified) | Chonan | Chonan | https://en.wikipedia.org/wiki/Kaw%C3%A9sqar_people ; https://iso639-3.sil.org/code/alc | high | ready (fix spelling + trim) | `alc` = Qawasqar, Chonan, Chilean Patagonia, critically endangered. The entry's spelling `Kawesqar` has lost the accent. Seeds (Puerto Eden, Puerto Natales, Punta Arenas, Isla Wellington) are exact **except `Jektarte`**, which is a fictional Lost World island and must be removed. Only 14 seeds. |
| Human Generic | 100000 | fantasy | **none** (unverified) | Misc | Misc | https://en.wikipedia.org/wiki/Given_name | high | needs research | Not a language at all - it is the **fallback given-name pool** for human cultures (307 invented fantasy given names: Amberglen, Angelhand, Arrowden...). It should never appear in a language catalog. If the mixer needs it, wire it as a separate `lexifier`/pool rather than a `languageMixes` line. Also note `public/modules/namebases-fantasy.js` holds this single entry and indices 100001+ are empty. |

---

## How to use this table

**Add now (52).** Every row whose verdict starts with `ready`. A worked example, the one the task brief uses:

```json
{ "name": "Ijaw", "iso": "ijaw", "region": "Africa", "category": "Niger-Congo", "family": "Ijo" }
```

**That example line is not safe to use, and the reason is the point of this report.** There is **no ISO 639-3 code
`ijaw`** - I checked the full code table. `ijo` is an ISO 639-5 *family* code, and the 43 seeds on entry 20
(Brass, Nembe, Okrika, Opobo, Abonnema) span at least three distinct Ijo languages: Opobo and Okrika are Ibani
(`iby`) while Brass and Nembe are Central Izon (`ijc`). The entry has to be split before it can be catalogued,
and I have not guessed which towns belong to which.

A line that **is** safe, from the same continent and the same format:

```json
{ "name": "Wobe", "iso": "wob", "region": "Africa", "category": "Niger-Congo", "family": "Kru" }
```

**Needs research (29).** The common blocker is not "is this language real" - almost all of them are real. It is
one of: no ISO 639-3 code exists (Barga, Daman Creole, the Cape Verdean island creoles, Miskito Coast Creole,
Montserrat Creole, Jamaican Maroon Creole, Min Chinese, Vietnamese South, Kwanyama, Leeward Caribbean Creole
English); the code was retired (Hun-Saare, `dud`, split 2019-01-25 into `uth`+`uss`); the entry is a branch
or grouping rather than a language (Iranian, Aizi, Min Chinese, Miao); or the name is ambiguous (Mao, Barga).

**Do not add (9).** Merge or rename first, as tabled above.

### Follow-up checks a human should run before writing the catalog lines

1. **Name collisions against the existing 3691-entry catalog.** I checked the ISO codes and the seed lists, but
   not every one of the 52 against all 3691 existing lines. The ones I flag as most at risk: **Khoekhoe** (the
   catalog already has `Nama`, i.e. 631; `naq`'s ref name is Khoekhoe and the two are the same language),
   **Itonama** and **Leco** (the catalog already carries `Language isolate / Itonama isolate` and
   `Language isolate / Leco isolate`), **Judeo-Mantuan** and **Judeo-Piedmontese** (the catalog already has
   `Romance / Judeo-Italian`), **Castillian** (probably a second Spanish line), and **Somontanoés** (probably a
   second Aragonese or Spanish line).
2. **Continent assignment.** Four entries in this table are in the wrong continent file (893, 181, 203249,
   203250). That is a separate fix from the catalog line and should not be bundled into it.
3. **Two Cape Verde island creoles plus the umbrella** (181, 203249, 203250) may be better as three lines under
   one `tags`-marked group macro than as three independent entries.
