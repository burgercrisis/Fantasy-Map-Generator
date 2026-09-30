# Research: `namebases-africa.js` i=3257 "Auyokawa" and i=5631 "Ayo"

**Scope:** identify what languages the two seed lists actually belong to, judge whether each name
is right, judge internal coherence, check for duplicates within the same file, and give the correct
ISO 639-3 / Glottolog identifiers.

**Outcome in one line:** only **one** of the two entries is misnamed. `i=5631 "Ayo"` is a genuine
misfile (its name belongs to a South American language; its seeds are Nigerian). `i=3257 "Auyokawa"`
is **correctly named** — the task brief's premise is wrong — but its seed list is 80% filler copied
from the Hausa entry.

**Read-only task.** No file in the repo was modified. This report is the only file written.

---

## Method

Both entries were read out of the live file rather than from the excerpt in the brief, by evaluating
`public/modules/namebases-africa.js` in a `node:vm` context with a fake `window`:

```js
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('public/modules/namebases-africa.js', 'utf8'), ctx);
ctx.window.africaNameBases.find(e => e.i === 3257);
```

Overlap was then computed against all 859 entries of that array (case-insensitive, exact string
match on the comma-separated `b` seed field), and cross-checked against
`config/language-mixes.json` (3727 rows) and `public/config/language-mixer-map.js` (4340 rows).

### Verbatim entries as they exist today

```
i=3257  name="Auyokawa"  status=COMPLETE  min=3  max=13  d=lnrt  m=0    51 seeds
i=5631  name="Ayo"       status=COMPLETE  min=4  max=12  d=lnrt  m=0.1  45 seeds
```

---

## Headline correction to the brief

The brief states *"Auyokawa is Tupian, of Mato Grosso do Sul, Brazil (ISO `auy`, Glottolog
`auy1248`)"*. **This is a different language with a near-identical name.**

| | Auyokawa | Auyánkawa |
|---|---|---|
| Where | Auyo LGA, **Jigawa State, Nigeria** | Mato Grosso do Sul, **Brazil** |
| Family | Afro-Asiatic › Chadic › West Chadic › Bade (B.1) | Tupian (claimed) |
| Status | extinct | claimed |
| ISO 639-3 | **`auo`** | `auy` (claimed) |
| Glottolog | **`auyo1240`** | `auy1248` (claimed) |

The Nigeria-side facts are established below. The Brazil-side codes I could **not** independently
re-verify: `glottolog.org/resource/languoid/id/auy1248` returns **404**, and a Glottolog ISO lookup
for `auy` does not return an Auyánkawa record. So the Brazil-side codes should be treated as the
catalog's claim, not as verified fact — but that is beside the point: **Auyokawa is not the Brazilian
language under any classification.**

The brief's other lead is also wrong in an instructive way: it says *"Fadan Ayu and Ungwar Nungu are
Idoma-area settlements in Benue State."* They are not Idoma and not in Benue. They are in **Sanga
LGA, Kaduna State**, and they are the two largest **Ayu** villages. That single correction is what
unlocked i=5631.

---

## i=3257 "Auyokawa" — the NAME IS CORRECT; the SEED LIST is contaminated

### Verdict

| Question | Answer |
|---|---|
| Is "Auyokawa" the right name for this language? | **Yes.** Keep the name. |
| Is the seed list internally coherent? | **No** — 10 of 51 seeds are Auyokawa; 41 are filler. |
| Is it a duplicate of another entry? | **No** as an entry, but **34 of its 51 seeds are verbatim duplicates** of Hausa (i=1934). |
| Correct ISO 639-3 | **`auo`** |
| Correct Glottolog id | **`auyo1240`** |
| Proposed `name` | **no change** — `"Auyokawa"` |
| Confidence | **Very high** |

### Evidence that Auyokawa is a real Jigawa State language

Auyokawa (also called **Tirio**) is an **extinct Afro-Asiatic West Chadic language formerly spoken
in Auyo LGA, Jigawa State, Nigeria**. It is known almost entirely from a list of numbers, the days
of the week, and one phrase, collected by Russell G. Schuh.

- https://en.wikipedia.org/wiki/Auyokawa_language
- https://glottolog.org/resource/languoid/id/auyo1240 — *"Glottocode: auyo1240, ISO 639-3: auo,
  AES status: extinct… Auyokawa (auo-auo) = 10 (Extinct)"*
- https://en.wikipedia.org/wiki/Bade_languages — *"**Auyokawa (extinct)** … Jigawa State, Kafin Hausa
  LGA, Auyo"*, alongside the sister extinct Shira and Teshena/Teshenawa
- Primary source: Schuh, Russell G. (2001), *"Shira, Teshena, Auyo: Hausa's (former) eastern
  neighbors"*, Historical Language Contact in Africa, **16/17**, pp. 387–435
- https://lughayangu.com/post/extinct-languages-in-nigeria — lists Auyokawa among Nigeria's nine
  extinct languages, *"formerly spoken in Auyo LGA, Jigawa State"*

### Seeds 1–10 are exactly Auyo LGA's ten wards

The first ten seeds of the entry, in order, are:

```
Auyo, Auyokayi, Ayama, Ayan, Gatafa, Gamafoi, Gamsarka, Kafur, Tsidir, Unik
```

That is the published ward list of Auyo LGA, verbatim and in the same order:

> *"The **Auyokawa** language, now extinct, was formerly spoken in Auyo… And it also has **ten
> political wards** which include: Auyo, Auyokayi, Ayama, Ayan, Gatafa, Gamafoi, Gamsarka, Kafur,
> Tsidir, and Unik."*
> — http://owiki.org/wiki/Auyo (mirrored, with "wards" mistranscribed as "words", at
> http://world.wikisort.org/nigeria/en/Nigeria/Auyo and https://www.medianigeria.com/history-of-auyo-lga-jigawa-state)

So the entry's first ten seeds are precisely right and precisely sourced. **The name and the seeds
agree.**

### Seeds 11–51 are filler, and mostly stolen from the Hausa entry

Remaining 41 seeds:

```
Hadejia, Gumel, Malam Madori, Dambatta, Wudil, Gwarzo, Bagwai, Shanono, Rimin Gado, Tofa, Dala,
Nassarawa, Tarauni, Gwale, Fagge, Kumbotso, Ungogo, Minjibir, Dawakin Tofa, Takai, Kibiya,
Tudun Wada, Kiru, Karaye, Makoda, Tsanyawa, Kunchi, Bichi, Danbatta, Bunkure, Gezawa, Gwaram,
Jahun, Miga, Buji, Kiyawa, Sule Tankarkar, Kaugama, Maigatari, Babura, Gwiwa
```

These are Hausa- and Fulfulde-speaking towns of **Kano and Jigawa States** — a different emirate,
~150 km from Auyo. **34 of the 51 seeds (67%) appear verbatim in the Hausa entry `i=1934`**
(263 seeds): Kafur, Hadejia, Gumel, Malam Madori, Dambatta, Wudil, Gwarzo, Bagwai, Shanono,
Rimin Gado, Tofa, Dala, Nassarawa, Tarauni, Gwale, Fagge, Kumbotso, Ungogo, Minjibir, Dawakin Tofa,
Takai, Kibiya, Tudun Wada, Kiru, Karaye, Makoda, Tsanyawa, Kunchi, Bichi, Danbatta, Bunkure, Gezawa,
Jahun, Kiyawa.

A further **5 seeds are shared with `i=202381 "Teshenawa"`** (32 seeds): Kiyawa, Auyo, Miga, Jahun,
Hadejia — the same generic-Jigawa padding appearing in both extinct-Bade entries.

The remaining 8 non-ward seeds not present in Hausa are other Jigawa LGA seats/districts:
Gwaram, Miga, Buji, Sule Tankarkar, Kaugama, Maigatari, Babura, Gwiwa.

**Net: 10 of 51 seeds are attributable to Auyokawa.** Auyokawa is documented as having *one* known
settlement area (Auyo LGA), so a ten-ward list is the honest ceiling. The other 41 exist only to make
the entry look substantive, and they import Hausa/Fulfulde material into an extinct Chadic language.

### Not a duplicate entry

`i=3257` has zero overlap with `i=1854 "Fula"` (46 seeds) — the existing Fulfulde entry, which is
itself a mixed West-African set (Labe, Podor, Matam, Katsina, Yola, Garoua, Ngaoundere…). Maximum
overlap anywhere in the file is Hausa 1934 at 34 seeds, which is 13% of Hausa's 263 seeds — a shared
region, not a shared entry. Auyokawa deserves its own entry; it just needs its seeds trimmed.

### What actually needs fixing for i=3257

**Not the namebase name. The catalog row.** `config/language-mixes.json` contains:

```json
{ "name": "Auyokawa", "iso": "auyokawa", "region": "South America",
  "category": "Tupian", "family": "Tupi-Guarani",
  "wikipedia": "https://en.wikipedia.org/wiki/Auyokawa_language" }
```

The **name and the Wikipedia URL are the Nigerian Chadic language**; the **region / category / family
are the South American Tupian one**. Someone copied the classification off the near-homophone
Brazilian language and pasted it onto the correct Nigerian article. `iso: "auyokawa"` is not a real
ISO 639-3 code. This row is wired to the namebase at
`public/config/language-mixer-map.js` → `{ "iso": "auyokawa", "bases": [3257] }`.

Suggested catalog row: `{ "name": "Auyokawa", "iso": "auo", "region": "Africa",
"category": "Afroasiatic", "family": "Chadic", "tags": ["extinct"],
"wikipedia": "https://en.wikipedia.org/wiki/Auyokawa_language" }`, with the mixer row keyed `auo`.

---

## i=5631 "Ayo" — the SEEDS ARE CORRECT; the NAME IS WRONG

### Verdict

| Question | Answer |
|---|---|
| What language is it? | **Ayu** |
| Is "Ayo" the right name? | **No.** "Ayo" is the ISO code of **Ayoreo**, an unrelated Zamucoan language of the Gran Chaco. |
| Is the seed list internally coherent? | **Yes — perfectly.** All 45 seeds are **Sanga LGA, Kaduna State, Nigeria**, the Ayu heartland. |
| Is it a duplicate of another entry? | **No.** Max overlap with any other Africa entry is 2 seeds (Tangale i=249). |
| Correct ISO 639-3 | **`ayu`** |
| Correct Glottolog id | **`ayuu1242`** |
| Proposed `name` | **`"Ayu"`** |
| Confidence | **Very high** |

### The deciding seeds

`Fadan Ayu` and `Ungwar Nungu` are the first two seeds, and Blench's field report names them both as
Ayu settlements and then lists the Ayu villages in the same order the entry has them:

> *"We first visited the chief, who is resident in **Fadan Ayu** [=Iciyai], a large settlement on the
> road from Fadan Karshe to Wamba… they recommended us to the chief's brother in **Ungwar Nungu**, a
> large village some 5 km. north of Fadan Ayu in Kaduna State… **Ayu speakers live in the following
> villages: Kongon, Gwade, Tayu, Arau, Diger, Ikwa [=Mayir], Agamati, Anka Ambel and Amantu**, all in
> the hilly region around Fadan Ayu."*
> — Blench, Roger, *"The Ayu language of Central Nigeria and its affinities"* (2006), Foundation for
> Endangered Languages, http://www.ogmios.org/ogmios_files/206.htm

Entry seeds 1–12 are `Fadan Ayu, Ungwar Nungu, Agamati, Amantu, Ambel, Anka, Arau, Digel, Gwade,
Ikwa, Kongon, Tayu` — the same set, with *Diger* normalised to **Digel** and *Diger = Mayir* supplied
in both forms. Wikipedia's Ayu article cites Ethnologue 22 with the same list:

> *"Ethnologue (22nd ed.) lists Ayu locations as **Agamati, Amantu, Ambel, Anka, Arau, Digel, Gwade,
> Ikwa, Kongon, and Tayu** villages in Sanga, Nigeria."*
> — https://en.wikipedia.org/wiki/Ayu_language

Ayu is **not** Idoma and **not** in Benue State. It is a moribund Plateau language of **Sanga LGA,
southern Kaduna State**, ~800 speakers (2003), possibly one of the **Ninzic** languages (Blench 2008).

- https://glottolog.org/resource/languoid/id/ayuu1242 — *"Ayu … Atlantic-Congo › Volta-Congo ›
  Benue-Congo › **Benue-Congo Plateau › Ninzic › Ayu**. Glottocode: **ayuu1242**. ISO 639-3: **ayu**.
  AES status: **moribund**."*
- https://iso639-3.sil.org/code/ayu — *"ayu | Ayu | Active | 639-3 | Individual | Living"*
- https://www.endangeredlanguages.com/elp-context/context-28059-ayu-source-ayu-language-central-nigeria-and-its-affinities

### Internal coherence: all 45 seeds, one LGA

Seeds 13–45 are the remaining villages of Sanga LGA, and each block matches a published ward/postcode
listing for that LGA exactly:

| Entry seeds | Sanga LGA ward / district | Postcode | Source |
|---|---|---|---|
| Alan, Chambwa, Gbaku, Gbuzhi, Jege, Kanjan, Kimba, Kpaji, Kpoto, Marinjo, Ninyu, Takpe, Unzahu | **Ayu** ward | 801107 | Wikipedia *List of villages in Kaduna State*; nigeriapostal.com |
| Boyi, Fatu, Timis, Tela | **Ambel** ward | 801120 | Wikipedia *List of villages in Kaduna State* |
| Ayaba, Challa, Dariya, Mantur, Nungu Bokana, Sansani, Amantu (Amantur) | **Bokana** ward | 801121 | Wikipedia *List of villages in Kaduna State* |
| Agas, Ankub, Awgon, Balawes, Digel, Gokwi, Iden, Sankwai, Tayu, Yabme | **Mayir** district | 801119 | nigeriapostcode.com/801119 (+ page 2) |

`https://en.wikipedia.org/wiki/List_of_villages_in_Kaduna_State` gives, e.g.:

> *Sanga | Ayu | 801107 | Makaranta; Tukura; Abu Kampani; Abu Makaranta; **Alan**; Ayu Gari; **Chambwa**;
> Gari; **Gbaku**; Gbun Tashi; **Gbuzhi**; Gogo; **Jege**; **Kanjan**; **Kimba**; Koshu; **Kpaji**;
> **Kpoto**; **Marinjo**; **Ninyu**; …; **Takpe**; …*
> *Sanga | Bokana | 801121 | … **Ayaba**; … **Challa**; Dakaci Fadan Ayu; … **Dariya**; … **Mantur**;
> … **Nungu Bokana**; … **Sansani**; Sarki Fadan Ayu …*
> *Sanga | Ambel | 801120 | **Boyi**; Dakaci Anka; … **Fatu**; … **Timis**; Tela Chessu …*

and `https://www.nigeriapostcode.com/801119` lists Agas, Ankub, Awgon, Balawes, Digel, Gokwi, Iden,
Sankwai, Tayu (page 1) and **Yabme** (page 2), all *"Rural | Mayir | Sanga | Kaduna"*.

**45 / 45 seeds are Sanga LGA, Kaduna State.** This is not a mixed list and not a padded one — it is
one of the tightest regional seed sets in the file. It looks like two independently-sourced lists
(the Ayu dialect villages, then the Sanga ward rosters) concatenated without duplication.

### Why the name is "Ayo"

The name was taken from the ISO code, not from the seeds. `config/language-mixes.json` holds:

```json
{ "name": "Ayoreo", "iso": "ayo", "region": "South America",
  "category": "Zamucoan", "family": "Zamucoan",
  "wikipedia": "https://en.wikipedia.org/wiki/Ayoreo_language" }
```

That catalog row is **correct** — Ayoreo really is the Zamucoan language of the Gran Chaco
(ISO `ayo`). The defect is that `public/config/language-mixer-map.js` points `ayo` at namebase
**5631**, whose seeds are the Nigerian **Ayu** (`ayu`). A genuine South American namebase already
exists at `i=201308 "Ayoreo"` in `namebases-southAmerica.js` (30 seeds: CampoLoro, Tunucojnai,
Jesudi, Arocojnadí, Filadelfia, PozoColorado, DefensoresDelChaco…). So `ayo → 5631` is wrong in both
directions: wrong base **and** wrong language.

### Not a duplicate

Maximum seed overlap with any other entry in `namebases-africa.js` is **2 seeds** (Tangale `i=249`,
89 seeds), then 1 each with Songhoyboro Ciine (`i=1332`) and Hausa (`i=1934`). No other entry holds
Ayu villages. There is no duplicate to merge with, and no existing "Ayu" entry anywhere in
`public/modules/namebases-*.js`.

### Proposed changes

1. `public/modules/namebases-africa.js` → `i=5631`: `"name": "Ayo"` → **`"name": "Ayu"`**. Seeds
   unchanged. `min`/`max`/`m` are fine as-is.
2. `config/language-mixes.json`: add a row for the real language, e.g.
   `{ "name": "Ayu", "iso": "ayu", "region": "Africa", "category": "Niger-Congo",
   "family": "Ninzic", "wikipedia": "https://en.wikipedia.org/wiki/Ayu_language" }`.
3. `public/config/language-mixer-map.js`: repoint `ayo` to `201308` (Ayoreo), and add
   `{ "iso": "ayu", "bases": [5631] }`.
   Caveat for whoever owns this file: the family taxonomy work in flight collapsed `Niger-Congo`
   top-level families, so `Ninzic` may need to match whatever bucket the neighbouring Plateau
   languages ended up in. `Sanga`'s neighbours `Numana` and `Ninzo` are the reference points.

---

## Root cause: a three-way name collision, all traced

| Place | Name | Actually is | ISO | Status |
|---|---|---|---|---|
| africa `i=3257` | Auyokawa | **Auyokawa** — extinct West Chadic, Auyo LGA, Jigawa, Nigeria | `auo` / `auyo1240` | Name right, seeds padded |
| southAmerica `i=893` | "Auyokawa language" | **Mineiro** — seeds are 75 Minas Gerais towns (Belo Horizonte, Ouro Preto, Diamantina, Juiz de Fora, Lavras…). `d: "nic-GH"` | `mineiro` | Name wrong, seeds right |
| `config/language-mixes.json` | Auyokawa / `auyokawa` | Nigerian name + Nigerian Wikipedia URL + **Brazilian Tupian taxonomy** | should be `auo` | Half-right, worst of the three |
| africa `i=5631` | Ayo | **Ayu** — moribund Ninzic, Sanga LGA, Kaduna, Nigeria | `ayu` / `ayuu1242` | Name wrong, seeds right |

Two additional shadows, both read-only observations:

- `public/modules/namebases-research.js` `i=3257` holds only **1 seed** (`"Auyo"`) against the Africa
  file's 51 — the same index, two divergent seed sets. The mixer row resolves to the Africa copy, so
  the richer one is what ships; but the divergence is real and worth flagging.
- `public/modules/namebases-research.js` `i=893` carries `iso: "mineiro"`, which confirms directly
  that the South American "Auyokawa language" entry is Mineiro and only the display name drifted.

---

## Confidence summary

| Finding | Confidence | Basis |
|---|---|---|
| i=3257 is Auyokawa of Jigawa, Nigeria, ISO `auo`, Glottolog `auyo1240` | **Very high** | Glottolog record, Wikipedia article, Schuh 2001 primary source, three independent secondary sources, and the seed list matching Auyo LGA's published wards verbatim |
| i=3257 seeds 11–51 are filler, 34 shared verbatim with Hausa `i=1934` | **Very high** | Computed directly from the file; no interpretation needed |
| i=5631 is Ayu, ISO `ayu`, Glottolog `ayuu1242`, Sanga LGA, Kaduna | **Very high** | Blench 2006 field report + Ethnologue 22 list + Glottolog + 45/45 seeds matched to four published Sanga ward/postcode rosters |
| "Ayo" = Ayoreo is a separate South American language | **Very high** | ISO `ayo`; existing entry `i=201308 "Ayoreo"` in the South America file |
| The Brazil-side codes (`auy`, `auy1248`) for Auyánkawa | **Low / unverified** | Glottolog 404s on `auy1248`; ISO lookup on `auy` returns no Auyánkawa record. Do not propagate these codes without checking the ISO 639-3 table directly. |
| i=5631 classification as Ninzic | **Medium-high** | Glottolog files it under Ninzic, but Wikipedia marks the placement uncertain ("Ninzic ?") per Blench 2008. The village identification is certain; the family assignment is not. |