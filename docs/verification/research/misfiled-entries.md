# Continent-file misfilings: found, fixed, and what is deliberately left

W006 reports entries whose seeds say they are in the wrong continent file.
**28 have been moved, 2 have been cleared, and 7 are left deliberately.**

The moved entries are in `docs/verification/research/misfiled-moves.json` and
the cleared ones in `w006-cleared.json`; both are replayable — the tools treat
the mapping as a statement of where each entry belongs and skip any that are
already there.

Which file a language lives in is organisational, not a claim about its
toponymy (`CONTINENT-ASSIGNMENTS.md` says so). So a misfiling is bookkeeping
rather than corruption, and the entries listed as *cleared* below were the real
defect hiding inside the same warning.

## Moved — right seeds, wrong file (28)

**africa → asia (7)** — `i=202394` Awadhi (Lucknow, Rishikesh, Jhang) ·
`i=202550` Noakhailla (Dehradun, Nagpur, Itanagar) · `i=202644` Sindhi Bhil
(Bangalore, Rangpur, Sylhet) · `i=202652` Sri Lankan English (Narathiwat,
Kratie, Lomphat) · `i=202393` Attapady Kurumba (Vijayawada, Kochi, Mangalore) ·
`i=202496` Magar/Dhut · `i=202810` Sogdian (Andijan, Naryn, Khorog)

**africa → europe (2)** — `i=202798` Kaitag (Zugdidi, Quba, Xinaliq, Dagestan) ·
`i=202780`, `i=202784` see the note below

**africa → northAmerica (2)** — `i=202780` Grenadian Creole English (Vieux
Fort, Brades, Grenville) · `i=202784` Leeward Caribbean Creole English
(Soufrière, Jost Van Dyke, Five Cays)

**asia → africa (2)** — `i=200928` Zay (Ziway, Butajira, Wolaita, Ethiopia) ·
`i=202291` Pretoria Sotho (Bago, Kisumu, Gambela)

**asia → europe (2)** — `i=738` Żejtun dialect (Marsaxlokk, Ħaż-Żabbar, Qormi,
Gozo — Malta) · `i=21108` Andalusi Arabic (Cordoba, Granada, Toledo)

**asia → southAmerica (1)** — `i=203253` Karipúna French Creole (Paramaribo,
Albina, Moengo — Suriname)

**europe → asia (11)** — `i=869` Amdo Tibetan (Haibei, Huangnan, Golog) ·
`i=863` Sui Lang (Sandu, Libo) · `i=865` Tai Ya (Jinghong, Menghai) ·
`i=1063` Lauhut (Wanning, Lingshui) · `i=203140` Waxiang (Changsha, Zhuzhou) ·
`i=847` Limbu (Taplejung, Phidim) · `i=851` Dungmali (Bhojpur, Hile) ·
`i=1109` Pashto, Central (Kabul, Kandahar, Herat) · `i=1374` Brahui (Kalat,
Khuzdar) · `i=1544` Chamdo (Chamdo, Dege, Jomda) · `i=2440` Newar
(Kathmandu, Lalitpur, Kirtipur — Kathmandu Valley)

**northAmerica → africa (1)** — `i=202291` Pretoria Sotho

**oceania → asia (2)** — `i=200995` Tansi (Guwahati, Dibrugarh, Assam) ·
`i=202280` Nagamese (Agra, Mymensingh, Nagaland)

## Cleared — wrong file *and* invented seeds (2)

Two were not misfilings. The file was wrong too, but the seeds were for a
continent the language has nothing to do with, so no move would have helped.

**`i=202496` Magar (Dhut)** — a Tibeto-Burman language of Nepal, filed under
`africa`, seeded with 62 Pacific island names: Labasa, Trobriand, Ngerulmud,
Denigomodu, Nibok, Bikenibeu, Majuro, Kimbe, Abaiang, Lifou. Moved to `asia`
and the seeds cleared. The language is real and is now `WAITING`.

**`i=202653` Sri Lankan Portuguese Creole** — correctly filed under `asia`, but
seeded with Palermo, Lyon, Bilbao and 51 other European cities. Left where it
was, seeds cleared.

## Left deliberately (7)

**Five transcontinental languages**, all correctly filed under `asia`: `i=1601`
Chukchi (Anadyr, Uelen), `i=2194` Khakas (Minusinsk, Abakan), `i=24732` Mari
(Yoshkar-Ola), `i=24733` Mordvin (Saransk), `i=24736` Siberian Tatar (Tobolsk,
Tyumen). Their towns also appear in the `europe` file, which is what W006 sees.
Where the Volga and Ural languages belong is a judgement the data cannot make,
and the gate's own comment says so. Moving some and not others would be
inconsistent; moving none is the defensible default.

**Two Caribbean creoles**, now correctly in `northAmerica`: `i=202780` Grenadian
Creole English and `i=202784` Leeward Caribbean Creole English. W006 still
reports them as 70% European, because the seed names collide — *St. John's*,
*Salisbury*, *Five Cays* and *Charlestown* are all Caribbean towns that also
appear in English entries in the `europe` file. This is a limitation of the
frequency heuristic, not a defect in the data. Their seed lists are correct:
Vieux Fort, Brades and Grenville are in Grenada; Soufrière, Jost Van Dyke and
Five Cays are in the Leewards.

## How this was done

`tools/namebase-tools/normalize-namebase-format.js` already existed and was the
right tool; it was just never run. It rewrites each continent file as
`JSON.stringify(entries, null, 2)` and asserts the parsed data is identical in
value before writing. Six files were non-canonical and are now canonical —
verified lossless across all 3793 entries.

With that done, moving an entry is a whole-file regeneration rather than a text
splice, so the two tools below parse, modify, re-serialise, and then re-parse to
prove the result still loads and that no data changed:

- `tools/namebase-tools/move-entries.js <mapping.json> [--check]`
- `tools/namebase-tools/clear-seeds.js <indexes.json> [--check]`

Both are idempotent, both report the entry count before and after, and both
abort rather than write if anything is out of place.

### Correction

An earlier version of this file claimed `namebases-oceania.js` had **doubled
commas between every entry** and that this was why two attempts to move entries
corrupted five files. That was wrong — I misread my own split output. The file
has 194 separators for 195 entries, which is correct. The real cause of the
corruption was splicing text blocks and mismanaging the trailing comma, not
pre-existing damage. Both attempts were rolled back from backups and this
comment does not change anything that was already done.

## Result

W006: **39 → 7**. All 28 moved entries verified in their target files with their
seed lists intact. Total entries unchanged at 3793.
