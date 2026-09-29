# T5 - The 107 populated duplicate groups that need a human decision

**Scope.** `C:\Users\user\AppData\Local\Temp\kilo\work\task5-needs-human.json` - 107 groups of two or
more namebase entries that share a normalised name and all have non-empty seed lists, but were excluded from
automatic merging because more than one member is referenced by a `config/language-mixer-map.json` row, or
neither is.

**Data read.** Current on-disk state of `public/modules/namebases-*.js`, `config/language-mixer-map.json` and
`config/language-mixes.json`, loaded through the same `namebases-all.js` pipeline the app uses (so the index
space matches production). `config/language-mixer-map.js` and `.json` were diffed and are byte-for-byte
equivalent (4304 rows each, 0 differing `bases`). The map is unchanged from `HEAD` - nothing here is the work
of a concurrent editor.

---

## Verdict at a glance

| | count |
|---|---|
| **Safe to merge** (canonical named, seeds imported, shadow rows deleted) | **103** |
| **Keep as-is - these are NOT duplicates** | **2** |
| **Genuinely need a human decision after more research** | **2** |
| total | 107 |

Of the 103 merges, **38** are pure deletions - the loser is fabricated filler or a stale copy and none of its
seeds should be imported (the index 202241-203262 padding cluster, plus the stale copies Tibetan 20065,
Mapudungun 7944, Ingush 203197 and German 203009). The other **65** are genuine duplicate coverage where the
loser's unique, verified placenames should be merged into the canonical entry first.

---

## What the data actually looks like

Three findings drove every decision in the table. They are reproducible from the files and are not judgement
calls.

### 1. Every group is "catalog member vs. shadow member"

`config/language-mixer-map.json` has 4304 rows but `config/language-mixes.json` has 3691 catalog entries.
**515 rows carry an `x-` prefix** (for example `x-tsonga`, `x-bezhta`) and only 4 of those have a catalog
entry. These synthetic rows were created by `tools/namebase-tools/unique-indices.js` in commit `a5b60bc8`
("fix(mixer): repair the ISO-to-namebase map and give every entry a unique index"), which gave the losing entry of
an index collision a fresh index above the maximum and added an `x-<slug>` row so the map stayed append-only.
**An `x-` row is therefore evidence of a duplicate, not of a distinct language.**

The other shadow rows are **ISO 639-1 two-letter codes** (`af`, `de`, `hi`, `ur`, `uz`, `th`, `my`,
`tl`, `yo`, `ro`, `ku`, `ms`, `es`, `ta`) and **misassigned three-letter codes** (see finding 3). The
catalog only ever used ISO 639-3.

So the operational rule is: **the member reachable from a row whose `iso` exists in `language-mixes.json` is
the one in production and is the default canonical.** In 104 of 107 groups exactly one member has such a row.

### 2. A cluster of `x-` entries is fabricated filler, not better data

38 of the 107 groups have a loser that is fabricated filler or a stale copy rather than a second data source.
The filler sits in indices 202241-203262 and shares one signature: **the first seed is the language's own
name**, followed by cities from a completely different country.

| entry | first seed | next seeds |
|---|---|---|
| 202794 "Andi" | `Andi` | `Quba`, `Qonagkend`, `Vladimir` (Azerbaijan / Russia) |
| 203010 "Icelandic" | `Icelandic` | `Gabala`, `Telavi`, `Lahij` (Azerbaijan) |
| 202920 "Northern Veps" | `Northern Veps` | `Canterbury`, `Soroca`, `The Hague` |
| 202811 "Wakhi" | `Wakhi` | `Andijan`, `Naryn`, `Puli Khumri` (Uzbekistan / Bangladesh) |
| 202703 "Tulu" | `Tulu` | `Lucknow`, `Jhang`, `Chennai` (India) |
| 202969 "Tundra Enets" | `Tundra Enets` | `Grodno`, `Brno`, `Mogilev` (Belarus) |
| 203036 "Upper Saxon" | `Upper Saxon` | `Oxford`, `Utrecht`, `Daugavpils` |
| 202894 "Kuuďärv Ludic" | `Kuuďärv Ludic` | `Canterbury`, `Soroca`, `The Hague` |
| 202604 "Rajasthani" | `Rajasthani` | `Dehradun`, `Nagpur`, `Agra` |
| 202583 "Pashto, Southern" | `Pashto` | `Tokmok`, `Kostanay`, `Rasht` (Kazakhstan) |

Across the whole namebase set 325 entries begin with their own name, and 116 of them sit in the 202700-203100
window. This is not a naming convention - Russian, Azerbaijani, Belarusian, Bangladeshi, British and Indian
cities are not settlements of Caucasian, Arctic, Sámi, Indian or Papuan languages. **These entries must be
deleted, not merged.** Merging them would inject foreign placenames into the name generator.

Not all `x-` entries are filler. Entries 203235 "Venda" (106 seeds: Thohoyandou, Louis Trichardt, Makhado),
203236 "Tsonga" (132: Giyani, Phalaborwa, Polokwane), 20153 "Bashkir" (175: Ufa, Sterlitamak, Salavat) and the
whole 10000-10045 band (Hindi 10000 = 256 seeds of real Delhi/Agra, German 10041 = 163 real German cities) are
**genuine research data that landed on a shadow row**. Those seeds should be imported.

### 3. 21 groups also carry a corrupt row whose ISO names a different language

This is a second, independent defect and it is not visible from the entry names at all:

| group | shadow row ISO | that ISO is actually | entry's own data |
|---|---|---|---|
| Oromo (20033) | `kur`, `bho` | Kurmanji, Bhojpuri | correct Oromo towns |
| Sotho (20172) | `afr` | Afar | correct Sotho towns |
| Luo (13605) | `ka` | Georgian | correct Luo towns |
| Kirundi (20171) | `wof` | Wolof | correct Kirundi towns |
| Lisu (20063) | `rum` | Romanian | correct Lisu towns |
| Hakka (20059) | `tha` | Thai | correct Hakka towns |
| Avar (20020) | `tel`, `bar` | Telugu, Bari | correct Avar towns |
| Abkhaz (20026) | `snd` | Sindhi | correct Abkhaz towns |
| Ingush (20024) | `urd` | Urdu | correct Ingush towns |
| Piedmontese (20126) | `es` | Spanish | correct Piedmont towns |
| Venetian (20124) | `mai` | Maithili | correct Venetian towns |
| Norwegian (20009) | `ibo` | Igbo | correct Norwegian cities |
| Romansh (24791) | `the` | The | correct Romansh towns |
| Slovak (20004) | `bur` | Burmese | correct Slovak cities |
| Yiddish (24788) | `hau` | Hausa | correct Yiddish shtetl |
| Dalmatian (24789) | `ms` | Malay | correct Dalmatian towns |
| Neapolitan (20123) | `ta`, `central-hilali-dialects` | Tamil, Algerian Berber | correct Neapolitan cities |
| German (203009) | `nds` | Low German | junk (`Prilep`, `Łódź`, `Cork`) |
| Awadhi (20055) | `aze` | Azerbaijani | correct Awadhi towns |
| Suoy (202659) | `suy` | Suyá (Brazil) | correct Pearic Suoy (Cambodia) - **confirmed independently by the asia research agent on the board** |
| Wayuu (20101) | `sin` | Sinhala | correct Wayuu towns |

In every one of these the **entry data is right and the row is wrong**. Deleting the row is correct; so is
merging the entry into its catalog sibling. Do not delete the entry on the strength of the row.

### Cross-cutting notes

- **11 groups have a continent misfiling on one side.** Chechen, Circassian, Abkhaz, Avar, Ossetian and Ingush
  split across `asia`/`europe`; South Oran-Figuig Berber (202311) and Kombai-Wanggom (2254) are filed in
  `oceania`/`asia` while being North African / New Guinean; Egyptian Arabic (203059) is in `asia`; Tzotzil
  (20228) and Mixtec (20230) are Mexican entries filed in `southAmerica`. The continent fix must survive the merge.
- **3 groups have no map row on either member** - Kafa, Mundu, Makonde. Their duplicates are invisible to the app
  and are also catalog gaps.
- **Cross-group duplicate found:** entries **200884 "Standard Swedish" and 200886 "Swedish (native-speakers
  subset)" share 33 of 34 seeds** - the same list under two names, both catalogued. This is a human decision
  (which name is canonical), not a merge this pass can make.
- **Live-app check.** `src/index.html` (lines 5217-5224) does not load `modules/namebases-research.js`. I
  re-ran the loader with and without it: **all 219 members of these 107 groups, and all 90 Task B entries, are
  present in the continent files and live in the shipped app.** Nothing in this report depends on research-only
  indices.

---

## A. Merge - 103 groups

| name | indices | recommended canonical | confidence | reasoning |
|---|---|---|---|---|
| Tsonga | 100 (keep) / 203236 (drop) | 100 | high | Catalog row `tsonga-or-xitsonga`/`tso` already selects 100; 203236 only exists because of its synthetic `x-tsonga` row. **Note:** 132-seed 203236 carries real extra towns (Phalaborwa, Polokwane) - import them. Row `x-tsonga` is then removed. |
| Afrikaans | 596 (keep) / 10039 (drop) | 596 | high | `afrikaans` catalog row selects 596; 10039 is only reachable via the bare ISO 639-1 row `af`, which has no catalog entry. **Note:** Import 10039's extra towns. `af` is a shadow row, not a second language. |
| Yoruba | 772 (keep) / 10010 (drop) | 772 | high | `yor`/`yor2`/`yor3` catalog rows select 772 (80 seeds); 10010 (149 seeds) is only reachable via the bare ISO 639-1 row `yo`. **Note:** Clear seed-count win for 10010 - import all 149 into 772 and drop `yo`. |
| Oromo | 1067 (keep) / 20033 (drop) | 1067 | high | Five catalog rows (`oromoid`,`oromo`,`orm`,`orm2`,`orm3`) select 1067; 20033 carries rows `kur` and `bho` that name Kurdish and Bhojpuri. **Note:** Seed data in 20033 (Adama, Bishoftu, Jimma, Nekemte) is genuinely Oromo - import it. Rows `kur`/`bho` are corrupt and must be repointed or removed. |
| Kafa | 20713 (keep) / 1143 (drop) | 20713 | medium | Neither member has any map row, so this is cosmetic; 20713 has 47 seeds vs 31 and the same 3-14 band. **Note:** Both are also dead catalog gaps (Kafa, 47 seeds, no row) - see the Task B report. |
| Mundu | 2499 (keep) / 21111 (drop) | 2499 | medium | Neither member has a map row; 2499 has 47 seeds vs 21111's 9 and a superset (jaro=0.67). **Note:** Dead in both the map and the catalog; lowest-risk merge in the set. |
| Sotho | 5384 (keep) / 20172 (drop) | 5384 | high | `sotho`/`sot` catalog rows select 5384; 20172 is only reachable via row `afr`, which names Afar. **Note:** 20172's seeds (Maseru, Teyateyaneng) are genuinely Sotho - import all 131. Row `afr` is corrupt. |
| Luo | 5874 (keep) / 13605 (drop) | 5874 | medium | `luo` catalog row selects 5874; 13605 is reachable only via row `ka` (Georgian) plus a synthetic `x-luo` row. **Note:** 13605's seeds (Kisii, Awendo, Awang) are Luo but Kenyan, not the Dholuo core - import selectively. Row `ka` is corrupt. |
| Makonde | 10280 (keep) / 13663 (drop) | 10280 | medium | Neither member has a map row; 10280 (Mozambique, Cabo Delgado) and 13663 (Tanzania, Mtwara/Lindi) are two ends of one language. **Note:** Merge but keep the Tanzanian place names; both halves are needed. |
| Venda | 13447 (keep) / 203235 (drop) | 13447 | high | `venda`/`ven` catalog rows select 13447; 203235 hangs off a synthetic `x-venda` row with an empty `d` field. **Note:** 203235's 106 seeds (Louis Trichardt, Polokwane) are real Venda-area towns - import them. |
| Kirundi | 13750 (keep) / 20171 (drop) | 13750 | high | `kirundi`/`run`/`run2` catalog rows select 13750; 20171 is reachable only via row `wof` (Wolof). **Note:** 20171's 80 seeds (Bujumbura, Rumonge) are genuine Kirundi - import. Row `wof` is corrupt. |
| Bangala | 203224 (keep) / 23002 (drop) | 203224 | medium | `bangala` catalog row selects 203224 (COMPLETE); 23002 is a 20-seed WAITING entry behind `x-bangala`. **Note:** Import 23002's Congo towns (Lisala, Bumba, Bondo); both are Bangala. |
| South Oran and Figuig Berber | 201011 (keep) / 202311 (drop) | 201011 | high | `south-oran-figuig-berber` catalog row selects 201011 (africa); 202311 is a synthetic `x-` copy parked in the **oceania** file. **Note:** 202311's seeds (Tiout, Boussemghoun, Moghrar) are real Algerian Berber villages - import, and do not lose the continent misfiling in the merge. |
| Algerian Arabic | 267 (keep) / 24798 (drop) | 267 | high | `algerian-arabic`/`arq` catalog rows select 267; 24798 is a synthetic `x-` copy with Arabic-script variants (Al, Jazair). **Note:** Keep the Latin forms from 267; do not import Arabic-script strings as seeds. |
| Egyptian Arabic | 203059 (keep) / 24794 (drop) | 203059 | high | `egyptian-arabic`/`arz` catalog rows select 203059 - but that entry is filed under **asia**, while Egypt is in africa. **Note:** 24794 (x-egyptian-arabic, africa) has the same Cairo/Alexandria data; merge into 203059 and fix the continent. |
| Kannada | 25 (keep) / 2104 (drop) | 25 | high | `kannada`/`kan2` catalog rows select 25 (88 seeds); 2104 is a 41-seed synthetic `x-kannada` copy. **Note:** Import 2104's Hubballi-Dharwad/Shivamogga; both are genuine Karnataka towns. |
| Chechen | 1555 (keep) / 20019 (drop) | 1555 | high | `chechen`/`che` catalog rows select 1555 (asia); 20019 is a synthetic `x-chechen` copy in the **europe** file. **Note:** Grozny/Argun/Gudermes are the same towns; merge and settle the continent (North Caucasus). |
| Circassian | 1617 (keep) / 20162 (drop) | 1617 | high | `circassian`/`ady` catalog rows select 1617 (asia); 20162 is a synthetic `x-circassian` copy in the **europe** file. **Note:** Both are Adyghe; merge and fix the continent. |
| Karakalpak | 2017 (keep) / 20030 (drop) | 2017 | medium | `karakalpak`/`kaa` catalog rows select 2017, but one of its seeds is `Konya` (Turkey) - a placeholder error. **Note:** 20030 (Nukus, Khujayli, Beruniy, Turtkul) is the authentic Karakalpak list - import all 34 and drop `Konya`. |
| Kombai-Wanggom | 2254 (keep) / 202349 (drop) | 2254 | high | Same language, zero shared seeds (jac=0.00) - the two entries cover different Papuan districts. 2254 is the catalog target but is filed under **asia**. **Note:** Boven Digoel/Mappi (2254) and Wanggemalo/Asmat (202349) are complementary; merge and move 2254 to oceania. |
| Kuki Chin | 201375 (keep) / 2453 (drop) | 201375 | high | `kuki-chin`/`kuki-chin-naga` catalog rows select 201375 (75 seeds); 2453 is a synthetic `x-kuki-chin` copy. **Note:** Import 2453's Chandel/Kangpokpi; both are Northeast India. |
| Kurukh | 2297 (keep) / 20050 (drop) | 2297 | high | `kurukh`/`kru` catalog rows select 2297, but its 20 'seeds' are Indian **states** (Jharkhand, Chhattisgarh, Odisha, West Bengal), not settlements. **Note:** 20050 (Gumla, Simdega, Latehar, Lohardaga) is the authentic Jharkhand district list - import all 48 and drop the state names. |
| Parkari Koli | 2300 (keep) / 2385 (drop) | 2300 | medium | `kvx` catalog row selects 2300; 2385 shares only 8 of 33 seeds but both are Tharparkar/Sindh (Mithi, Nagarparkar, Islamkot, Diplo). **Note:** 2385's `d` field holds a real description; import its unique seeds. |
| Abkhaz | 2351 (keep) / 20026 (drop) | 2351 | high | `abkhaz`/`abk` catalog rows select 2351 (asia); 20026 is in the **europe** file and carries row `snd` (Sindhi) plus a synthetic `x-abkhaz`. **Note:** Sukhumi/Gagra/Pitsunda are Abkhaz; import 20026 and fix both the continent and the corrupt `snd` row. |
| Levantine Arabic | 2418 (keep) / 24795 (drop) | 2418 | high | `levantine-arabic`/`apc` catalog rows select 2418; 24795 is a synthetic `x-` copy carrying Arabic-script variants (Dimashq, Halab). **Note:** Keep the Latin forms; do not import Arabic-script strings. |
| Lisu | 2428 (keep) / 20063 (drop) | 2428 | high | `lisu`/`lis` catalog rows select 2428 (Deqen/Lan/Wuding); 20063 is reachable only via row `rum` (Romanian). **Note:** 20063's Lijiang/Nujiang/Fugong seeds are Nujiang Lisu - import all 76. Row `rum` is corrupt. |
| Avar | 2431 (keep) / 20020 (drop) | 2431 | high | `ava` catalog row selects 2431 (asia); 20020 is in the **europe** file with rows `tel` and `bar` (Telugu, Bari) - both wrong. **Note:** Khunzakhsky/Tsezensky are Avar; import 20020 and drop the two corrupt rows. |
| Tibetan | 2438 (keep) / 10022, 20065 (drop) | 2438 | high | `bod`/`bod2` catalog rows select 2438; 10022 is reachable via row `tib`; 20065 has no row and shares 59 of 86 seeds with 10022. **Note:** Import 10022 (Lhasa/Gyantse), delete 20065 as a near-copy, add `tib` to the catalog rather than leaving it shadowed. |
| Hakka | 2465 (keep) / 20059 (drop) | 2465 | high | `hakka`/`hak` catalog rows select 2465; 20059 (88 seeds) is reachable only via row `tha` (Thai). **Note:** Meizhou/Heyuan/Huizhou are genuine Hakka - import all 88. Row `tha` is corrupt. |
| Hindi | 2574 (keep) / 10000 (drop) | 2574 | high | `hin`/`hin2` catalog rows select 2574 (72 seeds); 10000 has 256 seeds and is reachable only via the ISO 639-1 shadow row `hi`. **Note:** Clear seed-count win for 10000 - import all of it into 2574 and drop `hi`. |
| Urdu | 2594 (keep) / 10006 (drop) | 2594 | high | `urdu` catalog row selects 2594 (66 seeds); 10006 (165 seeds) sits behind the ISO 639-1 shadow row `ur`. **Note:** Import 10006's 165 seeds into 2594. |
| Uzbek | 2617 (keep) / 10029 (drop) | 2617 | medium | `uzbek` catalog row selects 2617; 10029 (65 seeds) sits behind the ISO 639-1 shadow row `uz`. **Note:** Overlaps are high (jaro=0.35) so the seed gain is modest; merge and drop `uz`. |
| Tajik | 2620 (keep) / 20115 (drop) | 2620 | high | `tajik`/`tgk`/`tgk2` catalog rows select 2620 (46 seeds, Tajik mountain villages); 20115 (64) is a synthetic `x-tajik` copy with the main cities. **Note:** Import 20115's Dushanbe/Khujand/Kulob - both are genuinely Tajik. |
| Ingush | 2630 (keep) / 203197, 20024 (drop) | 2630 | high | `ingush`/`inh` catalog rows select 2630; 20024 (europe) is a synthetic `x-ingush` copy that also carries the corrupt row `urd` (Urdu). **Note:** Merge 20024 into 2630. The third member 203197 is NOT a duplicate - its 11 seeds are regions and countries (Ingushetia, Chechnya, North Ossetia, Russia) - delete it as junk. |
| Ossetian | 2631 (keep) / 20025 (drop) | 2631 | high | `ossetian`/`oss` catalog rows select 2631 (asia); 20025 is a synthetic `x-ossetian` copy in the **europe** file. **Note:** Vladikavkaz/Mozdok/Beslan are the same; merge and fix the continent. |
| Turkmen | 2633 (keep) / 20164 (drop) | 2633 | high | `turkmen`/`tuk` catalog rows select 2633 (37 seeds); 20164 (66) is a synthetic `x-turkmen` copy. **Note:** Import 20164's Ashgabat/Dashoguz/Mary; identical towns. |
| Zhuang | 2670 (keep) / 20062 (drop) | 2670 | high | `zha` catalog row selects 2670 (24 seeds); 20062 (62) is a synthetic `x-zhuang` copy. **Note:** Import 20062's Nanning/Guilin/Liuzhou/Wuzhou. |
| Thai | 34834 (keep) / 10013 (drop) | 34834 | high | `thai`/`tha2` catalog rows select 34834 (130 seeds); 10013 (102) sits behind the ISO 639-1 shadow row `th`. **Note:** Merge the two Thai lists; `th` is a shadow, not a second language. |
| Burmese | 50033 (keep) / 10014 (drop) | 50033 | high | `burmese`/`mya`/`mya2` catalog rows select 50033; 10014 (102) sits behind the ISO 639-1 shadow row `my`. **Note:** Merge; `my` is a shadow row. |
| Magahi | 200344 (keep) / 20052 (drop) | 200344 | high | `magahi`/`mag` catalog rows select 200344 (29 seeds); 20052 (49) is a synthetic `x-magahi` copy. **Note:** Import 20052's Nawada/Jehanabad - same Magadh region. |
| Marwari | 200363 (keep) / 20054 (drop) | 200363 | high | `wry`/`rwr` catalog rows select 200363 (32 seeds); 20054 (63) is a synthetic `x-marwari` copy. **Note:** Import 20054's Pali/Bikaner; identical towns. |
| Pashto, Southern | 200432 (keep) / 202583 (drop) | 200432 | high | `pbt` catalog row selects 200432 (Kandahar/Quetta/Pishin); 202583 (54 seeds) is a synthetic `x-` copy holding Kazakh cities (Tokmok, Kostanay, Rasht). **Note:** 202583 is fabricated filler, not Pashto - delete it, do not import its seeds. |
| Sapa | 200476 (keep) / 202627 (drop) | 200476 | high | `sapa` catalog row selects 200476 (14 seeds); 202627 holds exactly one seed (`Sa Pa`) and is 100% contained in 200476. **Note:** Trivial merge; import the single seed, which is already present. |
| Suoy | 200508 (keep) / 202659 (drop) | 200508 | high | `suoy` catalog row selects 200508 (16 seeds); 202659 holds one seed (`Phum Krang Trachak`) under the corrupt row `suy` (Suyá, Brazil). **Note:** 202659 is genuine but the row is wrong; keep the seed, drop row `suy`. |
| Thar | 200541 (keep) / 202692 (drop) | 200541 | medium | `thar-bede` catalog row selects 200541 (Rajasthani towns); 202692's 8 seeds are **Bangladeshi** villages (Savar, Kaliganj, Munshiganj, Sunamganj). **Note:** 202692 is mislabelled filler - delete rather than import. |
| Toda | 200545 (keep) / 202696 (drop) | 200545 | high | `toda` catalog row selects 200545 and its `d` field holds a real description; 202696 adds 3 authentic Nilgiris villages (Bikkapathi, Bedukkal, Koduthen). **Note:** Tiny but genuine - import all 3. |
| Tulu | 200552 (keep) / 202703 (drop) | 200552 | high | `tulu` catalog row selects 200552 (Mangalore/Updi coastal Karnataka); 202703 (49 seeds) starts with the word `Tulu` and then lists Lucknow, Jhang and Chennai. **Note:** 202703 is fabricated filler - delete, do not import. |
| Vayu | 200563 (keep) / 202714 (drop) | 200563 | medium | `vay` catalog row selects 200563 (Dang/Tanahun/Gorkha/Rolpa); 202714's 9 seeds (Mudajor, Sukajor, Manedihi, Wadi) are generic, with the language name as its first seed. **Note:** 202714 shows the synthetic-padding pattern - delete rather than import. |
| Wadiyara Koli | 200571 (keep) / 202721 (drop) | 200571 | high | `kxp` catalog row selects 200571 (Sukkur/Larkana/Nawabshah); 202721 (50 seeds) starts with `Wadiyara Koli` then lists Hyderabad, Kochi and Pune. **Note:** 202721 is fabricated filler - delete. |
| Wakhi | 200661 (keep) / 202811 (drop) | 200661 | high | `wakhi` catalog row selects 200661 (Wakhan/Ishkashim/Putur) and carries a real description; 202811 (51 seeds) starts with `Wakhi` then lists Andijan, Naryn and Puli Khumri. **Note:** 202811 is fabricated filler - delete. |
| Western Middle Aramaic | 200922 (keep) / 202253 (drop) | 200922 | high | `western-middle-aramaic` catalog row selects 200922 (29 seeds); 202253 (51) starts with the language name and then lists Tartus, Aswan and the Turkish city Corum. **Note:** 202253 is fabricated filler - delete. |
| Persian | 2603 (keep) / 10040 (drop) | 2603 | medium | `persian`/`pes`/`pes2` catalog rows select 2603, but its 62 'seeds' are four **country names** (Iran, Afghanistan, Tajikistan, Uzbekistan). 10040 (108 real cities) sits under row `fas` - which is the correct ISO 639-3 code, just absent from the catalog. **Note:** Replace 2603's seed list with 10040's and add `fas` to the catalog rather than leaving it as a shadow row. |
| Kurdish | 2601 (keep) / 10026 (drop) | 2601 | medium | `kurdish`/`kur2`/`kur3` catalog rows select 2601, but its 15 'seeds' are variety and country names (Kurmanji, Sorani, Armenia, Azerbaijan). 10026 (93 real cities) sits under the ISO 639-1 shadow row `ku`. **Note:** Import 10026's Erbil/Sulaymaniyah/Duhok list; keep 2601 as the row target so production output is unchanged. |
| Nedebang | 201113 (keep) / 202372 (drop) | 201113 | high | `nedebang` catalog row selects 201113; 202372 is a 5-seed synthetic `x-nedebang` copy with `Pantar Island` vs `PantarIsland` spelling drift. **Note:** Both lists are tiny; merge the two Alor/Pantar halves. |
| Rapa Nui | 202432 (keep) / 24701 (drop) | 202432 | high | `rapa-nui`/`rap` catalog rows select 202432 (only 4 seeds); 24701 (12 seeds) is a synthetic `x-rapa-nui` copy with the real Hanga Roa hamlets. **Note:** Import 24701 wholesale - it is strictly better data for the same language. |
| Tagalog | 203057 (keep) / 10012 (drop) | 203057 | high | `tagalog`/`tgl`/`tgl2`/`gmh` catalog rows select 203057 (39 seeds); 10012 has 161 seeds and sits behind the ISO 639-1 shadow row `tl`. **Note:** Import 10012's Metro Manila list; `tl` is a shadow row. |
| Odia | 20046 (keep) / 202562 (drop) | 20046 | high | `odia`/`ori` catalog rows select 20046 (Bhubaneswar/Cuttack); 202562 (50 seeds) starts with `Odia` then lists Lucknow, Jhang and Chennai. **Note:** 202562 is fabricated filler - delete. |
| Rajasthani | 20053 (keep) / 202604 (drop) | 20053 | high | `rajasthani`/`raj` catalog rows select 20053 (101 seeds); 202604 (50) starts with `Rajasthani` then lists Dehradun, Nagpur and Agra. **Note:** 202604 is fabricated filler - delete. |
| Dalmatian | 405 (keep) / 24789 (drop) | 405 | high | `dalmatian`/`dlm` catalog rows select 405 (30 seeds); 24789 (74) sits behind the ISO 639-1 shadow row `ms` (Malay). **Note:** Import 24789's Zadar/Spalato/Ragusa; `ms` is a shadow row. |
| Piedmontese | 555 (keep) / 20126 (drop) | 555 | high | `piedmontese`/`pms` catalog rows select 555 (30 seeds); 20126 (110) sits behind row `es` (Spanish), which is wrong. **Note:** Turin/Novara/Alessandria are authentic Piedmontese - import all 110. Row `es` is corrupt. |
| Venetian | 656 (keep) / 20124 (drop) | 656 | high | `venetian`/`vec` catalog rows select 656; 20124 (68) sits behind row `mai` (Maithili), which is wrong. **Note:** Venice/Verona/Padua are authentic Venetian - import. Row `mai` is corrupt. |
| Norwegian | 918 (keep) / 20009 (drop) | 918 | high | `norwegian`/`nor` catalog rows select 918 (25 seeds); 20009 (114) sits behind row `ibo` (Igbo), which is wrong. **Note:** Oslo/Bergen/Trondheim are authentic - import all 114. Row `ibo` is corrupt. |
| Romansh | 2625 (keep) / 24791 (drop) | 2625 | high | `romansh`/`roh` catalog rows select 2625 (104 seeds); 24791 (69) sits behind row `the` (The), which is wrong. **Note:** Chur/Davos are authentic Romansh country - import. Row `the` is corrupt. |
| Bashkir | 2642 (keep) / 20153 (drop) | 2642 | high | `bashkir`/`bak` catalog rows select 2642 (28 seeds); 20153 (175) is a synthetic `x-bashkir` copy holding Ufa/Sterlitamak/Salavat. **Note:** 20153 is genuine Volga-Ural Bashkir - import all 175. |
| Neapolitan | 2669 (keep) / 20123 (drop) | 2669 | high | `neapolitan-lang`/`nap` catalog rows select 2669 (38 seeds); 20123 (110) sits behind rows `ta` (Tamil) and `central-hilali-dialects` (Algerian Berber) - both wrong. **Note:** Naples/Salerno/Torre del Greco are authentic Neapolitan - import all 110. Delete both wrong rows. |
| Slovak | 2715 (keep) / 20004 (drop) | 2715 | high | `slovak`/`slk` catalog rows select 2715 (31 seeds); 20004 (115) sits behind row `bur` (Burmese), which is wrong. **Note:** Bratislava/Kosice/Zilina are authentic - import all 115. Row `bur` is corrupt. |
| Yiddish | 2729 (keep) / 24788 (drop) | 2729 | high | `yiddish`/`yid` catalog rows select 2729 (25 seeds); 24788 (89) sits behind row `hau` (Hausa), which is wrong. **Note:** Vilnius/Vilna/Varshe are authentic - import all 89. Row `hau` is corrupt. |
| Romanian | 201376 (keep) / 10045 (drop) | 201376 | high | `romanian` catalog row selects 201376 (77 seeds); 10045 (179) sits behind the ISO 639-1 shadow row `ro`. **Note:** Import 10045's diacritic-correct list; `ro` is a shadow row. |
| Andi | 200644 (keep) / 202794 (drop) | 200644 | high | `ani` catalog row selects 200644 (Gunkha/Gagatl/Ashali, genuine Andi villages); 202794 (52) starts with `Andi` then lists Quba, Qonagkend and Vladimir - Azerbaijani and Russian towns. **Note:** 202794 is fabricated filler - delete. |
| Bezhta | 200645 (keep) / 202795 (drop) | 200645 | high | `kap` catalog row selects 200645 (Tladal/Khasharkhota); 202795 (55) starts with `Bezhta` then lists Zugdidi, Quba and Xinaliq - Mingrelian/Azerbaijani towns. **Note:** 202795 is fabricated filler - delete. |
| Botlikh | 200646 (keep) / 202796 (drop) | 200646 | high | `bph` catalog row selects 200646 (Miarso/Ashino/Chontaul); 202796 (53) starts with `Botlikh` then lists Telavi, Gabala and Naftalan - Azerbaijani towns. **Note:** 202796 is fabricated filler - delete. |
| Kubachi | 200649 (keep) / 202799 (drop) | 200649 | high | `ugh` catalog row selects 200649 (Amuzgi/Shari/Sulevkent); 202799 (52) starts with `Kubachi` then lists Telavi, Gabala and Naftalan - Azerbaijani towns. **Note:** 202799 is fabricated filler - delete. |
| Mingrelian | 200650 (keep) / 202800 (drop) | 200650 | high | `mingrelian` catalog row selects 200650 (Zugdidi/Poti/Senaki); 202800 (52) starts with `Mingrelian` then lists Gagra and Khachmaz - Abkhaz towns. **Note:** 202800 is fabricated filler - delete. |
| Rutul | 200652 (keep) / 202802 (drop) | 200652 | high | `rut` catalog row selects 200652 (Luchek/Ikhrek/Amsar); 202802 (52) starts with `Rutul` then lists Yevlakh, Lahij and Laryak - Azerbaijani towns. **Note:** 202802 is fabricated filler - delete. |
| Tabasaran | 200654 (keep) / 202804 (drop) | 200654 | high | `tabasaran` catalog row selects 200654 (Khuchni/Turag/Khurik); 202804 (55) starts with `Tabasaran` then lists Gabala, Telavi and Lahij - Azerbaijani towns. **Note:** 202804 is fabricated filler - delete. |
| Kuuďärv Ludic | 200744 (keep) / 202894 (drop) | 200744 | high | `kuu-rv-ludic` catalog row selects 200744 (Petrozavodsk/Kondopoga); 202894 (55) starts with `Kuuďärv Ludic` then lists Canterbury, Soroca and The Hague. **Note:** 202894 is fabricated filler - delete. |
| Mysy | 200762 (keep) / 202912 (drop) | 200762 | high | `mysy` catalog row selects 200762 (Kudymkar/Gaynsk/Yurla, Komi-Permyak); 202912 holds 4 authentic Komi villages (Kudymkar, Kosa, Chazyovo, Shalam). **Note:** Tiny but genuine - import all 4. |
| Northeastern coastal Estonian | 200766 (keep) / 202916 (drop) | 200766 | high | `northeastern-coastal-estonian` catalog row selects 200766 (Tallinn/Prnu/Kohtla-Jarve); 202916 (55) starts with the language name then lists Lisburn, Kharkiv and Mosta. **Note:** 202916 is fabricated filler - delete. |
| Northern Ludic | 200768 (keep) / 202918 (drop) | 200768 | high | `northern-ludic` catalog row selects 200768 (Petrozavodsk/Kondopoga); 202918 (55) starts with the language name then lists Plzen, Glasgow and Viseu. **Note:** 202918 is fabricated filler - delete. |
| Northern Veps | 200770 (keep) / 202920 (drop) | 200770 | high | `northern-veps` catalog row selects 200770 (Vytegra/Boksitogorsk); 202920 (54) starts with the language name then lists Canterbury, Soroca and The Hague. **Note:** 202920 is fabricated filler - delete. |
| Salaca Livonian | 200786 (keep) / 202936 (drop) | 200786 | high | `salaca-livonian` catalog row selects 200786 (Kolka/Mazirbe); 202936 (55) starts with the language name then lists Glasgow, Soroca and Riga. **Note:** 202936 is fabricated filler - delete. |
| Southeastern Finnish | 200800 (keep) / 202950 (drop) | 200800 | high | `southeastern-finnish` catalog row selects 200800; 202950 (54) starts with the language name then lists Ioannina, Salzburg and Timisoara. **Note:** 202950 is fabricated filler - delete. Note 200800's own seeds (Helsinki/Turku/Tampere/Oulu) are Standard Finnish, not specifically Southeastern - a data-quality flag, not a merge blocker. |
| Southern Mansi | 200804 (keep) / 202954 (drop) | 200804 | high | `southern-mansi` catalog row selects 200804 (Uray/Nyagan/Kogalym); 202954 (55) starts with the language name then lists Plzen, Glasgow and Viseu. **Note:** 202954 is fabricated filler - delete. |
| Tundra Enets | 200819 (keep) / 202969 (drop) | 200819 | high | `tundra-enets` catalog row selects 200819 (Dikson/Kharuta/Bugrino); 202969 (51) starts with the language name then lists Grodno, Brno and Mogilev - Belarusian towns. **Note:** 202969 is fabricated filler - delete. |
| Vakh | 200831 (keep) / 202981 (drop) | 200831 | high | `vakh` catalog row selects 200831 (88 seeds); 202981 holds 2 authentic Khanty-area towns (Nizhnevartovsk, Strezhevoy) and is 100% contained in 200831. **Note:** Trivial merge; import nothing new but do not lose the entry. |
| German | 200860 (keep) / 10041, 203009 (drop) | 200860 | high | `deu`/`ger` catalog rows select 200860 (81 seeds); 10041 (163) sits behind the ISO 639-1 shadow row `de`; 203009 sits behind row `nds` (Low German) with junk seeds (Prilep, Lodz, Cork). **Note:** Import 10041's 163 seeds into 200860 and drop `de`. Delete 203009 and either repoint `nds` at a real Low German namebase or remove the row - it is NOT a German duplicate. |
| Icelandic | 200861 (keep) / 203010 (drop) | 200861 | high | `isl` catalog row selects 200861 (Reykjavik/Kopavogur); 203010 (54) starts with `Icelandic` then lists Gabala, Telavi and Lahij - Azerbaijani towns. **Note:** 203010 is fabricated filler - delete. |
| Irish | 200862 (keep) / 203011 (drop) | 200862 | high | `gle` catalog row selects 200862 (Dublin/Cork/Galway); 203011 (54) starts with `Irish` then lists Sheffield, Dubrovnik and Charleroi. **Note:** 203011 is fabricated filler - delete. |
| Italo-Australian | 200863 (keep) / 203012 (drop) | 200863 | high | `italo-australian` catalog row selects 200863 (Melbourne/Sydney/Adelaide); 203012 (53) starts with `Italo-Australian` then lists Rabaul, Uaboe and Sogeri - Papuan towns. **Note:** 203012 is fabricated filler - delete. |
| Moselle Romance | 200870 (keep) / 203019 (drop) | 200870 | high | `moselle-romance` catalog row selects 200870 (Metz/Thionville/Forbach); 203019 (53) starts with the language name then lists Glasgow, Soroca and Riga. **Note:** 203019 is fabricated filler - delete. |
| Serbo-Croatian | 200880 (keep) / 203029 (drop) | 200880 | high | `serbo-croatian` catalog row selects 200880 (Belgrade/Zagreb/Sarajevo); 203029 (53) starts with the language name then lists Plzen, Glasgow and Viseu. **Note:** 203029 is fabricated filler - delete. |
| Silesian German | 200881 (keep) / 203030 (drop) | 200881 | high | `silesian-german` catalog row selects 200881 (Wroclaw/Opole/Gliwice); 203030 (52) starts with the language name then lists Glasgow, Soroca and Riga. **Note:** 203030 is fabricated filler - delete. |
| Standard Swedish | 200884 (keep) / 203033 (drop) | 200884 | high | `swe` catalog row selects 200884; 203033 (55) starts with the language name then lists Panevezys, Ceske Budejovice and Rotterdam. **Note:** 203033 is fabricated filler - delete. See the cross-group note: 200884 and 200886 share 33 of 34 seeds and are the same list under two names. |
| Swedish (native-speakers subset) | 200886 (keep) / 203035 (drop) | 200886 | high | `swedish-native-speakers` catalog row selects 200886; 203035 (66) starts with the language name then lists Miskolc, Cluj-Napoca and Tromso. **Note:** 203035 is fabricated filler - delete. 200886 duplicates 200884 under a different name - that pair needs a human decision, not a merge. |
| Upper Saxon | 200887 (keep) / 203036 (drop) | 200887 | high | `sxu` catalog row selects 200887 (Dresden/Leipzig/Chemnitz); 203036 (53) starts with the language name then lists Oxford, Utrecht and Daugavpils. **Note:** 203036 is fabricated filler - delete. |
| Simplified Italian of Libya | 200988 (keep) / 202295 (drop) | 200988 | high | `simplified-italian-of-libya` catalog row selects 200988 (Tripoli/Benghazi/Misrata); 202295 (53) starts with the language name then lists Belfast, Celje and Birkirkara. **Note:** 202295 is fabricated filler - delete. |
| Tzotzil | 8127 (keep) / 20228 (drop) | 8127 | high | `tzotzil`/`tzo` catalog rows select 8127 (northAmerica); 20228 is a synthetic `x-tzotzil` copy filed under **southAmerica** with diacritics stripped. **Note:** Chamula/Zinacantan are the same villages; merge and fix the continent - Mexico is not South America. |
| Mixtec | 8428 (keep) / 20230 (drop) | 8428 | high | `mixtec`/`mig` catalog rows select 8428 (northAmerica); 20230 is a synthetic `x-mixtec` copy filed under **southAmerica**. **Note:** Tlaxiaco/Juxtlahuaca are the same towns; merge and fix the continent. |
| Mapudungun | 8868 (keep) / 7944, 20090 (drop) | 8868 | medium | `mapudungun`/`arn` catalog rows select 8868; 7944 has no row and shares 38 of 52 seeds with 8868 - a stale copy. The third member 20090 is a different variety (row `bonan-manegacha-dialect`, jaro=0.14). **Note:** Merge 7944 into 8868 only. KEEP 20090 as a separate entry and rename it Bonoan - it is a distinct dialect, not a duplicate. |
| Southern Quechua | 201333 (keep) / 2565 (drop) | 201333 | high | `southern-quechua` catalog row selects 201333 (56 seeds); 2565 (66) sits behind row `quh` (Quechua, Southern Bolivian) - a sibling code, not this dialect. **Note:** Both are Cusco/Arequipa/Puno-area Quechua - import. Row `quh` needs its own catalog decision. |
| Wayuu | 7419 (keep) / 20101 (drop) | 7419 | high | `wayuu`/`guc` catalog rows select 7419 (34 seeds); 20101 (60) is reachable via the corrupt row `sin` (Sinhala) plus a synthetic `x-wayuu`, and repeats all four of 7419's seeds. **Note:** Import 20101's extra 26 Colombian towns and delete row `sin`. |
| Aneme Wake | 1971 (keep) / 50026 (drop) | 1971 | high | `aneme-wake`/`anz` catalog rows select 1971 (Abia/Aro/Ianu/Boneka); 50026 is a synthetic `x-aneme-wake` copy (Yoivi/Niniuri/Kawowoki). **Note:** Both are Anem (Papua); merge. |
| Fuyug | 50028 (keep) / 1856 (drop) | 50028 | high | `fuyug` catalog row selects 50028 (18 seeds); 1856 (43) is a synthetic `x-fuyug` copy whose first seed is the word `Fuyug` itself. **Note:** Mafulu/Orongomo/Managalasi are Central Province PNG; import them. |

## B. Keep all - not duplicates - 2 groups

| name | indices | recommended canonical | confidence | reasoning |
|---|---|---|---|---|
| Berta | 137 (keep) / 13948 (drop) | 137 | high | Zero shared seeds (jac=0.00). 137 is Berta (Asosa/Bambasi/Mendi, Benishangul-Gumuz); 13948 is a Nuba-area language (Kadugli/Rashad/Talodi, South Kordofan). **Note:** NOT a duplicate. 13948 needs its own name (Nuba/Heiban family), not a merge. |
| Cai Long | 1418 (keep) / 2495 (drop) | 1418 | medium | Zero shared seeds (jac=0.00). 1418 is Yunnan (Lijiazhai/Yangjiazhai/Yeli); 2495's seeds are Guizhou province and Qiandongnan county names. **Note:** Not the same language. 2495's first seed is a province, and Qiandongnan is Miao country - 2495 probably belongs to a Miao entry. |

## C. Needs a human decision - 2 groups

| name | indices | recommended canonical | confidence | reasoning |
|---|---|---|---|---|
| Lak | 2412 (keep) / 20023 (drop) | 2412 | medium | 2412 (10 seeds: Kumukh, Levashi, Vitskhi, Arakul) is Lak/Dagestan; 20023's 24 seeds are general Dagestan towns (Makhachkala, Kaspiysk, Kizlyar). **Note:** 20023 is more likely Dargwa, Lezgian or Kumukh. Do not merge until 20023 is identified. |
| Awadhi | 20055 (keep) / 200243, 202394 (drop) | 20055 | low | All three are Awadhi but they disagree: 200243 (57) has no row, 20055 (93) sits under the corrupt row `aze` (Azerbaijani), and the catalog target 202394 (50) starts with the language name and mixes in Visakhapatnam and Rishikesh. **Note:** 20055's list (Lucknow, Ayodhya, Faizabad, Sultanpur) is the only clean one. A human must decide whether to promote 20055 or rebuild 202394 from it. |

---

## The 5 groups I am least confident about

1. **Awadhi (200243 / 20055 / 202394)** - the only group where the *catalog-referenced* member is the worst of
   the three. 202394 (the `awadhi`+`awa` target) starts with the literal string `Awadhi` and then lists
   Visakhapatnam and Rishikesh, neither Awadhi. 20055 has 93 clean Awadhi towns (Lucknow, Ayodhya, Faizabad,
   Sultanpur) but sits under the corrupt row `aze`. 200243 has 57 more and no row. Pairwise overlap is near
   zero (jaro 0.007-0.111), so I cannot tell whether these are three samples of one language or two distinct
   Awadhi/Bagheli groupings. **I did not guess.** A human has to choose between promoting 20055 and rebuilding
   202394 from it.

2. **Lak (2412 / 20023)** - 2412 (10 seeds: Kumukh, Levashi, Vitskhi, Arakul) is unambiguously Lak per `lbe`.
   20023 (24 seeds: Makhachkala, Kaspiysk, Kizlyar, Izberbash) is Dagestan generally, which is equally consistent
   with Dargwa, Lezgian, Kumukh or Aghul. The overlap (jaro 0.133) is what you would expect from two Dagestan
   lists, and it does not discriminate. Merging would put non-Lak towns into a Lak namebase.

3. **Berta (137 / 13948)** - my one confident **"not a duplicate"**. Zero shared seeds. 137 is Berta proper
   (Asosa, Bambasi, Mendi, Dabuso - Benishangul-Gumuz, Ethiopia, and the catalog already has
   `Nilo-Saharan / Berta`). 13948 is Kadugli, Mugum, Rashad, Talodi - the Nuba Mountains of South Kordofan, Sudan,
   which is Nuba/Nobiin or Heiban territory, hundreds of kilometres away. The name is a collision. I flag this
   with high confidence, but 13948 still needs a *name*, not a deletion.

4. **Cai Long (1418 / 2495)** - my other "not a duplicate", at lower confidence. Zero shared seeds and, more
   damning, a geography mismatch: 1418 is Yunnan (Lijiazhai, Yangjiazhai, Yeli) while 2495's first seed is the
   **province** `Guizhou` followed by Qiandongnan county names (Puding, Pojiao), which is Miao/Hmong country. I
   believe 2495 is a mislabelled Miao entry, but "Cai Long" is an obscure name and I could not source it, so
   2495 needs a human identification rather than a confident relabel.

5. **Mapudungun (8868 / 7944 / 20090)** - a three-way group where only part of it merges. 8868 and 7944 share 38
   of 52 seeds (jaro 0.576) and 7944 has no map row at all, so it is a stale copy and should go. But 20090
   (108 seeds, Temuco/Pucon/Villarrica) is a third member with only jaro 0.14/0.19 against the others, and its map
   row is `bonan-manegacha-dialect` - Bonoan/Manegacha is a distinct Mapudungun dialect. I recommend merging
   7944 and **renaming rather than deleting** 20090. If Bonoan turns out to be a label the previous pipeline
   invented, that call flips.

Runners-up, in case the first five are resolved quickly: **Kurdish** (2601's 15 "seeds" are variety and
country names; 10026's 93 real cities sit behind shadow row `ku`), **Persian** (2603's 62 "seeds" are the
country names Iran/Afghanistan/Tajikistan/Uzbekistan; 10040's 108 real cities sit behind `fas` - which is the
*correct* ISO 639-3 code, merely missing from the catalog), and **Makonde** (no map row on either side; 10280
is Cabo Delgado, Mozambique and 13663 is Mtwara/Lindi, Tanzania - the two ends of one language, and both halves
are needed).
