# Adding catalog languages for the orphaned namebase entries

**Scope.** `config/language-mixes.json` and `config/language-mixer-map.json` only, plus this file.
No entry that already existed was changed; the diff is 518 insertions, 0 deletions.

## What was done

| | before | after | delta |
|---|---|---|---|
| catalog entries (`config/language-mixes.json`) | 3691 | **3728** | **+37** |
| map rows (`config/language-mixer-map.json`) | 4304 | **4341** | **+37** |
| distinct `family` values | 562 | **562** | 0 |
| distinct `category` values | 95 | **95** | 0 |

37 real, catalogable languages were added. The 37 map rows point at **40** namebase entries,
because four languages had two namebase records apiece and those records were folded into the
one row rather than catalogued twice.

No new `family` or `category` value was invented. Every new row reuses a value that was already
in the catalog, so the family and category counts are unchanged.

## How the candidate set was derived

The brief says 104 orphans. Re-deriving it from the shipped namebase files gives a different
number, so the derivation is recorded here rather than reconciled silently.

1. Load every shipped base file: `public/modules/namebases-{africa,asia,europe,northAmerica,
   oceania,southAmerica,fantasy}.js` (3533 entries, 3124 with seeds). `namebases-research.js` is
   **not** loaded by `src/index.html` (5217-5224) and is excluded; every index it holds for these
   languages is a copy of a continent-file entry anyway.
2. Keep entries with at least one seed.
3. Drop any `i` already referenced by a map row → 148.
4. Drop the 7 `(dedicated)` entries and the 10 race fallback bases → 131.
5. Drop the 37 whose `name` is already a catalog `name` → **94**.

Those 37 are not missing languages: they are namebase entries for languages the catalog already
has, left unreferenced by the map. That is a map-repair problem, not a catalog gap, and it is out
of scope here. The worst offenders are `203052`/`203141` "pa", `50024`/`203163` Arafundi-Enga
Pidgin, `200018` Dangaléat and `201162` Saʼban.

So the honest candidate count is **94 namebase entries**, not 104. The brief's 104 could not be
reproduced from the shipped data under any reading of "no catalog entry" that I tried; the closest
figures are 148 (before the explicit exclusions) and 131 (after them, before the name check). The
gap is worth chasing if the 104 came from a specific query, because it would mean 10 or 37
candidates are being missed somewhere.

## Verification method

- **ISO codes.** Every code written was checked against the ISO 639-3 code table downloaded
  2026-09-29 from
  <https://iso639-3.sil.org/sites/iso639-3/files/downloads/iso-639-3.tab> (7927 codes, columns
  `Id`, `Scope`, `Language_Type`, `Ref_Name`). The write script aborts unless the code exists
  **and** its `Ref_Name` matches the expected string, so a name-only guess cannot get through.
  Sources for the ISO codes come from `docs/verification/research/t6-orphan-catalog-gaps.md`; its
  `family` and `category` columns were discarded and re-derived (see below).
- **Duplicates.** Before writing, each candidate's ISO code and name were tested against every
  existing catalog `iso` and `name`, plus a substring test for near-misses. Of the 52 rows t6
  marked "ready", **33 were added and 19 skipped** — 16 of those 19 because the language is
  already catalogued, and 3 because they are the `(dedicated)` entries the brief excludes. t6 did
  the ISO work correctly; it did not check the languages against the catalog.
- **Wikipedia URLs.** 34 of the 37 rows carry a `wikipedia` field. Every title was confirmed to
  exist through the Wikipedia API in one batched `action=query&titles=` call, with `redirects=1`
  so the URL written is the canonical target, not a redirect. The three rows without one (`kai`,
  `dow`, `ntp`) have no article under the obvious name.
- **Family and category.** Re-derived from the current catalog, not copied from t6. For every new
  row the write script asserts that the `family` value already exists in the catalog *and* that
  the `category` is the one that family currently sits under, so no family can end up spanning two
  categories.

## The 37 added

| iso | name | region | category | family | bases | namebase entry(s) |
|---|---|---|---|---|---|---|
| `lue` | Luvale | Africa | Niger-Congo | Bantu | 107 | Luvale |
| `lgg` | Lugbara | Africa | Nilo-Saharan | Central Sudanic | 121 | Lugbara |
| `wob` | Wobe | Africa | Niger-Congo | Kru | 185 | Wobe |
| `bas` | Basaa | Africa | Niger-Congo | Bantu | 247 | Basaa |
| `shk` | Shilluk | Africa | Nilo-Saharan | Nilotic | 500 | Shilluk |
| `nrb` | Nara | Africa | Nilo-Saharan | Nilo-Saharan | 530 | Nara |
| `tmh` | Tamashek | Africa | Afroasiatic | Tuareg Berber | 767 | Tamashek |
| `ktb` | Kambaata | Africa | Afroasiatic | Cushitic | 1114 | Kambaata |
| `kbr` | Kafa | Africa | Afroasiatic | Omotic | 1143, 20713 | Kafa, Kafa |
| `fia` | Nobiin | Africa | Nilo-Saharan | Saharan | 1202 | Nobiin |
| `bez` | Bena | Africa | Niger-Congo | Bantu | 1230 | Bena |
| `bky` | Bokyi | Africa | Niger-Congo | Niger-Congo | 1339 | Bokyi |
| `kai` | Karekare | Africa | Afroasiatic | Chadic | 1935 | Karekare |
| `khj` | Kuturmi | Africa | Niger-Congo | Niger-Congo | 1979 | Kuturmi |
| `mdj` | Mangbetu | Africa | Nilo-Saharan | Central Sudanic | 2277 | Mangbetu |
| `nge` | Mankon | Africa | Niger-Congo | Grassfields Bantoid | 2292 | Mankon |
| `gmv` | Gamo | Africa | Afroasiatic | Omotic | 2522 | Gamo |
| `nnj` | Nyangatom | Africa | Nilo-Saharan | Nilotic | 2647 | Nyangatom |
| `avi` | Avikam | Africa | Niger-Congo | Niger-Congo | 2701 | Avikam |
| `kde` | Makonde | Africa | Niger-Congo | Bantu | 10280 | Makonde |
| `nym` | Nyamwezi | Africa | Niger-Congo | Bantu | 10883 | Nyamwezi |
| `yao` | Yao | Africa | Niger-Congo | Bantu | 10885 | Yao |
| `ndc` | Ndau | Africa | Niger-Congo | Bantu | 10934 | Ndau |
| `toi` | Tonga Zambia | Africa | Niger-Congo | Bantu | 13445 | Tonga |
| `hdy` | Hadiyya | Africa | Afroasiatic | Cushitic | 14151 | Hadiyya |
| `sid` | Sidamo | Africa | Afroasiatic | Cushitic | 947, 14152 | Sidamo, Sidama |
| `wal` | Wolaytta | Africa | Afroasiatic | Omotic | 957, 20714 | Wolayta, Wolaytta |
| `bcq` | Bench | Africa | Afroasiatic | Omotic | 14153 | Bench |
| `fat` | Fanti | Africa | Niger-Congo | Akan | 203215 | Fante |
| `mua` | Mundang | Africa | Niger-Congo | Niger-Congo | 203233 | Mundang |
| `bdt` | Bokoto | Africa | Niger-Congo | Adamawa | 20583 | Bokoto |
| `dow` | Doyago | Africa | Afroasiatic | Chadic | 20732 | Doyayo |
| `huo` | Hu | Asia | Austroasiatic | Palaungic | 1012 | Hu (Kongge / Kun'ge / Kon Keu) |
| `afb` | Gulf Arabic | Middle East | Afroasiatic | North Arabian | 23003 | Arabic (Gulf) |
| `mzh` | Wichí Lhamtés Güisnay | South America | Matacoan | Matacoan | 5826 | Wichí Lhamtés Güisnay |
| `alc` | Qawasqar | South America | Chonan | Chonan | 7947 | Kawésqar |
| `ntp` | Northern Tepehuan | North America | Uto-Aztecan | Piman | 201031 | Northern Tepehuan |

### Classification decisions worth reading

- **Karekare (`kai`) and Doyago (`dow`) are filed under `Afroasiatic` / `Chadic`, not
  `Niger-Congo`.** t6 listed Chadic for both; QUALITY-STANDARDS 5.7 makes Glottolog the authority
  and Glottolog nests Chadic inside Afro-Asiatic. The catalog's 221 Chadic entries already sit
  under `Afroasiatic`, so this is the existing placement.
- **Kafa (`kbr`) is `Afroasiatic` / `Omotic`, not Nilo-Saharan.** t6 does not cover Kafa at all.
  Glottolog `kafa1242` and Wikipedia both place it in North Omotic (Kafa–Shekkacho); Ethnologue
  says only "Afro-Asiatic". Glottolog wins, and `Omotic` is an existing family under `Afroasiatic`.
- **Nobiin (`fia`) is `Nilo-Saharan` / `Saharan`.** Glottolog `nobi1240` places it
  Nilo-Saharan → Saharan → Eastern Saharan → Nubian. `Saharan` is an existing family under
  `Nilo-Saharan` (Kanuri, Daza, Zaghawa, Tadaksahak), and is the correct level for this catalog's
  two-level scheme.
- **Four rows use the existing `Niger-Congo` family as a catch-all** rather than inventing values:
  `bky` Bokyi (Bendi), `khj` Kuturmi (Platoid), `avi` Avikam (Kwa), `mua` Mundang (Mbum). The
  catalog has no family for Bendi, Platoid, Kwa or Mbum, and 51 existing entries already sit in
  the `Niger-Congo` bucket for exactly this reason. The finer branch is recorded here so nobody
  has to re-derive it.
- **Bokoto (`bdt`) is `Adamawa`.** Gbaya is Adamawian in Glottolog, and `Adamawa` is an existing
  family under `Niger-Congo` (Caka, Mumuye).
- **Nara (`nrb`) uses the existing `Nilo-Saharan` family.** Nara is Eastern Sudanic; the catalog
  has no Eastern-Sudanic value, and 13 entries already use the bare `Nilo-Saharan` family.
- **`Gulf Arabic` is `North Arabian`** because that is where the catalog files the other two
  `afb`-adjacent entries (Ancient North Arabian, Dadanitic) and the only two regions in use under
  that family are `Middle East`. The seeds are Gulf states, so the region is consistent.
- **Two rows are siblings of a family that is already catalogued:** `ntp` Northern Tepehuan and
  `alc` Qawasqar join the existing `Piman` and `Chonan` families rather than creating new ones.

### Rows that carry two bases

Four languages had two namebase records. Both are now reachable through one catalog row, which is
what the duplication problem calls for:

| iso | bases | overlap |
|---|---|---|
| `kbr` Kafa | 1143, 20713 | 1143 is 31 Kafa villages; 20713 is 47 seeds that also include Bench Maji, Meinit, Sheka and Jimma, i.e. some borrowed towns |
| `sid` Sidamo | 947, 14152 | same language under two spellings, 14 seeds in common |
| `wal` Wolaytta | 957, 20714 | same language under two spellings, 10 seeds in common |

## Entries whose name did not match its language

These are the ones where a plausible-looking ISO code would have silently attached a language to
the wrong data.

| entry | name says | the language actually is | why it matters |
|---|---|---|---|
| 20572 | Bidiya | ISO `bid` is **Bidiyo**, Chadic, Guera region of **Chad**. The 25 seeds (Mongo, Abou Telfane, Niergui, Kafila, Tchakor) are all **Moroccan** Anti-Atlas. | adding it would feed Berber-country names to a Chadic label |
| 20513 | Bembe | `bmb` is Bembe of Tanzania/Kivu, and this entry shares **14 of its 25 seeds** (Fizi, Uvira, Itombwe, Kalemie, Mwenga, Baraka, Kazimia, Sebele, Swema, Minembwe, Kilembwe, Luberizi, Ruzizi, Kabambare) with the catalogued `bembe-drc` (base 20556). | a second catalog line for a language already present |
| 201038 | Tohono O'odham | `ood` is genuinely Tohono O'odham, but this entry shares **8 of its 14 seeds** (Sells, San Simon, Santa Rosa, Topawa, Pisinemo, Vamori, Gu Vo, Gila Bend) with the catalogued `oodham` "O'odham" (base 8483), which is Pima O'odham + Tohono towns. | sibling languages, but indistinguishable in the UI; needs a human call |
| 201160 | Samo | `smq` is East Strickland Samo, **Western Province** PNG. The catalog already has `samo` "Samo (Papua New Guinea)". | exact duplicate under a different key |
| 203195 | Bijiang Bai language | `bfc` ref name is Panyi Bai, whose denotations include Bijiang Bai (ISO CR 2013-006). The catalog already has `bijiang-bai`. | exact duplicate under a non-ISO key |
| 2387 | Kayort | `kyv` is Kayort, but the catalog's `kyv` is labelled **"Kewat"**. The iso is taken. | would be a duplicate iso, and the existing label is itself wrong |
| 2499 / 21111 | Mundu | Mundri County (Western Equatoria, South Sudan). The catalog already has `mundari` "Mundari" — filed, oddly, as `Asia` / Austroasiatic / Munda. | duplicate; the catalog's own classification looks wrong |
| 11532 | Kilba | ISO `hbb` ref name is **Huba**, also called Kilba. The catalog already has `huba` "Huba". | duplicate under the ISO's other name |
| 893 | Auyokawa | `auo` is Auyokawa, **Scope: E (extinct)**, Tupian, Minas Gerais. The catalog already has `auyokawa` — filed, wrongly, as `Africa` / Afroasiatic / Chadic. | duplicate; the existing classification is wrong in three fields |
| 1001 | Khoekhoe | `naq` ref name is Khoekhoe; the catalog already has `naq` "Nama". Same language. | duplicate |
| 200345 | Magar (Dhut) | no Dhut code exists; `mgp` (Magar) is taken by the catalog's "Eastern Magar". The seeds are western-Nepal districts, several of them (Darchula, Dadeldhura) Dotiyal rather than Magar. | no distinct code to write |
| 494 | Bassa | `bsq` is Bassa, **Liberian Kru**. The 30 seeds are Cameroonian and share **25 of 30** with entry 247 Basaa (`bas`). | duplicate of 247 under a second spelling |
| 1228 | Bila | `bip` is Forest Bira, **DRC**. The 131 seeds (Bal, Bibal, Mayo Beli, Kerke, Kamkam) are all **South Sudan**, in Bari country. | code and data disagree |
| 14148 | Geez | `gez` is a **liturgical** language with no speech community. The 28 seeds (Keren, Agordat, Barentu, Massawa, Assab) are Eritrean **Tigre** country. | the entry is Tigre, mislabelled |
| 5394 | Tonga Zambia | `toi` is Tonga of Zambia. This entry's 81 seeds (Mahwelereng, Mokopane, Bakenberg, Modimolle) are all **Limpopo, South Africa**. Entry 13445 holds the correct Zambezi Tonga. | added `toi` from 13445 only |
| 5260 | Aro | Arochukwu is Igbo; the main languages are Igbo, Ibuoro and Nkari. There is **no ISO 639-3 "Aro"** — the only `aro` in the catalog is Araona (Tacanan, South America). | no code exists |
| 13491 | Kar | `kar` is a **collective** code (Karen), not an individual language, and the catalog's `kar` is "Karen". The 20 seeds (Myitkyina, Bhamo, Tagaung, Kyaukme, Sagaing) are **Northern Shan**, so the name is not Karen either. | unresolvable |
| 11030 | Dry | not a language name. The 26 seeds are a mix of Plateau State, Niger State, Benue and one Guinean town (Kindia). | garbage |
| 200167 | Siri | 1 seed ("Sini Ningi"), so not a real seed list. The catalog's `siri` is "Siri (Chadic)". | 1 seed, and `siri` is taken |
| 5819 | Mika Huitoto | there is no "Mika" and no "Mika Huitoto" in ISO 639-3. The Huitotoan codes are `hto` Minica, `huu` Murui, `hux` Nüpode. | not a language |
| 20712 | Mao | "Mao" names at least two unrelated peoples (Omotic in Ethiopia, Sino-Tibetan in Nepal). The 18 seeds are Benishangul-Gumuz. | name is ambiguous |

## Skipped, with reasons

54 of the 94 candidate entries were skipped. Each one is in exactly one bucket below.

### Duplicate — the language is already in the catalog (19)

A second line for any of these is exactly the problem this catalog was cleaned of. This is the
single largest correction to t6, which marked 16 of these 19 "ready".

| entry | name | already in the catalog as |
|---|---|---|
| 4 | Castillian | `spa` Spanish, and the name **Castilian Spanish** |
| 47 | Ju/'hoan Click | `ju-hoan` "Juǀʼhoan" (Khoe-Kwadi / Kx'a) |
| 49, 22001 | Sandawe Click ×2 | `sandawe` "Sandawe" (Isolate / Sandawe) |
| 1001 | Khoekhoe | `naq` "Nama" — `naq`'s ISO ref name *is* Khoekhoe |
| 181, 203249, 203250 | Barlavento / São Nicolau / Santo Antão Creole | `kea` "Cape Verdean" (Creole / Portuguese Creole) |
| 625 | Somontanoés | `aragonese` "Aragonese" |
| 893 | Auyokawa | `auyokawa` "Auyokawa" |
| 11532 | Kilba | `huba` "Huba" — `hbb`'s other name |
| 1626 | Chilsso | `clh` "Chilisso" — the namebase spelling `Chilsso` is the misspelling |
| 200263 | Chepang (ISO) | `cdm` "Chepang" |
| 200345 | Magar (Dhut) | `mgp` "Eastern Magar" — no Dhut code exists |
| 20048 | Manipuri | `mni` "Meitei" |
| 22000 | Naro Click (Kalahari East) | `nhr` "Naro" |
| 23006 | Judeo-Mantuan | `judeo-italian` "Judeo-Italian" — no separate Mantuan code |
| 23007 | Judeo-Piedmontese | `pms` "Piedmontese Names"; seeds identical to entry 555 |
| 2387 | Kayort | `kyv`, labelled "Kewat" |
| 24801 | Gan Chinese | `gan` "Gan" |
| 25303 | Irish Gaelic | `gle` "Irish" |

### Duplicate found by seed overlap or a non-ISO catalog key (4)

| entry | name | why |
|---|---|---|
| 20513 | Bembe | shares **14 of 25 seeds** with the catalogued `bembe-drc` |
| 201038 | Tohono O'odham | shares **8 of 14 seeds** with the catalogued `oodham` "O'odham" |
| 201160 | Samo | the catalog has `samo` "Samo (Papua New Guinea)" — same language, same Glottocode |
| 203195 | Bijiang Bai language | the catalog has `bijiang-bai`; ISO change request 2013-006 made Panyi Bai (`bfc`) the denotation of Bijiang Bai |

### Unverified ISO — no code exists, or the code was retired (12)

| entry | name | why |
|---|---|---|
| 20 | Ijaw | no code; `ijo` is an ISO 639-5 family code, and the 43 seeds span Izon, Ibani and Kalabari |
| 3258 | Barga | no code; possibly a Bari dialect label |
| 667 | Liberian Pidgin English | `lir` is the creole/vernacular, `pcm` is Nigerian Pidgin — a human must pick |
| 814 | Aizi | three codes (`ahi`, `ahm`, `ahp`); the 176 seeds must be split first |
| 11037 | Kwanyama | standardised dialect of Oshiwambo, no dedicated code |
| 11538 | Hun-Saare | `dud` was **retired 2019-01-25** (CR 2018-014), split into `uth` + `uss` |
| 200565 | Vietnamese South | falls under `vie` |
| 203246 | Daman Creole | no code |
| 203249, 203250 | São Nicolau / Santo Antão Creole | island varieties of `kea`, which is taken |
| 5825 | Miraña | no code in the current table; 7 seeds |
| 201034 | Pima | ISO has no Pima: `pim` is Powhatan, `ora`/`ood` are O'odham. Seeds are Tohono country, already held by 201038 |

### Not a catalog language — a group, a branch, a period, or nothing (11)

| entry | name | what it actually is |
|---|---|---|
| 23 | Mesopotamian | a period/region label over Akkadian, Sumerian, Eblaite, Hurrian |
| 24 | Iranian | a branch label over Persian, Kurmanji, Pashto, Ossetic, Wakhi and more |
| 2680 | Ob-Ugric | a proposed grouping of Khanty and Mansi; its 67 "seeds" are **river names** |
| 10021 | Min Chinese | a branch covering Min Nan, Min Bei, Min Dong, Pu-Xian |
| 20060 | Miao | an exonym covering 20+ Miao codes; seeds are Qiandongnan Miao, and `hmn` (Hmong) is taken |
| 20712 | Mao | at least two unrelated peoples share the name; no code can be assigned from it |
| 5260 | Aro | an Igbo dialect (Arochukwu's main languages are Igbo, Ibuoro, Nkari); no code exists |
| 13491 | Kar | a Karen **collective** code, and the seeds are Northern Shan, so not Karen either |
| 11030 | Dry | not a name at all; the seeds mix Plateau State, Niger State, Benue and Kindia, Guinea |
| 200167 | Siri | one seed ("Sini Ningi") — not a seed list |
| 5819 | Mika Huitoto | there is no "Mika"; the Huitotoan codes are `hto` Minica, `huu` Murui, `hux` Nüpode |

### The code exists but describes different data (6)

| entry | name | the mismatch |
|---|---|---|
| 494 | Bassa | `bsq` is Liberian Kru; the seeds are Cameroonian and share 25 of 30 with entry 247 Basaa |
| 1228 | Bila | `bip` is Forest Bira, DRC; the 131 seeds are all South Sudan, in Bari country |
| 14148 | Geez | `gez` is liturgical with no speech community; the seeds are Eritrean Tigre country |
| 20572 | Bidiya | `bid` is Chadic, Chad; the seeds are Moroccan Anti-Atlas |
| 5394 | Tonga Zambia | `toi` is Zambian; the 81 seeds are Limpopo, South Africa. Entry 13445 holds the right data and is what the new row uses |
| 13663 | Makonde | same language as 10280 but 9 of its 27 seeds are classification metadata. Superseded by 10280, which is what the new row uses |

## A new defect the new rows expose

`khj` Kuturmi (base 1979) is a real language with a verified code, but its 108 "seeds" are
mostly **scraped metadata**, not placenames: `Plateau Language`, `ISO 639-3:khj`, `Niger-Congo`,
`Latitude 9.5 North`, `Longitude 7.5 East`, `Population 21000`, `Ethnologue 2016`,
`Total Languages 1`, `Persecution Rank 7`, `Open Doors Top 50`. About 20 are real Kachia-area
villages. Adding the row is correct at the catalog level, but **selecting Kuturmi in the mixer will
emit strings like "Ethnologue 2016" as a place name.** The seed list has to be cleaned in
`namebases-africa.js` first. This is the only new row I added with a known-bad `b` field.

`13663` Makonde has the same problem in milder form (9 of 27 seeds are classification metadata:
`Bantu`, `Niger-Congo`, `Atlantic-Congo`, …), which is why the `kde` row points at the clean
entry 10280 only and leaves 13663 unreferenced.

## Verification results

| check | result |
|---|---|
| catalog entries before → after | 3691 → 3728, monotonic increase only |
| map rows before → after | 4304 → 4341, monotonic increase only |
| no family spans more than one category | **pass** — the only violation is the pre-existing `English-based` (Creole + Pidgin), untouched |
| no catalog entry has an empty `family` or `category` | **pass** (0 / 0) |
| `"Mixed"` / `"Unclassified"` used as a value | **pass** (0) |
| no duplicate `iso` in the catalog | **pass** |
| no duplicate `iso` in the map | **pass** (0 across all 4341 rows) |
| every base index written exists in `public/modules/namebases-*.js` and has seeds | **pass** — 40/40 |
| no new `family` or `category` value invented | **pass** — 562 and 95 before and after |
| every added entry has exactly one map row | **pass** |
| `node tools/mixer-core/diff-language-families.js` | **exit 0**, "OK: No family values exist only in language-mixes-all.js, and no mismatches versus JSON" |
| `node tools/namebase-tools/verify-namebase-integrity.js --quiet` | **exit 1**, single error `M003` — generated-file drift, expected (see below) |
| `git diff --stat` | `config/language-mixer-map.json`, `config/language-mixes.json` — 518 insertions, **0 deletions** |

### The M003 failure is generated-file drift, and only that

```
M003  x1
    [config/] generated .js copies are stale against their .json sources.
    Run: node tools/regenerate-js-from-json.js
    (DRIFT config/language-mixes-all.js differs from config/language-mixes.json;
     DRIFT public/config/language-mixes-all.js differs from config/language-mixes.json;
     DRIFT config/language-mixer-map.js differs from config/language-mixer-map.json;
     DRIFT public/config/language-mixer-map.js differs from config/language-mixer-map.json)
```

I confirmed the bundles were **exactly** in sync before this change, by parsing all four generated
`.js` files and comparing them entry-by-entry against `git show HEAD:config/language-mixes.json`
and `git show HEAD:config/language-mixer-map.json`: **0 differing entries and 0 differing rows**
in all four. The only difference now is my 37 additions. Those four `.js` files are generated and
outside my file ownership, so `node tools/regenerate-js-from-json.js` will clear it. M003 is the
only blocking error in the run; no `E`-class namebase error is reported at all.

## Follow-ups for a human

1. Run `node tools/regenerate-js-from-json.js`.
2. Clean the Kuturmi seed list (1979) before anyone selects `khj`.
3. Decide Tohono O'odham (201038) vs the catalog's `oodham` "O'odham" (base 8483) — sibling
   languages, eight shared seeds, and they cannot be told apart in the UI as it stands.
4. Three existing catalog entries are filed wrongly and are worth correcting: `auyokawa`
   (Africa/Afroasiatic/Chadic, should be Tupian and extinct), `mundari` (Asia/Austroasiatic/Munda),
   and `kyv` "Kewat" (ISO `kyv` is Kayort, not Kewat).
5. 37 more namebase entries are orphaned but their language is already catalogued — see the list
   in *How the candidate set was derived*. Fixing those means editing the map, not the catalog.
