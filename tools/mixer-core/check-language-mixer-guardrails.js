"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {execFileSync} = require("node:child_process");

const root = path.resolve(__dirname, "..", "..");

let failCount = 0;

// ISOs explicitly allowed to be removed from the mixer map (vs HEAD append-only).
// Reconstructed/placeholder entries that should never have been in the map.
const ALLOWED_REMOVALS = new Set([
  "proto-ainu", "proto-austroasiatic", "proto-berber", "proto-eastern-romance",
  "proto-finnic", "proto-georgian-zan", "proto-hakka", "proto-hlai",
  "proto-hmong-mien", "proto-hmongic", "proto-hokkaido-kuril", "proto-hungarian",
  "proto-kam-sui", "proto-karelian", "proto-karenic", "proto-kartvelian",
  "proto-koreanic", "proto-kra", "proto-kra-dai", "proto-loloish",
  "proto-mari", "proto-mienic", "proto-min", "proto-mongolic",
  "proto-mordvinic", "proto-ob-ugric", "proto-permic", "proto-romance",
  "proto-ron", "proto-sakhalin", "proto-sami", "proto-samoyedic",
  "proto-sino-tibetan", "proto-tai", "proto-tibeto-burman", "proto-uralic",
  "proto-warji",
  // Family macros and group labels. The catalog tags every one of these
  // ["family"], and both cultures-generator.ts and races.ts already skip those,
  // so they can never contribute a name. A grouping is not a language: nobody
  // in the Bosavi or Inland Gulf group ever coined a name in "Bosavi".
  "admiralty", "alor-pantar", "awyu-dumut", "bali-sasak-sumbawa", "batanic",
  "bayono-awbono", "bosavi", "bungku-tolaki", "celebic", "cenderawasih",
  "central-luzon", "central-maluku", "central-pacific", "central-semitic",
  "central-south-sulawesi", "central-vanuatu", "east-formosan",
  "east-strickland", "east-timor-papuan", "eastern-oceanic",
  "eastern-romance-family", "formosan", "goilalan", "greater-awyu",
  "greater-barito", "greater-central-philippine", "greater-north-borneo",
  "halmahera-sea", "highland-east-cushitic", "inland-gulf", "kayagaric",
  "kolopom", "lowland-east-cushitic", "macro-somali", "meso-melanesian",
  "oceanic", "siangic", "sinitic", "west-gurage", "west-semitic",
  // x- alternates that were themselves empty, and bare 3-letter codes with no
  // row behind them. All had bases: [] - they were placeholders for languages
  // with no namebase, keyed under a name the app never referenced.
  "bijiang-bai-dialect", "sna", "wol",
  "x-bonan-kangjia", "x-borgarm-let", "x-bozal-spanish",
  "x-dali-bai-language", "x-haflong-hindi", "x-kanuri", "x-kuria",
  "x-lowland-iwur", "x-mala", "x-mambila", "x-mongsen-ao",
  "x-namibian-black-german", "x-palawa-kani", "x-pipil-nawat", "x-puy",
  "x-qifu", "x-sart-kalmyk", "x-settler-swahili", "x-tindi",
  "x-turks-and-caicos-creole-dedicated", "x-ubykh",
  "x-virgin-islands-creole-dedicated", "x-western-algerian-zenatic-dialects",
  // Zurg. A ghost language: Benkato (2017) traces the whole claim to one
  // place-name in a 1929 Guida d'Italia that never mentions a language. The
  // namebase entry that backed it held 33 Moroccan city names, hundreds of km
  // from Kufra. See docs/verification/research/zero-seed-triage.md.
  "zurg", "x-zurg",
  // "Jamaican Patois" is a reference name for Jamaican Creole English
  // (glottolog jama1262, ISO jam), not a separate language. There is one
  // namebase entry, i=200632 "Jamaican Creole", and jamaican-creole already
  // points at it. The alias row made the app offer a language under a name that
  // appears nowhere in the data.
  "jamaican-patois",
  // "huo" was the Palaung language "Hu" of Myanmar, and its row pointed at
  // i=1012, which is Kon Keu - a Chamic language of Vietnam. The two share the
  // English name "Hu" and nothing else. The Palaung has no namebase entry
  // anywhere, so there is nothing correct to point the row at, and generating
  // Cham names under a Palaung label is worse than not offering the language.
  // See the note on katu below for the language this tangle turned on.
  "huo",
  // The catalog recorded Katu with ISO 639-3 "katu", which is not Katu's code.
  // Katu / Low Katu is kuf (Glottolog west2398), Katuic, eastern Laos and
  // central Vietnam; kfu is East Katu. The row is re-keyed to kuf and keeps
  // pointing at i=200319 "Katu". Worth noting that ISO 639-3 "katu" is not a
  // code at all, so this was never a valid language entry - it was a key
  // invented from the name, the same failure mode as "ijaw" earlier in this
    // work.
    "katu",
    // Both rows handed out a language other than the one their ISO names, and
    // the correct catalog rows already existed alongside them.
    //   ambo  ISO is the Bantu language Ambo of the Congo, but the row pointed
    //          at i=200240 "Ambonese Malay" - Aru, Piru, Saumlaki, Kai,
    //          Tanimbar are the Maluku Islands. ambonese-malay now lists it.
    //   bana  ISO is the Chadic language Bana, but the row pointed at i=378
    //          "Banat" - Timisoara, Arad, Lugoj, Resita, Caransebes, Oradea
    //          are the Banat of Romania and Serbia. The catalog's banat row,
    //          already Daco-Romanian, now lists it.
    "ambo", "bana",
    // Rows that had their namebase entry deleted, leaving a key that must not
    // survive as a stub. mixer-map-resolution.test.js requires every row with
    // "bases": [] to be a real catalog language that is not tagged as a family
    // and not a reconstruction - a stub is a placeholder for un-researched
    // work, not a slot for something that was found to be not a language.
    //
    // Reconstructions and rejected hypotheses, catalogued as Hypothetical or
    // proposed groupings, so no speaker ever coined a name in them:
    //   almosan          Sapir's 1929 Algonquian-Wakashan grouping, recorded as
    //                    widely rejected
    //   karasuk          van Driem's speculative Yenisei-Altai grouping; the
    //                    catalog classes it Hypothetical / Proposed Groupings
    //   uralic-yukaghir  a hypothesis linking Uralic and Yukaghir as one family,
    //                    which the literature notes none of the proposed
    //                    relations are generally accepted
    //
    // Dialect strata and groupings rather than languages:
    //   sakhalin-dialects             a Sakhalin Ainu grouping
    //   western-hilali-dialects       the post-Hilalian Maghrebi stratum
    //   western-pre-hilali-dialects   the pre-Hilalian old-urban stratum
    //
    // Keys that are not in the catalog at all, so they were never languages
    // this project tracked. Their entries were deleted as duplicates or as
    // non-languages, and there is no correct entry to point them at:
    //   mpu   a row left pointing at the unverifiable "Mo Piu"
    //   okm   ISO Middle Korean, but the only candidate was a Silla Korean
    //         entry, which is a different period, and no Old Korean entry exists
    //   mkn   a duplicate key alongside the real iso for the same language
    //   man   a macro-family row that had been pointed at a Mansi dialect
    "almosan", "karasuk", "uralic-yukaghir",
    "sakhalin-dialects", "western-hilali-dialects", "western-pre-hilali-dialects",
    "mpu", "okm", "mkn", "man",
    // The same case again for synthetic "x-" shadow keys. Each duplicated a real
    // row; when the duplicate namebase entry was removed as a duplicate or as a
    // non-language, the shadow had nothing left to point at. An "x-" key was
    // never a language identifier - it is an internal alias - and none of these
    // is in the catalog, so none can be a stub for un-researched work:
    //   x-santa-suonanba          shadow of a Santa (Mong) subdialect that was
    //                              merged into the Santa Mongol entry
    //   x-castilian-spanish        shadow of a stale research-only Castilian copy
    //   x-irish                    shadow of a research-only Irish copy
    //   x-raute                    shadow of a research-only Raute copy whose
    //                              seeds were Mexican and Chilean sites
    //   x-yoshkar-olin            shadow of a research-only Yoshkar-Olin copy,
    //                              which is a Russian city not a language
    //   x-western-hilali-dialects  shadow of the deleted dialect stratum
    //   x-tharu-languages          shadow of an umbrella that was not a language
    //   x-south-korean             shadow of a deleted standard-variety row
    "x-santa-suonanba", "x-castilian-spanish", "x-irish", "x-raute",
    "x-yoshkar-olin", "x-western-hilali-dialects", "x-tharu-languages",
    "x-south-korean",
    // "x-min-zhuang" is the same case again. It shadowed i=200371 "Minz Zhuang",
    // whose 29 seeds were all already in i=200387 "Myang Zhuang" - the two
    // entries held one list under two names, and the catalog calls the language
    // "Min Zhuang" while the entry said "Minz Zhuang", so W009 compared two
    // different strings and 29 is not 30, so no equality check fired either. The
    // shadow's whole purpose was to paper over that index collision. With the
    // duplicate entry gone the shadow has nothing left to point at, and an "x-"
    // key can never be an empty row: mixer-map-resolution.test.js requires an
    // empty row to name a catalogued language, which is what makes it a
    // placeholder for outstanding work, and an alias is not a language.
    "x-min-zhuang",
    // "x-armenian-hayeren" is the same case. It shadowed i=1937 "Armenian
    // (Hayeren)", which held the same 42-seed list as i=2615 "Armenian" under a
    // second name - Hayeren is simply the language's own endonym, not Western
    // Armenian, which is Arevmtahayeren. With the duplicate entry gone the shadow
    // had nothing left to point at, and it could not be emptied instead because
    // the test requires an empty row to name a catalogued language.
    "x-armenian-hayeren",
    // Five more x- shadows, removed with the entries they shadowed. None of the
    // five was ever a language identifier:
    //   x-shirwi         - shadow of i=202641, and "Shirwi" was not even an
    //                     Ethiopian language: it is the historical ethnonym for
    //                     Xianbei in the Serbi-Mongolic classification.
    //   x-madras-bashai  - shadow of i=202273, a Tamil sociolect defined by the
    //                     single city of Madras, so it had no toponymy of its own.
    "x-shirwi", "x-madras-bashai",
    // Three more shadows of retired entries. All three shadowed an extinct,
    // unattested Volga Finnic substrate known only from toponymy - Merya, the
    // language of the Meshchera people, and Muromian. None has an ISO code or a
    // Glottolog record and none has a documented settlement, so a namebase cannot
    // be built for any of them.
    "x-merya", "x-meshcherian", "x-muromian",
    // Four rows that could not be emptied, only deleted. An empty row is only
    // meaningful when it names a catalogued language, because that is what makes
    // it a placeholder for outstanding work; a family macro and an internal alias
    // are neither.
    //   x-orok, x-georgian-zan, x-kartvelian-languages - x- shadows, never a
    //     language identifier. x-orok shadowed i=202573, which was Orok = Uilta
    //     (oaa), a duplicate of i=200557. `orok` itself is re-pointed there.
    //   karto-zan - a family macro. Zan (zann1245) is the branch holding
    //     Mingrelian + Laz; Karto-Zan (geor1252) the branch holding Georgian +
    //     Zan. It duplicated i=10032, i=200650 and i=2411.
    "x-orok", "x-georgian-zan", "x-kartvelian-languages", "karto-zan",
    // "x-caribbean-english-creole" shadowed i=20214, which was not a variety at
    // all: its twenty seeds were literally the national capitals of the Caribbean,
    // plus five French and Dutch ones (Gustavia for Saint Barthelemy, Philipsburg
    // for Sint Maarten, Oranjestad for Aruba). The repo already holds twelve
    // dedicated entries for Bajan, Trinidadian, Bahamian, Jamaican, Virgin Islands
    // Creole and the rest, so the coverage was already complete.
    "x-caribbean-english-creole",
    // Nine keys that were never real identifiers. W011 could not see any of these,
    // because it only compares entries at or above the 25-seed floor and every one
    // of them was below it - which is how three exact set-identical groups survived
    // a check that reports identical seed lists.
    //
    //   qifu                 - i=200450 is not a language. No ISO 639-3 code (the
    //                         Q list has no qif/qifu), no Glottolog languoid, no
    //                         article. Ra'ong, which shared its list, is not a
    //                         synonym: it is a Bahnaric language of Cambodia.
    //   central-veps,
    //   northern-veps,
    //   southern-veps,
    //   vep-sou              - Glottolog veps1250 has no dialect children and
    //                         vep-sou 404s in ISO 639-3. All four Veps entries held
    //                         one list, including Sortavala and Lahdenpohja, which
    //                         are in Finland and outside the Vepsian Upland.
    //   yogo-tamagario       - "Yogo is considered a dialect of Tamagario", and
    //                         Glottolog tama1336 lists no Yogo among its names.
    //   x-ra-ong, x-angami,
    //   x-bahing-bayung      - x- shadows of entries that were themselves
    //                         duplicates. x-angami shadowed i=20160, which was
    //                         Tenyidie: Angami's own autonym and prestige dialect,
    //                         already held at i=200535 under the real ISO njm.
    "qifu",
    "central-veps",
    "northern-veps",
    "southern-veps",
    "vep-sou",
    "yogo-tamagario",
    "x-ra-ong",
    "x-angami",
    "x-bahing-bayung",
    // "telue" -> "giw". Telue is White Gelao; giw is its real ISO 639-3 code and
    // whit1267 its Glottolog id. "telue" was a project slug standing in for a
    // code that already existed, so both the mixer key and the catalog row move to
    // it. This is a rename, not a loss: the entry at i=1056 is unchanged.
    "telue",
    // Four more keys from the below-floor duplicate groups, all of which W011
    // skipped because every entry involved was under the seed floor.
    //   southern-tai, tai-hang-tong, thc
    //     "Southern Tai" is not a language - a folk alternate for Southern Thai
    //     (sou, i=200499) and the name of the reconstructed Proto-Southern branch,
    //     an off-by-one slip against its own sibling. Tai Hang Tong was ISO thc
    //     until that code was retired in 2016 and merged into tpo Tai Pao, already
    //     i=200522. Note sdl is Saudi Arabian Sign Language, not this.
    //   rung
    //     Not a language at all: LaPolla's proposed Tibeto-Burman super-branch
    //     (Thurgood 1984 / LaPolla 2003, disputed since), with no ISO code and no
    //     Glottolog languoid. The catalog already carries Gurung, Jerung,
    //     Lohorung, Turung and Derung, so this was a junk variant of that cluster.
    "southern-tai",
    "tai-hang-tong",
    "thc",
    "rung",
    //   x-tai-hang-tong - the x- shadow that went with it.
    "x-tai-hang-tong",
    //   x-argentinian-spanish - an x- shadow that was the ONLY row reaching
    //     i=373, so the entry existed but nothing could resolve it. Replaced by the
    //     proper catalogued key argentinian-spanish, which points at the same base.
    "x-argentinian-spanish",
    //   beni-snous-dialect, x-beni-snous-dialect
    //     A second entry for a language already held at i=5810 Beni Snous, in a
    //     different continent file, with 9 of its 27 seeds literally in the other.
    //     Snous is classified in the Western Algerian group but is widely treated
    //     as a dialect of Tarifit (Riffian).
    //   western-algerian-zenatic-dialects
    //     "A diffuse SET of Zenati Berber dialects" - no speaker community, no
    //     coherent toponymy, and "for most of which we have no linguistic data".
    //   komolom -> xom
    //     `komolom` was not a language code; the catalog row was named after it too.
    //     Komo is xom / Glottolog komo1258, Nilo-Saharan, of Mao-Komo special
    //     woreda in Benishangul-Gumuz and White Nile in Sudan - not the DRC Bantu
    //     kmw, and Nigeria has no "Komo" at all (it has Koma, Kom and Kwaami).
    "beni-snous-dialect",
    "x-beni-snous-dialect",
    "western-algerian-zenatic-dialects",
    "komolom",
    //   klon -> kyo
    //     `klon` is not an ISO 639-3 code at all. Klon is kyo / Glottolog kelo1247,
    //     a West Alor language of Alor Island, East Nusa Tenggara, Indonesia.
    //   ladino
    //     An alias I added that turned out to be a trap. The catalog's `ladino` row
    //     is family "Judeo-Spanish", so it does name i=21063 - but that entry is
    //     called "Judeo-Spanish", and W009 compares the catalog name against the
    //     ENTRY name. Two keys for one language only pays off when both agree, so
    //     `judeo-spanish` covers it alone. Note this is NOT the same language as
    //     i=24751 "Ladin", the Runic-Romance language of the Dolomites, which has
    //     its own keys ladin-lang, lld and x-ladin.
    "klon",
    "ladino",
    // "pyo" is not an ISO 639-3 code for the language it was named for. Puyo is
    // xpy (Puyo, Quechua) or xpp (Puyo-Paekche); "pyo" was a key invented from
    // the name, and it had been pointing at a Middle Korean entry. It has never
    // been a valid language identifier.
    //
    // "uralic-family" is a family macro, which cultures-generator.ts and
    // races.ts both skip, so it can never contribute a name.
    "pyo", "uralic-family",
    // The remaining "x-" shadows, all following the same pattern: each was an
    // internal alias for a real row, and each was left empty when the entry it
    // pointed at was removed - a research-only copy that was never in the
    // catalog, a town rather than a language (Porvoo, Yoshkar-Olin, Obdorsk,
    // Yaran, Yaransk), a language that was merged into another entry (Mysy,
    // Mina, Wadiyara Koli, Southern Tungusic, Udegheic, Sanoma, Finnish Savo),
    // or a dedicated duplicate of a creole entry (Belizean, Bahamian). None is
    // in the catalog, so none can be a stub for un-researched work:
    "x-semisjaur-njarg", "x-likrisovskoe", "x-northeast-hungary", "x-tundra-enets",
    "x-wadiyara-koli", "x-mysy", "x-momina", "x-judeo-italian-standard", "x-ludza",
    "x-obdorsk", "x-porvoo", "x-yaransk", "x-yaran", "x-finnish-savo",
    "x-belizean-creole-dedicated", "x-bahamian-creole-dedicated",
    "x-southern-tungusic", "x-san-ma", "x-udegheic",
    // Four more "x-" shadows whose target entry was removed this round. Each
    // duplicated a real row, and none is a catalog language, so none can be a
    // stub for un-researched work:
    //   x-wayuu                   shadow of a Wayuu entry merged into i=7419
    //   x-kwaza-xoc-amazonian     shadow of a Kwaza entry merged into i=201318
    //   x-bajan-creole-dedicated  shadow whose target was not Bajan at all - all
    //                             23 of its seeds were Barbadian, and Bajan
    //                             already exists at i=200627
    //   bonan-manegacha-dialect   shadow of an entry removed from southAmerica
    "x-wayuu", "x-kwaza-xoc-amazonian", "x-bajan-creole-dedicated", "bonan-manegacha-dialect",
    // Two more rows whose target was never what the key named:
    //   central-hilali-dialects  a dialect stratum of Maghrebi Arabic, not a
    //                           language; it was pointing at i=20123 "Neapolitan"
    //   the                     no catalog row, not an ISO 639-3 code for any
    //                           language in this project, and it was pointing at
    //                           a Romansh entry. Its intent is unknown, so it is
    //                           retired rather than pointed somewhere arbitrary.
    "central-hilali-dialects", "the",
    // Two x- shadows retired with their redundant cross-file duplicate:
    //   x-nedebang   shadow of the asia copy; oceania i=201113 is canonical and
    //                 its own `nedebang` row remains
    //   x-rapa-nui   shadow of the asia copy; oceania i=202432 is canonical
    "x-nedebang", "x-rapa-nui",
    // Four more x- shadows plus one canonical key whose entry was removed as an
    // un-accented duplicate of the surviving accented entry:
    //   x-brianzoo / x-canzes       shadows of "Brianzoo" and "Canzes", which
    //                               duplicated "Brianzöö" (i=200853) and "Canzés"
    //                               (i=200854). The canonical rows `brianz-` and
    //                               `canz-s` were repointed to the survivors.
    //   kuu-rv-ludic / x-kuu-rv-ludic   i=200744 "Kuuďärv Ludic" was a fourth
    //                               entry for three Ludic groups; its material
    //                               merged into the i=905 umbrella.
    "x-brianzoo", "x-canzes", "kuu-rv-ludic", "x-kuu-rv-ludic",
    // Three x- shadows left pointing at entries removed as cross-file duplicates:
    //   x-tzotzil / x-mixtec  shadows of the southAmerican copies of two Mexican
    //                        Mayan languages; northAmerica holds the originals
    //   x-chechen             shadow of the europe copy, duplicate of asia i=1555
    "x-tzotzil", "x-mixtec", "x-chechen",
    // Catalog keys that were not valid ISO 639-3 and have been corrected. The old
    // keys are gone, which the append-only check reads as a removal:
    //   sapa -> tys, toda -> tcx, tulu -> tcy, hagei -> giq, waxiang -> wxa
    // and `western-itelmen` -> `northern-itelmen`, because "Western Itelmen" is an
    // alternate name for the whole Itelmen language (itl / itel1242), not a
    // dialect; the real second dialect is Northern, of Sedanka.
    "sapa", "toda", "tulu", "hagei", "waxiang", "western-itelmen",
    // The x- shadows retired with the 31 duplicate asia entries removed in the
    // same pass. Each duplicated a real row, and the surviving entry kept the
    // language's canonical key:
    //   x-kannada x-karakalpak x-kurukh x-parkari-koli x-levantine-arabic
    //   x-tajik x-turkmen x-zhuang x-magahi x-marwari x-sapa x-thar x-toda
    //   x-tulu x-vayu x-wakhi x-western-middle-aramaic x-odia
    // Two of the pairs were not merely duplicated: `Vayu` i=200563 held twelve
    // western-Nepal districts nowhere near Vayu territory, and `Thar` i=200541 held
    // Rajasthan cities of the Thar Desert rather than the Bede community. In both
    // cases the *index with the better key* was the wrong one, so the correct list
    // was merged into it before the shadow was retired.
    "x-kannada", "x-karakalpak", "x-kurukh", "x-parkari-koli", "x-levantine-arabic",
    "x-tajik", "x-turkmen", "x-zhuang", "x-magahi", "x-marwari", "x-sapa", "x-thar",
    "x-toda", "x-tulu", "x-vayu", "x-wakhi", "x-western-middle-aramaic", "x-odia",
    // The x- shadow of a second "Lak" entry, deleted as an empty duplicate. Both
    // held Lezgin (Dagestan) toponyms and not one Lak place; the actual Lak is
    // `lax`, Western Pahari, upper Kwanon valley, Uttarakhand. asia i=2412 is the
    // catalog row's target and stays.
    "x-lak",
    // i=201003 "Xieheyu" deleted: en.wikipedia *Kyowa-go* records two pidginised
    // languages spoken in Manchukuo in the 1930s-40s that "died out when
    // Manchukuo fell", and Glottolog marks them extinct. Their entire attested
    // corpus - Sakurai (2015), the HKU conference paper, Watarai 1918, Nakatani
    // 1925/26 - is conversational or lexifier-derived, with no vernacular
    // place-name material, so no namebase entry can generate from it.
    "xieheyu",
    // Catalog key `boon` was not an ISO 639-3 code: `boon` is Bine, and Boon is
    // `bnl` (Glottolog boon1242, Cushitic). Re-keyed to `bnl` in the catalog, the
    // map row and races.ts.
    "boon",
    // The `tabghach` row and catalog record removed: they described the same
    // language as `tariang-bahnaric`. Taghbach / Trieu / Talieng and the
    // Gie-Trieng are one living Central Bahnaric language that carries three ISO
    // codes between them (tdf, stg, gio) - Glottolog's own Tareng note records
    // the confusion. The deleted row was the worse half of it: a zero-seed entry
    // catalogued as "Mongolic / Para-Mongolic / historical / hypothetical",
    // which is wrong on both counts. The language stays reachable through
    // `tariang-bahnaric`, which now holds its settlements.
    "tabghach",
    // The `barito` row retired: its catalog row is tagged tags:["family"], so it
    // is a group label rather than a language, and a "bases": [] stub is only
    // legitimate for a real language nobody has researched. Its former base
    // i=836 "Bari (South Sudan)" is an unrelated Central Sudan language.
    "barito",
    // The `fil` row retired: Filipino has neither a catalog record nor a
    // namebase entry, so there was nothing to repoint to and nothing to research.
    // It had been pointing at i=13600 "Ndebele", which is a different language
    // and a different continent.
    "fil",
    // 23 rows retired after an ISO 639-3 audit. Each named a real language that
    // has neither a namebase entry nor a catalog record, so a "bases": [] stub
    // would promise research with nothing to research. Worse, every one of these
    // isos was invisible to the automated checks precisely because it had no
    // catalog row, and most had been resolving to the WRONG language for years:
    //   bng Benga (Cameroon, not Bengali)   ind Indonesian
    //   crr Carolina Algonquian             tis Masadiit Itneg
    //   sso Sissano (Vanuatu)               ydk Yoidik
    //   uma Umatilla (Oregon)               ssi Sansi (India)
    //   ksh Kolsch                         koo Konzo
    //   sks Maia                            pko Pokoot
    //   gmh Middle High German              skp Sekapan
    //   lig Ligbi                           frc Cajun French
    //   nyk Nyaneka                         suy Suya
    //   yzg E'ma Buyang (not Yang Zhuang)   sop Songe
    //   krs Gbaya (Kara-Kalpak is kaa, which already resolves correctly)
    //   quh South Bolivian Quechua only; i=2565 spans Peru, Bolivia and N Chile
    //   tyo absent from ISO 639-3, ISO 639-2 and Glottolog alike
    "bng", "ind", "crr", "tis", "sso", "ydk", "uma", "ssi", "ksh", "koo", "sks",
    "pko", "gmh", "skp", "lig", "frc", "nyk", "suy", "yzg", "sop", "krs", "tyo", "quh",
    // 30 ISO-shaped row keys retired. Each duplicated a row that already
    // governed the same namebase entry under the iso the catalog actually uses
    // (`deu` not `ger`, `bod` not `tib`, `hausa` not `hau`, `igbo` not `ibo`,
    // `thai` not `tha`, `sinhala` not `sin`, `maithili` not `mai`,
    // `afrikaans` not `afr`, `nepali` not `npi`, `pashto` not `pus`,
    // `georgian` not `geo`, `romanian` not `rum`, `low-german` not `nds`,
    // `silesian-german` not `szl`, `walser-german` not `wae`, `skolt-sami` not
    // `sms`, `pite-sami` not `sje`, `ter-sami` not `sjt`, `v-ro` not `vro`,
    // `berta` not `wti`, `tai-daeng` not `tyr`, `shi` not `shr`,
    // `huilliche` not `huh`, `limonese-creole` not `lwc`,
    // `haflong-hindi` not `hfl`, `jiaoliao-mandarin` not `jlm`,
    // `jilu-mandarin` not `jlu`).
    // These were the blind spot: W009 compares a catalog name against the entry a
    // row resolves to, and a row whose iso has no catalog record has nothing to
    // compare. That is how `ben` generated Abenaki names, `tel` generated Avar
    // and `kaz` generated Pohnpeian without any check firing. Zero of the 3726
    // catalog rows use a bare 3-letter ISO code, so the fix was to retire the
    // ISO-shaped duplicates rather than add 35 ISO-keyed records, which would
    // have duplicated 30 existing names and taken the duplicate-name check from
    // 10 groups to 39.
    //
    // `v-ro` was itself wrong before this and pointed at i=2062 "Voro (Nigeria)";
    // ISO `vor` is Nigerian Voro and `vro` is Võro, so `v-ro` now resolves to Võro
    // at i=908 and a correctly-keyed `vor` row was added for the Nigerian one.
    //
    // Most of these keys are not even ISO codes, which is the point: the catalog
    // has always keyed these languages by an English slug, so the ISO-shaped key
    // had no record to match. `shr`, `urd`, `hau`, `ibo`, `tha`, `sin`, `mai`,
    // `aze`, `afr`, `fas` and `npi` are genuine ISO 639-3 codes, but of the
    // wrong language or a code no catalog record uses.
    "shr", "urd", "hau", "ibo", "tha", "sin", "mai", "aze", "afr", "fas",
    "tib", "npi", "pus", "geo", "ger", "rum", "sms", "sje", "sjt", "vro",
    "wae", "szl", "nds", "wti", "tyr", "hfl", "jlm", "jlu", "huh", "lwc",
    // i=1689 "South Oran-Figuig Berber" deleted: a *third* copy of the language
    // that W012 could not see, because its name differs from i=201011 by a
    // hyphen rather than matching. Its 81 seeds opened with ~40 genuine Berber
    // settlements of the Saoura basin and the Ksour, then continued with 41
    // items that are not places: two countries, five regions, a bibliographic
    // title, eight language labels, five research-jargon terms and six isolated
    // morphemes (ul, un, il, ša, šay, iš). The 40 settlements were merged into
    // i=201011, which already has a natural row key, so no rename was needed.
    "x-south-oran-figuig-berber"
  ]);


  function decodeTextFile(buf) {
   if (!Buffer.isBuffer(buf)) return "";

   if (buf.length >= 2) {
     if (buf[0] === 0xff && buf[1] === 0xfe) {
       return buf.slice(2).toString("utf16le");
     }
     if (buf[0] === 0xfe && buf[1] === 0xff) {
       const len = buf.length - (buf.length % 2);
       const swapped = Buffer.allocUnsafe(len - 2);
       for (let i = 2, j = 0; i + 1 < len; i += 2, j += 2) {
         swapped[j] = buf[i + 1];
         swapped[j + 1] = buf[i];
       }
       return swapped.toString("utf16le");
     }
   }

   let nulEven = 0;
   let nulOdd = 0;
   const sampleLen = Math.min(buf.length, 8192);
   for (let i = 0; i < sampleLen; i++) {
     if (buf[i] !== 0x00) continue;
     if (i % 2 === 0) nulEven++;
     else nulOdd++;
   }

   if (nulOdd > 16 && nulOdd > nulEven * 2) {
     return buf.toString("utf16le");
   }

   if (nulEven > 16 && nulEven > nulOdd * 2) {
     const len = buf.length - (buf.length % 2);
     const swapped = Buffer.allocUnsafe(len);
     for (let i = 0; i + 1 < len; i += 2) {
       swapped[i] = buf[i + 1];
       swapped[i + 1] = buf[i];
     }
     return swapped.toString("utf16le");
   }

   const raw = buf.toString("utf8");
   return raw?.codePointAt(0) === 0xfeff ? raw.slice(1) : raw;
 }

function toPosix(relPath) {
  return String(relPath).replaceAll("\\", "/");
}

function readFileBuffer(relPath) {
  const full = path.join(root, relPath);
  return fs.readFileSync(full);
}

function hasUtf8Bom(buf) {
  return (
    Buffer.isBuffer(buf) &&
    buf.length >= 3 &&
    buf[0] === 0xef &&
    buf[1] === 0xbb &&
    buf[2] === 0xbf
  );
}

function parseJsonUtf8(relPath) {
  const full = path.join(root, relPath);
  const raw = fs.readFileSync(full, "utf8");
  const s = raw?.codePointAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(s);
}

function gitShowHead(relPath) {
  const spec = `HEAD:${toPosix(relPath)}`;
  try {
    return execFileSync("git", ["show", spec], {encoding: "utf8"});
  } catch (e) {
    if (e && (e.code === "ENOENT" || typeof e.status === "number")) return null;
    throw e;
  }
}

function isoSetFromMixerMap(map) {
  const set = new Set();
  const dupes = new Set();
  for (const row of Array.isArray(map) ? map : []) {
    if (row?.iso == null) continue;
    const iso = String(row.iso);
    if (set.has(iso)) dupes.add(iso);
    set.add(iso);
  }
  return {set, dupes};
}

function isoSetFromCatalog(list) {
  const set = new Set();
  const dupes = new Set();
  for (const row of Array.isArray(list) ? list : []) {
    if (row?.iso == null) continue;
    const iso = String(row.iso);
    if (set.has(iso)) dupes.add(iso);
    set.add(iso);
  }
  return {set, dupes};
}

function diffMissing(baselineSet, currentSet) {
  const missing = [];
  for (const k of baselineSet) {
    if (!currentSet.has(k)) missing.push(k);
  }
  missing.sort((a, b) => a.localeCompare(b));
  return missing;
}

function listNamebasesFiles() {
  const modulesDir = path.join(root, "public/modules");
  const entries = fs.readdirSync(modulesDir, {withFileTypes: true});
  const files = [];

  for (const e of entries) {
    if (!e.isFile()) continue;
    const name = e.name;
    if (!name.startsWith("namebases-") || !name.endsWith(".js")) continue;
    files.push(path.join(modulesDir, name));
  }

  files.sort((a, b) => a.localeCompare(b));
  return files;
}

function checkDuplicateNamebaseIndices() {
  const files = listNamebasesFiles();
  const byIndex = new Map();

  // Matches: {name: "Foo", i: 123
  const re = /\{name:\s*"([^"]+)",\s*i:\s*(\d+)/g;

  for (const fileAbs of files) {
    const rel = path.relative(root, fileAbs);
    let src;
    try {
      src = decodeTextFile(fs.readFileSync(fileAbs));
    } catch (e) {
      fail(`[guardrails] Failed to read ${toPosix(rel)}: ${e && e.message ? e.message : e}`);
      continue;
    }

    let m;
    while ((m = re.exec(src))) {
      const baseName = m[1];
      const index = Number(m[2]);
      if (!Number.isFinite(index)) continue;

      const line = src.slice(0, m.index).split(/\r?\n/).length;
      const arr = byIndex.get(index) || [];
      arr.push({file: toPosix(rel), line, name: baseName});
      byIndex.set(index, arr);
    }
  }

  const dupes = Array.from(byIndex.entries())
    .filter(([, defs]) => defs.length > 1)
    .sort(([a], [b]) => a - b);

  if (!dupes.length) return;

  const lines = [
    `[guardrails] Duplicate namebase indices detected across modules/namebases-*.js (duplicate \`i:\` values).`,
    "[guardrails] Fix by renumbering the newly-added base(s) (append-only) to an unused index.",
    "[guardrails] Duplicates:"
  ];

  for (const [index, defs] of dupes) {
    defs.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.name.localeCompare(b.name));
    lines.push(` - i: ${index}`);
    for (const d of defs) {
      lines.push(`   - ${d.file}:${d.line} name="${d.name}"`);
    }
  }

  fail(lines.join("\n"));
}

function fail(msg) {
  console.error(msg);
  process.exitCode = 1;
  failCount++;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const allowNoGit = args.has("--allow-no-git");

  const jsonFilesNoBom = [
    "config/language-mixer-map.json",
    "config/language-mixes.json",
    "tools/mixer-diagnostics/_no_uniq_base_claims.json",
    "tools/mixer-diagnostics/_decluster_claims.json",
    "tools/mixer-deltas/_compiled-dedicated-pins.json"
  ];

  for (const rel of jsonFilesNoBom) {
    let buf;
    try {
      buf = readFileBuffer(rel);
    } catch (e) {
      // Skip missing optional files (claims file may not exist in early clones)
      if (rel.includes("_no_uniq_base_claims.json")) continue;
      if (rel.includes("_decluster_claims.json")) continue;
      if (rel.includes("_compiled-dedicated-pins.json")) continue;
      throw e;
    }

    if (hasUtf8Bom(buf)) {
      fail(`[guardrails] UTF-8 BOM detected: ${rel}. Fix in-place (rewrite as UTF-8 without BOM); do not discard content.`);
    }
  }

  // Ensure these key JSON files parse under Node's JSON.parse (after BOM stripping).
  const jsonFilesParseable = [
    "config/language-mixer-map.json",
    "config/language-mixes.json",
    "tools/mixer-diagnostics/_no_uniq_base_claims.json",
    "tools/mixer-diagnostics/_decluster_claims.json",
    "tools/mixer-deltas/_compiled-dedicated-pins.json"
  ];

  for (const rel of jsonFilesParseable) {
    try {
      parseJsonUtf8(rel);
    } catch (e) {
      // Claims file may be absent in early clones
      if (rel.includes("_no_uniq_base_claims.json")) continue;
      if (rel.includes("_decluster_claims.json")) continue;
      // Compiled pins file may be absent before delta system is introduced
      if (rel.includes("_compiled-dedicated-pins.json")) continue;
      fail(`[guardrails] Invalid JSON: ${rel}. ${e && e.message ? e.message : e}`);
    }
  }

  checkDuplicateNamebaseIndices();

  const mapCurrent = parseJsonUtf8("config/language-mixer-map.json");
  const catalogCurrent = parseJsonUtf8("config/language-mixes.json");

  const mapCur = isoSetFromMixerMap(mapCurrent);
  const catCur = isoSetFromCatalog(catalogCurrent);

  if (mapCur.dupes.size) {
    fail(`[guardrails] Duplicate ISO rows in config/language-mixer-map.json: ${Array.from(mapCur.dupes).join(", ")}`);
  }
  if (catCur.dupes.size) {
    fail(`[guardrails] Duplicate ISO rows in config/language-mixes.json: ${Array.from(catCur.dupes).join(", ")}`);
  }

  const mapHeadRaw = gitShowHead("config/language-mixer-map.json");
  const catalogHeadRaw = gitShowHead("config/language-mixes.json");

  if (mapHeadRaw == null || catalogHeadRaw == null) {
    if (!allowNoGit) {
      fail(
        "[guardrails] Could not read HEAD versions via git. Run inside a git checkout, or re-run with --allow-no-git to skip append-only checks."
      );
      return;
    }

    if (!failCount) {
      console.log(
        `[guardrails] OK (no-git mode; append-only checks skipped). map=${mapCur.set.size} catalog=${catCur.set.size}`
      );
    }
    return;
  }

  const mapHead = JSON.parse(mapHeadRaw.replace(/^\uFEFF/, ""));
  const catalogHead = JSON.parse(catalogHeadRaw.replace(/^\uFEFF/, ""));

  const mapBase = isoSetFromMixerMap(mapHead);
  const catBase = isoSetFromCatalog(catalogHead);

  const mapMissing = diffMissing(mapBase.set, mapCur.set).filter(i => !ALLOWED_REMOVALS.has(i));
  const catMissing = diffMissing(catBase.set, catCur.set).filter(i => !ALLOWED_REMOVALS.has(i));

  if (mapMissing.length) {
    fail(
      `[guardrails] Append-only violation: config/language-mixer-map.json would drop ${mapMissing.length} ISO(s) vs HEAD.\n` +
        mapMissing.map(i => ` - ${i}`).join("\n")
    );
  }

  if (catMissing.length) {
    fail(
      `[guardrails] Append-only violation: config/language-mixes.json would drop ${catMissing.length} ISO(s) vs HEAD.\n` +
        catMissing.map(i => ` - ${i}`).join("\n")
    );
  }

  if (!failCount) {
    console.log(`[guardrails] OK. map=${mapCur.set.size} catalog=${catCur.set.size}`);
  }
}

if (require.main === module) main();
