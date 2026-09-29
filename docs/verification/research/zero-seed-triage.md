# Zero-seed entry triage

Every entry in the served namebase files that had **zero seeds** was checked
against an external source. 24 existed; each was placed in exactly one of three
buckets. 9 were deleted, 15 were kept as work.

The question asked was not "is this entry empty" but "does this language exist,
and is it attested". An empty entry for a real language is unfinished work. An
empty entry for a language nobody ever documented is a fabrication waiting to
happen — someone will eventually fill it in, and they will invent the names.

Measured before: 3802 entries, 24 zero-seed, 962 below the seed floor of 25.
Measured after: 3793 entries, 16 zero-seed, 954 below floor.

---

## DELETED — the language is not attested (1 entry, 2 records)

### Zurg

> Wikipedia: *"Zurg, or Kufra, is a reportedly extinct Berber language formerly
> spoken in the town of Kufra in southeastern Libya. **No data seems to be
> attested for it**, and it is described by Benkato (2017) as a 'ghost language'
> that may never have existed."*

Adam Benkato, *Ghost Languages?* (2017-09-16), traces the entire claim to one
place-name. The locale `ez-Zurgh` appears in the 1929 *Guida d'Italia del
Touring Club* — **and the Guida does not mention a language at all.** Kufra is a
Tebu oasis; the Guida itself records that Zurg was inhabited by a few hundred
slaves, which Benkato notes makes a unique Berber language spoken only there
implausible. No grammar, no vocabulary, no word list, ever.

Two records existed, and the populated one was worse than the empty one:

| entry | file | seeds | what the seeds were |
|---|---|---|---|
| i=201018 | africa | 33 | Tarfaya, Laayoune, Smara, Dakhla, Azrou, Ifrane, Khenifra, Midelt … |
| i=202318 | northAmerica | 0 | — |

i=201018 was marked `COMPLETE`. Its 33 "seeds" are **Moroccan and Western
Saharan cities**, hundreds of kilometres from Kufra in Libya, in languages
unrelated to any Berber tongue. Nothing about that list is Zurg. It was
manufactured to clear the seed floor, and the floor is exactly the kind of
target that manufactures data. Deleting the empty duplicate and keeping the
fabricated one would have been the worst of both options, so both went.

## DELETED — duplicate of an entry that already has names (7)

These are not missing work. A populated entry for the same language already
exists, so the empty one is a second record of something already substantiated.
Left in place, the mixer can select the empty one and generate nothing.

| deleted | file | duplicate of | seeds there |
|---|---|---|---|
| i=200340 Longsang Zhuang | asia | i=200337 (asia), i=202491 | 4 / 55 |
| i=200349 Mak Kam Sui | asia | i=202500 | 55 |
| i=200400 Nong Zhuang | asia | i=202551 | 55 |
| i=203263 Xieheyu | asia | i=201003 (europe) | 35 |
| i=203092 Riantana | asia | i=201148 (oceania) | 32 |
| i=202601 Qifu | asia | i=200450 | 21 |
| i=202317 Western Algerian Zenatic dialects | northAmerica | i=201017 (africa) | 25 |

**Caveat, and it matters.** Several of the "populated" counterparts are not
trustworthy either, and this triage is only about the empty ones:

- **i=202491 Longsang Zhuang** — 55 seeds including the entry's own name, and
  then Dongguan, Changwon, Nantou, Uliastai, Rason, Kanazawa, Kaifeng, Nara.
  A scatter of cities from five countries. i=200337, the other duplicate, has 4
  seeds (Sanhe, Qiaotou, Qiaonan, Daji) that look like real Guangxi townships.
  The 4-seed entry is the honest one; the 55-seed entry is padding.
- **i=202500 Mak Kam Sui** and **i=202551 Nong Zhuang** — 55 seeds each, each
  beginning with its own name, and **both carrying the identical list** of
  Nagasaki, Miaoli, Rason, Taitung, Mörön, Kaifeng, Yuen Long, Bayanhongor,
  Yamagata. Two unrelated Zhuang/Kam-Sui languages cannot share a seed list. At
  least one is wholesale fabricated.
- **i=201003 Xieheyu** is filed under **europe** while its seeds are Gansu
  province cities (Lanzhou, Wuwei, Jinchang, Dunhuang). The file is wrong.
- **i=201018-adjacent i=201017 Western Algerian Zenatic** is reasonable: Oran,
  Tlemcen, Maghnia, Nedroma are real Algerian towns.

These four entries are now the highest-priority targets in the whole backlog,
because they are marked `COMPLETE` and are not. Flagged, not fixed — fixing them
is research, and this pass was triage.

## KEPT — real, documented, simply not researched yet (15)

Left in place. These are the actual work.

**Chadic, Africa (5)** — all confirmed on Wikipedia with ISO 639-3 or Glottocode:
`Mawa` (mcw, mawa1270, ~6,600 speakers, central Chad) · `Miler` (West Chadic A3,
Pankshin LGA, Plateau State, Nigeria, ~1,000 speakers in 3 villages, Blench 2022)
· `Mire` (mvh, mire1238, Tandjile and Lai provinces, Chad) · `Ubi` (Chad, has a
SIL sociolinguistic survey, Hutchinson & Johnson 2006) · `Zirenkel` (East
Chadic, Mubi B.1.2)

**China / Vietnam (5):** `Badong Yao` (八垌瑶语, unclassified Sinitic, Xinning
County, Hunan; Wikipedia names 3 villages — Huangyandong, Malindong, Dazhendong)
· `Longsang Zhuang` surviving as i=200337 (4 seeds) · `Mak Kam Sui` · `Nong
Zhuang` (zhn) · `Xieheyu` — **this last one is questionable**: no such language
is documented. It may be a misspelling of *xiehouyu* (歇后语), which is a form
of Chinese folk riddle, not a language. Needs resolving before anyone researches it.

**South Asia / Himalaya (3):** `Kalanadi` (wkl, Dravidian, India, endangered per
Ethnologue) · `Kayong` (kxy, kayo1245, Austroasiatic, **Vietnam** — filed under
asia, which is defensible, but it is a Vietnamese language with 25,000 speakers
and should be easy to substantiate) · `Turaka` (trh, tura1265, Arunachal Pradesh,
moribund)

**Taiwan (1):** `Kulon` (uon/kulo1238, Northwest Formosan, **extinct**, primary
source Tsuchida 1985, 60 pages). Real and documented, but extinct — its toponymy
is a historical reconstruction task, not a village list.

**Africa, filed under Asia — misfiled (2):** `Bhaya` (bhe) and `Goaria` (gig) are
both in `namebases-africa.js` with `d: "nic-GH"` (Ghana), but Glottolog places
**both in Pakistan**: Bhaya is a Western Rajasthani / Western Hindi language of
Sindh, and Goaria is `Pakistan [PK]`. Neither is African. They should move to
`namebases-asia.js` and be researched there.

**Korea, extinct (1):** `Puyo` (xpy, Puyŏ/Buyeo, extinct 7th century). Attested
only in Chinese dynastic records; the "Puyŏ languages are very poorly attested"
and affiliation is disputed (Koreanic? Japonic? Tungusic? Amuric?).

**Papua (1):** `Auye` (auu, auye1238, Auye-Dao, Paniai Lakes, Central Papua,
Indonesia, ~600 speakers, AES shifting). The one entry here with real research
trail: OLAC has lexical resources and a Swadesh list, and Glottolog links
transnewguinea.org.

## Could not confirm (1)

`Oeld` — no Wikipedia article, no Glottolog record, no ISO 639-3 code, no search
hit of any kind. Kept, because deleting on absence-of-evidence is how real
languages get lost, but it should be treated as probable noise until someone can
name a source for it. Compare Zurg, which *did* have a Wikipedia article and
still turned out to be a ghost.

---

## Also removed in this pass

**54 research-label seeds from 40 africa entries.** Strings like
`Glottolog:bush1247` and `ELP:Harari` had been pasted into the `b` field. A
Glottocode is a database pointer, not a place name. A representative sample:

    i=185  Wobe     Glottolog:weno1238
    i=243  Bushong  Glottolog:bush1247
    i=312  Harari   Glottolog:hara1255 | ELP:Harari
    i=708  Shwai    Glottolog:shwa1239 | ELP:Shwai | Glottolog:Heibanic
    i=791  Ait Seghrouchen Berber   Glottolog:None

No entry was reduced to zero by this — every one of the 40 had real seeds as
well.

## And the 37 `proto-*` rows in the mixer map

Deleted from all three copies of the map. A proto-language is a reconstruction:
it never had speakers, so nobody ever coined a place name in it, so it can never
have seeds. All 37 carried `"bases": []`, which meant the mixer could select one
and produce nothing. Verified before deleting: none of them carried a base index,
so removing them orphaned nothing.

Of the 17 whose stripped name matched a real namebase entry (`proto-ainu` →
`Ainu`, `proto-tai` → `Tai`, and so on), the proto rows were still empty. The
real languages are unaffected and still in the map; only the reconstruction
aliases are gone.

The map went 4410 → 4373 rows. The other 544 empty rows are **not** in this
pass — they are family and group labels (`bole-niger-congo`, `western-berber`,
`african-romance`) and 73 bare 3-letter ISO codes that need their own triage.
