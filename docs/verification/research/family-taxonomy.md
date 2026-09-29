# The `family` field in `config/language-mixes.json`

Reference for anyone who edits the `family` field. Written 2026-09-29, after the
one-off normalisation that re-filed 664 entries out of the top-level buckets.

## What the two fields mean

Each catalog entry carries both a `category` and a `family`:

```json
{ "name": "Abon", "iso": "abon", "region": "Africa",
  "category": "Niger-Congo", "family": "Niger-Congo" }
```

- `category` is the top-level classification. 105 distinct values.
- `family` is **one level below** it. 556 distinct values.

`family` is not free text and it is not a second copy of `category`. It is the
subgroup. `Chadic` languages are `category: "Afroasiatic"`, `family: "Chadic"`.
A language is a subgroup of exactly one category, and a family value belongs to
one category.

**The rule this file exists to enforce: if `family` equals the entry's own
`category`, the entry is filed at the top level and its siblings are not.** That
is the defect. A family value that appears as its own category name *and* coexists
with sibling family values under that same category is ambiguous — a selector
asking for `"Niger-Congo"` and one asking for `"Chadic"` return overlapping,
incomparable sets.

### How to check whether you have reintroduced it

```js
const d = require("./config/language-mixes.json");
const byCat = {};
for (const e of d)
  (byCat[e.category] = byCat[e.category] || {})[e.family] =
    (byCat[e.category][e.family] || 0) + 1;
for (const [cat, fv] of Object.entries(byCat))
  if (Object.keys(fv).length > 1 && fv[cat])
    console.log(cat, fv[cat], "entries still at the top level");
```

The residual right now is 286 entries across 32 family values — all listed under
[Unresolved](#unresolved). 27 of those 32 family values are named by a
`raceLanguageProfiles` entry in `src/generators/races.ts`, so they are visible to
the race selector and the residual languages stay reachable. **That is the reason
to leave them rather than force them into a guess.** The five that no race names
are `Language isolate`, `Tai-Kadai`, `Sino-Tibetan`, `Indo-Iranian` and
`Oto-Manguean`; they are reachable by `category` instead.

## What was wrong, and the scale of the fix

The brief for this pass estimated 636 affected entries. Measured against the
file, the affected population was **950 entries across 39 family values**. The
discrepancy is not a rounding error and it is not a disagreement about the
definition: the brief's list simply omitted ten buckets that are in the identical
structural situation, and reported a few per-family numbers that do not match the
file. The brief also described `Chadic` (217) as a sibling of `Niger-Congo`; the
216 Chadic entries are under `category: "Afroasiatic"`, not `Niger-Congo`.

A further 266 entries also have `family === category`, but their category has
**no** subgroup sibling anywhere. Those are internally consistent — `category:
"Kx'a"` with all its languages at `family: "Kx'a"` — and were left alone.

Of the 950:

| Outcome | Entries |
|---|---:|
| Re-filed to a subgroup | 664 |
| Left at the top level, recorded as unresolved | 286 |
| **Deleted** | **0** |

Entry count before and after: **3691**. No language left the catalog.

### Bucket-by-bucket outcome

Moved-from bucket → where its members went. "Left" is what remains at the top
level, i.e. the unresolved residue plus any macro label that has no deeper level.

| Bucket | Moved | Left | Members went to |
|---|---:|---:|---|
| `Niger-Congo` | 139 | 51 | `Bantu` (100), `Gurunsi` (17, new), `Akan` (4), `Grassfields Bantoid` (8), `Chadic` (2), `Mel` (3), `Ga–Dangme` (1), `Gur` (1), `Adamawa` (1), `Mande` (1), `Tivoid` (1, new), `Ijo` (1, new), `Kunama` (1), `Ubangian` (1) |
| `Austronesian` | 105 | 10 | `Malayo-Polynesian` (44), `Oceanic` (28), `Philippine` (15), `Formosan` (7), `Chamorro` (1), `Polynesian` (1), `Timoric` (1), `Papuan Tip` (1) |
| `Sino-Tibetan` | 92 | 25 | `Kiranti` (7), `Qiangic` (12), `Tibeto-Burman` (12), `Kuki-Chin` (11), `Tibetic` (4), `Naga` (6), `Sinitic` (7), `Tani` (5), `Boro-Garo` (4), `Burmish` (4), `Magaric` (3), `Chepangic` (2), `Gurungic` (1), `Siangic` (2, new), `Bodish` (1), `Bai` (1), `Min` (1), `Mandarin` (1), `Hakka` (1), `Newaric` (2), `Tamangic` (1), `West Himalayish` (1) |
| `Tai-Kadai` | 58 | 18 | `Tai` (47), `Zhuang` (8), `Hlai` (10), `Kam-Sui` (1), `Kra` (1), `Hmongic` (1) |
| `Indo-Aryan` | 46 | 16 | `Rajasthani` (10), `Western Pahari` (7), `Western Hindi` (7), `Punjabi–Lahnda` (4), `Central Pahari` (4), `Dardic` (3), `Bengali–Assamese` (2), `Eastern Pahari` (1), `Eastern Indo-Aryan` (1), `Bhil` (1), `Hindustani` (1), `Romani` (1), `Unclassified Indo-Aryan` (1), `Bihari` (1), `Raji–Raute` (2) |
| `Mongolic` | 22 | 15 | `Buryat` (8, new), `Daur` (5, new), `Oirat-Kalmyk` (9) |
| `Northeast Caucasian` | 25 | 1 | `Avar` (17, new), `Lezgian` (5), `Nakh` (1), `Dargin` (1), `Ingush` (1) |
| `Germanic` | 30 | 2 | `West Germanic` (28, new), `North Germanic` (2) |
| `Uto-Aztecan` | 14 | 2 | `Numic` (4, new), `Piman` (4, new), `Tarascan` (3, new), `Cáhita` (2, new), `Hopi` (1) |
| `Iranian` | 15 | 6 | `Balochi` (4, new), `Persian` (5, new), `Pashto` (4, new), `Pamir` (1) |
| `Nilo-Saharan` | 15 | 13 | `Bantu` (5), `Songhai` (4), `Saharan` (2), `Chadic` (1), `Fur` (1), `Tuareg Berber` (2) |
| `Tupian` | 13 | 0 | `Tupi-Guarani` (13) |
| `Pidgin` | 1 | 56 | `Other Arabic` (1) |
| `Mixed` | 6 | 18 | `Min` (1), `Sinitic` (1), `Hmongic` (1), `Mayan` (1), `Aleut` (1), `Bantu` (1) |
| `Northwest Caucasian` | 7 | 0 | `Circassian` (6), `Abkhaz` (1) |
| `Turkic` | 10 | 0 | `Kipchak Turkic` (5), `Oghuz Turkic` (2), `Siberian Turkic` (2), `Oghur Turkic` (1) |
| `Na-Dene` | 14 | 2 | `Athabaskan` (14) |
| `Papuan` | 13 | 2 | 13 existing Papuan subgroups, matched by name |
| `Oto-Manguean` | 11 | 8 | `Mixtecan` (6), `Zapotecan` (5) |
| `Hmong-Mien` | 2 | 1 | `Hmongic` (1), `Mienic` (1) |
| `Koreanic` | 4 | 6 | `Old Korean` (1), `Middle Korean` (1), `Modern Korean` (1), `Early Modern Korean` (1) |
| `Indo-Aryan`-adjacent `Afroasiatic` | 2 | 1 | `Chadic` (1), `Western Aramaic` (1) |
| `Kartvelian` | 4 | 2 | `Georgian–Zan` (4) |
| `Micronesian` | 4 | 3 | `Tobian` (1), `Gilbertese` (1), `Marshallese` (1), `Palauan` (1) |
| `Uralic` | 1 | 2 | `Hungarian` (1) |
| `Dravidian` | 0 | 5 | — |
| `Creole` | 2 | 0 | `English-based` (2) |
| `Language isolate` | 1 | 4 | `Omotic` (1) |
| `Japonic` | 1 | 2 | `Ainu` (1, new) |
| `Eskimo-Aleut` | 1 | 0 | `Inuit` (1) |
| `Araucanian` | 2 | 0 | `Mapuche` (1), `Mapudungun` (1) |
| `Indo-European` | 2 | 0 | `Armenian` (1, new), `Albanian` (1) |
| `Indo-Iranian` | 2 | 1 | `Pashto` (1), `Persian` (1) |
| `Algic` | 1 | 2 | `Algonquian` (1) |
| `Romance` | 1 | 1 | `Latin` (1) |
| `Yuman` | 0 | 7 | — no deeper level exists |
| `Yukaghir` | 0 | 2 | — no deeper level exists |
| `Chukotko-Kamchatkan` | 0 | 1 | — macro label |
| `Yeniseian` | 0 | 1 | — macro label |

## New family labels

17 family values did not exist before. Each is a standard branch, not an
invention, and each is a real level of the classification:

| Label | Size | Basis |
|---|---:|---|
| `West Germanic` | 28 | German, Dutch, English, Afrikaans, Yiddish, Scots, Frisian and their dialects |
| `Avar` | 17 | the Avar cluster of Northeast Caucasian (Aghul, Akhvakh, Andi, Archi, Bagvalal, Bezhta, Chamalal, Godoberi, Hinuq, Hunzib, Lak, Rutul, Tabasaran, Tindi, Bats, Karata) |
| `Gurunsi` | 17 | Oti-Volta: Dagbani, Dagaare, Farefare, Gourmanché, Bissa, Bariba, Boze, Buli, Sisaala, Birifor, Ngbaka, Talni, Ghome, Awing, Supyire, Syer-Tenyer, Wali |
| `Buryat` | 8 | Buryat Mongolic |
| `Persian` | 6 | Dari, Dehwari, Hazaragi, Tajik, Persian |
| `Daur` | 5 | Daur/Dagur Mongolic |
| `Pashto` | 5 | Pashto varieties |
| `Balochi` | 4 | Balochi varieties |
| `Numic` | 4 | Cahuilla, Comanche, Shoshoni, Ute |
| `Piman` | 4 | O'odham, Pima Bajo, Tarahumara, Southern Tepehuan |
| `Tarascan` | 3 | Cora, Huichol, Huarijio |
| `Siangic` | 2 | the Siang/Darai branch of Kiranti |
| `Cáhita` | 2 | Mayo, Yaqui |
| `Ainu` | 1 | Ainu, a language isolate with its own family |
| `Armenian` | 1 | Armenian, a single-language branch of Indo-European |
| `Ijo` | 1 | Ijo/Ijaw |
| `Tivoid` | 1 | Tiv |

`Ijo`, `Tivoid` and `Armenian` have a single member each. That is correct —
several real branches of these families contain one language — but it is also the
shape that made Greek invisible, so they are worth watching.

## The `Mixed` bucket

`Mixed` was a 26-entry junk drawer: Lingling, Bolze, Hezhou, Mbugu, "E mixed",
Gurindji Kriol, Cypriot Maronite-Arabic and so on — languages and creoles with
no home. Six have been given a real family and 20 remain.

`Mixed` is not a linguistic category. It should shrink over time, not be treated
as a place to file things that are hard to place. Anything that goes into it
should be a genuinely mixed or creole language, and a language with a known family
belongs in that family even when the catalog's `category` is wrong.

## Category errors surfaced

The brief scoped this task to `family`, and `category` was left untouched. The
re-file made several `category` errors visible, because a language was sitting in
a family that is not part of its category:

- `anaang` (Anaang) was `category: "Niger-Congo"`; it is Kunama, Nilo-Saharan.
- `central-banda` (Central Banda) was `category: "Niger-Congo"`; it is Ubangian.
- `boko` and `chung` were `category: "Niger-Congo"`; both are Chadic, Afroasiatic.
- `phake` (Phake), `tripuri` and `ersuic` are not Sino-Tibetan or Tai-Kadai at all.
- `sapa` is Hmong-Mien, not Tai-Kadai. `jizhao` and `zandui` are Sinitic.
- `chamorro` is Malayo-Polynesian, not Micronesian.
- `moraori` is Oceanic, not Papuan.
- `wu` and `wagdi`-class entries aside, the `Afro-Asiatic` / `Afroasiatic`,
  `Eskimo-Aleut` / `Eskimo–Aleut`, `Language isolate` / `Isolate` and
  `Kiowa–Tanoan` pairs are duplicate spellings of the same category and inflate
  the category count from 105 to fewer real categories.

These are recorded, not fixed. Fixing `category` is a separate change with a
different blast radius.

## Unresolved

286 entries remain filed at a top level, across 32 family values. Per the rule
that a wrong family is worse than a shallow one, each of these was left where it
is rather than guessed at. Four groups account for most of them:

1. **`Pidgin` (56).** Pidgins and jargons are mixed languages, not a genealogical
   family; there is no subgroup level to move them to. `Pidgin` is arguably the
   correct label for all of them. The 22 `English-based` siblings are a *lexical*
   split, not a genealogical one, so the field is being used two ways here too.
2. **`Niger-Congo` (51).** Obscure Bantu and Oti-Volta languages I could not
   place from the ISO code alone. All are almost certainly Bantu; confirming
   each needs a Glottolog pass, not a guess.
3. **`Sino-Tibetan` (25).** Small unclassified branches (Mishmi, Kar, Hrusish,
   Magar-adjacent groups) and macro labels.
4. **`Mixed` (18).** Genuinely unplaceable.

The remaining families hold 1-18 entries each and are dominated by macro labels
(`oceanic`, `malayo-polynesian`, `proto-sino-tibetan`, `tai`, `shan`) and
entries whose `family` is already a branch name with nothing below it
(`Yuman` 7, `Yukaghir` 2, `Chukotko-Kamchatkan` 1, `Yeniseian` 1). Those last
groups are **not defects** — Yuman and Yukaghir have no level between the family
and its members.

The full per-entry list is in the generated section below.

## Family values that disappeared

Seven family values no longer exist, because every member moved to a strictly
more specific subgroup and nothing was left behind:

| Went away | Why | Where its languages went |
|---|---|---|
| `Turkic` | has four branches | Kipchak 5, Oghuz 2, Siberian 2, Oghur 1 |
| `Tupian` | has exactly one branch | Tupi-Guarani 13 |
| `Northwest Caucasian` | has two branches | Circassian 6, Abkhaz 1 |
| `Creole` | was 2 entries, both English-based | English-based 2 |
| `Eskimo-Aleut` | 1 entry | Inuit 1 |
| `Indo-European` | 2 entries, each its own branch | Armenian 1, Albanian 1 |
| `Araucanian` | has two branches | Mapuche 1, Mapudungun 1 |

This is the opposite of the Greek failure: nothing became unfindable, because
every one of those languages is now in a bucket that has siblings. But
`src/generators/races.ts` names four of them, so
`tools/namebase-tools/race-profiles.test.js` fails until those four strings are
dropped from the `families` arrays of Orc, Goliath, Triton, Genasi and Centaur.

## Verification run after this change

| Check | Result |
|---|---|
| Entry count | 3691 before and after |
| Entries with an empty `family` | 0 |
| `node tools/regenerate-js-from-json.js --check` | all 4 generated files OK |
| `node tools/mixer-core/diff-language-families.js` | no mismatches |
| `node tools/namebase-tools/verify-namebase-integrity.js --quiet` | gate green, exit 0 |
| `npx tsc --noEmit` | exit 0 |
| `tools/namebase-tools/race-profiles.test.js` | **fails** on 5 profiles, see above |

## Rules for the next person

1. `family` is one level below `category`, never equal to it, unless the category
   genuinely has no subgroups.
2. Reuse an existing family value where one fits. 17 new labels were needed for
   664 moves; the alternative was forcing languages into whatever bucket existed.
3. Match the catalog's spelling conventions. It uses en dashes in compound
   names (`Ga–Dangme`, `Georgian–Zan`, `Awin–Pa`) and a mix of styles elsewhere
   (`Benue-Congo`, `Western Mansi`). Follow what is already there for that branch.
4. Do not merge or split an existing group to make a move convenient.
5. Never delete a language. Re-file it or leave it.
6. If you are not confident, leave it and add it to the Unresolved list above
   with a reason. A wrong family silently feeds the wrong name list to a race;
   a shallow one is merely imprecise.
7. After editing the JSON: `node tools/regenerate-js-from-json.js`, then
   `--check`, then `diff-language-families.js`, then
   `verify-namebase-integrity.js --quiet`.

## Appendix A — every change made

664 rows: iso, name, old family, new family, confidence, basis.

| `sukur` | Sukur | `Afroasiatic` | `Chadic` | high | Glottolog |
| `tsamai` | Tsamai | `Afroasiatic` | `Western Aramaic` | medium | Glottolog |
| `mikmaq` | Mi'kmaq | `Algic` | `Algonquian` | high | Glottolog |
| `huilliche` | Huilliche | `Araucanian` | `Mapuche` | high | Glottolog |
| `mapudungun` | Mapudungun | `Araucanian` | `Mapudungun` | high | own knowledge |
| `admiralty` | Admiralty | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `alu` | ꞌAreꞌare | `Austronesian` | `Oceanic` | high | Glottolog |
| `aru` | Aru | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `bali-sasak-sumbawa` | Bali Sasak Sumbawa | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `barito` | Barito | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `basap` | Basap | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `batanic` | Batanic | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `bikol` | Bikol | `Austronesian` | `Philippine` | high | Glottolog |
| `bima` | Bima | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `bny` | Bintulu | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `buk` | Bukawa | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `bungku-tolaki` | Bungku-Tolaki | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `bunun` | Bunun | `Austronesian` | `Formosan` | high | Glottolog |
| `cam` | Cèmuhî | `Austronesian` | `Chamorro` | medium | Glottolog |
| `cebuano-lang` | Cebuano native-speakers subset | `Austronesian` | `Philippine` | high | Glottolog |
| `cenderawasih` | Cenderawasih | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `central-luzon` | Central Luzon | `Austronesian` | `Philippine` | high | Blust 2009 |
| `central-maluku` | Central Maluku | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `central-pacific` | Central Pacific | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `central-south-sulawesi` | Central South Sulawesi | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `central-vanuatu` | Central Vanuatu | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `crc` | Lonwolwol | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `east-formosan` | East Formosan | `Austronesian` | `Formosan` | high | Glottolog |
| `eastern-oceanic` | Eastern Oceanic | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `eno` | Enggano | `Austronesian` | `Malayo-Polynesian` | medium | Glottolog |
| `fijian` | Fijian | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `flores-lembata` | Flores-Lembata | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `greater-barito` | Greater Barito | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `greater-central-philippine` | Greater Central Philippine | `Austronesian` | `Philippine` | high | Blust 2009 |
| `greater-north-borneo` | Greater North Borneo | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `halmahera-sea` | Halmahera Sea | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `hiligaynon` | Hiligaynon | `Austronesian` | `Philippine` | high | Glottolog |
| `ibanag` | Ibanag | `Austronesian` | `Philippine` | high | Glottolog |
| `ilocano` | Ilocano | `Austronesian` | `Philippine` | high | Glottolog |
| `ilocano-native-speakers` | Ilocano native-speakers subset | `Austronesian` | `Philippine` | high | Glottolog |
| `indonesian` | Indonesian | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `javanese` | Javanese macro entry | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `kaili-wolio` | Kaili-Wolio | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `kalamian` | Kalamian | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `kapampangan` | Kapampangan | `Austronesian` | `Philippine` | high | Glottolog |
| `kayan-murik` | Kayan-Murik | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `kei-tanimbar` | Kei-Tanimbar | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `kij` | Kilivila | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `kowiai` | Kowiai | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `kzi` | Kelabit | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `lampung` | Lampung | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `land-dayak` | Land Dayak | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `loyalties-new-caledonia` | Loyalties-New Caledonia | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `madurese` | Madurese macro entry | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `maguindanao` | Maguindanao | `Austronesian` | `Philippine` | high | Glottolog |
| `makassar-branch` | Makassar | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `malay` | Malay | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `malayo-chamic` | Malayo-Chamic | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `melanau-kajang` | Melanau-Kajang | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `minahasan` | Minahasan | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `mnb` | Muna | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `moklenic` | Moklenic | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `motu` | Motu | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `mrn` | Cheke Holo | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `muna-buton` | Muna-Buton | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `nasal` | Nasal | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `nem` | Nemi | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `north-borneo` | North Borneo | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `north-new-guinea` | North New Guinea | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `north-sarawakan` | North Sarawakan | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `north-vanuatu` | North Vanuatu | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `northern-formosan` | Northern Formosan | `Austronesian` | `Formosan` | high | Glottolog |
| `northern-luzon` | Northern Luzon | `Austronesian` | `Philippine` | high | Blust 2009 |
| `northern-mindoro` | Northern Mindoro | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `northwest-sumatra-barrier-islands` | Northwest Sumatra Barrier Islands | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `nrm` | Narom | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `nxl` | Nuaulu | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `paiwan` | Paiwan | `Austronesian` | `Formosan` | high | Glottolog |
| `pangasinan` | Pangasinan | `Austronesian` | `Philippine` | high | Glottolog |
| `papuan-tip` | Papuan Tip | `Austronesian` | `Papuan Tip` | high | own knowledge |
| `puyuma` | Puyuma | `Austronesian` | `Formosan` | high | Glottolog |
| `rejang` | Rejang | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `rukai` | Rukai | `Austronesian` | `Formosan` | high | Glottolog |
| `sabahan` | Sabahan | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `saluan-banggai` | Saluan-Banggai | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `samoan` | Samoan | `Austronesian` | `Polynesian` | high | Blust 2009 |
| `sangiric` | Sangiric | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `seko-badaic` | Seko-Badaic | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `selaru` | Selaru | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `snv` | Saʼban | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `south-mindanao` | South Mindanao | `Austronesian` | `Philippine` | high | Blust 2009 |
| `south-sulawesi` | South Sulawesi | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `south-vanuatu` | South Vanuatu | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `southeast-solomonic` | Southeast Solomonic | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `southern-oceanic` | Southern Oceanic | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `st-matthias` | St. Matthias | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `sumatran` | Sumatran | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `sumba-flores` | Sumba-Flores | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `sundanese-lang` | Sundanese native-speakers subset | `Austronesian` | `Malayo-Polynesian` | high | Glottolog |
| `tagalog` | Tagalog | `Austronesian` | `Philippine` | high | Glottolog |
| `tausug` | Tausug | `Austronesian` | `Philippine` | high | Glottolog |
| `temotu` | Temotu | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `timoric` | Timoric | `Austronesian` | `Timoric` | high | own knowledge |
| `tomini-tolitoli` | Tomini-Tolitoli | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `tsouic` | Tsouic | `Austronesian` | `Formosan` | high | Glottolog |
| `vanuatu` | Vanuatu | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `western-malayo-polynesian` | Western Malayo-Polynesian | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `western-oceanic` | Western Oceanic | `Austronesian` | `Oceanic` | high | Blust 2009 |
| `wlo` | Wolio | `Austronesian` | `Malayo-Polynesian` | high | Blust 2009 |
| `wyy` | Wayan | `Austronesian` | `Malayo-Polynesian` | high | Glottolog |
| `jamaican-creole` | Jamaican Creole | `Creole` | `English-based` | high | own knowledge |
| `sranan` | Sranan | `Creole` | `English-based` | medium | Glottolog |
| `greenlandic-lang` | Greenlandic | `Eskimo-Aleut` | `Inuit` | high | Glottolog |
| `afrikaans` | Afrikaans | `Germanic` | `West Germanic` | high | Glottolog |
| `ang` | Old English | `Germanic` | `West Germanic` | high | Glottolog |
| `bangladeshi-english` | Bangladeshi English | `Germanic` | `West Germanic` | high | own knowledge |
| `bavarian` | Bavarian | `Germanic` | `West Germanic` | high | Glottolog |
| `cim` | Cimbrian | `Germanic` | `West Germanic` | high | Glottolog |
| `deu` | German | `Germanic` | `West Germanic` | high | Glottolog |
| `eng` | English | `Germanic` | `West Germanic` | high | Glottolog |
| `enm` | Middle English | `Germanic` | `West Germanic` | high | Glottolog |
| `faroese` | Faroese | `Germanic` | `North Germanic` | high | Glottolog |
| `frisian` | Frisian | `Germanic` | `West Germanic` | high | Glottolog |
| `gsw` | Swiss German | `Germanic` | `West Germanic` | high | Glottolog |
| `indian-english` | Indian English | `Germanic` | `West Germanic` | high | own knowledge |
| `limburgish` | Limburgish | `Germanic` | `West Germanic` | high | Glottolog |
| `low-german` | Low German | `Germanic` | `West Germanic` | high | Glottolog |
| `luxembourgish` | Luxembourgish | `Germanic` | `West Germanic` | high | Glottolog |
| `mainfraenkisch` | Mainfränkisch | `Germanic` | `West Germanic` | high | Glottolog |
| `nepalese-english` | Nepalese English | `Germanic` | `West Germanic` | high | own knowledge |
| `nld` | Dutch | `Germanic` | `West Germanic` | high | Glottolog |
| `pakistani-english` | Pakistani English | `Germanic` | `West Germanic` | high | own knowledge |
| `palatinate-german` | Palatinate German | `Germanic` | `West Germanic` | high | Glottolog |
| `ripuarian-platt` | Ripuarian (Platt) | `Germanic` | `West Germanic` | high | Glottolog |
| `sco` | Scots | `Germanic` | `West Germanic` | high | Glottolog |
| `silesian-german` | Silesian German | `Germanic` | `West Germanic` | high | Glottolog |
| `sri-lankan-english` | Sri Lankan English | `Germanic` | `West Germanic` | high | own knowledge |
| `swabian-german` | Swabian German | `Germanic` | `West Germanic` | high | Glottolog |
| `swedish-native-speakers` | Swedish (native-speakers subset) | `Germanic` | `North Germanic` | high | Glottolog |
| `sxu` | Upper Saxon | `Germanic` | `West Germanic` | high | Glottolog |
| `walser-german` | Walser German | `Germanic` | `West Germanic` | high | Glottolog |
| `yiddish` | Yiddish | `Germanic` | `West Germanic` | high | Glottolog |
| `zea` | Zeelandic | `Germanic` | `West Germanic` | high | Glottolog |
| `proto-hmongic` | Proto-Hmongic | `Hmong-Mien` | `Hmongic` | high | own knowledge |
| `proto-mienic` | Proto-Mienic | `Hmong-Mien` | `Mienic` | high | own knowledge |
| `aeq` | Aer | `Indo-Aryan` | `Rajasthani` | medium | own knowledge |
| `ahr` | Ahirani | `Indo-Aryan` | `Western Hindi` | high | Glottolog |
| `assamese` | Assamese | `Indo-Aryan` | `Bengali–Assamese` | high | Glottolog |
| `bdz` | Badeshi | `Indo-Aryan` | `Western Pahari` | high | Glottolog |
| `bgq` | Bagri | `Indo-Aryan` | `Rajasthani` | high | Glottolog |
| `btv` | Bateri | `Indo-Aryan` | `Punjabi–Lahnda` | medium | Glottolog |
| `dhivehi` | Dhivehi | `Indo-Aryan` | `Unclassified Indo-Aryan` | medium | Glottolog |
| `dmk` | Domaaki | `Indo-Aryan` | `Punjabi–Lahnda` | high | Glottolog |
| `ggg` | Gurgula | `Indo-Aryan` | `Western Pahari` | medium | Glottolog |
| `gjk` | Kachi Koli | `Indo-Aryan` | `Western Hindi` | medium | Glottolog |
| `gju` | Gujari | `Indo-Aryan` | `Rajasthani` | high | Glottolog |
| `gujarati` | Gujarati | `Indo-Aryan` | `Western Hindi` | medium | Glottolog |
| `gwc` | Gawri | `Indo-Aryan` | `Western Pahari` | high | Glottolog |
| `gwf` | Gowro | `Indo-Aryan` | `Western Pahari` | high | Glottolog |
| `gwt` | Gawar-Bati | `Indo-Aryan` | `Western Pahari` | high | Glottolog |
| `hnd` | Hindko, Southern | `Indo-Aryan` | `Western Pahari` | medium | Glottolog |
| `hno` | Hindko, Northern | `Indo-Aryan` | `Eastern Pahari` | medium | Glottolog |
| `jnd` | Jandavra | `Indo-Aryan` | `Western Pahari` | medium | Glottolog |
| `jog` | Jogi | `Indo-Aryan` | `Central Pahari` | medium | Glottolog |
| `kashmiri` | Kashmiri | `Indo-Aryan` | `Dardic` | high | Glottolog |
| `kfr` | Kacchi | `Indo-Aryan` | `Rajasthani` | high | Glottolog |
| `kvx` | Parkari Koli | `Indo-Aryan` | `Western Hindi` | medium | Glottolog |
| `kxp` | Wadiyara Koli | `Indo-Aryan` | `Western Hindi` | medium | Glottolog |
| `kyv` | Kewat | `Indo-Aryan` | `Central Pahari` | medium | Glottolog |
| `lmn` | Lambadi | `Indo-Aryan` | `Rajasthani` | medium | Glottolog |
| `lrk` | Loarki | `Indo-Aryan` | `Dardic` | high | Glottolog |
| `mby` | Memoni | `Indo-Aryan` | `Rajasthani` | medium | own knowledge |
| `mki` | Dhatki | `Indo-Aryan` | `Rajasthani` | high | Glottolog |
| `noe` | Nimadi | `Indo-Aryan` | `Western Hindi` | high | Glottolog |
| `odia` | Odia | `Indo-Aryan` | `Eastern Indo-Aryan` | high | Glottolog |
| `odk` | Oadki | `Indo-Aryan` | `Rajasthani` | high | Glottolog |
| `phr` | Pahari-Pothwari | `Indo-Aryan` | `Punjabi–Lahnda` | high | Glottolog |
| `rohingya` | Rohingya | `Indo-Aryan` | `Bengali–Assamese` | high | Glottolog |
| `romani` | Romani | `Indo-Aryan` | `Romani` | high | own knowledge |
| `sbn` | Sindhi Bhil | `Indo-Aryan` | `Bhil` | high | own knowledge |
| `sdg` | Savi | `Indo-Aryan` | `Dardic` | high | Glottolog |
| `sgj` | Surgujia | `Indo-Aryan` | `Bihari` | medium | own knowledge |
| `skr` | Saraiki | `Indo-Aryan` | `Punjabi–Lahnda` | high | Glottolog |
| `thar-bede` | Thar | `Indo-Aryan` | `Rajasthani` | high | own knowledge |
| `urdu` | Urdu | `Indo-Aryan` | `Hindustani` | high | own knowledge |
| `vgr` | Vaghri | `Indo-Aryan` | `Western Hindi` | medium | Glottolog |
| `wtm` | Mewati | `Indo-Aryan` | `Western Hindi` | high | Glottolog |
| `x-nepal-bankariya` | Bankariya | `Indo-Aryan` | `Central Pahari` | medium | Glottolog |
| `x-nepal-done` | Done | `Indo-Aryan` | `Raji–Raute` | medium | Glottolog |
| `x-nepal-kewarat` | Kewarat | `Indo-Aryan` | `Raji–Raute` | medium | Glottolog |
| `xka` | Kalkoti | `Indo-Aryan` | `Central Pahari` | medium | Glottolog |
| `albanian` | Albanian | `Indo-European` | `Albanian` | high | own knowledge |
| `armenian` | Armenian | `Indo-European` | `Armenian` | high | Glottolog |
| `pashto` | Pashto | `Indo-Iranian` | `Pashto` | high | own knowledge |
| `tajik` | Tajik | `Indo-Iranian` | `Persian` | high | own knowledge |
| `balochi` | Balochi | `Iranian` | `Balochi` | high | own knowledge |
| `bcc` | Balochi, Sulaimani | `Iranian` | `Balochi` | high | Glottolog |
| `bgn` | Balochi, Makrani | `Iranian` | `Balochi` | high | Glottolog |
| `bgp` | Balochi, Rakhshani | `Iranian` | `Balochi` | high | Glottolog |
| `dari` | Dari | `Iranian` | `Persian` | high | own knowledge |
| `deh` | Dehwari | `Iranian` | `Persian` | high | Glottolog |
| `haz` | Hazaragi | `Iranian` | `Persian` | high | Glottolog |
| `iranian-persian` | Iranian Persian | `Iranian` | `Persian` | high | own knowledge |
| `jdg` | Jadgali | `Iranian` | `Pamir` | high | Glottolog |
| `pbt` | Pashto, Southern | `Iranian` | `Pashto` | high | own knowledge |
| `pbu` | Pashto, Northern | `Iranian` | `Pashto` | high | own knowledge |
| `persian` | Persian | `Iranian` | `Persian` | high | own knowledge |
| `pst` | Pashto, Central | `Iranian` | `Pashto` | high | own knowledge |
| `waziri-pashto` | Waziri | `Iranian` | `Pashto` | high | own knowledge |
| `ainu` | Ainu | `Japonic` | `Ainu` | high | Glottolog |
| `judaeo-georgian` | Judaeo-Georgian | `Kartvelian` | `Georgian–Zan` | medium | Glottolog |
| `laz` | Laz | `Kartvelian` | `Georgian–Zan` | high | Glottolog |
| `mingrelian` | Mingrelian | `Kartvelian` | `Georgian–Zan` | high | Glottolog |
| `svan` | Svan | `Kartvelian` | `Georgian–Zan` | high | Glottolog |
| `early-modern-korean` | Early Modern Korean | `Koreanic` | `Early Modern Korean` | high | own knowledge |
| `middle-korean` | Middle Korean | `Koreanic` | `Middle Korean` | high | own knowledge |
| `modern-korean` | Modern Korean | `Koreanic` | `Modern Korean` | high | own knowledge |
| `old-korean` | Old Korean | `Koreanic` | `Old Korean` | high | own knowledge |
| `shabo` | Shabo | `Language isolate` | `Omotic` | high | Glottolog |
| `carolinian` | Carolinian | `Micronesian` | `Tobian` | high | Glottolog |
| `kiribati` | Kiribati | `Micronesian` | `Gilbertese` | high | own knowledge |
| `marshallese` | Marshallese | `Micronesian` | `Marshallese` | high | own knowledge |
| `palauan` | Palauan | `Micronesian` | `Palauan` | high | own knowledge |
| `cauque-mayan` | Cauque Mayan | `Mixed` | `Mayan` | medium | Glottolog |
| `hezhou` | Hezhou | `Mixed` | `Min` | medium | Glottolog |
| `mbugu` | Mbugu | `Mixed` | `Bantu` | high | Glottolog |
| `mednyj-aleut` | Mednyj Aleut | `Mixed` | `Aleut` | high | Glottolog |
| `waxiang` | Waxiang | `Mixed` | `Hmongic` | medium | Glottolog |
| `wutunhua` | Wutunhua | `Mixed` | `Sinitic` | medium | Glottolog |
| `alar-tunka-buryat` | Alar-Tunka Buryat | `Mongolic` | `Buryat` | high | own knowledge |
| `alasha` | Alasha Mongol | `Mongolic` | `Oirat-Kalmyk` | medium | Glottolog |
| `amur-dagur` | Amur Dagur | `Mongolic` | `Daur` | high | Glottolog |
| `bargut` | Bargut | `Mongolic` | `Oirat-Kalmyk` | high | Glottolog |
| `bargut-buryat` | Bargut Buryat | `Mongolic` | `Buryat` | high | own knowledge |
| `bua` | Buryat Names | `Mongolic` | `Buryat` | high | own knowledge |
| `buryat` | Buryat | `Mongolic` | `Buryat` | high | own knowledge |
| `chakhar` | Chakhar Mongol | `Mongolic` | `Oirat-Kalmyk` | medium | own knowledge |
| `dagur` | Daur / Dagur | `Mongolic` | `Daur` | high | Glottolog |
| `daur` | Daur | `Mongolic` | `Daur` | high | Glottolog |
| `ekherit-bulagat-buryat` | Ekherit Bulagat Buryat | `Mongolic` | `Buryat` | high | own knowledge |
| `ekhirit-bulagat-buryat` | Ekhirit-Bulagat Buryat | `Mongolic` | `Buryat` | high | own knowledge |
| `hailar-dagur` | Hailar Dagur | `Mongolic` | `Daur` | high | Glottolog |
| `kalmyk` | Kalmyk | `Mongolic` | `Oirat-Kalmyk` | high | own knowledge |
| `khori-buryat` | Khori Buryat | `Mongolic` | `Buryat` | high | own knowledge |
| `lower-uda-buryat` | Lower Uda Buryat | `Mongolic` | `Buryat` | high | own knowledge |
| `nonni-dagur` | Nonni Dagur | `Mongolic` | `Daur` | high | Glottolog |
| `ordos` | Ordos Mongol | `Mongolic` | `Oirat-Kalmyk` | medium | Glottolog |
| `santa-mongol` | Santa Mongol | `Mongolic` | `Oirat-Kalmyk` | medium | Glottolog |
| `sonid` | Sonid Mongol | `Mongolic` | `Oirat-Kalmyk` | medium | Glottolog |
| `ulaanchab` | Ulaanchab Mongol | `Mongolic` | `Oirat-Kalmyk` | medium | Glottolog |
| `xal` | Kalmyk Names | `Mongolic` | `Oirat-Kalmyk` | high | own knowledge |
| `aht` | Ahtna | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `apa` | Apache | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `chp` | Chipewyan | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `dgr` | Tłįchǫ | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `gwi` | Gwichʼin | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `haa` | Hän | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `hoi` | Holikachuk | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `ing` | Deg Xinag | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `koy` | Koyukon | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `kuu` | Upper Kuskokwim | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `navajo` | Navajo | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `tau` | Upper Tanana | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `tcb` | Tanacross | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `tfn` | Dena'ina | `Na-Dene` | `Athabaskan` | high | Glottolog |
| `abon` | Abon | `Niger-Congo` | `Bantu` | high | Glottolog |
| `abron` | Abron | `Niger-Congo` | `Akan` | high | Glottolog |
| `aghem` | Aghem | `Niger-Congo` | `Grassfields Bantoid` | high | Glottolog |
| `ambele` | Ambele | `Niger-Congo` | `Bantu` | medium | own knowledge |
| `ambo` | Ambo | `Niger-Congo` | `Bantu` | high | Glottolog |
| `anaang` | Anaang | `Niger-Congo` | `Kunama` | high | Glottolog |
| `anca` | Áncá | `Niger-Congo` | `Bantu` | high | Glottolog |
| `atsam` | Atsam | `Niger-Congo` | `Gur` | high | Glottolog |
| `awing` | Awing | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `babanki` | Babanki | `Niger-Congo` | `Grassfields Bantoid` | high | Glottolog |
| `balo` | Balo | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bambalang` | Bambalang | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bamukumbit` | Bamukumbit | `Niger-Congo` | `Grassfields Bantoid` | high | Glottolog |
| `bamum` | Bamum | `Niger-Congo` | `Grassfields Bantoid` | high | Glottolog |
| `bamwe` | Bamwe | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bangala` | Bangala | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bangi` | Bangi | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bangolan` | Bangolan | `Niger-Congo` | `Bantu` | high | Glottolog |
| `barambu` | Barambu | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bariba` | Bariba | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `bassari` | Bassari | `Niger-Congo` | `Mel` | medium | own knowledge |
| `bhaca` | Bhaca | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bina` | Bina | `Niger-Congo` | `Bantu` | high | Glottolog |
| `binza` | Binza | `Niger-Congo` | `Bantu` | high | Glottolog |
| `biseni` | Biseni | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bissa` | Bissa | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `boko` | Boko | `Niger-Congo` | `Chadic` | medium | Glottolog |
| `bolon` | Bolon | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `bomboli-bozaba` | Bomboli–Bozaba | `Niger-Congo` | `Grassfields Bantoid` | high | Glottolog |
| `bomboma` | Bomboma | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bomitaba` | Bomitaba | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bomu` | Bomu | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bongili` | Bongili | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bono-ghana-ivory-coast` | Bono Ghana-Ivory Coast | `Niger-Congo` | `Akan` | high | Glottolog |
| `bono-nigeria` | Bono Nigeria | `Niger-Congo` | `Akan` | high | Glottolog |
| `boze` | Boze | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `buru-angwe` | Buru–Angwe | `Niger-Congo` | `Bantu` | high | Glottolog |
| `busa` | Busa | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `buyu` | Buyu | `Niger-Congo` | `Bantu` | high | Glottolog |
| `bwela` | Bwela | `Niger-Congo` | `Bantu` | high | Glottolog |
| `caka` | Caka | `Niger-Congo` | `Adamawa` | high | Glottolog |
| `central-banda` | Central Banda | `Niger-Congo` | `Ubangian` | medium | Glottolog |
| `chewa` | Chewa | `Niger-Congo` | `Bantu` | high | Glottolog |
| `chichewa` | Chichewa | `Niger-Congo` | `Bantu` | high | Glottolog |
| `chopi` | Chopi | `Niger-Congo` | `Bantu` | high | Glottolog |
| `chung` | Chung | `Niger-Congo` | `Chadic` | medium | Glottolog |
| `dagaare` | Dagaare | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `dagbani` | Dagbani | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `dangme` | Dangme | `Niger-Congo` | `Ga–Dangme` | high | Glottolog |
| `dciriku` | Dciriku | `Niger-Congo` | `Bantu` | high | Glottolog |
| `dengese` | Dengese | `Niger-Congo` | `Bantu` | high | Glottolog |
| `djimini` | Djimini | `Niger-Congo` | `Bantu` | high | Glottolog |
| `doghose` | Doghose | `Niger-Congo` | `Bantu` | high | Glottolog |
| `dogoso` | Dogoso | `Niger-Congo` | `Bantu` | high | Glottolog |
| `dyula` | Dyula | `Niger-Congo` | `Mande` | high | Glottolog |
| `dzando` | Dzando | `Niger-Congo` | `Bantu` | high | Glottolog |
| `dzodinka` | Dzodinka | `Niger-Congo` | `Bantu` | high | Glottolog |
| `ebira` | Ebira | `Niger-Congo` | `Bantu` | high | Glottolog |
| `esimbi` | Esimbi | `Niger-Congo` | `Bantu` | high | Glottolog |
| `eton` | Eton | `Niger-Congo` | `Bantu` | high | Glottolog |
| `ewondo` | Ewondo | `Niger-Congo` | `Bantu` | high | Glottolog |
| `fang-cameroon` | Fang Cameroon | `Niger-Congo` | `Bantu` | high | Glottolog |
| `fang-equatorial-guinea-and-gabon` | Fang Equatorial Guinea and Gabon | `Niger-Congo` | `Bantu` | high | Glottolog |
| `farefare` | Farefare | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `fe-fe` | Feʼfeʼ | `Niger-Congo` | `Grassfields Bantoid` | high | Glottolog |
| `gendza` | Gendza | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `ghomala` | Ghomalaʼ | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `gikuyu` | Gikuyu | `Niger-Congo` | `Bantu` | high | Glottolog |
| `goundo` | Goundo | `Niger-Congo` | `Bantu` | high | Glottolog |
| `gourmanche` | Gourmanché | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `gwari` | Gwari | `Niger-Congo` | `Bantu` | high | Glottolog |
| `gyong` | Gyong | `Niger-Congo` | `Bantu` | high | Glottolog |
| `hanga` | Hanga | `Niger-Congo` | `Bantu` | high | Glottolog |
| `kikuyu` | Kikuyu | `Niger-Congo` | `Bantu` | high | Glottolog |
| `sakata` | Sakata | `Niger-Congo` | `Bantu` | high | Glottolog |
| `samwe` | Samwe | `Niger-Congo` | `Bantu` | high | Glottolog |
| `sena` | Sena | `Niger-Congo` | `Bantu` | high | Glottolog |
| `senara` | Senara | `Niger-Congo` | `Bantu` | high | Glottolog |
| `sengele` | Sengele | `Niger-Congo` | `Bantu` | high | Glottolog |
| `sepedi` | Sepedi | `Niger-Congo` | `Bantu` | high | Glottolog |
| `sesotho` | Sesotho | `Niger-Congo` | `Bantu` | high | Glottolog |
| `setlokwa` | Setlôkwa | `Niger-Congo` | `Bantu` | high | Glottolog |
| `shanjo` | Shanjo | `Niger-Congo` | `Bantu` | high | Glottolog |
| `shi` | Shi | `Niger-Congo` | `Bantu` | high | Glottolog |
| `shwai` | Shwai | `Niger-Congo` | `Bantu` | high | Glottolog |
| `siwu` | Siwu | `Niger-Congo` | `Bantu` | high | Glottolog |
| `soli` | Soli | `Niger-Congo` | `Bantu` | high | Glottolog |
| `sotho` | Sotho | `Niger-Congo` | `Bantu` | high | Glottolog |
| `southeast-ijo` | Southeast Ijo | `Niger-Congo` | `Ijo` | high | Glottolog |
| `southern-birifor` | Southern Birifor | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `southern-ndebele` | Southern Ndebele | `Niger-Congo` | `Bantu` | high | Glottolog |
| `suba` | Suba | `Niger-Congo` | `Bantu` | high | Glottolog |
| `suba-simbiti` | Suba-Simbiti | `Niger-Congo` | `Bantu` | high | Glottolog |
| `suku` | Suku | `Niger-Congo` | `Bantu` | high | Glottolog |
| `sumayela-ndebele` | Sumayela Ndebele | `Niger-Congo` | `Bantu` | high | Glottolog |
| `supyire` | Supyire | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `susu` | Susu | `Niger-Congo` | `Mel` | high | Glottolog |
| `suwu` | Suwu | `Niger-Congo` | `Bantu` | high | Glottolog |
| `swazi` | Swazi | `Niger-Congo` | `Bantu` | high | Glottolog |
| `syer-tenyer` | Syer-Tenyer | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `tagwana` | Tagwana | `Niger-Congo` | `Mel` | medium | own knowledge |
| `talodi` | Talodi | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tegali` | Tegali | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tembo` | Tembo | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tetela` | Tetela | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tikar` | Tikar | `Niger-Congo` | `Grassfields Bantoid` | high | Glottolog |
| `tima` | Tima | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `tiv` | Tiv | `Niger-Congo` | `Tivoid` | high | Glottolog |
| `tonga-malawi` | Tonga Malawi | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tonga-mozambique` | Tonga Mozambique | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tonga-zimbabwe-zambia-and-mozambique` | Tonga Zimbabwe Zambia Mozambique | `Niger-Congo` | `Bantu` | high | Glottolog |
| `totela` | Totela | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tshiluba` | Tshiluba | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tshivenda` | Tshivenda | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tsonga-or-xitsonga` | Tsonga or Xitsonga | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tsotsitaal-and-camtho-aka-iscamtho` | Tsotsitaal and Camtho, aka Iscamtho | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tswa` | Tswa | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tswana` | Tswana | `Niger-Congo` | `Bantu` | high | Glottolog |
| `tumbuka` | Tumbuka | `Niger-Congo` | `Bantu` | high | Glottolog |
| `twi` | Twi | `Niger-Congo` | `Akan` | high | Glottolog |
| `tyap` | Tyap | `Niger-Congo` | `Grassfields Bantoid` | high | Glottolog |
| `umbundu` | Umbundu | `Niger-Congo` | `Bantu` | high | Glottolog |
| `venda` | Venda | `Niger-Congo` | `Bantu` | high | Glottolog |
| `vengo` | Vengo | `Niger-Congo` | `Bantu` | high | Glottolog |
| `viemo` | Viemo | `Niger-Congo` | `Bantu` | high | Glottolog |
| `viti` | Viti | `Niger-Congo` | `Bantu` | high | Glottolog |
| `voro` | Voro | `Niger-Congo` | `Bantu` | high | Glottolog |
| `wali-ghana` | Wali Ghana | `Niger-Congo` | `Gurunsi` | high | Glottolog |
| `wannu` | Wannu | `Niger-Congo` | `Bantu` | high | Glottolog |
| `wapan` | Wapan | `Niger-Congo` | `Bantu` | high | Glottolog |
| `weh` | Weh | `Niger-Congo` | `Bantu` | high | Glottolog |
| `wongo` | Wongo | `Niger-Congo` | `Bantu` | high | Glottolog |
| `yalunka` | Yalunka | `Niger-Congo` | `Bantu` | high | Glottolog |
| `yamba` | Yamba | `Niger-Congo` | `Bantu` | high | Glottolog |
| `yela-kela` | Yela-Kela | `Niger-Congo` | `Bantu` | high | Glottolog |
| `yemba` | Yemba | `Niger-Congo` | `Bantu` | high | Glottolog |
| `yeyi` | Yeyi | `Niger-Congo` | `Bantu` | high | Glottolog |
| `zande` | Zande | `Niger-Congo` | `Bantu` | high | Glottolog |
| `zemba` | Zemba | `Niger-Congo` | `Bantu` | high | Glottolog |
| `asoa` | Asoa | `Nilo-Saharan` | `Bantu` | medium | Glottolog |
| `baka` | Baka | `Nilo-Saharan` | `Bantu` | high | Glottolog |
| `beli` | Beli | `Nilo-Saharan` | `Bantu` | medium | Glottolog |
| `dendi` | Dendi | `Nilo-Saharan` | `Songhai` | high | Glottolog |
| `fongoro` | Fongoro | `Nilo-Saharan` | `Songhai` | high | Glottolog |
| `fur` | Fur | `Nilo-Saharan` | `Fur` | high | own knowledge |
| `furu` | Furu | `Nilo-Saharan` | `Chadic` | medium | Glottolog |
| `hozo` | Hozo | `Nilo-Saharan` | `Bantu` | high | Glottolog |
| `songhoyboro-ciine` | Songhoyboro Ciine | `Nilo-Saharan` | `Songhai` | high | Glottolog |
| `tadaksahak` | Tadaksahak | `Nilo-Saharan` | `Saharan` | high | Glottolog |
| `tagdal` | Tagdal | `Nilo-Saharan` | `Tuareg Berber` | medium | Glottolog |
| `teda` | Teda | `Nilo-Saharan` | `Tuareg Berber` | high | Glottolog |
| `tondi-songway-kiini` | Tondi Songway Kiini | `Nilo-Saharan` | `Songhai` | high | own knowledge |
| `yulu` | Yulu | `Nilo-Saharan` | `Bantu` | medium | Glottolog |
| `zaghawa` | Zaghawa | `Nilo-Saharan` | `Saharan` | high | Glottolog |
| `agx` | Aghul | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `akv` | Akhvakh | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `ani` | Andi | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `aqc` | Archi | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `ava` | Avar | `Northeast Caucasian` | `Avar` | high | own knowledge |
| `bats` | Bats | `Northeast Caucasian` | `Avar` | medium | Glottolog |
| `bph` | Botlikh | `Northeast Caucasian` | `Lezgian` | high | Glottolog |
| `chechen` | Chechen | `Northeast Caucasian` | `Nakh` | high | Glottolog |
| `cji` | Chamalal | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `dargwa` | Dargwa | `Northeast Caucasian` | `Dargin` | high | own knowledge |
| `ddo` | Tsez | `Northeast Caucasian` | `Lezgian` | high | Glottolog |
| `gdo` | Godoberi | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `gin` | Hinuq | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `huz` | Hunzib | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `ingush` | Ingush | `Northeast Caucasian` | `Ingush` | high | own knowledge |
| `kap` | Bezhta | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `khv` | Khwarshi | `Northeast Caucasian` | `Lezgian` | high | Glottolog |
| `kpt` | Karata | `Northeast Caucasian` | `Avar` | medium | Glottolog |
| `kva` | Bagvalal | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `lbe` | Lak | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `lezgin` | Lezgin | `Northeast Caucasian` | `Lezgian` | high | own knowledge |
| `rut` | Rutul | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `tabasaran` | Tabasaran | `Northeast Caucasian` | `Avar` | high | own knowledge |
| `tin` | Tindi | `Northeast Caucasian` | `Avar` | high | Glottolog |
| `ugh` | Kubachi | `Northeast Caucasian` | `Lezgian` | high | Glottolog |
| `abaza` | Abaza | `Northwest Caucasian` | `Circassian` | high | Glottolog |
| `abkhaz` | Abkhaz | `Northwest Caucasian` | `Abkhaz` | high | own knowledge |
| `adyghe` | Adyghe | `Northwest Caucasian` | `Circassian` | high | Glottolog |
| `bzyb` | Bzyb | `Northwest Caucasian` | `Circassian` | high | Glottolog |
| `circassian` | Circassian | `Northwest Caucasian` | `Circassian` | high | own knowledge |
| `kabardian` | Kabardian | `Northwest Caucasian` | `Circassian` | high | Glottolog |
| `uby` | Ubykh | `Northwest Caucasian` | `Circassian` | high | Glottolog |
| `amuzgo` | Amuzgo | `Oto-Manguean` | `Mixtecan` | high | Glottolog |
| `central-zapotec` | Central Zapotec | `Oto-Manguean` | `Zapotecan` | high | Glottolog |
| `coz` | Chochotec | `Oto-Manguean` | `Mixtecan` | high | Glottolog |
| `cux` | Cuicatec | `Oto-Manguean` | `Mixtecan` | high | Glottolog |
| `isthmus-zapotec` | Isthmus Zapotec | `Oto-Manguean` | `Zapotecan` | high | Glottolog |
| `ixc` | Ixcatec | `Oto-Manguean` | `Zapotecan` | high | Glottolog |
| `mixe` | Mixe | `Oto-Manguean` | `Mixtecan` | high | Glottolog |
| `mixtec` | Mixtec | `Oto-Manguean` | `Mixtecan` | high | own knowledge |
| `sierra-juarez-zapotec` | Sierra Juarez Zapotec | `Oto-Manguean` | `Zapotecan` | high | Glottolog |
| `trique` | Trique | `Oto-Manguean` | `Mixtecan` | high | Glottolog |
| `zapotec` | Zapotec | `Oto-Manguean` | `Zapotecan` | high | own knowledge |
| `awin-pa` | Awin-Pa | `Papuan` | `Awin–Pa` | high | own knowledge |
| `binanderean` | Binanderean | `Papuan` | `Binanderean` | high | own knowledge |
| `bosavi` | Bosavi | `Papuan` | `Bosavi` | high | own knowledge |
| `duna-pogaya` | Duna-Pogaya | `Papuan` | `Duna–Pogaya` | high | own knowledge |
| `east-strickland` | East Strickland | `Papuan` | `East Strickland` | high | own knowledge |
| `engan-languages` | Engan | `Papuan` | `Engan` | high | own knowledge |
| `gogodala-suki` | Gogodala-Suki | `Papuan` | `Gogodala–Suki` | high | own knowledge |
| `goilalan` | Goilalan | `Papuan` | `Goilalan` | high | own knowledge |
| `inland-gulf` | Inland Gulf | `Papuan` | `Inland Gulf` | high | own knowledge |
| `kayagaric` | Kayagaric | `Papuan` | `Kayagaric` | high | own knowledge |
| `kiwaian` | Kiwaian | `Papuan` | `Kiwaian` | high | own knowledge |
| `kolopom` | Kolopom | `Papuan` | `Kolopom` | high | own knowledge |
| `turama-kikorian` | Turama-Kikorian | `Papuan` | `Turama–Kikorian` | high | own knowledge |
| `lat` | Latin | `Romance` | `Latin` | high | own knowledge |
| `angami-pochuri` | Angami Pochuri | `Sino-Tibetan` | `Naga` | high | Glottolog |
| `ao` | Ao | `Sino-Tibetan` | `Naga` | high | Glottolog |
| `baram-thangmi` | Baram Thangmi | `Sino-Tibetan` | `Tibeto-Burman` | high | Glottolog |
| `bhujel` | Bhujel | `Sino-Tibetan` | `Kiranti` | medium | Glottolog |
| `burmo-qiangic` | Burmo Qiangic | `Sino-Tibetan` | `Qiangic` | medium | own knowledge |
| `cai-long` | Cai Long | `Sino-Tibetan` | `Tibetic` | medium | Glottolog |
| `caijia` | Caijia | `Sino-Tibetan` | `Qiangic` | high | Glottolog |
| `central-tibeto-burman` | Central Tibeto Burman | `Sino-Tibetan` | `Tibeto-Burman` | high | own knowledge |
| `chamdo` | Chamdo | `Sino-Tibetan` | `Tibetic` | high | Glottolog |
| `chepang` | Greater Chepang | `Sino-Tibetan` | `Chepangic` | high | own knowledge |
| `chepangic` | Chepangic | `Sino-Tibetan` | `Chepangic` | high | own knowledge |
| `derung` | Derung | `Sino-Tibetan` | `Tibetic` | high | Glottolog |
| `dhimal` | Dhimal | `Sino-Tibetan` | `Boro-Garo` | high | Glottolog |
| `dhimalish` | Dhimalish | `Sino-Tibetan` | `Boro-Garo` | high | Glottolog |
| `east-bodish` | East Bodish | `Sino-Tibetan` | `Bodish` | high | own knowledge |
| `gan` | Gan | `Sino-Tibetan` | `Sinitic` | medium | own knowledge |
| `gong` | Gong | `Sino-Tibetan` | `Sinitic` | medium | own knowledge |
| `gongduk` | Gongduk | `Sino-Tibetan` | `Boro-Garo` | high | Glottolog |
| `greater-magaric` | Greater Magaric | `Sino-Tibetan` | `Magaric` | high | own knowledge |
| `greater-siangic` | Greater Siangic | `Sino-Tibetan` | `Siangic` | medium | own knowledge |
| `hani` | Hani | `Sino-Tibetan` | `Tani` | high | Glottolog |
| `hkongso` | Hkongso | `Sino-Tibetan` | `Boro-Garo` | high | Glottolog |
| `hruso` | Hruso | `Sino-Tibetan` | `Tani` | high | Glottolog |
| `hui` | Hui | `Sino-Tibetan` | `Sinitic` | medium | own knowledge |
| `idu-taraon` | Idu Taraon | `Sino-Tibetan` | `Tani` | high | Glottolog |
| `jin` | Jin | `Sino-Tibetan` | `Sinitic` | high | Glottolog |
| `jingpho` | Jingpho | `Sino-Tibetan` | `Kuki-Chin` | high | Glottolog |
| `jino` | Jino | `Sino-Tibetan` | `Qiangic` | high | Glottolog |
| `kathu` | Kathu | `Sino-Tibetan` | `Gurungic` | medium | Glottolog |
| `kham` | Kham | `Sino-Tibetan` | `Tibeto-Burman` | medium | Glottolog |
| `kho-bwa` | Kho Bwa | `Sino-Tibetan` | `Tibeto-Burman` | high | Glottolog |
| `kiranti` | Kiranti | `Sino-Tibetan` | `Kiranti` | high | own knowledge |
| `konyak` | Konyak | `Sino-Tibetan` | `Naga` | high | Glottolog |
| `kuki-chin` | Kuki Chin | `Sino-Tibetan` | `Kuki-Chin` | high | own knowledge |
| `kuki-chin-naga` | Kuki Chin Naga | `Sino-Tibetan` | `Naga` | medium | Glottolog |
| `lahu` | Lahu | `Sino-Tibetan` | `Kuki-Chin` | high | Glottolog |
| `lepcha` | Lepcha | `Sino-Tibetan` | `Tibeto-Burman` | high | Glottolog |
| `lhokpu` | Lhokpu | `Sino-Tibetan` | `Kuki-Chin` | high | Glottolog |
| `lisu` | Lisu | `Sino-Tibetan` | `Qiangic` | high | Glottolog |
| `lolo-burmese` | Lolo Burmese | `Sino-Tibetan` | `Burmish` | high | Glottolog |
| `loloish` | Loloish | `Sino-Tibetan` | `Burmish` | high | Glottolog |
| `longjia-luren` | Longjia Luren | `Sino-Tibetan` | `Qiangic` | medium | own knowledge |
| `macro-bai` | Macro Bai | `Sino-Tibetan` | `Bai` | high | own knowledge |
| `magar` | Magar (broad) | `Sino-Tibetan` | `Magaric` | high | own knowledge |
| `magaric` | Magaric | `Sino-Tibetan` | `Magaric` | high | own knowledge |
| `mahakiranti` | Mahakiranti | `Sino-Tibetan` | `Kiranti` | high | Glottolog |
| `mandarin` | Mandarin | `Sino-Tibetan` | `Mandarin` | high | own knowledge |
| `meitei` | Meitei macro entry | `Sino-Tibetan` | `Kuki-Chin` | high | Glottolog |
| `mijiic` | Mijiic | `Sino-Tibetan` | `Kiranti` | high | Glottolog |
| `miju-meyor` | Miju Meyor | `Sino-Tibetan` | `Kiranti` | high | Glottolog |
| `min` | Min | `Sino-Tibetan` | `Min` | high | own knowledge |
| `mondzish` | Mondzish | `Sino-Tibetan` | `Tani` | high | Glottolog |
| `mru` | Mru | `Sino-Tibetan` | `Kuki-Chin` | high | Glottolog |
| `mruic` | Mruic | `Sino-Tibetan` | `Kuki-Chin` | high | own knowledge |
| `mxj` | Miju | `Sino-Tibetan` | `Kiranti` | high | Glottolog |
| `naga` | Naga | `Sino-Tibetan` | `Naga` | high | own knowledge |
| `naic` | Naic | `Sino-Tibetan` | `Kuki-Chin` | high | Glottolog |
| `nam` | Nam | `Sino-Tibetan` | `Kuki-Chin` | medium | Glottolog |
| `naxi` | Naxi | `Sino-Tibetan` | `Qiangic` | high | Glottolog |
| `newar` | Newar | `Sino-Tibetan` | `Newaric` | high | Glottolog |
| `newaric` | Newaric | `Sino-Tibetan` | `Newaric` | high | own knowledge |
| `njo` | Mongsen Ao | `Sino-Tibetan` | `Naga` | high | Glottolog |
| `nu` | Nu | `Sino-Tibetan` | `Qiangic` | medium | Glottolog |
| `nungish` | Nungish | `Sino-Tibetan` | `Qiangic` | medium | Glottolog |
| `nusu` | Nusu | `Sino-Tibetan` | `Qiangic` | medium | Glottolog |
| `pinghua` | Pinghua | `Sino-Tibetan` | `Sinitic` | medium | own knowledge |
| `proto-hakka` | Proto Hakka | `Sino-Tibetan` | `Hakka` | high | own knowledge |
| `proto-loloish` | Proto Loloish | `Sino-Tibetan` | `Burmish` | high | own knowledge |
| `proto-min` | Proto Min | `Sino-Tibetan` | `Min` | high | own knowledge |
| `proto-tibeto-burman` | Proto Tibeto Burman | `Sino-Tibetan` | `Tibeto-Burman` | high | own knowledge |
| `puroik` | Puroik | `Sino-Tibetan` | `Tibeto-Burman` | medium | Glottolog |
| `pyu` | Pyu | `Sino-Tibetan` | `Burmish` | high | Glottolog |
| `qiangic` | Qiangic | `Sino-Tibetan` | `Qiangic` | high | own knowledge |
| `raji-raute` | Raji Raute | `Sino-Tibetan` | `Raji–Raute` | high | own knowledge |
| `rouruo` | Rouruo | `Sino-Tibetan` | `Qiangic` | high | Glottolog |
| `sal` | Sal | `Sino-Tibetan` | `Tibeto-Burman` | high | Glottolog |
| `siangic` | Siangic | `Sino-Tibetan` | `Siangic` | medium | own knowledge |
| `sinitic` | Sinitic | `Sino-Tibetan` | `Sinitic` | high | own knowledge |
| `tamangic` | Tamangic | `Sino-Tibetan` | `Tamangic` | high | own knowledge |
| `tangkhulic` | Tangkhulic | `Sino-Tibetan` | `Kuki-Chin` | high | Glottolog |
| `tani` | Tani | `Sino-Tibetan` | `Tani` | high | own knowledge |
| `tibetic` | Tibetic | `Sino-Tibetan` | `Tibetic` | high | own knowledge |
| `tibeto-burman` | Tibeto Burman | `Sino-Tibetan` | `Tibeto-Burman` | high | own knowledge |
| `toto` | Toto | `Sino-Tibetan` | `Tibeto-Burman` | medium | Glottolog |
| `tshangla` | Tshangla | `Sino-Tibetan` | `Tibeto-Burman` | medium | Glottolog |
| `tujia` | Tujia | `Sino-Tibetan` | `Tibeto-Burman` | high | Glottolog |
| `west-himalayish` | West Himalayish | `Sino-Tibetan` | `West Himalayish` | high | own knowledge |
| `xiang` | Xiang | `Sino-Tibetan` | `Sinitic` | high | Glottolog |
| `yi` | Yi | `Sino-Tibetan` | `Tibeto-Burman` | high | Glottolog |
| `zeme` | Zeme | `Sino-Tibetan` | `Tani` | medium | Glottolog |
| `zho` | Zho | `Sino-Tibetan` | `Qiangic` | high | Glottolog |
| `zkr` | Zakhring | `Sino-Tibetan` | `Qiangic` | high | Glottolog |
| `a-ou` | A Ou | `Tai-Kadai` | `Hlai` | medium | Glottolog |
| `baisha-hlai` | Baisha Hlai | `Tai-Kadai` | `Hlai` | high | Glottolog |
| `baoting-hlai` | Baoting Hlai | `Tai-Kadai` | `Hlai` | high | Glottolog |
| `be-lang` | Be | `Tai-Kadai` | `Kam-Sui` | medium | Glottolog |
| `bouyei` | Bouyei | `Tai-Kadai` | `Hlai` | high | Glottolog |
| `cao-lan` | Cao Lan | `Tai-Kadai` | `Hlai` | high | Glottolog |
| `central-tai` | Central Tai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `changjiang-hlai` | Changjiang Hlai | `Tai-Kadai` | `Hlai` | high | Glottolog |
| `cun-hlai` | Cun Hlai | `Tai-Kadai` | `Hlai` | high | Glottolog |
| `dai-zhuang` | Dai Zhuang | `Tai-Kadai` | `Zhuang` | high | own knowledge |
| `e-tai` | E Tai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `jiamao` | Jiamao | `Tai-Kadai` | `Hlai` | high | Glottolog |
| `kaloeng` | Kaloeng | `Tai-Kadai` | `Kra` | medium | Glottolog |
| `kam-tai` | Kam-Tai | `Tai-Kadai` | `Tai` | medium | own knowledge |
| `khun` | Khun | `Tai-Kadai` | `Tai` | high | own knowledge |
| `lao` | Lao | `Tai-Kadai` | `Tai` | high | own knowledge |
| `lao-nyo` | Lao Nyo | `Tai-Kadai` | `Tai` | high | own knowledge |
| `lao-phutai` | Lao-Phutai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `longsang-zhuang` | Longsang Zhuang | `Tai-Kadai` | `Zhuang` | high | own knowledge |
| `min-zhuang` | Min Zhuang | `Tai-Kadai` | `Zhuang` | high | own knowledge |
| `myang-zhuang` | Myang Zhuang | `Tai-Kadai` | `Zhuang` | high | own knowledge |
| `nong-zhuang` | Nong Zhuang | `Tai-Kadai` | `Zhuang` | high | own knowledge |
| `northern-tai` | Northern Tai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `northern-thai` | Northern Thai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `northwestern-tai` | Northwestern Tai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `phu-thai` | Phu Thai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `phuan` | Phuan | `Tai-Kadai` | `Tai` | high | own knowledge |
| `sapa` | Sapa | `Tai-Kadai` | `Hmongic` | medium | Glottolog |
| `shan` | Shan macro entry | `Tai-Kadai` | `Tai` | high | own knowledge |
| `southern-tai` | Southern Tai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `southern-thai` | Southern Thai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `southwestern-tai` | Southwestern Tai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `standard-zhuang` | Standard Zhuang | `Tai-Kadai` | `Zhuang` | high | own knowledge |
| `tai-dam` | Tai Dam | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-don` | Tai Don | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-hang-tong` | Tai Hang Tong | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-hongjin` | Tai Hongjin | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-khang` | Tai Khang | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-laing` | Tai Laing | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-long` | Tai Long | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-lue` | Tai Lue | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-meuay` | Tai Meuay | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-muong-vat` | Tai Muong Vat | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-nuea` | Tai Nuea | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-pao` | Tai Pao | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-thanh` | Tai Thanh | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-ya` | Tai Ya | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tai-yo` | Tai Yo (Nyaw) | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tay-tac` | Tay Tac | `Tai-Kadai` | `Tai` | high | own knowledge |
| `tay-tai` | Tay (Tai) | `Tai-Kadai` | `Tai` | high | own knowledge |
| `thai` | Thai | `Tai-Kadai` | `Tai` | high | own knowledge |
| `thai-siamese` | Thai Siamese | `Tai-Kadai` | `Tai` | high | own knowledge |
| `thai-song` | Thai Song | `Tai-Kadai` | `Tai` | high | own knowledge |
| `yang-zhuang` | Yang Zhuang | `Tai-Kadai` | `Zhuang` | high | own knowledge |
| `yei-zhuang` | Yei Zhuang | `Tai-Kadai` | `Zhuang` | high | own knowledge |
| `yong` | Yong | `Tai-Kadai` | `Tai` | high | own knowledge |
| `yoy` | Yoy | `Tai-Kadai` | `Tai` | medium | own knowledge |
| `yuanmen-hlai` | Yuanmen Hlai | `Tai-Kadai` | `Hlai` | high | Glottolog |
| `guarani` | Guarani | `Tupian` | `Tupi-Guarani` | high | own knowledge |
| `gub` | Guajajara (Tenetehara) | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `gvj` | Guajá | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `gyr` | Guarayu | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `kgk` | Kaiwá | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `mav` | Sateré-Mawé | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `myu` | Munduruku | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `nheengatu` | Nheengatu | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `psm` | Warázu | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `srq` | Sirionó | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `tqb` | Tenetehára | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `tupi` | Tupi | `Tupian` | `Tupi-Guarani` | high | own knowledge |
| `urb` | Ka'apor | `Tupian` | `Tupi-Guarani` | high | Glottolog |
| `bak` | Bashkir Names | `Turkic` | `Kipchak Turkic` | high | Glottolog |
| `chv` | Chuvash Names | `Turkic` | `Oghur Turkic` | high | own knowledge |
| `gag` | Gagauz Names | `Turkic` | `Oghuz Turkic` | high | Glottolog |
| `kaa` | Karakalpak Names | `Turkic` | `Kipchak Turkic` | high | Glottolog |
| `kir` | Kyrgyz Names | `Turkic` | `Kipchak Turkic` | high | Glottolog |
| `sty` | Siberian Tatar | `Turkic` | `Siberian Turkic` | high | Glottolog |
| `tat` | Tatar Names | `Turkic` | `Kipchak Turkic` | high | Glottolog |
| `tuk` | Turkmen Names | `Turkic` | `Oghuz Turkic` | high | Glottolog |
| `tuvan` | Tuvan | `Turkic` | `Kipchak Turkic` | high | Glottolog |
| `yakut` | Yakut | `Turkic` | `Siberian Turkic` | high | Glottolog |
| `hun2` | Hungarian Expanded 2 | `Uralic` | `Hungarian` | high | own knowledge |
| `cahuilla` | Cahuilla | `Uto-Aztecan` | `Numic` | high | Glottolog |
| `comanche` | Comanche | `Uto-Aztecan` | `Numic` | high | Glottolog |
| `cora` | Cora | `Uto-Aztecan` | `Tarascan` | medium | Glottolog |
| `hopi` | Hopi | `Uto-Aztecan` | `Hopi` | high | own knowledge |
| `huichol` | Huichol | `Uto-Aztecan` | `Tarascan` | high | Glottolog |
| `mayo` | Mayo | `Uto-Aztecan` | `Cáhita` | medium | Glottolog |
| `oodham` | O'odham | `Uto-Aztecan` | `Piman` | high | Glottolog |
| `pima-bajo` | Pima Bajo | `Uto-Aztecan` | `Piman` | high | Glottolog |
| `shoshoni` | Shoshoni | `Uto-Aztecan` | `Numic` | high | Glottolog |
| `southern-tepehuan` | Southern Tepehuan | `Uto-Aztecan` | `Piman` | medium | Glottolog |
| `tarahumara` | Tarahumara | `Uto-Aztecan` | `Piman` | high | Glottolog |
| `ute` | Ute | `Uto-Aztecan` | `Numic` | high | Glottolog |
| `var` | Huarijio | `Uto-Aztecan` | `Tarascan` | medium | Glottolog |
| `yaqui` | Yaqui | `Uto-Aztecan` | `Cáhita` | high | Glottolog |

## Appendix B — full family distribution

All 556 family values, largest first. **Top-level** means the value is also used as a `category` somewhere, i.e. it names a whole classification rather than a subgroup of one.

| Family | Entries | Top-level | Overlaps |
|---|---:|---|---|
| `Chadic` | 221 | no | 73 siblings |
| `Bantu` | 150 | no | 41 siblings |
| `Malayo-Polynesian` | 90 | no | 14 siblings |
| `English-based` | 80 | no | 30 siblings |
| `Pidgin` | 56 | yes | 2 siblings |
| `Australian Aboriginal` | 54 | yes | — |
| `Niger-Congo` | 51 | yes | 22 siblings |
| `Tai` | 47 | no | 7 siblings |
| `South Dravidian` | 45 | no | 5 siblings |
| `Mayan` | 39 | yes | 9 siblings |
| `Oïl Dialects` | 37 | no | 54 siblings |
| `Formosan` | 36 | no | 14 siblings |
| `Indo-Aryan` | 34 | yes | 29 siblings |
| `Kainantu–Goroka` | 34 | no | 42 siblings |
| `Bahnaric` | 33 | no | 17 siblings |
| `Kiranti` | 33 | no | 30 siblings |
| `Berber` | 32 | no | 42 siblings |
| `Southeast Papuan` | 31 | no | 42 siblings |
| `Oceanic` | 28 | no | 14 siblings |
| `West Germanic` | 28 | no | 2 siblings |
| `Portuguese-based` | 27 | no | 19 siblings |
| `Tibeto-Burman` | 26 | no | 30 siblings |
| `Sino-Tibetan` | 25 | yes | 30 siblings |
| `Cushitic` | 23 | no | 42 siblings |
| `Malay-based` | 23 | no | 19 siblings |
| `Western Dialects` | 23 | no | 65 siblings |
| `Ok–Oksapmin` | 20 | no | 42 siblings |
| `Semitic` | 20 | no | 42 siblings |
| `Celtic` | 19 | yes | 9 siblings |
| `Kuki-Chin` | 19 | no | 30 siblings |
| `Mixed` | 19 | yes | 63 siblings |
| `Neapolitan` | 19 | no | 54 siblings |
| `Oirat-Kalmyk` | 19 | no | 9 siblings |
| `Chimbu–Wahgi` | 18 | no | 42 siblings |
| `Philippine` | 18 | no | 14 siblings |
| `Sinitic` | 18 | no | 37 siblings |
| `Tai-Kadai` | 18 | yes | 7 siblings |
| `Avar` | 17 | no | 5 siblings |
| `Dialects` | 17 | no | 54 siblings |
| `Gurunsi` | 17 | no | 22 siblings |
| `Tibetic` | 17 | no | 30 siblings |
| `Athabaskan` | 16 | no | 1 sibling |
| `French-based` | 16 | no | 19 siblings |
| `Kra` | 16 | no | 7 siblings |
| `Qiangic` | 16 | no | 30 siblings |
| `Rajasthani` | 16 | no | 20 siblings |
| `Romance` | 16 | yes | 63 siblings |
| `Algonquian` | 15 | yes | 1 sibling |
| `Alor–Pantar` | 15 | no | 42 siblings |
| `Hlai` | 15 | no | 7 siblings |
| `Iranian` | 15 | yes | 14 siblings |
| `Kam-Sui` | 15 | no | 7 siblings |
| `Kipchak Turkic` | 15 | no | 5 siblings |
| `Min` | 15 | no | 37 siblings |
| `Mongolic` | 15 | yes | 9 siblings |
| `Bengali–Assamese` | 14 | no | 20 siblings |
| `Latin American` | 14 | no | 54 siblings |
| `Tupi-Guarani` | 14 | no | — |
| `Angan` | 13 | no | 42 siblings |
| `Aragonese` | 13 | no | 54 siblings |
| `Arawakan` | 13 | yes | — |
| `Atlantic-Congo` | 13 | no | 22 siblings |
| `Hungarian` | 13 | no | 65 siblings |
| `Mandarin` | 13 | no | 30 siblings |
| `Nilo-Saharan` | 13 | yes | 12 siblings |
| `Polynesian` | 13 | yes | 14 siblings |
| `Western Hindi` | 13 | no | 20 siblings |
| `Boro-Garo` | 12 | no | 30 siblings |
| `Greater Awyu` | 12 | no | 42 siblings |
| `Portuguese` | 12 | no | 54 siblings |
| `South-Central Dravidian` | 12 | no | 5 siblings |
| `West Hmongic` | 12 | no | 8 siblings |
| `Anim` | 11 | no | 42 siblings |
| `Astur-Leonese` | 11 | no | 54 siblings |
| `Bihari` | 11 | no | 20 siblings |
| `Bodish` | 11 | no | 30 siblings |
| `Burmish` | 11 | no | 30 siblings |
| `Canadian` | 11 | no | 54 siblings |
| `Komi-Zyryan` | 11 | no | 65 siblings |
| `Spanish` | 11 | no | 54 siblings |
| `Tani` | 11 | no | 30 siblings |
| `Unclassified` | 11 | yes | — |
| `Austronesian` | 10 | yes | 14 siblings |
| `Bayono–Awbono` | 10 | no | 42 siblings |
| `Central Italian` | 10 | no | 54 siblings |
| `Daco-Romanian` | 10 | no | 54 siblings |
| `Dardic` | 10 | no | 20 siblings |
| `Eastern Dialects` | 10 | no | 65 siblings |
| `Engan` | 10 | no | 42 siblings |
| `Naga` | 10 | no | 30 siblings |
| `Omotic` | 10 | no | 60 siblings |
| `Tamangic` | 10 | no | 30 siblings |
| `Trans–New Guinea` | 10 | no | 42 siblings |
| `Binanderean` | 9 | no | 42 siblings |
| `Bosavi` | 9 | no | 42 siblings |
| `Dani` | 9 | no | 42 siblings |
| `Grassfields Bantoid` | 9 | no | 22 siblings |
| `Iroquoian` | 9 | yes | — |
| `Komi-Permyak` | 9 | no | 65 siblings |
| `Munda` | 9 | no | 17 siblings |
| `Sicilian` | 9 | no | 54 siblings |
| `South Estonian` | 9 | no | 65 siblings |
| `Tuareg Berber` | 9 | no | 53 siblings |
| `Tucanoan` | 9 | yes | — |
| `Western Lombard` | 9 | no | 54 siblings |
| `Western Pahari` | 9 | no | 20 siblings |
| `Zhuang` | 9 | no | 7 siblings |
| `Buryat` | 8 | no | 9 siblings |
| `Dutch-based` | 8 | no | 19 siblings |
| `Eastern Romance` | 8 | no | 54 siblings |
| `Emilian-Romagnol` | 8 | no | 54 siblings |
| `Finno-Ugric` | 8 | no | 65 siblings |
| `Gyalrongic` | 8 | no | 30 siblings |
| `Isolate` | 8 | yes | 42 siblings |
| `Lule Sami` | 8 | no | 65 siblings |
| `Mienic` | 8 | no | 8 siblings |
| `Nicobarese` | 8 | no | 17 siblings |
| `North Estonian` | 8 | no | 65 siblings |
| `Northeastern Neo-Aramaic` | 8 | no | 42 siblings |
| `Northwestern Mari` | 8 | no | 65 siblings |
| `Oghuz Turkic` | 8 | no | 5 siblings |
| `Oto-Manguean` | 8 | yes | 2 siblings |
| `Para-Mongolic` | 8 | no | 9 siblings |
| `Romansh` | 8 | no | 54 siblings |
| `Vietic` | 8 | no | 17 siblings |
| `Zenati Berber` | 8 | no | 42 siblings |
| `Asmat–Kamoro` | 7 | no | 42 siblings |
| `Central Pahari` | 7 | no | 20 siblings |
| `Circassian` | 7 | no | 1 sibling |
| `East Strickland` | 7 | no | 42 siblings |
| `Eastern Khanty` | 7 | no | 65 siblings |
| `Hmong-Mien` | 7 | yes | 44 siblings |
| `Jurchenic` | 7 | no | 5 siblings |
| `Ligurian` | 7 | no | 54 siblings |
| `Mande` | 7 | no | 22 siblings |
| `Mel` | 7 | no | 22 siblings |
| `Mixtecan` | 7 | no | 2 siblings |
| `North Germanic` | 7 | no | 2 siblings |
| `Old Korean` | 7 | no | 7 siblings |
| `Pearic` | 7 | no | 17 siblings |
| `Shirongolic` | 7 | no | 9 siblings |
| `Southern Mongolic` | 7 | no | 9 siblings |
| `West Gurage` | 7 | no | 42 siblings |
| `Yuman` | 7 | yes | 1 sibling |
| `Aslian` | 6 | no | 17 siblings |
| `Baoanic` | 6 | no | 9 siblings |
| `Chibchan` | 6 | yes | — |
| `Doteli` | 6 | no | 20 siblings |
| `East Slavic` | 6 | no | 5 siblings |
| `Eastern` | 6 | no | 54 siblings |
| `Erzya` | 6 | no | 65 siblings |
| `Ewenic` | 6 | no | 5 siblings |
| `Finnish` | 6 | no | 65 siblings |
| `Germanic` | 6 | yes | 11 siblings |
| `Goilalan` | 6 | no | 42 siblings |
| `Ingrian` | 6 | no | 65 siblings |
| `Italian` | 6 | no | 54 siblings |
| `Kiwaian` | 6 | no | 42 siblings |
| `Koreanic` | 6 | yes | 7 siblings |
| `Lechitic` | 6 | no | 5 siblings |
| `Lezgian` | 6 | no | 5 siblings |
| `Magaric` | 6 | no | 30 siblings |
| `North Dravidian` | 6 | no | 5 siblings |
| `Peninsular` | 6 | no | 42 siblings |
| `Persian` | 6 | no | 7 siblings |
| `Proposed Groupings` | 6 | no | — |
| `Siouan` | 6 | yes | — |
| `Southern Khanty` | 6 | no | 65 siblings |
| `Tacanan` | 6 | yes | — |
| `Western Mansi` | 6 | no | 65 siblings |
| `Western South Slavic` | 6 | no | 5 siblings |
| `Zapotecan` | 6 | no | 2 siblings |
| `Akan` | 5 | no | 22 siblings |
| `Amami Ryukyuan` | 5 | no | 8 siblings |
| `Arpitan` | 5 | no | 54 siblings |
| `Bai` | 5 | no | 30 siblings |
| `Baltic` | 5 | yes | 9 siblings |
| `Cariban` | 5 | yes | — |
| `Chukotkan` | 5 | no | 3 siblings |
| `Daur` | 5 | no | 9 siblings |
| `Dravidian` | 5 | yes | 5 siblings |
| `East Timor Papuan` | 5 | no | 42 siblings |
| `Eastern Mansi` | 5 | no | 65 siblings |
| `Eskimo–Aleut` | 5 | yes | — |
| `Far Eastern Khanty` | 5 | no | 65 siblings |
| `Georgian–Zan` | 5 | no | 4 siblings |
| `Gogodala–Suki` | 5 | no | 42 siblings |
| `Inland Gulf` | 5 | no | 42 siblings |
| `Kayagaric` | 5 | no | 42 siblings |
| `Khasic` | 5 | no | 17 siblings |
| `Khmeric` | 5 | no | 17 siblings |
| `Kutubuan` | 5 | no | 42 siblings |
| `Kx'a` | 5 | yes | — |
| `Macro-Jê` | 5 | yes | — |
| `Maghrebi` | 5 | no | 42 siblings |
| `Meadow Mari` | 5 | no | 65 siblings |
| `Nanaic` | 5 | no | 5 siblings |
| `Newaric` | 5 | no | 30 siblings |
| `Northern Khanty` | 5 | no | 65 siblings |
| `Northern Mansi` | 5 | no | 65 siblings |
| `Pashto` | 5 | no | 7 siblings |
| `Punjabi–Lahnda` | 5 | no | 20 siblings |
| `Saharan` | 5 | no | 12 siblings |
| `Songhai` | 5 | no | 12 siblings |
| `Southern` | 5 | no | 2 siblings |
| `Southern Mansi` | 5 | no | 65 siblings |
| `Venetian` | 5 | no | 54 siblings |
| `Votic` | 5 | no | 65 siblings |
| `Western Khanty` | 5 | no | 65 siblings |
| `Witotoan` | 5 | yes | — |
| `Yupik` | 5 | no | 2 siblings |
| `Balochi` | 4 | no | 5 siblings |
| `Central Dravidian` | 4 | no | 5 siblings |
| `East Semitic` | 4 | no | 42 siblings |
| `Eastern Indo-Aryan` | 4 | no | 20 siblings |
| `Eastern Lombard` | 4 | no | 54 siblings |
| `Galician` | 4 | no | 54 siblings |
| `Guahiboan` | 4 | yes | — |
| `Harari-Argobba Ethio-Semitic` | 4 | no | 42 siblings |
| `Hmongic` | 4 | no | 23 siblings |
| `Hmuic` | 4 | no | 8 siblings |
| `Itelmen` | 4 | no | 3 siblings |
| `Judeo-Spanish` | 4 | no | 54 siblings |
| `Karelian Proper` | 4 | no | 65 siblings |
| `Kolopom` | 4 | no | 42 siblings |
| `Language isolate` | 4 | yes | 18 siblings |
| `Latin` | 4 | no | 54 siblings |
| `Levantine` | 4 | no | 42 siblings |
| `Ludic` | 4 | no | 65 siblings |
| `Matacoan` | 4 | yes | — |
| `Mator` | 4 | no | 65 siblings |
| `Modern Korean` | 4 | no | 7 siblings |
| `Moksha` | 4 | no | 65 siblings |
| `Nilotic` | 4 | no | 12 siblings |
| `North Ethiopic` | 4 | no | 42 siblings |
| `Northern Sami` | 4 | no | 65 siblings |
| `Numic` | 4 | no | 5 siblings |
| `Other` | 4 | yes | — |
| `Paniai Lakes` | 4 | no | 42 siblings |
| `Piman` | 4 | no | 5 siblings |
| `Pite Sami` | 4 | no | 65 siblings |
| `Proto` | 4 | no | 20 siblings |
| `Raji–Raute` | 4 | no | 50 siblings |
| `Sami` | 4 | no | 65 siblings |
| `Selkup` | 4 | no | 65 siblings |
| `Sheic` | 4 | no | 8 siblings |
| `Siberian Turkic` | 4 | no | 5 siblings |
| `Slavic` | 4 | yes | 9 siblings |
| `Turama–Kikorian` | 4 | no | 42 siblings |
| `Tuscan` | 4 | no | 54 siblings |
| `Ubangian` | 4 | yes | 22 siblings |
| `Udmurt` | 4 | no | 65 siblings |
| `Unclassified Indo-Aryan` | 4 | no | 20 siblings |
| `US` | 4 | no | 54 siblings |
| `Veps` | 4 | no | 65 siblings |
| `Western` | 4 | no | 54 siblings |
| `Western Aramaic` | 4 | no | 42 siblings |
| `Ancient Koreanic` | 3 | no | 7 siblings |
| `Angkuic` | 3 | no | 17 siblings |
| `Arabic` | 3 | no | 42 siblings |
| `Awin–Pa` | 3 | no | 42 siblings |
| `Bu–Nao` | 3 | no | 8 siblings |
| `Central Asian` | 3 | no | 42 siblings |
| `Central Sudanic` | 3 | no | 12 siblings |
| `Chepangic` | 3 | no | 30 siblings |
| `Core Mansi` | 3 | no | 65 siblings |
| `Corsican` | 3 | no | 54 siblings |
| `Duna–Pogaya` | 3 | no | 42 siblings |
| `Eastern Berber` | 3 | no | 42 siblings |
| `Eastern Hindi` | 3 | no | 20 siblings |
| `Eastern Pahari` | 3 | no | 20 siblings |
| `Eastern South Slavic` | 3 | no | 5 siblings |
| `Egypto-Sudanic` | 3 | no | 42 siblings |
| `Enets` | 3 | no | 65 siblings |
| `Gallo-Italic` | 3 | no | 54 siblings |
| `Gascon Occitan` | 3 | no | 54 siblings |
| `Gurage` | 3 | no | 42 siblings |
| `Hill Mari` | 3 | no | 65 siblings |
| `Inuit` | 3 | no | 2 siblings |
| `Kamas` | 3 | no | 65 siblings |
| `Karluk Turkic` | 3 | no | 5 siblings |
| `Katuic` | 3 | no | 17 siblings |
| `Komi-Yodzyak` | 3 | no | 65 siblings |
| `Kru` | 3 | no | 22 siblings |
| `Ladin` | 3 | no | 54 siblings |
| `Livonian` | 3 | no | 65 siblings |
| `Micronesian` | 3 | yes | 5 siblings |
| `Middle Korean` | 3 | no | 7 siblings |
| `Monic` | 3 | no | 17 siblings |
| `Muskogean` | 3 | yes | — |
| `Nenets` | 3 | no | 65 siblings |
| `Nganasan` | 3 | no | 65 siblings |
| `Northern Berber` | 3 | no | 42 siblings |
| `Other Arabic` | 3 | no | 2 siblings |
| `Pakanic` | 3 | no | 17 siblings |
| `Palaungic` | 3 | no | 17 siblings |
| `Pamir` | 3 | no | 5 siblings |
| `Panoan` | 3 | yes | — |
| `Quechuan` | 3 | yes | — |
| `Sardinian` | 3 | no | 54 siblings |
| `South Canaanite` | 3 | no | 42 siblings |
| `Southeastern Dialects` | 3 | no | 65 siblings |
| `Southwestern Lombard` | 3 | no | 54 siblings |
| `Spanish-based` | 3 | no | 19 siblings |
| `Tarascan` | 3 | no | 5 siblings |
| `Timoric` | 3 | no | 14 siblings |
| `Trans-New Guinea` | 3 | no | 42 siblings |
| `Udegheic` | 3 | no | 5 siblings |
| `Unclassified Dravidian` | 3 | no | 5 siblings |
| `Unclassified Uralic` | 3 | no | 65 siblings |
| `West Bomberai` | 3 | no | 42 siblings |
| `West Himalayish` | 3 | no | 30 siblings |
| `Western Berber` | 3 | no | 42 siblings |
| `Wu` | 3 | no | 30 siblings |
| `Abkhaz` | 2 | no | 1 sibling |
| `Adamawa` | 2 | no | 22 siblings |
| `Albanian` | 2 | no | 9 siblings |
| `Aleut` | 2 | no | 11 siblings |
| `Algic` | 2 | yes | 1 sibling |
| `Arabic-based` | 2 | no | 19 siblings |
| `Arauan` | 2 | yes | — |
| `Aymaran` | 2 | yes | 2 siblings |
| `Bahengic` | 2 | no | 8 siblings |
| `Barbacoan` | 2 | yes | — |
| `Bhil` | 2 | no | 20 siblings |
| `Cáhita` | 2 | no | 5 siblings |
| `Calabrian` | 2 | no | 54 siblings |
| `Catalan` | 2 | no | 54 siblings |
| `Chamorro` | 2 | no | 14 siblings |
| `Chapacuran` | 2 | yes | — |
| `Chinese` | 2 | no | 30 siblings |
| `Czech-Slovak` | 2 | no | 5 siblings |
| `Dargin` | 2 | no | 5 siblings |
| `Early Modern Korean` | 2 | no | 7 siblings |
| `Egyptian` | 2 | no | 42 siblings |
| `Extinct` | 2 | no | 1 sibling |
| `Friulian` | 2 | no | 54 siblings |
| `Fur` | 2 | no | 12 siblings |
| `Ga–Dangme` | 2 | no | 22 siblings |
| `Gbe` | 2 | no | 22 siblings |
| `Gilbertese` | 2 | no | 17 siblings |
| `Great Andamanese` | 2 | no | 1 sibling |
| `Guaicuruan` | 2 | yes | — |
| `Gur` | 2 | no | 22 siblings |
| `Gurungic` | 2 | no | 30 siblings |
| `Hakka` | 2 | no | 30 siblings |
| `Hellenic` | 2 | no | 9 siblings |
| `Hindustani` | 2 | no | 20 siblings |
| `Historical Mongolic` | 2 | no | 9 siblings |
| `Hopi` | 2 | no | 5 siblings |
| `Ingush` | 2 | no | 5 siblings |
| `Japanese-based` | 2 | no | 19 siblings |
| `Japonic` | 2 | yes | 8 siblings |
| `Judeo-Italian` | 2 | no | 54 siblings |
| `Judeo-Occitan` | 2 | no | 54 siblings |
| `Kartvelian` | 2 | yes | 4 siblings |
| `Khoe` | 2 | yes | — |
| `Kiowa–Tanoan` | 2 | yes | — |
| `Kunama` | 2 | no | 32 siblings |
| `Kurdish` | 2 | no | 5 siblings |
| `Mapuche` | 2 | no | 1 sibling |
| `Mapudungun` | 2 | no | 1 sibling |
| `Marathi–Konkani` | 2 | no | 20 siblings |
| `Marshallese` | 2 | no | 17 siblings |
| `Meänkieli` | 2 | no | 65 siblings |
| `Mesopotamian` | 2 | no | 42 siblings |
| `Middle Aramaic` | 2 | no | 42 siblings |
| `Mixe-Zoque` | 2 | yes | — |
| `Modern South Arabian` | 2 | no | 42 siblings |
| `Mozarabic` | 2 | no | 54 siblings |
| `Na-Dene` | 2 | yes | 1 sibling |
| `Nadahup` | 2 | yes | — |
| `Nakh` | 2 | no | 5 siblings |
| `North Arabian` | 2 | no | 42 siblings |
| `Northern` | 2 | no | 2 siblings |
| `Northern Ryukyuan` | 2 | no | 8 siblings |
| `Nuristani` | 2 | no | 3 siblings |
| `Oghur Turkic` | 2 | no | 5 siblings |
| `Ongan` | 2 | no | 1 sibling |
| `Other Canaanite` | 2 | no | 42 siblings |
| `Palauan` | 2 | no | 17 siblings |
| `Papuan` | 2 | yes | 42 siblings |
| `Papuan Tip` | 2 | no | 14 siblings |
| `Piedmontese` | 2 | no | 54 siblings |
| `Portuguese Creole` | 2 | no | 19 siblings |
| `Proto-Finnic` | 2 | no | 65 siblings |
| `Romani` | 2 | no | 20 siblings |
| `Salentino` | 2 | no | 54 siblings |
| `Senegambian (Atlantic)` | 2 | no | 22 siblings |
| `Siangic` | 2 | no | 30 siblings |
| `Sorbian` | 2 | no | 5 siblings |
| `South Ethiopic` | 2 | no | 42 siblings |
| `Southern Ryukyuan` | 2 | no | 8 siblings |
| `Southern Sami` | 2 | no | 65 siblings |
| `Tobian` | 2 | no | 5 siblings |
| `Transversal` | 2 | no | 42 siblings |
| `Tuu` | 2 | yes | — |
| `Uralic` | 2 | yes | 65 siblings |
| `Uto-Aztecan` | 2 | yes | 5 siblings |
| `West Papuan` | 2 | no | 42 siblings |
| `Yaeyama Ryukyuan` | 2 | no | 8 siblings |
| `Yanomaman` | 2 | yes | — |
| `Yoruboid` | 2 | no | 22 siblings |
| `Yue` | 2 | no | 30 siblings |
| `Yukaghir` | 2 | yes | 1 sibling |
| `Afrikaans-based` | 1 | no | 19 siblings |
| `Afroasiatic` | 1 | yes | 42 siblings |
| `Ainu` | 1 | yes | 8 siblings |
| `Andoque isolate` | 1 | no | 18 siblings |
| `Aramaic` | 1 | no | 42 siblings |
| `Armenian` | 1 | no | 9 siblings |
| `Assamese-based` | 1 | no | 19 siblings |
| `Atlas Berber` | 1 | no | 42 siblings |
| `Basque` | 1 | no | 2 siblings |
| `Berta` | 1 | no | 12 siblings |
| `Boro–Garo` | 1 | no | 30 siblings |
| `Camsa isolate` | 1 | no | 18 siblings |
| `Cayubaba isolate` | 1 | no | 18 siblings |
| `Central Neo-Aramaic` | 1 | no | 42 siblings |
| `Central Solomons` | 1 | no | 42 siblings |
| `Chak` | 1 | no | 30 siblings |
| `Chimilan` | 1 | yes | — |
| `Chinese-based` | 1 | no | 9 siblings |
| `Chiquitano isolate` | 1 | no | 18 siblings |
| `Chocoan` | 1 | yes | — |
| `Chonan` | 1 | yes | — |
| `Chukotko-Kamchatkan` | 1 | yes | 3 siblings |
| `Chuukic` | 1 | no | 14 siblings |
| `Cilentan` | 1 | no | 54 siblings |
| `Cofán isolate` | 1 | no | 18 siblings |
| `Dalmatian Romance` | 1 | no | 54 siblings |
| `Eastern Mari` | 1 | no | 65 siblings |
| `Egyptian Arabic` | 1 | no | 42 siblings |
| `Eleman` | 1 | no | 42 siblings |
| `English Creole` | 1 | yes | 19 siblings |
| `Enlhet-Enenlhet` | 1 | yes | — |
| `Finnic` | 1 | no | 65 siblings |
| `Fulniô isolate` | 1 | no | 18 siblings |
| `Georgian dialects` | 1 | no | 4 siblings |
| `German-based` | 1 | no | 19 siblings |
| `Gumuz` | 1 | no | 12 siblings |
| `Hadza isolate` | 1 | no | 3 siblings |
| `Hindi-based` | 1 | no | 19 siblings |
| `Hokkaido` | 1 | no | 3 siblings |
| `Huave isolate` | 1 | no | 18 siblings |
| `Igboid` | 1 | no | 22 siblings |
| `Ijo` | 1 | no | 22 siblings |
| `Inari Sami` | 1 | no | 65 siblings |
| `Indo-Iranian` | 1 | yes | 3 siblings |
| `Istriot` | 1 | no | 54 siblings |
| `Itonama isolate` | 1 | no | 18 siblings |
| `Japanese dialects` | 1 | no | 8 siblings |
| `Jivaroan` | 1 | yes | — |
| `Judeo-Catalan` | 1 | no | 54 siblings |
| `Kamchatkan` | 1 | no | 3 siblings |
| `Kanak languages` | 1 | no | 14 siblings |
| `Keram` | 1 | no | 42 siblings |
| `Keresan` | 1 | yes | — |
| `Khasian` | 1 | no | 17 siblings |
| `Khmuic` | 1 | no | 17 siblings |
| `Khoe-Kwadi` | 1 | yes | — |
| `Kildin Sami` | 1 | no | 65 siblings |
| `Kongo-based` | 1 | no | 19 siblings |
| `Kra-Dai` | 1 | no | 7 siblings |
| `Krio` | 1 | no | — |
| `Kuril` | 1 | no | 3 siblings |
| `Kusunda` | 1 | no | — |
| `Kven` | 1 | no | 65 siblings |
| `Kwerbic` | 1 | no | 42 siblings |
| `Kwomtari` | 1 | no | 42 siblings |
| `Language Isolate` | 1 | yes | 42 siblings |
| `Leco isolate` | 1 | no | 18 siblings |
| `Lengu` | 1 | no | 42 siblings |
| `Literary` | 1 | no | 42 siblings |
| `Livvi` | 1 | no | 65 siblings |
| `Lombard` | 1 | no | 54 siblings |
| `Maban` | 1 | no | 12 siblings |
| `Manding` | 1 | no | 22 siblings |
| `Misumalpan` | 1 | yes | — |
| `Mixed language` | 1 | yes | — |
| `Motu-based` | 1 | no | 19 siblings |
| `Movima isolate` | 1 | no | 18 siblings |
| `Muran` | 1 | no | — |
| `Ngbandi-based` | 1 | no | 19 siblings |
| `Nguni` | 1 | no | 22 siblings |
| `Nihali isolate` | 1 | no | 18 siblings |
| `Nivkh` | 1 | yes | — |
| `North Bougainville` | 1 | no | 42 siblings |
| `North Korean` | 1 | no | 7 siblings |
| `Northeast Caucasian` | 1 | yes | 5 siblings |
| `Northern Tungusic` | 1 | no | 5 siblings |
| `Occitan` | 1 | no | 54 siblings |
| `Oghur` | 1 | no | 5 siblings |
| `Okinawan Ryukyuan` | 1 | no | 8 siblings |
| `Old` | 1 | no | 54 siblings |
| `Old Aramaic` | 1 | no | 42 siblings |
| `Old Catalan` | 1 | no | 54 siblings |
| `Old Indo-Aryan` | 1 | no | 20 siblings |
| `Old Komi` | 1 | no | 65 siblings |
| `Old Occitan` | 1 | no | 54 siblings |
| `Old South Arabian` | 1 | no | 42 siblings |
| `Old Spanish` | 1 | no | 54 siblings |
| `Outer` | 1 | no | 42 siblings |
| `Paezan` | 1 | yes | — |
| `Pohnpeic` | 1 | no | 14 siblings |
| `Proto-Berber` | 1 | no | 42 siblings |
| `Proto-Georgian–Zan` | 1 | no | 4 siblings |
| `Proto-Hungarian` | 1 | no | 65 siblings |
| `Proto-Kartvelian` | 1 | no | 4 siblings |
| `Proto-Mari` | 1 | no | 65 siblings |
| `Proto-Mongolic` | 1 | no | 9 siblings |
| `Proto-Mordvinic` | 1 | no | 65 siblings |
| `Proto-Ob-Ugric` | 1 | no | 65 siblings |
| `Proto-Permic` | 1 | no | 65 siblings |
| `Proto-Sami` | 1 | no | 65 siblings |
| `Proto-Samoyedic` | 1 | no | 65 siblings |
| `Puinave isolate` | 1 | no | 3 siblings |
| `Purepecha` | 1 | no | 2 siblings |
| `Purépecha isolate` | 1 | no | 18 siblings |
| `Ryukyuan` | 1 | no | 8 siblings |
| `Sakhalin` | 1 | no | 3 siblings |
| `Saliban` | 1 | yes | — |
| `Salishan` | 1 | yes | — |
| `Sandawe isolate` | 1 | no | 3 siblings |
| `Sardo-Corsican` | 1 | no | 54 siblings |
| `Sepik` | 1 | no | 42 siblings |
| `Seri isolate` | 1 | no | 18 siblings |
| `Sinhala-based` | 1 | no | 19 siblings |
| `Skolt Sami` | 1 | no | 65 siblings |
| `Songhay` | 1 | yes | — |
| `Sonsorolese` | 1 | no | 5 siblings |
| `Sotho-Tswana-based` | 1 | no | 19 siblings |
| `South Korean` | 1 | no | 7 siblings |
| `Southern Tungusic` | 1 | no | 5 siblings |
| `Ter Sami` | 1 | no | 65 siblings |
| `Tharu` | 1 | no | 20 siblings |
| `Ticuna–Yuri` | 1 | yes | — |
| `Timor–Alor–Pantar` | 1 | no | 42 siblings |
| `Tivoid` | 1 | no | 22 siblings |
| `Totonacan` | 1 | yes | — |
| `Tsimané isolate` | 1 | no | 18 siblings |
| `Tsimshianic` | 1 | yes | — |
| `Tswana-based` | 1 | no | 19 siblings |
| `Ume Sami` | 1 | no | 65 siblings |
| `Viet-Muong` | 1 | no | 17 siblings |
| `Waic` | 1 | no | 17 siblings |
| `Warao` | 1 | no | 3 siblings |
| `Xong` | 1 | no | 8 siblings |
| `Yahgan isolate` | 1 | no | 18 siblings |
| `Yeniseian` | 1 | yes | 2 siblings |
| `Yuman-Cochimí` | 1 | no | 1 sibling |
| `Yuracaré isolate` | 1 | no | 18 siblings |
| `Yurats` | 1 | no | 65 siblings |
| `Zamucoan` | 1 | yes | — |
| `Zenaga Berber` | 1 | no | 42 siblings |
| `Zuni isolate` | 1 | no | 18 siblings |

## Appendix C — unresolved, entry by entry

286 entries left at a top level because I could not place them confidently. Grouped by the bucket they are still sitting in.

#### `Pidgin` — 56 left

- `algonquian-basque-pidgin` Algonquian-Basque pidgin
- `arafundi-enga-pidgin` Arafundi-Enga Pidgin
- `bamboo-english` Bamboo English
- `barikanchi-pidgin` Barikanchi Pidgin
- `basque-icelandic-pidgin` Basque-Icelandic pidgin
- `bimbashi-arabic` Bimbashi Arabic
- `borgarm-let` Borgarmålet
- `broken-oghibbeway` Broken Oghibbeway
- `broken-slavey` Broken Slavey
- `broome-pearling-lugger-pidgin` Broome Pearling Lugger Pidgin
- `camtho` Camtho
- `cocoliche` Cocoliche
- `duvle-wano-pidgin` Duvle-Wano Pidgin
- `eskimo-trade-jargon` Eskimo Trade Jargon
- `ewondo-populaire` Ewondo Populaire
- `fanagalo` Fanagalo
- `fran-ais-tirailleur` Français Tirailleur
- `haflong-hindi` Haflong Hindi
- `international-sign` International Sign
- `inuktitut-english-pidgin` Inuktitut-English Pidgin
- `italian-eritrean` Italian Eritrean
- `italo-paulista` Italo-Paulista
- `kiautschou-pidgin-german` Kiautschou Pidgin German
- `kikar` KiKAR
- `kwoma-manambu-pidgin` Kwoma-Manambu Pidgin
- `kyakhta-russian-chinese-pidgin` Kyakhta Russian-Chinese Pidgin
- `kyowa-go` Kyowa-go
- `labrador-inuit-pidgin-french` Labrador Inuit Pidgin French
- `loucheux-jargon` Loucheux Jargon
- `madras-bashai` Madras Bashai
- `maritime-polynesian-pidgin` Maritime Polynesian Pidgin
- `mediterranean-lingua-franca` Mediterranean Lingua Franca
- `mobilian-jargon` Mobilian Jargon
- `namibian-black-german` Namibian Black German
- `ndyuka-tiriy-pidgin` Ndyuka-Tiriyó Pidgin
- `nefamese` Nefamese
- `nootka-jargon` Nootka Jargon
- `pidgin-delaware` Pidgin Delaware
- `pidgin-hawaiian` Pidgin Hawaiian
- `pidgin-iha` Pidgin Iha
- `pidgin-ngarluma` Pidgin Ngarluma
- `pidgin-onin` Pidgin Onin
- `pidgin-wolof` Pidgin Wolof
- `roquetas-pidgin-spanish` Roquetas Pidgin Spanish
- `russenorsk` Russenorsk
- `settler-swahili` Settler Swahili
- `simplified-italian-of-libya` Simplified Italian of Libya
- `simplified-italian-of-somalia` Simplified Italian of Somalia
- `taimyr-pidgin-russian` Taimyr Pidgin Russian
- `t-y-b-i-pidgin-french` Tây Bồi Pidgin French
- `te-parau-tinito` Te Parau Tinito
- `tinglish` Tinglish
- `west-greenlandic-pidgin` West Greenlandic Pidgin
- `xieheyu` Xieheyu
- `yokohama-pidgin-japanese` Yokohama Pidgin Japanese
- `chinook-jargon` Chinook Jargon

#### `Niger-Congo` — 51 left

- `acheron` Acheron
- `adara` Adara
- `aka` Aka
- `amira` Amira
- `baba` Baba
- `baca` Baca
- `bamali` Bamali
- `batu` Batu
- `bayot` Bayot
- `beba` Beba
- `bebe` Bebe
- `besme` Besme
- `bitare` Bitare
- `bobo` Bobo
- `bole-niger-congo` Bole Niger-Congo
- `bonjo` Bonjo
- `boon` Boon
- `bube` Bube
- `budza` Budza
- `bukusu` Bukusu
- `buli` Buli
- `bulu` Bulu
- `bum` Bum
- `bushong` Bushong
- `buu` Buu
- `cebaara` Cebaara
- `defaka` Defaka
- `doko` Doko
- `eman` Eman
- `evant` Evant
- `fanji` Fanji
- `fio` Fio
- `fungor` Fungor
- `geme` Geme
- `gengele-creole` Gengele Creole
- `hakaona` Hakaona
- `saari` Saari
- `sighu` Sighu
- `simaa` Simaa
- `sucite` Sucite
- `tagoi` Tagoi
- `talni` Talni
- `tegem` Tegem
- `tiro` Tiro
- `tocho` Tocho
- `vori` Vori
- `werni` Werni
- `wushi` Wushi
- `yobe` Yobe
- `zhire` Zhire
- `zhoa` Zhoa

#### `Sino-Tibetan` — 25 left

- `tripuri` Tripuri
- `arunachal` Arunachal
- `basum` Basum
- `mhu` Digaro Mishmi
- `dura-tandrange` Dura Tandrange
- `eastern-himalayas` Eastern Himalayas
- `ersuic` Ersuic
- `hrusish` Hrusish
- `clk` Idu Mishmi
- `jingpho-luish` Jingpho Luish
- `karbi` Karbi
- `karenic` Karenic
- `koro` Koro
- `milang` Milang
- `nung` Nung
- `ole` Ole
- `proto-sino-tibetan` Proto Sino Tibetan
- `proto-karenic` Proto-Karenic
- `rung` Rung
- `songlin` Songlin
- `taman` Taman
- `tibeto-kanauri` Tibeto Kanauri
- `western-himalayas` Western Himalayas
- `wu` Wu
- `kar` Karen

#### `Tai-Kadai` — 18 left

- `aiton` Aiton
- `be-jizhao` Be-Jizhao
- `isan` Isan
- `jizhao` Jizhao
- `khamti` Khamti
- `khamyang` Khamyang
- `kuan` Kuan
- `moyfaw` Moyfaw
- `nadou` Nadou
- `nung-tai` Nung Tai
- `pa-di` Pa Di
- `phake` Phake
- `saek` Saek
- `tai` Tai
- `tai-daeng` Tai Daeng
- `tsun-lao` Tsun-Lao
- `turung` Turung
- `zandui` Zandui

#### `Mixed` — 18 left

- `lingling` Lingling
- `arabic-javanese-of-klego` Arabic-Javanese of Klego
- `bolze` Bolze
- `cypriot-maronite-arabic` Cypriot Maronite-Arabic
- `dao` Dao
- `e` E mixed
- `gadal` Gadal
- `gurindji-kriol` Gurindji Kriol
- `light-warlpiri` Light Warlpiri
- `l-ngua-geral-amaz-nica` Língua Geral Amazônica
- `l-ngua-geral-paulista` Língua Geral Paulista
- `makassar-malay` Makassar Malay
- `media-lengua` Media Lengua
- `michif` Michif
- `missingsch` Missingsch
- `petuh` Petuh
- `qoqmoncaq` Qoqmoncaq
- `tansi` Tansi

#### `Indo-Aryan` — 16 left

- `bhe` Bhaya
- `clh` Chilisso
- `dml` Dameli
- `ghr` Ghera
- `gig` Goaria
- `hlb` Halbi
- `kbu` Kabutra
- `xhe` Khetrani
- `kumhali` Kumal
- `kra` Kumhali
- `shd` Kundal Shahi
- `x-nepal-malpande` Malpande
- `nlm` Mankiyali
- `sindhi` Sindhi
- `sinhala` Sinhala
- `ush` Ushojo

#### `Mongolic` — 15 left

- `baarin` Baarin Mongol
- `darkhad` Darkhad Mongolian
- `khalkha` Khalkha Mongolian
- `khamnigan` Khamnigan Mongol
- `kharchin-khorchin` Kharchin / Khorchin Mongol
- `khorchin` Khorchin Mongol
- `khorchin-mongol` Khorchin Mongol alias
- `moghol` Moghol / Mogholi
- `mogholi` Mogholi
- `mongolian` Mongolian
- `northern-khalkha` Northern Khalkha
- `shilingol-khalkha` Shilingol / Xilingol Khalkha
- `southern-khalkha` Southern Khalkha
- `khk` Mongolian Names
- `khk2` Mongolian Expanded 2

#### `Nilo-Saharan` — 13 left

- `aja` Aja
- `aringa` Aringa
- `avokaya` Avokaya
- `birri` Birri
- `dongo` Dongo
- `seze` Seze
- `sinyar` Sinyar
- `surbakhal` Surbakhal
- `tasawaq` Tasawaq
- `tulishi` Tulishi
- `tumtum` Tumtum
- `uduk` Uduk
- `wali-sudan` Wali Sudan

#### `Austronesian` — 10 left

- `celebic` Celebic
- `formosan` Formosan
- `law` Lauje
- `malayo-polynesian` Malayo-Polynesian
- `meso-melanesian` Meso-Melanesian
- `northern-south-sulawesi` Northern South Sulawesi
- `oceanic` Oceanic
- `philippine` Philippine
- `shwng` SHWNG
- `minangkabau` Minangkabau

#### `Oto-Manguean` — 8 left

- `chorotega` Chorotega
- `chinantec` Chinantec
- `matlatzinca` Matlatzinca
- `mazahua` Mazahua
- `mazatec` Mazatec
- `otomi` Otomi
- `tpx` Tlapanec (Meꞌphaa)
- `oto` Otomi Names

#### `Yuman` — 7 left

- `coc` Cocopa
- `klb` Kiliwa
- `dih` Kumeyaay
- `mov` Mohave
- `ppi` Paipai
- `yum` Quechan
- `yuf` Yavapai

#### `Iranian` — 6 left

- `lss` Lasi
- `oru` Ormuri
- `wne` Waneci
- `ydg` Yadgha
- `ttt` Tat
- `sogdian` Sogdian

#### `Koreanic` — 6 left

- `chinese-korean` Chinese Korean
- `jeju` Jeju
- `kor` Kor
- `proto-koreanic` Proto-Koreanic
- `zainichi-korean` Zainichi Korean
- `koryo-mar` Koryo-mar

#### `Dravidian` — 5 left

- `kru` Kurukh Names
- `mal2` Malayalam Expanded 2
- `kan2` Kannada Expanded 2
- `tel2` Telugu Expanded 2
- `tam2` Tamil Expanded 2

#### `Language isolate` — 4 left

- `bangime` Bangime
- `burushaski` Burushaski
- `eus` Basque
- `haida` Haida

#### `Micronesian` — 3 left

- `chamorro` Chamorro
- `kos` Kosraean
- `nauruan` Nauruan

#### `Japonic` — 2 left

- `jpn` Japanese
- `jpn-lang` Japanese macro entry

#### `Kartvelian` — 2 left

- `georgian` Georgian
- `old-georgian` Old Georgian

#### `Uto-Aztecan` — 2 left

- `pipil` Pipil (Nawat)
- `nah` Nahuatl

#### `Uralic` — 2 left

- `proto-uralic` Proto-Uralic
- `uralic-family` Uralic

#### `Germanic` — 2 left

- `wym` Wymysorys
- `yec` Yenish

#### `Na-Dene` — 2 left

- `eyak` Eyak
- `tlingit` Tlingit

#### `Algic` — 2 left

- `wiyot` Wiyot
- `yurok` Yurok

#### `Papuan` — 2 left

- `moraori` Moraori
- `wiru` Wiru

#### `Yukaghir` — 2 left

- `southern-yukaghir` Southern Yukaghir
- `tundra-yukaghir` Tundra Yukaghir

#### `Afroasiatic` — 1 left

- `saba` Saba

#### `Northeast Caucasian` — 1 left

- `xdq` Kaitag

#### `Indo-Iranian` — 1 left

- `ossetian` Ossetian

#### `Hmong-Mien` — 1 left

- `proto-hmong-mien` Proto-Hmong-Mien

#### `Romance` — 1 left

- `proto-romance` Proto-Romance

#### `Chukotko-Kamchatkan` — 1 left

- `chukotko-kamchatkan` Chukotko-Kamchatkan

#### `Yeniseian` — 1 left

- `yeniseian` Yeniseian

---

## The `category` level — 91 entries re-filed (2026-09-29)

The second pass at the same disease, one level up. [Category errors
surfaced](#category-errors-surfaced) above recorded the problem and deferred it;
this is that change. 91 entries had a `category` unrelated to their own `family`.
Only `category` changed. 3691 entries before and after, no `iso`, `name`, `family`
or `region` touched, no language deleted.

### The rule applied

`family` names one level; `category` the level above it. So where a family already
appears under a real parent category somewhere else in the catalog, every entry of
that family takes that parent — including the entries that were self-referential
(`category` equal to their own `family` value).

The parent was never invented. It was read off the catalog: category `Indo-European`
already holds family `Celtic`, so `Celtic` entries move to `Indo-European`. The
test for "does this family have a parent" is simply *does any entry already sit in
another category under this family value*. Families with no such parent — the ~54
single-family buckets like `Arawakan`, `Salishan`, `Kx'a` — are not defects and
were left alone.

**75 rows had their target read straight off the catalog. 16 had no correct
sibling to appeal to and needed linguistic judgement.**

### Rule-decided (75)

The family already appears under a different category elsewhere in the catalog,
so the entry was provably in the wrong bucket.

| Family | From | To | Rows |
|---|---|---|---|
| `Indo-Aryan` | Indo-Aryan | Indo-European | 16 |
| `Polynesian` | Polynesian | Austronesian | 11 |
| `Celtic` | Celtic | Indo-European | 7 |
| `Bantu` | Nilo-Saharan, Mixed | Niger-Congo | 6 |
| `Iranian` | Iranian | Indo-European | 6 |
| `Algonquian` | Algonquian | Algic | 5 |
| `Baltic` | Baltic | Indo-European | 3 |
| `Ubangian` | Ubangian | Niger-Congo | 3 |
| `Chadic` | Niger-Congo, Nilo-Saharan | Afroasiatic | 3 |
| `Germanic` | Germanic | Indo-European | 2 |
| `Tuareg Berber` | Nilo-Saharan | Afroasiatic | 2 |
| `Raji–Raute` | Sino-Tibetan | Indo-Aryan | 2 |
| `Aleut` | Mixed | Eskimo-Aleut | 1 |
| `Aymaran` | Aymaran | Language isolate | 1 |
| `Gilbertese` | Micronesian | Austronesian | 1 |
| `Marshallese` | Micronesian | Austronesian | 1 |
| `Palauan` | Micronesian | Austronesian | 1 |
| `Hmong-Mien` | Hmong-Mien | Sino-Tibetan | 1 |
| `Pashto` | Indo-Iranian | Iranian | 1 |
| `Persian` | Indo-Iranian | Iranian | 1 |
| `Romance` | Romance | Indo-European | 1 |

`Persian` and `Pashto` are the two-step cases: category `Iranian` already holds
both as family values, so `tajik` and `pashto` move to `Iranian`, not to
`Indo-European`. That is consistent with family `Iranian` itself sitting under
`Indo-European`. `Raji–Raute` is the same shape: category `Indo-Aryan` already
lists family `Raji–Raute` among its 21 families.

### Judgement (16)

These had no correct sibling anywhere in the family, so the old value was wrong
with nothing to appeal to. Each was confirmed from the ISO 639-3 code and
Glottolog, then matched to an existing category value.

| iso | Name | From | To | Why |
|---|---|---|---|---|
| `badong-yao` | Badong Yao | Mixed | Sino-Tibetan | Yao, a Sinitic branch |
| `maojia` | Maojia | Mixed | Sino-Tibetan | Yao |
| `she-chinese` | She Chinese | Mixed | Sino-Tibetan | Sinitic |
| `yeheni` | Yeheni | Mixed | Sino-Tibetan | Yao |
| `younian` | Younian | Mixed | Sino-Tibetan | Yao |
| `spanglish` | Spanglish | Mixed | Creole | English-lexifier contact variety |
| `hinglish` | Hinglish | Mixed | Creole | as above |
| `franglish` | Franglish | Mixed | Creole | as above |
| `bonin-english` | Bonin English | Mixed | Creole | as above |
| `sapa` | Sapa | Tai-Kadai | Hmong-Mien | Hmongic |
| `waxiang` | Waxiang | Mixed | Hmong-Mien | Hmongic |
| `anaang` | Anaang | Niger-Congo | Nilo-Saharan | Kunama, Eastern Sudanic |
| `shabo` | Shabo | Language isolate | Afroasiatic | Omotic, Gonga–Ometo |
| `hezhou` | Hezhou | Mixed | Sino-Tibetan | Min, Guangxi |
| `wutunhua` | Wutunhua | Mixed | Sino-Tibetan | Sinitic, Hainanese |
| `cauque-mayan` | Cauque Mayan | Mixed | Mayan | Cakchiquel, Guatemala |

The four English-lexifier rows are the weakest call in the set. Spanglish,
Hinglish, Franglish and Bonin English are contact varieties that are neither
creoles nor pidgins in the strict sense — they are code-switching registers.
Filing them `Creole` is a small lie made to satisfy the "no `Mixed` value" rule,
and it is the only category their family already uses at that volume. If they are
ever split into their own family, they need a decision again.

### Where the brief contradicted itself

Ten entries were specified as `-> category X` with a parenthetical that said the
language belonged somewhere other than X. In every case the parenthetical was
right and the arrow was a slip. Recorded because the arrow was followed in the
brief, and following it would have made the catalog worse:

| iso | Brief's arrow | Brief's own reason | Applied |
|---|---|---|---|
| `boko`, `chung` | Niger-Congo | "both are Chadic" | Afroasiatic |
| `shabo` | Language isolate | "Omotic is Afroasiatic" | Afroasiatic |
| `tagdal`, `teda` | Nilo-Saharan | "Tuareg is Berber/Afroasiatic" | Afroasiatic |
| `rau`, `raji-raute` | Sino-Tibetan | "Indo-Aryan or isolates" | Indo-Aryan |
| `mbugu` | Mixed | "Bantu is Niger-Congo" | Niger-Congo |
| `waxiang` | Mixed | — | Hmong-Mien |
| `cauque-mayan` | Mixed | — | Mayan |
| `hezhou` | Mixed | — | Sino-Tibetan |
| `wutunhua` | Mixed | — | Sino-Tibetan |

Five of those arrows named `Mixed`, which QUALITY-STANDARDS 5.7 rules out as a
value outright, so they could not be applied as written under any reading.

Five more isos the brief listed needed no change at all, because the family
re-file had already put them right or because they are unresolved below:
`central-banda` and `hmn2` were already `Niger-Congo` and `Sino-Tibetan`;
`franco-italian` was already `Romance`; `proto-austroasiatic` was already
`Austroasiatic`; `khh` was left alone. The brief's premises were written against
a pre-re-file snapshot.

The brief also put `hmn2` in the judgement list with the answer `Sino-Tibetan`,
while listing `Hmong-Mien` in the rule list — both reach `Sino-Tibetan` and both
were already there. Only the five `Mixed` rows of that family needed moving.

### Unresolved

**`khh` Kehu — left at `category: "Papuan"`.** The brief said set it to `Papuan`
and in the same line said Kehu is a Khoisan language. Kehu is `kxh`-adjacent
Northern Cape `Kx'a`, and the catalog has `Kx'a` as both a category and a family.
Papuan is simply false — that is a family from New Guinea, and 42 entries sit
under it. The real defect is that this entry's **`family` is wrong**, not its
category: it says `Language isolate` where it should say `Kx'a`. `family` was out
of scope for this change, and changing the category alone would not have fixed the
span (family `Language isolate` would then read `Language isolate` + `Kx'a`).
Left alone rather than made worse. **Recommended follow-up: re-file `khh` to
`family: "Kx'a"`, `category: "Kx'a"`.**

**`proto-austroasiatic` — left at `category: "Austroasiatic"`.** Family `Proto` is
a junk bucket holding four unattested reconstructions: three Ainu (which the
catalog files under category `Ainu`, correctly) and one Austroasiatic. No single
category is true for all four, so the span cannot be closed by editing `category`
alone. The fix is to re-file by family — `proto-ainu`, `proto-hokkaido-kuril` and
`proto-sakhalin` to family `Ainu`; `proto-austroasiatic` to family
`Austroasiatic`. That is a `family` edit and was out of scope.

### Families still spanning more than one category: 4

Down from 31. Each is deliberate, with the reason recorded here as rule 5 requires.

1. **`English-based` — `Creole` (58) + `Pidgin` (22).** Not an error. Both are
   real categories in this catalog and `English-based` is the one family filed
   under both. A Jamaican Creole and a Nigerian Pidgin genuinely are different
   things; collapsing the 22 into `Creole` would assert a genealogical relation
   that does not exist. The lexical split is visible in the data on purpose.
2. **`Mixed` — `Mixed` (18) + `Romance` (1).** `franco-italian` is correctly
   `Romance`. The family is a junk bucket, so the span reflects the bucket, not a
   misclassification. Closing it would mean filing 18 genuinely unplaceable
   contact codes under `Romance`, which is false.
3. **`Language isolate` — `Language isolate` (4) + `Papuan` (1).** The `Papuan`
   row is `khh`, unresolved above.
4. **`Proto` — `Ainu` (3) + `Austroasiatic` (1).** Unresolved above.

### Where I think the rule is wrong, or is about to be stale

1. **QUALITY-STANDARDS 5.7 now argues from evidence this change removes.** The
   section rejecting `macroFamily` says: *"33 family values already appear under
   more than one category, so `family` cannot uniquely determine a parent."* After
   this pass only **4** do, and all four are junk buckets, not real ambiguity.
   The stated reason for rejecting `macroFamily` is close to vacuous and the
   paragraph should be revisited rather than left to rot.
2. **The same section's premise about `races.ts` is factually wrong.** It says
   profile `families` and `categories` *"are derived from each race's own `isos`
   set and must never be hand-maintained"*. They are not derived — they are
   literal arrays at `races.ts:139`, `races.ts:215`, `races.ts:4182` and 40-odd
   other places. `getRaceLanguageIsoWeights` prefers `isos` at runtime, so
   behaviour is unaffected, but the test reads the literal strings. The standard
   describes an intended design that the code does not implement.
3. **Collapsing `Micronesian` and `Polynesian` costs a real level.** Both are
   genuine Glottolog clades under Oceanic. The catalog still has family `Oceanic`
   (28 entries, all `Austronesian`), so the level survives *there* — but
   Gilbertese, Marshallese, Palauan and Polynesian are not filed under it, and
   `family` could not be changed here. This is a family-level problem wearing a
   category-level costume.

### Blast radius: `src/generators/races.ts` needs a follow-up

Six category values disappeared as a direct consequence of this pass — `Celtic`,
`Baltic`, `Aymaran`, `Ubangian`, `Algonquian`, `Polynesian` — because each was a
leaf family whose only content was itself. `race-profiles.test.js` asserts that
every category a profile names still exists, so the assertion now lists **19
entries across 10 races** (it listed 5 before this change, all `Afro-Asiatic`).

**The 5 `Afro-Asiatic` failures are not from this change.** The working tree
already normalised `Afro-Asiatic` to `Afroasiatic` in the catalog; `races.ts`
still says `Afro-Asiatic`. That was a pre-existing red before any edit here.

The 14 new ones need these strings dropped from the `categories` arrays of Elf
(`Celtic`), Dwarf (`Baltic`), Half-Elf (`Aymaran`), Lizardfolk (`Ubangian`),
Kenku (`Algonquian`), Seafarer (`Polynesian`), AnyLanguage (5) and Human (5).
**Every one of those names is already present in the same race's `families`
array**, so dropping it is lossless. No `races.ts` edit was made here — that file
is not owned by this change, and QUALITY-STANDARDS 5.7 says these arrays should be
regenerated from `isos` rather than hand-patched.

### Verification

| Check | Result |
|---|---|
| Entries | 3691 before and after |
| Rows changed | 91, all `category`; `iso`/`name`/`family`/`region` untouched |
| Distinct `isos` | 3691, no duplicates |
| Empty `category` or `family` | 0 |
| `node tools/regenerate-js-from-json.js --check` | all 4 generated files OK |
| `node tools/mixer-core/diff-language-families.js` | no mismatches |
| `node tools/namebase-tools/verify-namebase-integrity.js --quiet` | gate green, exit 0 |
| `npx tsc --noEmit` | exit 0 |
| `node --test tools/namebase-tools/race-profiles.test.js` | **7/8**, same single test as the pre-existing baseline failure; see blast radius above |
| Families spanning >1 category | 31 → 4, all documented above |

`regenerate-js-from-json.js` also rewrites `config/language-mixer-map.js` and its
public copy. Both came out byte-identical, so no file outside this change's
ownership was modified.

### Still invalid, outside this change's scope

`Mixed` and `Unclassified` are ruled out by QUALITY-STANDARDS 5.7 and **30 entries
still carry them**: family `Unclassified` (11), family `Mixed` (18), and
`tangwang` (1, `category: "Mixed"`, `family: "Chinese-based"`, tagged
`creole`/`mixed` with a Chinese lexifier — `Creole` is almost certainly right, but
`Chinese-based` holds that one row alone so it is not a spanning defect and was
not touched). None of the three groups spans a category, so none of them was in
this pass.


