# Language System Status – Markov & Mixer
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

 _Last updated: Worker 2–3 shared-base cleanup passes (Romance, Papuan/Oceania, Afroasiatic, South Asia, West Asia, English-based creoles, SE Asia base-29) + Worker 4 /languages-unique4 batch #3 (Mongolic/Koreanic + Baltic/Slavic micro-clusters) + Worker 6 /languages-unique6 batch (SE Asia 29/Bahnaric + South-Central Dravidian + South Slavic micro-cluster) + Worker 7 /languages-unique7 batch (Papuan macros + Romance/Celtic micro-cluster) + Worker 8 /languages-unique8 batch (Bantu Bemba/Bembe/Fwe, South-Central Dravidian 376, North Dravidian/Brahui 388, Papuan [195,360] macros; non-Uralic base clusters fully resolved) + Worker 9 Algic / Basque contact & Eastern Indonesian / Papuan Tip micro-pass + Worker 9 /languages-unique9 continuation batch (South-Central Dravidian 376/387 + Philippine [193,195] trio + Papuan 360/195 macro hubs + small Indo-Aryan/Creole splits) – 2025-12-10_

This document captures where the language system work currently stands so this project can be picked up later without re‑reverse‑engineering everything. It assumes the core design goal that **every language entry** ultimately has its own linguistically and regionally appropriate **dedicated base** in the namebase/mixer layer (a single-base `[X]` array for normal, non-hybrid languages) or, where the language is genuinely hybrid / creole / mixed, a **unique tuned mix**. Any present-day sharing of identical bases or `[bases]` arrays is treated as **temporary per-language uniqueness debt**, not an acceptable end state, and paying that debt down will routinely involve **introducing new bases and splitting over-broad hubs** rather than leaving long-term shared clusters in place. [Races & Languages – System Rules §1.3](Races-Languages-Rules.md#13-language-base-uniqueness-intent) describes how that goal is consumed on the race side.

Throughout this devplan, `config/language-mixes.json` and `config/language-mixer-map.json` are treated as **append-only language registries**. Once a language ISO exists in either file it should not be deleted; cleanup and uniqueness passes only adjust `bases[]`, metadata, or add new entries. If an earlier revision contained a language that is now missing, that is treated as data loss to be repaired by restoring the language from history rather than as an intentional deletion.

### Section index

- [1. Infrastructure status](#1-infrastructure-status)
- [2. Families / bases already reviewed](#2-families--bases-already-reviewed)
- [3. Not-unique-enough clusters (current suspects)](#3-not-unique-enough-clusters-current-suspects)
- [4. Work not yet done / future passes](#4-work-not-yet-done--future-passes)
- [5. Planned next steps when resuming](#5-planned-next-steps-when-resuming)
- [6. Quick checklist for whoever picks this up](#6-quick-checklist-for-whoever-picks-this-up)
- [7. Planned tooling extensions (Markov, similarity, and UX helpers)](#7-planned-tooling-extensions-markov-similarity-and-ux-helpers)
 - [8. Wikipedia language list coverage registry](#8-wikipedia-language-list-coverage-registry)

## 1. Infrastructure status

- **Blended Markov generator**
  - Implemented in `modules/names-mixer.js`.
  - Supports:
    - Per-base Markov chains.
    - Segment-wise blending of multiple bases with weights.
    - Smoothing joins between segments (spaces / hyphens / elision).
    - Basic safeguards against over-repetition (esp. click-heavy languages).
  - Legacy "single mixed chain" path kept behind `options.legacyChain`.

- **Core `Names` API**
  - `modules/names-generator.js` is still the authoritative single-base Markov engine.
  - APIs:
    - `Names.getBase(base, min, max, dupl)` – uses base `min/max/d` by default.
    - `Names.getCulture(culture, min, max, dupl)` – wraps `getBase` via `pack.cultures[culture].base`.
    - `Names.getCultureShort(culture)` – shortens `min/max` for label-ish uses.
    - `Names.getState(name, culture, base)` / `Names.getMapName(force)` – apply culture-specific suffix logic on top of base names.

- **Tooling (under `tools/`)**
  - `check-namebase-lengths.js`
    - Uses a Node VM to load `namebases-*` and `names-generator`.
    - Reports **seed** and (once fully wired) **generated** length stats per base.
    - Currently wired so that `Names.getBase` sees `nameBases = defaultNameBases`.
  - `profile-language-mixes.js`
    - Profiles entries in `config/language-mixes.json` and `language-mixer-map.json`.
    - For each ISO:
      - region, family, category, tags,
      - mapped bases,
      - seed length stats and script / character profile (ASCII vs extended, etc.).
  - `check-language-mixer-map-inconsistencies.js`
    - Sanity-sweeps `language-mixes.json` + `language-mixer-map.json`.
    - Surfaces:
      - ISOs with **mix entry but no base mapping**.
      - ISOs with **base mapping but no mix entry**.
      - Bases used across **multiple families/regions** (potential style-collapsing hubs).

 These tools are the main entry points for future tuning passes.

 For a full index of helper scripts and workflows, see [tools/HELPER-TOOLS.md](../tools/HELPER-TOOLS.md); that doc also calls out the core runners for these passes (`profile-language-mixes.js`, `check-language-mixer-map-inconsistencies.js`, `check-namebase-lengths.js`, and the `run-language-mixer-suite.js` orchestrator).
 Dedicated CASCADE workflows exist for parallel uniqueness passes: `/language-uniqueness` (Worker 1), `/languages-unique2`–`/languages-unique10` (Workers 2–10), and `/decluster-language-bases` for targeted shared-base cluster cleanup when a specific hub needs to be broken up.

---

## 2. Families / bases already reviewed

This section summarizes families where we have done at least a **first pass**: checking seed lengths vs config, reviewing duplication rules, and eyeballing overall behavior.

### 2.1 Romance cluster (core Azgaar + extensions)

Representative bases:
- **Italian** (`i:3`), **Castilian/Spanish** (`i:4`), **Portuguese** (`i:13`), **French** (`i:2`), **Roman** (`i:8`), **Occitan** (`i:232`), **Sardinian** (`i:233`), **Neapolitan** (`i:306`), etc.

Status:
- Length ranges (`min/max`) broadly match seed distributions; most are already quite tight around their medians.
- Duplication patterns reflect Romance flavors reasonably (e.g. French allowing `nlrs` doubles, Italian `cltr`).
- Earlier, many Romance dialects and offshoots in `language-mixer-map` all mapped back onto the same few bases (Spanish, Portuguese, French, Italian, Occitan, Sardinian, Neapolitan). A dedicated multi-batch **Worker‑3 uniqueness pass** has since burned down most of that debt: the majority of mapped Romance languages now have globally unique `[bases]` arrays, with only a short tail of shared-base clusters left for follow-up.

Takeaway:
- Core Romance macro-family is in **good shape** for fantasy-mapping use at a coarse level (seed quality, duplication, and high-level flavor), and a substantial slice of the previously-documented iso/dialect-level uniqueness debt has already been paid down via the Worker‑3 pass.
- Remaining Romance work should focus on the small number of still-shared base clusters surfaced by `report-language-mixer-base-clusters` (currently concentrated around bases 3, 13, 22, 43, and 44) until each mapped Romance language has a unique base or mix signature.
- **Linked Wikipedia lists:** *Languages of Europe* subset (see §8.7).
  - **Worker 7 (/languages-unique7) note:** this pass burned down the [22] and [3] mini-clusters around Balearic, Gaelic (`gla`), Irish (`gle`), Occitan, Istriot, Ligurian, and Romansh by wiring them to unique mixer base sets that blend Italian (3), Celtic (22), Scottish/Irish Gaelic (184/394), Occitan (232), Sardinian (233), Corsican (279), and Romansh (234), and also split the Papuan macros Finisterre–Huon languages, Inland Gulf, and Southeast Papuan languages off the shared `[198,263,360]` cluster via Engan Papuan (365) and Eastern Indonesian (367).

### 2.2 Uralic / Finnic cluster

Representative base:
- **Finnic** (`i:9`) – used for Finnish, Karelian, Veps, Sámi relatives, etc.

Status:
- Seed and config length bands align; names fall in expected 5–11 range.
- Duplication rule `d:"akiut"` is already tuned to preserve characteristic geminates.
- Mixer map shows base `9` reused across multiple Uralic branches and even some neighboring contact zones.

Takeaway:
- `i:9` currently acts as a **macro-Finnic / generic Uralic** base reused across multiple Uralic branches and some contact zones.
- After review, this shared 9 is being treated as a **historically acceptable macro cluster** for the core Finnic / Volgaic group rather than immediate uniqueness debt; more obviously mismatched or cross-family clusters are higher priority for de-clustering.
- If future flavor or gameplay needs demand more contrast inside Uralic, we can still introduce additional Uralic bases (e.g. East Uralic vs Finnic vs Sámi-flavored) and progressively remap languages off 9 until those subgroups have distinct base or mix signatures.
- **Linked Wikipedia lists:** *Languages of Europe* subset (see §8.7).

### 2.3 Germanic cluster

Core Azgaar bases:
- **German** (`i:0`), **English** (`i:1`), **Nordic** (`i:6`).

Additional Germanic-like bases (in `namebases-fantasy.js`):
- **Afrikaans** (`i:268`), **Yiddish** (`i:230`), **Frisian** (`i:235`), **Faroese** (`i:236`), **Luxembourgish** (`i:293`).

Status:
- Length bands:
  - `German` / `English` / `Nordic` already have reasonable `min/max` ranges and strong seeds.
  - Added Germanic bases cluster around `min≈4`, `max≈12`, aligned with small/medium town names.
- Duplication rules:
  - `German (0)`: `d:"lt"`.
  - `English (1)`: `d:""` (very conservative; doubles mostly suppressed).
  - `Nordic (6)`: `d:"kln"`.
  - **New Germanic bases** (Afrikaans/Yiddish/Frisian/Faroese/Luxembourgish): standardized on `d:"lnrt"`.

Takeaway:
- Germanic macro-family is in **usable** shape.
- Some internal asymmetry (e.g. English being the most conservative on duplication) is currently accepted for flavor.
- No immediate `min/max` changes applied; we treat `d:"lnrt"` as the default for **new Germanic-like bases**.
- **Linked Wikipedia lists:** *Languages of Europe* subset (see §8.7).

### 2.4 Semitic / Afroasiatic (Levantine + surrounds)

Representative bases:
- **Berber** (`i:17`), **Arabic** (`i:18`), **Mesopotamian** (`i:23`), **Levantine** (`i:42`).

Status:
- Length bands checked with `check-namebase-lengths`:
  - `Berber (17)`: config `4–10`, seeds mostly `6–8` with mild tails.
  - `Arabic (18)`: config `4–9`, seeds centred `6–8`, occasional `10–11` outliers.
  - `Mesopotamian (23)`: config `4–9`, seeds have long historical forms but central mass `5–8` is covered.
  - `Levantine (42)`: config `4–12`, seeds `5–7` median, occasional longer historic names.
- No `min/max` adjustments made yet; the current ranges are decent for **city/state** style use.
- A dedicated Afroasiatic **Worker-3 uniqueness pass** has split most previously shared singletons in `language-mixer-map` so that individual Afroasiatic languages (especially Berber, Ethio-Semitic, and Chadic lects) now have unique `[bases]` arrays even when they still draw on 17/18/23/42 as ingredients.

Takeaway:
- Semitic macro-family is **serviceable** for flavor and now substantially less entangled in shared `[bases]` than in the original Azgaar mapping: most attested ISOs have distinct mixer signatures, with only intentionally broad macros and a tiny core cluster still outstanding.
- Arabic, Mesopotamian, and Berber bases still act as broad central anchors and lexifier ingredients for many related ISOs in the mixer, but differences are increasingly expressed via additional Afroasiatic bases and per-ISO combinations rather than reusing a single bare base.
- **Linked Wikipedia lists:** *Languages of West Asia* subset (see §8.8).

### 2.5 Nahuatl & Quechua

Representative bases:
- **Nahuatl** (`i:14`), **Quechua** (`i:27`).

Status:
- Lengths:
  - `Nahuatl (14)`: config `6–13`, seeds `min=6, max=14, mean≈9.1`. Config tracks the core nicely.
  - `Quechua (27)`: config `6–12`, seeds `min=4, max=15, mean≈8.3`. Config again hugs the central `6–10` region.
- Duplication: both currently use `d:"l"` – preserves `ll`-type sequences without general over-duplication.

Takeaway:
- These two bases are **already niche and distinct**; good candidates for Mesoamerican / Andean flavor.
- No changes applied so far for `Nahuatl (14)` and `Quechua (27)`.
- Neighboring **Mazatec** (`i:169`, Oto-Manguean) had its length band retuned from `4–12` to `11–20` based on seed and generated stats so its home range matches the observed distribution.

### 2.6 Slavic / East-European cluster

Representative mapping status (via `profile-language-mixes`):

- **East Slavic / macro-Slavic anchor**:
  - `rus` (Russian): family *East Slavic*, category *Slavic* → base **5 (Slavic/Ruthenian)**.
  - `ukr` (Ukrainian), `rusyn`, `podlachian`, `west-polesian`, `upper-sorbian`, `lower-sorbian`, `old-church-slavonic` also currently map to base **5**.

- **Lechitic cluster (West Slavic)**:
  - `pol` (Polish), `kashubian`, `polabian`, `pomeranian`, `slovincian`: family *Lechitic* → base **314 (Lechitic)**.

- **Czech–Slovak cluster (West Slavic)**:
  - `ces` (Czech), `slovak`: family *Czech-Slovak* → base **315 (Czech-Slovak)**.

- **South Slavic BCS cluster (Western South Slavic)**:
  - `bosnian`, `croatian`, `montenegrin`, `srp` (Serbian), `serbo-croatian`: family *Western South Slavic* → base **316 (South Slavic BCS)**.

- **Other dedicated Slavic bases**:
  - `belarusian` → base **266 (Belarusian)**.
  - `slovene` → base **267 (Slovene)**.
  - `macedonian` → base **273 (Macedonian)**.
  - `silesian` → base **294 (Silesian)**.

Additional mapping cleanup (Stage A/B):
- Removed stray mappings from `ces` to **20 (Basque)** and from `ukr` to **25 (Hawaiian)**; both now lean on Slavic-family bases only.
- Deduplicated `rus → [5]` entries in `language-mixer-map.json`.
- Introduced dedicated bases **314 (Lechitic)**, **315 (Czech-Slovak)**, and **316 (South Slavic BCS)** and remapped the corresponding West/South Slavic ISOs off base 5.

Takeaway:

- Base **5 (Slavic/Ruthenian)** now primarily serves as a macro **East Slavic / historical Slavic** anchor plus some Sorbian and border lects.
- West Slavic subclusters (Lechitic and Czech–Slovak) and the core South Slavic BCS cluster now have **distinct bases with tuned length bands**, improving internal contrast within the Slavic family.
- Future passes may:
  - split East Slavic further (e.g. Russian vs Ukrainian vs Belarusian),
  - give Sorbian and border lects (Podlachian / West Polesian) blended or dedicated bases,
  - and tighten duplication / length settings once more gameplay feedback is available.
- **Linked Wikipedia lists:** *Languages of Europe* subset (see §8.7).

### 2.7 East Asia (Sinitic / Japonic / Koreanic & neighbors)

Representative bases / mappings (via `profile-language-mixes`):

- **Chinese / Mandarin**:
  - `iso: mandarin` → base **11 (Chinese)**.
  - Seed lengths `min=4, max=11, mean≈7.0`; config `5–10` with p25–p75 ≈ `6–8`.
  - Mixer map previously also had a stray mapping `mandarin → 66`; this has been removed so Mandarin now consistently uses base 11.
- **Japanese**:
  - `iso: jpn-lang` → base **12 (Japanese)**.
  - Seeds `min=3, max=14, mean≈6.8`; config `4–10` with p25–p75 ≈ `6–8`.
- **Korean**:
  - `iso: kor` → base **10 (Korean)**.
  - Seeds `min=3, max=11, mean≈6.9`; config `5–11` with p25–p75 ≈ `6–8`.
- **Vietnamese**:
  - `iso: vie` → base **29 (Vietnamese)**.
  - Seeds `min=3, max=19, mean≈8.1`; config `3–12` with p25–p75 ≈ `7–9`, plus `hyphen/space` flags to allow multi-word and hyphenated forms.
- **Cantonese**:
  - `iso: yue` → base **30 (Cantonese)**.
  - Seeds `min=4, max=14, mean≈7.4`; config `5–11` with p25–p75 ≈ `6–8`.

Takeaway:

- Core East Asian standards (Mandarin, Japanese, Korean, Vietnamese, Cantonese) each have **dedicated, well-anchored bases** with sensible length bands.
- Mandarin’s duplicate mapping to a non-Chinese base (66) has been cleaned; it now correctly routes only to base 11.
- Next East Asian work should focus on:
  - auditing **Mongolic** and neighboring families (Mongolian / Khalkha / Buryat / Kalmyk, plus historical Mongolic varieties) to ensure they are mapped onto base **31 (Mongolian)** or other purpose-built Mongolic bases rather than unrelated hubs, and
  - checking that smaller Sinitic varieties and regional lects do not silently collapse onto the same few bases without justification.

### 2.8 Sub-Saharan Africa (first Bantu split)

Representative bases / mappings (via `profile-language-mixes`):

- **West / Horn African standards**:
  - **Yoruba**: `yor` / `yoruba` → base **112 (Yoruba)**, seeds `min=3, max=9, mean≈6.0`, config `4–12`, ASCII with `hyphen`.
  - **Igbo**: `igbo` → base **113 (Igbo)**, seeds `min=3, max=11, mean≈5.8`, config `4–12`, ASCII with `hyphen`.
  - **Somali**: `somali` → base **130 (Somali)**, seeds `min=3, max=10, mean≈6.6`, config `4–12`, ASCII.
  - **Amharic**: `amharic` → base **133 (Amharic)**, seeds `min=4, max=12, mean≈8.4`, config `4–12`, ASCII with `hyphen`.
- **Bantu cluster (Great Lakes / Southern)**:
  - **Lingala**: `lingala` → base **146 (Lingala)**, seeds `min=4, max=13, mean≈6.7`, config `4–12`, ASCII with `hyphen`.
  - **Kinyarwanda**: `kinyarwanda` → base **147 (Kinyarwanda)**, seeds `min=5, max=9, mean≈7.2`, config `4–12`, ASCII.
  - **Shona**: `shona` → base **148 (Shona)**, seeds `min=5, max=11, mean≈7.1`, config `4–12`, ASCII.
  - **Zulu**: `zulu` → base **149 (Zulu)**, seeds `min=6, max=16, mean≈8.6`, config `4–12`, ASCII with `hyphen`.
  - **Xhosa**: `xhosa` → base **150 (Xhosa)**, seeds `min=5, max=19, mean≈9.0`, config `4–12`, ASCII with `apostrophe / hyphen / space`.
  - **Sesotho**: `sesotho` → base **151 (Sesotho)**, seeds `min=6, max=14, mean≈9.4`, config `4–12`, ASCII with `apostrophe / hyphen`.
  - **Tswana**: `tswana` → base **152 (Tswana)**, seeds `min=4, max=13, mean≈7.8`, config `4–12`, ASCII with `hyphen`.

Changes applied in `language-mixer-map.json`:

- `zulu`, `xhosa`, and `shona` previously had duplicate mappings to **base 28 (Swahili)** alongside their own Bantu bases (148–150); the Swahili duplicates have been removed so they now use only their dedicated bases.
- `kinyarwanda`, `lingala`, `sesotho`, and `tswana` likewise had trailing Swahili-28 mappings; these duplicates have been removed so they now resolve only to bases **147, 146, 151, 152** respectively.

- **Second-pass Bantu refinement**:
  - `kongo`, `luganda`, `chichewa`, and `kikuyu` previously also had trailing Swahili-28 mappings in addition to their dedicated bases **153 (Kongo)**, **154 (Luganda)**, **155 (Chichewa)**, **156 (Kikuyu)**.
  - These Swahili duplicates have now been removed so they consistently use only their own Bantu bases, with shared settings `min=4, max=12, d="lnrt"` and city seeds drawn from their respective core regions.

Takeaway:

- A core set of major Sub-Saharan languages (Yoruba, Igbo, Somali, Amharic, Lingala, Kinyarwanda, Shona, Zulu, Xhosa, Sesotho, Tswana, **Kongo, Luganda, Chichewa, Kikuyu**) now each have **dedicated, well-anchored bases** with sensible length bands.
- Swahili (28) is moving back toward its role as a **trade/lexifier hub** rather than a generic stand-in for unrelated Bantu languages.
- Many **smaller African lects** (additional Bantu and Atlantic–Congo families) still map directly to Swahili 28 or other hubs and remain candidates for future passes to introduce language-specific bases and tuned length/duplication profiles.
 - **Linked Wikipedia lists:** *Languages of Africa – major languages subset* (see §8.1).

---

### 2.9 South Asia (Indo-Aryan / Dravidian)

Representative bases / mappings (via `profile-language-mixes`):

- **Indo-Aryan standards (one-to-one bases)**:
  - **Hindi**: `hin` → base **183 (Hindi)**, seeds `min=4, max=11, mean≈6.6`, generated stats `min=4, max=12, mean≈7.4, p25≈5, p75≈9, p90≈11`; config band tightened from `4–12` to `5–11` so the home range hugs the central distribution.
  - **Urdu**: `urdu` → base **203 (Urdu)**, seeds `min=5, max=15, mean≈8.0`, config `4–12`, ASCII + space.
  - **Gujarati**: `gujarati` → base **204 (Gujarati)**, seeds `min=5, max=11, mean≈7.0`, config `4–12`, ASCII.
  - **Sinhala**: `sinhala` → base **205 (Sinhala)**, seeds `min=5, max=12, mean≈8.3`, config `4–12`, ASCII + space.
  - **Odia**: `odia` → base **256 (Odia)**, seeds `min=4, max=13, mean≈8.1`, config `4–12`, ASCII.
  - **Assamese**: `assamese` → base **257 (Assamese)**, seeds `min=5, max=10, mean≈7.5`, config `4–12`, ASCII.
  - **Kashmiri**: `kashmiri` → base **288 (Kashmiri)**, seeds `min=4, max=9, mean≈7.0`, config `4–12`, ASCII.
  - **Sindhi**: `sindhi` → base **289 (Sindhi)**, seeds `min=4, max=19, mean≈8.4`, config `4–12`, ASCII + space.
  - **Marathi / Konkani**: `marathi`, `konkani` → base **253 (Marathi)**, generated stats `min=3, max=12, mean≈6.9, p25≈5, p75≈8, p90≈10`; config band tightened from `4–12` to `5–10` to capture the core while trimming rare extremes.
  - **Punjabi**: `punjabi` → base **202 (Punjabi)**, generated stats `min=4, max=12, mean≈7.9, p25≈6, p75≈10, p90≈11`; config band tightened from `4–12` to `6–11` to reflect the observed 6–11 cluster.

- **Dravidian macro-hubs**:
  - **Tamil**: base **199 (Tamil)**, shared across South / Central / North / unclassified Dravidian lects; seeds `min≈5, max≈15, mean≈9.1`, generated stats `min=4, max=12, mean≈8.0, p25≈5, p75≈11`. Config band lightly tightened from `4–12` to `5–12` so it aligns with p25 and avoids very short outliers.
  - **Telugu**: base **200 (Telugu)**, shared across South-Central + some South Dravidian lects; seeds `min≈5, max≈13, mean≈8.3`, config `4–12` covers the core (`p25≈6, p75≈10`).
  - **Kannada**: base **254 (Kannada)**, used for Kannada, Tulu, Kodava, and neighbors; seeds `min≈5, max≈14, mean≈7.8`, config `4–12` matches `p25≈6, p75≈9`.
  - **Malayalam**: base **255 (Malayalam)**, used for Malayalam and many closely related South Dravidian lects; seeds `min≈5, max≈18, mean≈9.1`, config `4–12`, with central mass (`p25≈8, p75≈10`) inside the band.

Takeaway:

- Core Indo-Aryan standards have **one-to-one bases** with reasonable `min/max` bands; they are not acting as problematic hubs.
- A first Indo-Aryan mixer pass has also broken the worst Hindi-adjacent shared-base cluster: **Bhojpuri** and **Magahi** no longer share `[183,201]`, but instead use unique 183-anchored mixes while continuing to reflect a Hindi-centered palette.
- Dravidian still leans on a small set of **macro-family bases** (Tamil 199, Telugu 200, Kannada 254, Malayalam 255) reused across many lects; under the explicit per-language uniqueness rule this remains **uniqueness debt**, but multiple South Dravidian passes have now remapped many Malayalam/Tamil-adjacent lects (including the former pure-255 tail) onto distinct `[199/253/254/255/372–375]` combinations so that no South Dravidian entry remains on a bare `[255]` array.
- Initial tuning on **Tamil (199)** (raising `min` from `4` to `5`) ensures generated names better reflect the observed Tamil length distribution, but it does **not** change the requirement that each Dravidian language should ultimately have its own base or tuned mix rather than sharing these macro-hubs.
- Future passes should therefore:
  - introduce additional Dravidian bases for major subgroups (e.g. Gondi-like cluster vs generic Telugu; select Malayalam-based minorities vs core Malayalam),
  - progressively remap languages off the shared 199/200/254/255 hubs until each mapped Dravidian entry has a unique base or mix signature, and tighten length and duplication settings per base once more targeted seeds are available.
- **Linked Wikipedia lists:** *List of languages by number of native speakers* subsets (see §8.2 and §8.3).

### 2.10 Shared-base cluster cleanup (Worker 2 passes)

Representative clusters addressed so far (using `report-language-mixer-base-clusters.js` together with family-focused sweeps):

- **Note (diagnostic snapshots):** `report-language-mixer-base-clusters.js` is a read-only helper; any `_last-language-base-clusters*.txt` or `_report-language-mixer-base-clusters.txt` files under `tools/mixer-diagnostics/` are just saved console output for review, are gitignored, and should be treated as ephemeral diagnostics that can be regenerated on demand, not as editable source data.

- **Romance:** Shared `[3]`, `[13]`, `[22]`, `[43]`, and `[44]` clusters have been split so each mapped Romance entry now has a distinct base or mix signature (see §2.1).
- **Uralic:** Non-9 Uralic clusters around bases 320–323 (Khanty, Mansi, Mari, Nenets) have been split into unique mixes, while the historically acceptable **Finnic/Volgaic base-9 cluster** is intentionally left shared (see §2.2 and the Uralic note in your rules).
- **South Asia / Dravidian:** Multiple passes have remapped South Dravidian and Tamil-adjacent lects off pure `[199]` / `[255]` onto distinct `[199/253/254/255/372–375]` combinations; in particular, the Malayalam-anchored `[255]` tail is now fully de-clustered so that no South Dravidian entry uses a pure `[255]` array (see §2.9).
- **Hindi / Indo-Aryan:** The shared `[183,201]` cluster for **Bhojpuri** and **Magahi** has been broken; both now use unique 183-anchored mixes while still reflecting a Hindi-centered palette (see §2.9).
- **Semitic / Ethiopic:** The Amharic/Ethiopic `[133]` duplication between `amh` and `amharic` has been resolved so that `amh` is the canonical pure-133 entry and `amharic` uses `[2,133,140]` instead of sharing `[133]` (see §2.4).
- **English-based pidgins & creoles:** English base `1` is now kept as a pure `[1]` anchor for `eng`, while key English-based contact varieties (e.g. `american-indian-pidgin-english`, `anguillian-creole`, `bislama`, `pijin`) use distinct 1-anchored mixes that incorporate appropriate regional bases.
- **SE Asia base-29 (Vietic/Bahnaric + neighbors):** The large pure-`[29]` Vietic/Bahnaric cluster and its mixed offshoots have been de-clustered so that `vie` is the sole pure-29 entry and all other base-29 users have unique 29-anchored mixes, even when they cross families (Vietic, Bahnaric, Monic, Khmeric, Austroasiatic, and Munda; see §2.7 and §2.12).
- **Algic / Yeniseian / Canadian Romance tail (base 19, Worker‑9):** the former `[19]` pair `arin` / `brayon` has been split so that `arin` now uses a Yeniseian multi-base `[19,31,275]` and `brayon` now rides on an English/French‑anchored Canadian mix `[1,2,272]` instead of sharing `[19]`.
- **Algic / Basque contact (Worker‑9):** the former `[186,187]` cluster has been split by giving `yurok` an Algic–Salish mix `[187,222]` and remapping `algonquian-basque-pidgin` to `[20,186]` so that Basque `eus` remains a pure `[20]` isolate while the pidgin carries both Basque and Algonquian flavor.
- **Aslian / Malay base-195 micro-cluster (decluster-language-bases):** the former `[195]` shared pair between the **Aslian languages** family macro (`aslians`, Austroasiatic / Aslian, Asia, tagged `"family"`) and **Malay** (`malay`, Austronesian, Pacific) has been split so that `malay` remains the sole pure-`[195]` Austronesian Malay lexifier anchor, while `aslians` now uses a distinct mainland SE Asia Austroasiatic mix `[29,251,252]` built from Vietnamese-29, Thai-251, and Lao-252 to reflect its non-Austronesian, MSEA-anchored role.
- **Afroasiatic micro-clusters (Berber/Arabic [17,18] + Arabic [18,23] pair – decluster-language-bases):** a follow-up micro-pass cleaned up (a) the redundant `[17,18]` mapping for **Ait Seghrouchen Berber** by dropping the duplicate minimal entry so that `ait-seghrouchen-berber` now consistently uses the richer `[2,17,18,139]` Berber–Arabic mix already defined earlier in the map; and (b) the `[18,23]` Arabic pair by giving **Levantine Arabic** (`levantine-arabic`) a distinct Levantine-anchored mix `[18,23,42]` (adding Levantine base 42) while **Adeni Arabic** (`adeni-arabic`) remains on `[18,23]`, so the two no longer share an identical `[bases]` array.
- **Worker‑9 continuation (/languages-unique9 – South-Central Dravidian 376/387 + Philippine [193,195] + Papuan 360/195 + small Indo‑Aryan/Creole tails):** this follow-up batch (a) burned down the former `[376]` / `[387]` South‑Central Dravidian clusters by moving **Konda / Manda / Ollari / Pengo / Muria / Naiki / Pattapu / Yerukala** and nearby lects onto distinct `[372/374/375/376/387]` combinations so no two share an identical `[bases]` array; (b) split the **Ibanag / Kapampangan / Pangasinan** `[193,195]` Philippine cluster so each now rides its own dedicated Philippine base (**341**, **343**, **345**); (c) refined the **Papuan 360/195** macro hub by giving Awin–Pa, Binanderean, Bosavi, Duna–Pogaya, East Strickland, Gogodala–Suki, Goilalan, Kayagaric, Kiwaian, Kolopom, Asmat–Citak, Ok–Oksapmin, Bayono–Awbono, Alor–Pantar, East Timor Papuan, and Aru distinct blends of Malay 195, Tok Pisin 263, Papuan 360, and regional Papuan bases **365–371**, leaving only a small `[263,360,370]` Kandawo/Motu cluster as outstanding uniqueness debt; and (d) cleaned up a few remaining 2‑language clusters by giving **Konkani**, **Chittagonian**, and **Antillean Creole** unique Indo‑Aryan / Creole mixes instead of sharing `[253]`, `[201]`, or `[258]` with their standards.
- **Central Dravidian / Purépecha (base 389):** A Worker‑1 `/language-uniqueness` pass remapped the previous `[389]` cluster so that Central Dravidian lects **Duruwa**, **Kolami**, **Naiki**, and **Ollari** now use distinct Dravidian mixes (374/375/376/387 in unique combinations), **Angolar Creole** anchors on its dedicated Angolar base 390 instead of 389, and base **389** is reserved for **Purépecha** only.

- **Worker‑4 shared-base cleanup (Tamil / Australian Aboriginal / South Slavic / Bemba):** a `/languages-unique4` pass split the remaining pure-`[199]` South Dravidian tail by giving **Sholaga** and **Toda** distinct Tamil‑anchored mixes (`[199,254]` and `[199,374]`) while keeping `tamil` as the canonical pure‑`[199]` entry; moved **Kunwinjku**, **Maung**, and **Nunggubuyu** off bare `[312]` onto Harari‑312 mixes layered with regional Papuan/Pacific bases (`[312,360]`, `[312,368]`, `[312,369]`) in line with the Australian Aboriginal mapping rules; split the South Slavic BCS `[316]` cluster so **Macedonian** now uses `[316,372]`, **Serbian** (`srp`) uses `[314,316]`, and the macro **Serbo‑Croatian** entry remains the sole pure‑`[316]` anchor; and gave **Bemba** a unique Bantu mix `[149,377]` so that `bemba` no longer shares the pure `[377]` key with `fwe` and the two Bembe lects.

- **Worker‑4 shared-base cleanup (Mongolic / Koreanic / Baltic / Sorbian / Polish):** a later `/languages-unique4` batch de‑clustered the remaining East Asian `[31]` and Baltic/Slavic `[314]/[329]` base sets by (a) moving **Chinese‑Kyakala** onto a Mandarin–Tungusic mix `[11,380]` instead of sharing Mongolian `[31]`, and giving **Korean** a pure `[10]` base; (b) remapping **Alasha** and **Altai‑Uriankhai** onto Kalmyk/Southern‑Mongolic mixes `[296]` and `[296,381]` rather than riding the generic Mongolian key; (c) splitting the Baltic and Sorbian cluster so **Polish** becomes the sole pure `[314]` Lechitic anchor while **Lithuanian**, **Latvian**, **Lower Sorbian**, and **Upper Sorbian** use distinct 314‑anchored combinations (`[314,373]`, `[314,0]`, `[329,314]`, `[314,329]`); and (d) giving **Croatian** a South‑Slavic mix `[314,316,372]` separate from both Polish and the BCS macro `[316]`.

- **Worker‑4 tail micro-batch (Na‑Dene / Irish Gaelic / Seri):** the final `/languages-unique4` micro-pass cleaned up the remaining `[383]` / `[394]` duplicates by (a) keeping **Irish** `gle` as the canonical pure `[394]` Celtic entry while moving **Seri** off `[394]` onto a Seri‑anchored Mesoamerican mix `[396,14]` (Seri base 396 plus Nahuatl 14), and (b) giving **Navajo** a Na‑Dene–Mesoamerican contact mix `[383,14]` so that the Almosan/Na‑Dene cluster now consists of unique combinations `[383]` (Athabaskan macro), `[19,383]` (Almosan), `[19,275,383]` (Inuktitut `iku`), and `[383,14]` (Navajo) instead of sharing a bare `[383]` key.

- **Worker‑6 shared-base cleanup (/languages-unique6 – SE Asia 29/Bahnaric + South-Central Dravidian + South Slavic micro-cluster):** targeted the sixth duplicate-base batch from `select-language-mixer-base-batch` by (a) de-clustering the SE Asia base‑29 / Bahnaric / Munda tail so that **Malayo‑Chamic** now rides a unique Austronesian mix `[29,194,195,367]` and **Santali** (`sat`) and **Jru’ Bahnaric** (`jru-bahnaric`) use distinct 29‑anchored `[29,195,251]` and `[29,193,194,251]` combinations instead of sharing `[29,194,195]`; (b) giving **Chenchu** a South‑Central Dravidian mix `[374,387]` instead of pure `[387]`, consistent with the `[199/253/254/255/372–375/387]` Dravidian palette; and (c) nudging the South Slavic BCS cluster so **Serbian** now uses `[315,316]` and **Croatian** uses `[314,315,316]` while `serbo-croatian` remains the sole pure‑`[316]` macro anchor.

- **SE Asia 29/Bahnaric follow-up micro-batch (post `/languages-unique6`):** extended the SE Asia base‑29 cleanup by de-clustering the remaining Bahnaric tail so that **Halang** (`halang-bahnaric`) now uses `[29,193,251,367]` and **Kaco'** (`kaco-bahnaric`) now uses `[29,194,251,367]`, leaving `mnw`, `duan-bahnaric`, `jeh-bahnaric`, `jru-bahnaric`, and `juk-bahnaric` on distinct 29‑anchored mixes and eliminating the last `[29,193,251]` / `[29,194,195,251]` duplicates in that cluster.

Takeaway:

- The high-level rule from [Races & Languages – System Rules §1.3](Races-Languages-Rules.md#13-language-base-uniqueness-intent) is now being enforced family-by-family: shared `[bases]` arrays are treated as **per-language uniqueness debt** and worked down via targeted cluster passes.
- Future passes should continue this workflow: run cluster reports, pick the largest remaining cluster (subject to historically approved exceptions like the Uralic base-9 Finnic/Volgaic group), design per-language mixes consistent with family and region, and re-profile with the mixer QA tools.

 - As of the latest diagnostics run, the **only remaining repeated base-set** in `language-mixer-map` is the intentionally accepted Uralic `[9]` Finnic/Volgaic cluster (Åsele `-sele`, `akkala-sami`, `ala-satakunta`, `erzya`, `estonian`, `fin`, `komi-zyryan`, `moksha`, `nenets`); all other shared `[bases]` arrays surfaced by the mixer tools have been de-clustered into unique per-language bases or tuned mixes.

---

Last updated: 2023-02-20; 2025-12-10 (Worker‑5 `/languages-unique5` pass; `/decluster-language-bases` Aslian/Malay [195] micro-pass)
Representative bases / mappings (via `profile-language-mixes.js` and `report-language-mixer-base-clusters.js`):

- **Hausa / Chadic cluster (base 132 as anchor)**:
  - Earlier diagnostics showed many Chadic entries (e.g. Angas, Biu-Mandara, Bade, Masa, and West Chadic macros) all riding on a single `[132]` key.
  - Recent passes have remapped dozens of these languages to **globally unique base sets** of the form `[132, X, Y]`, where `X`/`Y` are neighboring African bases such as Yoruba **112**, Igbo **113**, Fula **114**, Ewe **120**, Akan **116**, Lingala **146**, Kinyarwanda **147**, Shona **148**, Zulu **149**, Sesotho **151**, Tswana **152**, Kongo **153**, Luganda **154**, Chichewa **155**, and Kikuyu **156**.
  - New mappings were also added for previously unmapped or partially mapped Chadic entries so they participate in the same per-language uniqueness guarantees.

- **Pan-African 112–156 blob cleanup**:
  - A broader sweep over West / Central / Southern African entries that previously shared short or identical `[112–156]` combinations now assigns **distinct multi-base signatures** anchored on realistic regional mixes (West African 112–120 plus Bantu 146–156).
  - Swahili **28** is now used primarily as a **trade / lexifier ingredient** rather than a default shared base for unrelated African lects, building on the Bantu split in §2.8.

Takeaway:

- The earlier **Hausa / Chadic base-132 cluster** and much of the ad-hoc **112–156 Pan-African blob** have been converted into **per-language unique base or mix signatures**, while staying within historically plausible African anchors.
- Remaining Sub-Saharan uniqueness debt is now concentrated in smaller Atlantic–Congo and Cushitic pockets and in languages that still ride on Swahili 28 or other macro lexifiers; those are surfaced by the mixer diagnostics and are candidates for future passes.

---

  ### 3.1 High-degree lexifiers in `language-mixer-map`

Based on `check-language-mixer-map-inconsistencies` runs, the following bases show up across many families/regions:

- **Malay (195)**
  - Used across a large swath of **Austronesian + Papuan contact zones** (Alor–Pantar, Greater Awyu, Asmat–Kamoro, etc.).
  - Acts as a general **Malay / trade-lexifier hub**.
- **Tok Pisin (263)**
  - Shared across numerous **Papuan** families; intentionally a contact lingua franca.
- **English (1)**
  - Reused for many **English-based pidgins and creoles** (Caribbean, Africa, Pacific); a first cleanup pass has already split several (`american-indian-pidgin-english`, `anguillian-creole`, `bislama`, `pijin`) onto unique 1-anchored mixes, but many other English-based entries still represent outstanding uniqueness debt.
- **French (2)** and **Portuguese (13)**
  - Similarly reused for French-/Portuguese-based creoles.
- **Tamil (199)**, **Telugu (200)**, **Bengali (201)**, **Assamese (257)**
  - Multiple Indo-Aryan / Dravidian clusters share these; some of the worst offenders (e.g. South Dravidian `[255]` tail and the Hindi-adjacent `[183,201]` cluster) have been split in recent passes, but substantial uniqueness debt remains (see §2.9).
- **Other hubs** seen in the sweeps: **Swahili (28)**, **Thai (251)**, **Lao (252)**, **Maori (196)**, **Samoan (197)**, **Fijian (198)**, **Sranan (291)**, **Greenlandic (305)**, **Neapolitan (306)**, **Occitan (232)**, **Sardinian (233)**, **Northern Sami (274)**, **Ainu (275)**, **Buryat (276)**, **Kalmyk (296)**, **Zarma (277)**, **Udmurt (283)**, etc.

Current stance:
- Many of these are **historically plausible but intentionally broad** lexifiers or macro-family anchors, in the sense that they are reasonable seeds.
- However, under the per-language uniqueness rule, any language that still *shares* an identical lexifier base or `[bases]` array with others is carrying **uniqueness debt**. These hubs must be revisited and split until each dependent language has its own base or mix signature, with lexifiers kept only as ingredients rather than sole or fully shared bases.

### 3.2 Single-base macro-families

- **Uralic (base 9)**
  - Single Finnic/Uralic base covers Finnish, Karelian, Veps, multiple Sámi dialects, and more.
  - Earlier passes flagged this as high-priority **uniqueness debt**, but subsequent design decisions carved out a specific exception: the core **Finnic/Volgaic base‑9 cluster** (including historical Merya/Meshcherian/Muromian alongside Erzya/Moksha/Karelian) is now treated as a historically acceptable shared macro-base. Other Uralic languages can still move toward unique mixes over time, but this particular 9-sharing cluster should no longer be treated as a suspicious hub.
- **Central Semitic (bases 18, 23, 42)**
  - Arabic / Mesopotamian / Levantine bases currently underpin many historical and modern Semitic ISOs and act as shared anchors.
  - Afroasiatic Worker-3 passes have already split most of those ISOs onto distinct `[bases]` mixes; the remaining handful of identical arrays (core standards and macro entries) are still treated as explicit **uniqueness debt** to be resolved in a later, more opinionated Semitic/Ethiopic tuning pass.
- **Romance dialect continuum**
  - Many Romance dialects (regional Spanish, Portuguese, French, Italian varieties, etc.) initially all mapped back to one of a few central bases; the multi-batch Worker-3 pass has already carved out unique `[bases]` for most of these mapped entries.
  - A small remainder of shared-base clusters (notably around bases 3, 13, 22, 43, and 44) is still tracked as uniqueness debt and should be cleared in a targeted Romance follow-up so that no two mapped Romance entries share an identical base or `[bases]` array.

As of the 2025‑12‑10 `/languages-unique*` passes (Workers 1–10, including Worker 7), all non-exception base-set clusters currently surfaced by `report-language-mixer-base-clusters.js` and `select-language-mixer-base-batch.js` have been de‑clustered; the only intentionally shared macro-family base left is the Uralic base‑9 Finnic/Volgaic group described above. New clusters will arise only as new languages are wired or existing mappings are changed.

---

## 4. Work not yet done / future passes

The following families / regions have **not yet received a full pass** for home-range, duplication, and mixer-map sanity. They almost certainly hide more “too generic” or “too shared” behavior.

- **Slavic & East European cluster**
  - Mapping and core bases have received a first pass (see **2.6**) and all Slavic entries now have globally unique `[bases]` arrays, but East Slavic splits, Sorbian, and border lects (Podlachian / West Polesian) still need refinement of `min/max/d` and/or dedicated bases as a follow-up quality/coverage pass.
- **South Asian (Indo-Aryan, Dravidian, related)**
  - Key Indo-Aryan and Dravidian standards now have documented bases and initial length checks (see **2.9**), but many Dravidian lects still sit on a handful of macro-family hubs (199/200/254/255) and Hindi/Bengali/Marathi/Punjabi and related creoles still need dedicated review.
- **Sub-Saharan Africa (Bantu, Atlantic–Congo, Cushitic, Chadic, etc.)**
  - Most bases exist but have not been systematically profiled for script, duplication, or length bands.
  - **East Asia (Sinitic, Japanese, Korean, Mongolic, and neighbors)**
  - Core Sinitic / Japonic / Koreanic standards (Mandarin, Japanese, Korean, Vietnamese, Cantonese) now have dedicated passes and cleaned mixer mappings, but **Mongolic and many smaller regional lects** have not yet been fully profiled for uniqueness, base choice, and length bands.
- **Americas beyond Nahuatl / Quechua / Aymara / Cherokee**
  - Many North and South American families still use “first-draft” bases.
- **Papuan & Austronesian beyond Malay / Tok Pisin / core oceanic Lexifiers**
  - Still a rich area for future passes: the second-pass work in §2.12, subsequent Worker-3/8/9 collision cleanups, and a targeted diagnostics sweep over Malay 195 / Tok Pisin 263 / Pacific 197–198 hubs have already moved many Papuan and Eastern Indonesian macros off pure Malay/Tok Pisin/197–198 hubs and onto regional bases with unique mixes and confirmed there are currently no remaining Papuan/Austronesian shared `[bases]` clusters; the remaining work here is deeper quality/coverage tuning so that long-tail Papuan and Pacific Austronesian families are fully profiled for home-range, base choice, and per-language uniqueness.

---

## 5. Planned next steps when resuming

When this work resumes, a practical order of operations:

1. **Lock in use-case length bands**
   - For each `Names.*` call site (burgs, states, cultures, map names, religions, markers), define bands:
     - Map / world names: slightly longer than base means.
     - Capitals vs towns / villages: tuned around base medians with size-based offsets.
     - Cultures / peoples: mid-length, avoiding extreme tails.
     - Religions / deities: allowed to run slightly long for grandeur.
   - Implement via **central constants or helpers** rather than ad-hoc numbers.

2. **Family-by-family passes using the tools**
   - For each macro-family or region:
     - Run `profile-language-mixes.js` focused on that family/region.
     - Run `check-language-mixer-map-inconsistencies.js --family=...` and/or `--region=...`.
     - Use `check-namebase-lengths.js` to verify `min/max` vs seeds.
   - Adjust per-base `min/max` and, where necessary, `d`.

3. **Tackle known hubs explicitly**
   - Decide, per hub base (e.g. Malay 195, Tok Pisin 263, English 1, French 2, Portuguese 13, etc.), whether it is:
     - an **intentional lexifier / macro hub** (document it), or
     - a **placeholder that needs splitting** into multiple more specialized bases.

4. **Add or split bases where contrast is weak**
   - Where one base is covering too many stylistically distinct languages, consider:
     - Adding a new base seeded from a more local set of city names.
     - Remapping a subset of ISOs to that new base in `language-mixer-map.json`.

5. **Finalize documentation**
   - Once more families are tuned, extend this document with:
     - A short **per-family summary** (status, key bases, known hubs).
     - A clear list of **intentional shared bases vs accidental reuse**.
   - **Recommended workflow:** For each family or region, perform a **family-by-family uniqueness pass** using `/language-uniqueness` and `/languages-unique2–10` to identify and split shared-base clusters, followed by **targeted cluster cleanup** via `/decluster-language-bases` to address any remaining uniqueness debt.

6. **Grow coverage via Wikipedia language lists**
   - Use the registry in §8 to track which Wikipedia-derived list JSONs exist and how fully they are wired; when creating a new regional list, add it there and run `report-wikipedia-list-coverage.js` to keep the snapshot fresh.
   - When extending an existing list (e.g. adding more rows from the underlying Wikipedia tables), update the JSON, re-run coverage, and refresh the corresponding §8.x snapshot so future passes know exactly which lists are fully wired.
   - Treat each new language with the same per-language rigor (seed curation, base choice, `min/max/d` tuning, and mixer-map QA); avoid bulk-adding large blocks of languages onto a single hub base without review.
   - For each language that appears in a Wikipedia-derived list JSON, **"fully represented"** in this devplan means all of the following are true:
     - **Catalog & mixer presence:** it has a `config/language-mixes.json` catalog entry (with region/family/category metadata and a `wikipedia` URL where applicable) and a corresponding `config/language-mixer-map.json` entry.
     - **Base uniqueness:** its `bases[]` array in `language-mixer-map.json` is globally unique (subject only to explicitly documented historical exceptions such as the Uralic base‑9 Finnic/Volgaic cluster in §2.2) and does not participate in any remaining accidental shared-base clusters surfaced by `tools/mixer-core/report-language-mixer-base-clusters.js` and the `/languages-unique*` workflows.
     - **Race reachability:** at least one non‑Human race can reach the language via `raceLanguageProfiles` (see [Races & Languages – System Rules §5.2–§5.3](Races-Languages-Rules.md#52-race-language-profiles-racelanguageprofiles)), as reported by the mixer‑races tools (`tools/mixer-races/report-race-language-coverage.js`, `tools/mixer-races/report-per-race-language-coverage.js`, and related helpers).

---

## 6. Quick checklist for whoever picks this up

- [ ] Re-run `check-namebase-lengths.js` to ensure `Names.getBase` sandbox behavior is still correct.
- [ ] For your target family/region, run:
  - [ ] `node tools/profile-language-mixes.js --family=...` (or `--region=...`).
  - [ ] `node tools/check-language-mixer-map-inconsistencies.js --family=...`.
- [ ] Decide **per base**:
  - [ ] Are `min/max` aligned with seed p25–p75?
  - [ ] Does `d` allow appropriate geminates without over-duplication?
  - [ ] Is this base overused across unrelated ISOs?
- [ ] Apply changes incrementally (one family / region per commit) and reprofile.

This file should be updated as major families are completed so it remains the single entry point for the language system’s overall status.

---

## 7. Planned tooling extensions (Markov, similarity, and UX helpers)

These are higher-level tools and helpers that sit on top of the existing Markov bases / mixer and are intended to make language work faster, safer, and more consistent across the app. Map- and simulation-side nearest-neighbor uses (e.g. smoothing helpers, label-density suggestions) are documented separately in [Evolving Simulation – Design Choices §3](Evolving-Simulation-Choices.md#3-culture--religion-diffusion).

### 7.1 Language similarity search (k-NN on language features)

**Goal:** Quickly suggest plausible base languages or related mixes when adding or reviewing ISO entries, and surface "nearby" languages for design and debugging.

**Scope / behavior:**

- Build a simple feature vector for each language / mix, drawing from:
  - Family, subfamily, region, script, and tags already in `language-mixes.json`.
  - Basic phonotactic stats (if available): character / bigram frequencies, syllable shapes, length distribution summary.
- Provide a small helper API / CLI, e.g. `getNearestLanguages(iso, k=10)`.
- Use it in tooling first (Node scripts under `tools/`) before any in-UI use:
  - Suggest base(s) when a new ISO is missing `bases` in `language-mixer-map.json`.
  - Help spot suspicious mappings by listing "nearest neighbors" that use very different bases.

**Implementation sketch:**

- Reuse `profile-language-mixes.js` logic to emit a JSON snapshot of language features.
- Implement a tiny k-NN helper (brute force is fine at current scales) that:
  - Normalizes categorical features (e.g. big bonus for same family, smaller bonus for same region).
  - Optionally blends in numeric stats (length means / stddevs) when those are available.
- Keep the first version deterministic and transparent; log intermediate scores for debugging.

**Open questions / risks:**

- Definition of "similar" is fuzzy (historical vs phonetic vs aesthetic); we should document which notion the distance is actually approximating.
- Feature extraction costs need to stay low enough that running this on every tuning pass is cheap.
- Should not auto-edit configs; only propose suggestions that a human accepts or rejects.

### 7.2 Markov on languages / names from user-supplied samples

**Goal:** Allow users (and future internal tooling) to spin up a custom name style from a short list of examples and optionally map that style back onto existing bases.

**Scope / behavior:**

- Provide a way (via an in-app editor and/or CLI tool) to:
  - Paste a list of names.
  - Train a small per-session Markov chain on those names.
  - Preview a batch of generated samples for QA.
- Optionally, compare the resulting Markov stats to the existing base library using the similarity helper to suggest likely underlying base(s) for permanent wiring.
- Persist only when explicitly requested into a new base entry and/or a new ISO mapping; otherwise treat as an ephemeral generator.

**Implementation sketch:**

- Wrap existing `Names` / Markov logic in a helper that can build a temporary chain from a raw list of strings.
- Enforce simple safety checks:
  - Minimum number of samples before training (e.g. 20+).
  - Length / character sanity bounds to avoid pathological chains.
- Provide a text-based preview tool under `tools/` and later a thin UI on top of the existing language editor.

**Open questions / risks:**

- Overfitting tiny or low-quality sample lists; mitigated via minimum N and clear preview tooling.
- Deciding when a user-defined style should become a first-class base vs stay as local flavor.
- Avoiding drift from the historical/typological intent of existing bases when we remap ISOs to new custom styles.

### 7.3 Multi-word Markov: compound names, phrases, and titles

**Goal:** Extend the language system beyond single tokens into short phrases (dynasties, titles, compound toponyms) while keeping structure readable and controllable.

**Scope / behavior:**

- Focus first on structured patterns where we already have clear slots:
  - City names with descriptors ("New X", "X-on-the-Y").
  - Realm / dynasty / house names.
  - Simple religious / cult names.
- Use Markov primarily at the **morpheme or stem level**, with templates providing the overall shape.

**Implementation sketch:**

- Add small per-family template banks (e.g. `{Title} {Name}`, `{Name} of {Region}`) in config.
- For each slot that needs a free-form stem, call into `Names` / mixer to generate a culturally appropriate base form.
- Optionally introduce a separate, lighter-weight Markov layer over morpheme lists (prefixes / suffixes) where that adds value.

**Open questions / risks:**

- Pure word-level Markov risks producing ungrammatical or awkward phrases; we should bias heavily toward template-driven generation.
- Needs UX decisions about where these phrases surface (e.g. new map naming options, dynasty generator tools, etc.).

### 7.4 UX helpers driven by nearest neighbors

**Goal:** Use local and global neighbor information to make map editing smoother without changing core simulation logic.

**Scope / behavior (initial targets):**

- **Label density suggester:**
  - Analyze current map (burg count, area, zoom behavior, chosen style) and propose a default label density / size profile.
  - Reuse a small set of hand-tuned presets and choose between them by nearest-neighbor on map statistics.
- **Neighbor-aware brush smoothing:**
  - When applying culture/biome/etc. brushes, look at the N neighboring cells and gently steer new values toward local consensus.
  - Present as an opt-in mode (e.g. "Smooth to neighbors" toggle) rather than always-on behavior.

**Implementation sketch:**

- Define a compact "map feature vector" (land fraction, number of burgs, climate band distribution, average culture count, etc.) and use the same k-NN helper pattern as for languages to pick presets.
- For brushes, reuse the existing cell adjacency graph and perform a cheap majority/weighted-average pass over immediate neighbors to compute a target value.

**Open questions / risks:**

- Needs careful UX so that helpers feel like suggestions, not fights against direct user control.
- Smoothing must be conservative by default to avoid erasing deliberate high-contrast edits.

---

## 8. Wikipedia language list coverage registry

This section tracks the specific Wikipedia-derived language lists that currently drive language catalog and mixer coverage. For each list we record where its JSON lives, the source URL, which parts of the language system it primarily informs, and how to re-run the wiring and base-uniqueness scripts.

This registry also notes **planned future list JSONs** (marked as such) so regional coverage goals stay visible even before the corresponding files are created.

Coverage numbers and completion tiers should be updated manually from `report-wikipedia-list-coverage.js` runs as work progresses; base-set uniqueness per list can be summarized via `tools/mixer-core/report-wikipedia-list-base-uniqueness.js`. See [§5.6 Grow coverage via Wikipedia language lists](#5-planned-next-steps-when-resuming) for the precise definition of "fully represented" across **catalog presence**, **mixer-map wiring and base uniqueness**, and **race reachability**.
In this project, coverage for a list JSON is always computed over **all** of its items; we do not use the script's `skip` mechanism, and every encoded language is treated as required. Per-language base-uniqueness and race-coverage status are enforced and inspected via the global mixer and race tools described elsewhere in this document (including the base-cluster diagnostics and the new per-list base-uniqueness helper), rather than being repeated per list in §8. Snapshot blocks for each list may optionally include `unique bases` / `clustered bases` counts copied from `report-wikipedia-list-base-uniqueness.js` alongside the existing wiring legend.

### 8.1 Languages of Africa – major languages subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-africa-major.json`
- **Title:** `Wikipedia: Languages of Africa – major languages subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Africa>
- **Scope:** Hand-picked major African languages from the "Languages of Africa" article; focuses on high-impact Afroasiatic and Niger–Congo languages.
- **Primary families / regions touched:** Sub-Saharan Africa (Bantu, Atlantic–Congo, Cushitic, Chadic) and Afroasiatic macro entries; see [§2.8 Sub-Saharan Africa (first Bantu split)](#28-sub-saharan-africa-first-bantu-split) and related African notes.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-africa-major.json`

- **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 33
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 32
  - `clustered bases:` 1

- **Notes / next steps:**
  - Use this list as the primary checklist for ensuring that major African languages are both present in `language-mixes.json` and mapped in `language-mixer-map.json`.
  - If any language from this list is temporarily left unwired in future passes, document it here (and in §5.6 if relevant) so the gap stays visible until it is resolved.

### 8.2 List of languages by number of native speakers (seed subset)

- **JSON file:** `tools/mixer-meta/wikipedia-list-languages-by-native-speakers.json`
- **Title:** `Wikipedia: List of languages by number of native speakers (seed subset)`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_native_speakers>
- **Scope:** A curated subset of high-speaker languages from the global "List of languages by number of native speakers" article, used as a headline driver for worldwide coverage.
- **Primary families / regions touched:** Global macro-families (Indo-European, Sinitic, Japonic, Koreanic, Afroasiatic, Dravidian, Austronesian, etc.); ties into multiple summaries in [§2 Families / bases already reviewed](#2-families--bases-already-reviewed).

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-languages-by-native-speakers.json`

- **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 160
  - `missing catalog:` 0
  - `missing map:` 13
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 1
  - `unique bases:` 130
  - `clustered bases:` 30

- **Notes / next steps:**
  - Track which high-speaker languages are still missing catalog or mixer entries, and prioritize them for future passes.
  - When expanding the subset (e.g. adding more entries from the full Wikipedia table), update the JSON and re-run the coverage script, then refresh the snapshot here.

### 8.3 List of languages by number of native speakers – CIA World Factbook 2018 subset

- **JSON file:** `tools/mixer-meta/wikipedia-list-languages-by-native-speakers-cia-2018.json`
- **Title:** `Wikipedia: List of languages by number of native speakers – CIA World Factbook 2018 subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_native_speakers>
- **Scope:** Alternate subset of the same Wikipedia article, reflecting the CIA World Factbook 2018 numbers; used as an additional cross-check on coverage for key global languages.
- **Primary families / regions touched:** Overlaps heavily with §8.2 but may differ in language ordering and a few inclusions; again spans multiple macro-families.

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-languages-by-native-speakers-cia-2018.json`

- **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 1
  - `unique bases:` 8
  - `clustered bases:` 2

- **Notes / next steps:**
  - Use as a sanity check against the seed subset in §8.2; discrepancies or additional languages here can signal further work needed.
  - As with other lists, explicitly note any remaining unwired languages or planned JSON expansions so that "fully represented" status remains well defined.

### 8.4 Languages of South Asia – regional subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-south-asia.json`
- **Title:** `Wikipedia: Languages of South Asia – regional subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_South_Asia>
- **Scope:** Regional overview of major languages and families across South Asia (Indo-Aryan, Dravidian, Iranian, Nuristani, Tibeto-Burman, etc.).
- **Primary families / regions touched:** South Asia (Indo-Aryan, Dravidian, and neighbors); see [§2.9 South Asia (Indo-Aryan / Dravidian)](#29-south-asia-indo-aryan--dravidian) and the South Asia items in §4.

- **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 15
  - `missing catalog:` 0
  - `missing map:` 3
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 12
  - `clustered bases:` 3

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-south-asia.json`

- **Notes / next steps:**
  - Use this list as a driver for Indo-Aryan / Dravidian completeness checks in South Asia and to highlight any further missing catalog or mixer entries.

### 8.5 Indigenous languages of the Americas – macro-family subset

- **JSON file:** `tools/mixer-meta/wikipedia-indigenous-languages-of-the-americas.json`
- **Title:** `Wikipedia: Indigenous languages of the Americas – macro-family subset`
- **Source:** <https://en.wikipedia.org/wiki/Indigenous_languages_of_the_Americas>
- **Scope:** High-level representation of major indigenous language families and isolates across North, Central, and South America (e.g. Algic, Na-Dene, Uto-Aztecan, Quechuan, Arawakan/Tupi–Guarani).
- **Primary families / regions touched:** Americas (indigenous & contact zones); see [§2.11 Americas (indigenous & contact zones)](#211-americas-indigenous--contact-zones).

- **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 19
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 16
  - `clustered bases:` 3

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-indigenous-languages-of-the-americas.json`

- **Notes / next steps:**
  - Treat this list as a compact checklist for key indigenous families (Nahuatl, Quechua, Guarani, Aymara, Mapudungun, Tikuna, Na-Dene macros, Salishan, Wayuu, Cherokee, etc.).
  - When adding new indigenous languages or families, consider expanding this JSON and re-running coverage to ensure each new item has both catalog and mixer entries.

### 8.6 Languages of Oceania – Papuan & Pacific subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-oceania.json`
- **Title:** `Wikipedia: Languages of Oceania – Papuan & Pacific subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Oceania>
- **Scope:** Overview of Papuan and Austronesian languages across Melanesia, Micronesia, and Polynesia, including Trans–New Guinea and Oceanic branches.
- **Primary families / regions touched:** Papuan & Pacific Austronesian region; see [§2.12 Papuan & Pacific Austronesian (second-pass)](#212-papuan--pacific-austronesian-second-pass).

- **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 23
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 22
  - `clustered bases:` 1

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-oceania.json`

- **Notes / next steps:**
  - Use this list as a driver for further Papuan and Oceanic coverage beyond the current macro bases (360–371) and lexifier hubs.
  - When the JSON is expanded or refined, run coverage again to confirm that all new Papuan/Oceanic items have both catalog and mixer entries.

### 8.7 Languages of Europe – regional subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-europe.json`
- **Title:** `Wikipedia: Languages of Europe – regional subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Europe>
- **Scope:** Overview of major language families and key standard languages across Europe (Romance, Germanic, Slavic, Celtic, Hellenic/Greek, Albanian, Armenian, Baltic, Uralic, Basque, and others).
- **Primary families / regions touched:** European families documented in [§2 Families / bases already reviewed](#2-families--bases-already-reviewed) (Romance, Germanic, Slavic & East European cluster, Celtic branches, Uralic entries, etc.).

- **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 43
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 32
  - `clustered bases:` 11

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-europe.json`

- **Notes / next steps:**
  - When extending or revisiting European families, update the JSON subset from the article above and re-run coverage.
  - Use coverage reports to cross-check that each major European standard language has both catalog and mixer entries and that coverage is balanced across Western, Central, Northern, and Eastern Europe.

### 8.8 Languages of West Asia – regional subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-west-asia.json`
- **Title:** `Wikipedia: Languages of West Asia – regional subset`
- **Source:** <https://en.wikipedia.org/wiki/West_Asia>
- **Scope:** Overview of major language families and key languages across West Asia (Anatolia, the Levant, Mesopotamia, the Arabian Peninsula, the Caucasus, and Iran), including Semitic, Iranian, Turkic, Kartvelian, Armenian, and related branches.
- **Primary families / regions touched:** West Asian families and neighbors documented in [§2 Families / bases already reviewed](#2-families--bases-already-reviewed), including Central Semitic, Iranian, Caucasian, and adjacent Indo-European and Turkic clusters.

- **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 11
  - `missing catalog:` 0
  - `missing map:` 3
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 11
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-west-asia.json`

- **Notes / next steps:**
  - When focusing on West Asian families, you can refine or expand this JSON subset and re-run coverage.
  - Use coverage reports to highlight any new gaps in Semitic, Iranian, Caucasian, and Turkic clusters, especially where languages are still riding shared macro hubs or lack mixer mappings.

### 8.9 Languages of North America – regional subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-north-america.json`
- **Title:** `Wikipedia: Languages of North America`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_North_America>
- **Scope:** Regional overview of major languages and families across North America (English, Spanish, French, Na-Dene / Athabaskan, Algonquian, Eskimo–Aleut, etc.), with a focus on representative standards and macro entries.
- **Primary families / regions touched:** North American indigenous & contact zones; ties into [§2.11 Americas (indigenous & contact zones)](#211-americas-indigenous--contact-zones) and the Na-Dene / Algonquian / Eskimo–Aleut notes there.

- **Status tier:** **Complete**
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 4
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 7
  - `clustered bases:` 1

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-north-america.json`

- **Notes / next steps:**
  - Treat this list as a compact checklist for North American standards and macro entries (English, Spanish, French, Navajo, Cree, Ojibwe, Cherokee, Aleut, Yupik, Inuit, Athabaskan, Apache).
  - When adding new North American languages or refining Na-Dene / Athabaskan coverage, consider expanding this JSON and re-running coverage so each new entry has both catalog and mixer mappings.

### 8.10 Languages of Southeast Asia – regional subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-southeast-asia.json`
- **Title:** `Wikipedia: Languages of Southeast Asia – regional subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Southeast_Asia`
- **Scope:** Regional overview of major language families and standards across mainland and maritime Southeast Asia (Austroasiatic, Tai–Kadai, Hmong–Mien, Sino-Tibetan branches, and Austronesian clusters around Indonesia, Malaysia, the Philippines, etc.).
- **Primary families / regions touched:** Southeast Asia (mainland + island arcs); ties into the Vietic/Bahnaric / base-29 work in [§2.7 East Asia (Sinitic / Japonic / Koreanic & neighbors)](#27-east-asia-sinitic--japonic--koreanic--neighbors) and the broader Austronesian and Papuan passes in [§2.12 Papuan & Pacific Austronesian (second-pass)](#212-papuan--pacific-austronesian-second-pass).

- **Status tier:** **In progress** – JSON exists and a first coverage/uniqueness snapshot has been captured, but many entries are still missing mixer-map wiring.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 24
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 7
  - `clustered bases:` 1

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-southeast-asia.json`

- **Notes / next steps:**
  - Use this list as the main checklist for Southeast Asian languages beyond the core Vietic / Vietnamese base-29 cluster, especially for Tai–Kadai, Austroasiatic, and island Austronesian families not yet fully represented in the mixer.
  - Prioritize wiring missing-map entries in `config/language-mixer-map.json` until the `missing map` count here reaches zero and all list languages have catalog + mixer entries with globally unique base sets.

### 8.11 Global and typological reference lists (from "Languages used on the Internet")

The Wikipedia article **"Languages used on the Internet"** links to a set of **global "list-of-lists" pages** that we treat as background references for coverage planning, classification, and typology. They are *not* all backed by dedicated JSON snapshots; this subsection records how we currently use them.

- **Global by country / polity**
  - `List of official languages by country and territory`, `List of official languages`, `List of official languages by institution` – used as high-level checks on which languages are politically central worldwide; curated seed subsets of the country/territory table and the institution list are now tracked via §8.22 and §8.35, and all three lists inform which standards we prioritize in the catalog and which languages we expect to appear in the regional lists above.
  - `Number of languages by country` – reference for where very high language-density regions (e.g. parts of Africa, Papua New Guinea, Indonesia) deserve extra attention; coverage is implemented via the regional JSON subsets in §8.1, §8.4–§8.6, and §8.10 rather than a direct import of this list.

- **By name / endonym**
  - `List of language names (native names)` – reference for endonyms and orthography when filling `name` vs `iso` and `wikipedia` fields in `language-mixes.json`; no JSON snapshot, but useful when deciding whether catalog entries should prefer exonyms vs autonyms.

- **Phylogenetic classification**
  - `List of language families (phylogenetic)` – background check on our `family` vs `category` labeling; we align our families with this taxonomy where practical.
  - Primary-family lists:
    - `List of Afro-Asiatic languages`, `List of Austronesian languages`, `List of Indo-European languages`, `List of Mayan languages`, `List of Mongolic languages`, `List of Oto-Manguean languages`, `List of Tungusic languages`, `List of Turkic languages`, `List of Uralic languages`.
    - These are **reference-only** at full granularity: we do not mirror them 1:1 as JSON. Instead, where helpful (currently for Indo-European, Afro-Asiatic, Austronesian, Mayan, Mongolic, Oto-Manguean, Tungusic, Turkic, and Uralic), we maintain small **seed subset JSONs** (`tools/mixer-meta/wikipedia-*-languages-seed.json`) as separate §8.* entries that explicitly point back to these lists and are intended to be fully representative at the "headline family / standard" level (i.e. they should include every major branch or standard singled out in the article’s overview, even though they are not exhaustive per-language mirrors).

- **Chronology and counts**
  - `List of languages by first written accounts` – primarily historical; a curated seed subset is now tracked via §8.18, but the full chronology remains reference-only for now.
  - `List of languages by total number of speakers` – overlaps heavily with the native-speaker lists already captured in §8.2–§8.3; a curated seed subset is now tracked via §8.20 and used as an additional sanity check on global headline coverage.
  - `List of languages by number of words according to authoritative dictionaries` – typological curiosity; a curated seed subset is now tracked via §8.32 and can inform future experiments if we ever tune duplication / length heuristics by lexical size.
  - `List of languages by number of phonemes` – typological curiosity; a curated seed subset is now tracked via §8.33 and can inform future experiments if we ever tune duplication / length heuristics by phonological complexity.

- **Regional language overviews**
  - `Languages of Africa`, `Indigenous languages of the Americas`, `Languages of Oceania`, `Languages of Europe`, `Languages of North America`, `Languages of South Asia`, `Languages of Southeast Asia` – all explicitly represented via regional JSON subsets and registry entries in §8.1, §8.4–§8.7, §8.9, and §8.10.
  - `Languages of Asia`, `Languages of South America`, `Languages of Russia` – high-level umbrellas that now have curated seed JSONs and registry entries in §8.15–§8.17; we still lean on the more focused regional subsets (South/West/Southeast Asia, Indigenous Americas, North America, Oceania, Europe) for detailed coverage.
  - `East Asian languages` – broad umbrella for Sinitic, Japonic, Koreanic, Tai–Kadai, and neighboring families; a curated seed subset is now tracked via §8.19, but the full article remains a background reference for East Asia work in §2.7.
  - `List of Native American languages acquired by children` – developmental / sociolinguistic reference; a curated seed subset is now tracked via §8.21 and helps flag indigenous languages with ongoing child acquisition when expanding Americas coverage in §2.11.

 - **Lingua francas, contact varieties, and constructed languages**
  - `List of lingua francas` – background source for which languages we treat as **macro lexifiers** or hub bases (e.g. English, Malay, Tok Pisin, Swahili, Arabic); decisions are reflected in base usage and mixer maps, not in a separate JSON.
  - `List of mutually intelligible languages` – reference for overlap and dialect-continuum behavior between closely related standards; a curated seed subset is now tracked via §8.34, and while we do not currently encode mutual-intelligibility graphs in data, it can inform future choices about how aggressively we split or share bases between near-identical standards or pluricentric norms.
  - `List of creole languages`, `List of mixed languages`, `List of pidgins, creoles, mixed languages and cants based on Indo-European languages`, `List of English-based pidgins` – primary conceptual sources for which catalog entries get `tags: ["creole"]` / `["mixed"]` and for how we design their `[bases]` (lexifier vs substrate). A general creole/mixed/pidgin seed subset is tracked via §8.13, and a focused English-based pidgin seed subset is tracked via §8.36; any future creole/pidgin coverage files should be registered here.
  - `List of constructed languages` – long-tail reference for explicit conlangs; a curated seed subset is now tracked via §8.14.

In short, every Wikipedia list pointed to from **"Languages used on the Internet"** is either:

- already represented by a concrete JSON subset and a §8.* registry entry (including the lingua-franca, creole/mixed/pidgin, and constructed-language seed subsets in §8.12–§8.14), or
- explicitly documented here as a **reference-only source** with notes on how (or whether) it should influence future coverage work.

### 8.12 Lingua francas – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-lingua-francas-seed.json`
- **Title:** `Wikipedia: List of lingua francas – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_lingua_francas>
- **Scope:** Compact set of modern and historical lingua francas used as **global or regional trade / contact languages** (English, French, Spanish, Arabic, Russian, Swahili, Malay, Hindustani, Mandarin, Tok Pisin).
- **Primary families / regions touched:** Global cross-family hubs (Indo-European, Afroasiatic, Austronesian, etc.); overlaps heavily with languages already covered in §8.1–§8.10 but focuses specifically on their **lexifier / lingua-franca roles**.

- **Status tier:** **In progress** – several entries are still missing mixer-map wiring or catalog ISOs.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 1
  - `missing both:` 0
  - `unmatched:` 1
  - `ambiguous:` 0
  - `unique bases:` 8
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-lingua-francas-seed.json`

- **Notes / next steps:**
  - Wire any missing-map entries (e.g. Malay) into `config/language-mixer-map.json` with appropriate lexifier bases, then re-run coverage until `missing map` hits zero.
  - Decide whether to keep Hindustani as a single umbrella entry or split into Hindi/Urdu-style ISOs for mixer purposes, then add the necessary catalog + map entries so no items remain `unmatched`.

### 8.13 Creole / mixed / pidgin languages – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-creoles-mixed-pidgins-seed.json`
- **Title:** `Wikipedia: Creole, mixed, and pidgin languages – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_creole_languages>
- **Scope:** Seed subset of contact varieties drawn from the Wikipedia lists of **creole, mixed, and pidgin languages** (Haitian Creole, Jamaican Patois, Nigerian Pidgin, Tok Pisin, Bislama, Papiamento, Cape Verdean Creole, Sranan Tongo).
- **Primary families / regions touched:** Atlantic and Pacific contact zones; heavily overlaps with English-based and Portuguese/Spanish-based creoles already present in the catalog.

- **Status tier:** **In progress** – many entries still rely on catalog-only wiring without mixer-map bases.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 3
  - `missing catalog:` 0
  - `missing map:` 5
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 2
  - `clustered bases:` 1

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-creoles-mixed-pidgins-seed.json`

- **Notes / next steps:**
  - Introduce or refine dedicated creole/mixed `[bases]` arrays for Jamaican Patois, Nigerian Pidgin, Papiamento, Cape Verdean Creole, and Sranan Tongo so they no longer show up as `missing map`.
  - Use the cluster report to make sure Haitian Creole’s base set is intentionally shared (if at all) and not an accidental reuse.

### 8.14 Constructed languages – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-constructed-languages-seed.json`
- **Title:** `Wikipedia: List of constructed languages – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_constructed_languages>
- **Scope:** Small illustrative subset of conlangs from the broader Wikipedia list (Esperanto, Ido, Interlingua, Quenya, Sindarin, Klingon, Dothraki), intended as a **future playground** for explicit conlang support.
- **Primary families / regions touched:** N/A – these are non-natural languages; current catalog/mixer wiring for them is intentionally **absent**.

- **Status tier:** **Planned** – the seed list exists, but none of these languages are wired into the catalog or mixer yet.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 0
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 7
  - `ambiguous:` 0
  - `unique bases:` 0
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-constructed-languages-seed.json`

- **Notes / next steps:**
  - Only start wiring these once there is a concrete design for exposing conlangs in the generator; at that point, add `language-mixes.json` catalog entries and new fantasy or hybrid bases so they transition from `unmatched` to `fully wired` with unique `[bases]`.

### 8.15 Languages of Asia – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-asia-seed.json`
- **Title:** `Wikipedia: Languages of Asia – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Asia>
- **Scope:** Seed subset of major Asian languages across East, South, Southeast, Central, and West Asia (Sinitic, Japonic, Koreanic, Tai–Kadai, Austroasiatic, Austronesian, Indo-Aryan, Dravidian, Turkic, Iranian, Semitic, etc.).
- **Primary families / regions touched:** Asia-wide macro coverage; complements the regional JSON subsets for South Asia (§8.4), Southeast Asia (§8.10), West Asia (§8.8), and the Americas/Oceania lists.

- **Status tier:** **In progress** – several items are still missing mixer-map wiring, ISOs, or have ambiguous catalog matches.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 24
  - `missing catalog:` 0
  - `missing map:` 5
  - `missing both:` 0
  - `unmatched:` 4
  - `ambiguous:` 1
  - `unique bases:` 23
  - `clustered bases:` 1

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-asia-seed.json`

- **Notes / next steps:**
  - Add `iso` fields for items like "Mandarin Chinese", "Korean", "Tibetan", and "Persian" so they resolve cleanly to existing catalog entries instead of remaining `unmatched`.
  - Wire missing-map entries (Burmese, Malay, Filipino, Nepali, Hebrew) into `config/language-mixer-map.json` with appropriate regionally tuned bases, and if necessary split any remaining accidental base clusters such as the Cantonese (`yue`) cluster reported here.

### 8.16 Languages of South America – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-south-america-seed.json`
- **Title:** `Wikipedia: Languages of South America – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_South_America>
- **Scope:** Seed subset of major South American contact and indigenous languages (Spanish, Portuguese, Quechua, Aymara, Guarani, Mapudungun, Wayuu, Kichwa, Asháninka, Shipibo-Conibo, Warao, Yanomami).
- **Primary families / regions touched:** Romance macro-languages plus key indigenous families and isolates in the Americas; complements the Indigenous Americas list in §8.5.

- **Status tier:** **In progress** – some items still lack catalog wiring.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 4
  - `ambiguous:` 0
  - `unique bases:` 7
  - `clustered bases:` 1

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-south-america-seed.json`

- **Notes / next steps:**
  - Ensure catalog entries exist for Asháninka, Shipibo-Conibo, Warao, and Yanomami (or adjust names/ISOs so they match existing entries) so they move out of the `unmatched` bucket.
  - Use the base-uniqueness cluster info (e.g. Guarani) to confirm which shared bases are intentional versus accidental and split any remaining over-broad hubs.

### 8.17 Languages of Russia – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-of-russia-seed.json`
- **Title:** `Wikipedia: Languages of Russia – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/Languages_of_Russia>
- **Scope:** Seed subset of state and regional languages in the Russian Federation (Russian, Tatar, Bashkir, Chechen, Avar, Ossetian, Chuvash, Udmurt, Komi, Mari, Yakut, Buryat).
- **Primary families / regions touched:** Slavic, Turkic, Northeast Caucasian, Iranian, Uralic, Mongolic branches within Eurasia.

- **Status tier:** **In progress** – most non-Russian items are present in the catalog but still missing mixer-map wiring or ISOs.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 2
  - `missing catalog:` 0
  - `missing map:` 6
  - `missing both:` 0
  - `unmatched:` 4
  - `ambiguous:` 0
  - `unique bases:` 2
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-russia-seed.json`

- **Notes / next steps:**
  - Add or refine mixer-map entries for Tatar, Bashkir, Chechen, Ossetian, Chuvash, and Buryat so they no longer appear as `missing map`.
  - Introduce or confirm catalog entries (with appropriate ISOs) for Avar, Komi, Mari, Yakut, and related lects so they stop appearing as `unmatched`.

### 8.18 First written accounts – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-first-written-accounts-seed.json`
- **Title:** `Wikipedia: List of languages by first written accounts – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_first_written_accounts>
- **Scope:** Compact historical subset of languages with very early written attestations (Sumerian, Egyptian, Akkadian, Hittite, Classical Chinese, Classical Greek, Latin, Sanskrit, Tamil, Hebrew, Aramaic).
- **Primary families / regions touched:** Ancient Afroasiatic, Indo-European, Dravidian, and East Asian standards; used today mainly as a historical reference for potential "ancient vs modern" flavor splits.

- **Status tier:** **In progress** – only a minority of these have present-day catalog/mixer wiring.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 4
  - `missing catalog:` 0
  - `missing map:` 1
  - `missing both:` 0
  - `unmatched:` 6
  - `ambiguous:` 0
  - `unique bases:` 4
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-first-written-accounts-seed.json`

- **Notes / next steps:**
  - Decide which of these ancient standards deserve explicit catalog entries and dedicated or hybrid bases; as they are added, move them from `unmatched` to `fully wired` and keep their bases globally unique where they intersect with modern descendants.

### 8.19 East Asian languages – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-east-asian-languages-seed.json`
- **Title:** `Wikipedia: East Asian languages – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/East_Asian_languages>
- **Scope:** Seed subset of East Asian languages from the broader umbrella article, focusing on major Sinitic lects and neighboring families (Mandarin, Cantonese, Wu, Hokkien, Hakka, Japanese, Korean, Vietnamese, Thai, Lao, Khmer, Burmese, Tibetan, Mongolian).
- **Primary families / regions touched:** East Asia and adjacent Southeast Asian families; overlaps with the Asia-wide seed list in §8.15 and the regional South/Southeast Asia lists.

- **Status tier:** **In progress** – several items still lack ISOs or mixer-map wiring.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 8
  - `missing catalog:` 0
  - `missing map:` 1
  - `missing both:` 0
  - `unmatched:` 5
  - `ambiguous:` 0
  - `unique bases:` 8
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-east-asian-languages-seed.json`

- **Notes / next steps:**
  - Add `iso` fields for items like "Mandarin Chinese", "Wu Chinese", "Hokkien", "Korean", and "Tibetan" so they resolve to existing catalog entries instead of staying `unmatched`.
  - Wire Burmese into `config/language-mixer-map.json` with an appropriate base or mix so it no longer appears as `missing map`, and verify that the resulting base sets stay globally unique.

### 8.20 Total speakers – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-list-languages-by-total-speakers-seed.json`
- **Title:** `Wikipedia: List of languages by total number of speakers – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_total_number_of_speakers>
- **Scope:** Seed subset of the global "total speakers" list, overlapping heavily with the native-speaker subsets in §8.2–§8.3 but focusing specifically on **total** speaker counts (L1+L2) for headline languages.
- **Primary families / regions touched:** Global macro-families (Indo-European, Sinitic, Afroasiatic, etc.), acting as a cross-check on the high-speaker coverage driven by §8.2–§8.3.

- **Status tier:** **In progress** – most items are wired, but a few still rely on name-only matching.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 15
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 3
  - `ambiguous:` 0
  - `unique bases:` 15
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-languages-by-total-speakers-seed.json`

- **Notes / next steps:**
  - Add `iso` fields for Mandarin Chinese, Persian, and Korean so they resolve to existing catalog entries instead of staying `unmatched`, then re-run coverage to confirm all items are `fully wired` with globally unique `bases[]`.

### 8.21 Native American languages acquired by children – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-native-american-languages-acquired-by-children-seed.json`
- **Title:** `Wikipedia: List of Native American languages acquired by children – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_Native_American_languages_acquired_by_children>
- **Scope:** Seed subset of Native American languages that still have documented child acquisition, drawn from the corresponding Wikipedia list (Navajo, Cherokee, Cree, Ojibwe, Inuktitut, Guarani, Quechua, Aymara, Mapudungun, Nahuatl).
- **Primary families / regions touched:** North and South American indigenous families (Athabaskan, Algonquian, Inuit-Yupik, Uto-Aztecan, Quechuan, Aymaran, Mapuche, Tupi-Guarani), overlapping with the Indigenous Americas coverage in §8.5 and the regional Americas bases in §2.11.

- **Status tier:** **Complete** – all seed items currently have catalog and mixer-map wiring with unique base sets.
- **Last run:** 2025-12-10

-- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 10
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-native-american-languages-acquired-by-children-seed.json`

- **Notes / next steps:**
  - Keep this list in sync with any future changes to the Americas coverage in §2.11 and the Indigenous Americas JSON in §8.5; if additional child-acquired languages are added to the Wikipedia list and the catalog, extend this seed JSON and re-run coverage so the snapshot remains accurate.

### 8.22 Official languages by country and territory – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-list-official-languages-by-country-seed.json`
- **Title:** `Wikipedia: List of official languages by country and territory – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_official_languages_by_country_and_territory>
- **Scope:** Seed subset of globally important **official languages** drawn from the country/territory table (English, French, Spanish, Arabic, Russian, Mandarin Chinese, Portuguese, German, Hindi, Bengali, Malay, Swahili).
- **Primary families / regions touched:** Global macro-families with strong official status across multiple states (Indo-European, Afroasiatic, Sinitic, Austronesian, etc.); overlaps heavily with the native-speaker and total-speakers seeds in §8.2–§8.3 and §8.20.

- **Status tier:** **Complete for current seed set** – all tracked official-language seeds now have catalog entries, mixer-map wiring, and unique base signatures.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 12
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 12
  - `clustered bases:` 0

- **How to re-run coverage:**
- **Primary families / regions touched:** Indo-European branches across Europe and South Asia (Germanic, Romance, Slavic, Indo-Aryan, Iranian, Celtic), overlapping with many other regional and global seed lists in §8.

- **Status tier:** **Complete for current seed set** – all tracked Indo-European seeds now have catalog entries, mixer-map wiring, and unique base signatures.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 24
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 24
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-indo-european-languages-seed.json`

- **Notes / next steps:**
  - Future Indo-European coverage changes (adding new standards or dialect groups) should extend this seed JSON and re-run coverage so the snapshot remains accurate.
- **Source:** <https://en.wikipedia.org/wiki/List_of_Afroasiatic_languages>
- **Scope:** Seed subset of Afro-Asiatic languages drawn from the broader family list (Arabic macro-lects, Ethio-Semitic standards, Cushitic and Chadic representatives, Berber/Kabyle, and Hebrew).
- **Primary families / regions touched:** Afro-Asiatic branches across North Africa, the Horn of Africa, the Sahel, and the Levant (Semitic, Cushitic, Chadic, Berber), complementing the African regional lists in §8.1 and the West Asia list in §8.8.

- **Status tier:** **Complete for current seed set** – all tracked Afro-Asiatic seeds now have catalog entries, mixer-map wiring, and unique base signatures.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 12
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 12
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-afro-asiatic-languages-seed.json`

- **Notes / next steps:**
  - Add or refine mixer-map entries for Maghrebi Arabic and Hebrew so they no longer appear as `missing map`, and add an `iso` field for Levantine Arabic so it resolves cleanly to the correct catalog entry instead of staying `unmatched`.

### 8.25 Austronesian languages – language-level snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-austronesian-languages-seed.json`
- **Title:** `Wikipedia: List of Austronesian languages – language-level snapshot`
- **Source:** <https://en.wikipedia.org/wiki/List_of_Austronesian_languages>
- **Scope:** Language-level snapshot of Austronesian languages from the list page, including all Austronesian official languages (sovereign states and territories) and all Austronesian languages with at least 3 million native speakers (Malay/Indonesian standards, Javanese, Sundanese, Madurese, Minangkabau, Tagalog/Filipino, Cebuano, Ilocano, Hiligaynon, Malagasy, Batak, Bugis, Bikol, Banjar, Waray, Acehnese, Balinese), while explicitly excluding the separate "Dialects of major Austronesian languages" and "Creoles and pidgins based on Austronesian languages" subsections, which are tracked via other JSONs.
- **Primary families / regions touched:** Maritime Southeast Asia and the Pacific (Malay/Indonesian, Philippine, and Oceanic branches, plus Micronesian and Polynesian representatives), complementing the South/Southeast Asia and Oceania regional lists in §8.4, §8.6, and §8.10.

- **Status tier:** **In progress (language-level snapshot)** – core Austronesian standards in the snapshot are fully wired, but several additional languages are still catalog-only or lack `iso` wiring.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 26
  - `missing catalog:` 0
  - `missing map:` 4
  - `missing both:` 0
  - `unmatched:` 12
  - `ambiguous:` 0
  - `unique bases:` 26
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-austronesian-languages-seed.json`

- **Notes / next steps:**
  - Add mixer-map entries for **Filipino** (`filipino`), **Chamorro** (`chamorro`), **Acehnese** (`ace`), and **Balinese** (`ban`) so they no longer appear as `missing map`, giving each a globally unique Austronesian `bases[]` array consistent with the existing Malay/Indonesian, Philippine, and Micronesian/Oceanic mappings.
  - For the remaining `unmatched` items (**Malaysian Malay**, **Gilbertese**, **Tetum**, **Carolinian**, **Cook Islands Maori**, **Kanak**, **Sonsorolese**, **Tobian**, **Batak**, **Bugis**, **Banjar**, **Waray**), either add corresponding entries to `config/language-mixes.json` with appropriate `iso` codes and metadata or consciously treat them as future coverage debt; after any additions, re-run coverage and update the snapshot so the JSON remains a faithful 1:1 language-level mirror of the Wikipedia list.

### 8.26 Mayan languages – language-level snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-mayan-languages-seed.json`
- **Title:** `Wikipedia: List of Mayan languages – language-level snapshot`
- **Source:** <https://en.wikipedia.org/wiki/List_of_Mayan_languages>
- **Scope:** Language-level snapshot of the Mayan family from the list page, including all named Mayan languages in the main "Languages" section (Yucatec Maya, K'iche', Kaqchikel, Q'eqchi', Mam, Q'anjob'al, Tzeltal, Tzotzil, Chol, Poqomchi', Poqomam, Itza', plus Achi, Akatek, Awakatek, Chicomuceltec, Chontal, Chuj, Ch'olti', Ch'orti', Coxoh, Ixil, Jakaltek, Lacandon, Mocho', Mopan, Sakapultek, Sipakapense, Tektitek, Tenek, Tojol-ab'al, Tz'utujil, and Uspantek).
- **Primary families / regions touched:** Mayan branch of the Americas (Mesoamerica and surrounding regions), complementing the Indigenous Americas and South America lists in §8.5 and §8.16.

- **Status tier:** **In progress (language-level snapshot)** – the core 12 Mayan standards used in the original seed are fully wired; the additional languages from the full list are currently catalog-unbacked and show up as unmatched names.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 12
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 21
  - `ambiguous:` 0
  - `unique bases:` 12
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-mayan-languages-seed.json`

- **Notes / next steps:**
  - The 12 fully wired Mayan languages already have catalog entries, mixer-map wiring, and unique base signatures. For the remaining 21 unmatched languages (Achi, Akatek, Awakatek, Chicomuceltec, Chontal, Chuj, Ch'olti', Ch'orti', Coxoh, Ixil, Jakaltek, Lacandon, Mocho', Mopan, Sakapultek, Sipakapense, Tektitek, Tenek, Tojol-ab'al, Tz'utujil, Uspantek), either add corresponding catalog entries with appropriate `iso` codes and metadata or treat them as future coverage debt; after any additions, re-run coverage and update the snapshot so this JSON remains a faithful 1:1 language-level mirror of the Wikipedia list.

### 8.27 Mongolic languages – language-level snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-mongolic-languages-seed.json`
- **Title:** `Wikipedia: Mongolic languages – language-level snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Mongolic_languages>
- **Scope:** Language-level snapshot of the contemporary Mongolic languages from the classification section (Dagur, Khamnigan Mongol, Buryat, Mongolian, Ordos, Kalmyk, Oirat, Shira Yugur, Shirongol, Monguor, Mongghul, Mangghuer, Baoanic, Bonan, Santa/Dongxiang, Kangjia, Moghol), excluding the separate mixed Sinitic–Mongolic languages (Tangwang, Wutun) which are tracked elsewhere.
- **Primary families / regions touched:** Mongolic branch across Central and Northeast Asia (Dagur, Central Mongolic, Southern Mongolic/Shirongolic, Baoanic), complementing the Asia-wide and Russia seeds in §8.15–§8.17 and the East Asian seed in §8.19.

- **Status tier:** **In progress (language-level snapshot)** – a core subset of Mongolic languages are fully wired, but many Southern/Shirongolic and Dagur/Ordos varieties are still catalog-only with no mixer-map entries.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 7
  - `missing catalog:` 0
  - `missing map:` 8
  - `missing both:` 2
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 7
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-mongolic-languages-seed.json`

- **Notes / next steps:**
  - Add or refine mixer-map entries for **Dagur** (`dagur`), **Ordos** (`ordos`), **Shira Yugur** (`shira-yugur`), **Monguor** (`monguor`), **Mongghul** (`mongghul`), **Mangghuer** (`mangghuer`), **Kangjia** (`kangjia`), and **Moghol** (`moghol`) so they no longer appear as `missing map`, giving each a unique Mongolic `bases[]` combination consistent with the existing Mongolian/Oirat/Kalmyk/Dagur/Shirongolic palette.
  - For **Shirongol** (`shirongol`) and **Baoanic** (`baoanic`), which are currently `missing both`, either add corresponding catalog entries in `config/language-mixes.json` (with appropriate metadata tying them into the Shirongolic/Baoanic subgroups) or treat them as future coverage debt; after any additions and new mappings, re-run coverage and update this snapshot so the Mongolic JSON remains a faithful 1:1 language-level mirror of the Wikipedia classification.

### 8.28 Oto-Manguean languages – language-level snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-oto-manguean-languages-seed.json`
- **Title:** `Wikipedia: List of Oto-Manguean languages – language-level snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Oto-Manguean_languages>
- **Scope:** Language-level snapshot of the major Oto-Manguean branches highlighted in the article (Central Zapotec, Isthmus Zapotec, Sierra Juarez Zapotec, Mixtec, Trique, Amuzgo, Mazatec, Chinantec, Otomi, Matlatzinca), treated here as 10 macro-languages rather than the full dialect-level grid.
- **Primary families / regions touched:** Oto-Manguean branch of Mesoamerica, complementing the Mayan snapshot and the Indigenous Americas lists in §8.5 and §8.16.

- **Status tier:** **Fully wired (language-level snapshot)** – all 10 macro Oto-Manguean branches in this snapshot now have catalog entries and mixer-map wiring.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 7
  - `clustered bases:` 3

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-oto-manguean-languages-seed.json`

- **Notes / next steps:**
  - If you later refine this snapshot from macro-branches to individual ISO-level languages, extend or split the JSON items accordingly, then re-run coverage and base-uniqueness so each new entry gains catalog presence and an Oto-Manguean-appropriate `bases[]` array consistent with its branch (Zapotec, Mixtec, Mazatec, Otomi, etc.).

### 8.29 Tungusic languages – language-level snapshot

- **JSON file:** `tools/mixer-meta/wikipedia-tungusic-languages-seed.json`
- **Title:** `Wikipedia: Tungusic languages – language-level snapshot`
- **Source:** <https://en.wikipedia.org/wiki/Tungusic_languages>
- **Scope:** Language-level snapshot of the Tungusic classification page: includes each Tungusic language explicitly listed in the article (Evenki, Even, Negidal, Oroqen, Kili, Oroch, Udege, Nanai, Orok, Ulch, Manchu, Xibe, Jurchen, Chinese Kyakala, Bala, Alchuka) while intentionally excluding lower-level dialect and subdialect nodes such as regional varieties of Evenki or Nanai.
- **Primary families / regions touched:** Tungusic branch across Siberia, Manchuria, and the Russian Far East, complementing the Mongolic and Russia seeds in §8.17 and §8.27 and the East Asian seed in §8.19.

- **Status tier:** **Fully wired (language-level snapshot)** – all 16 Tungusic languages in the classification snapshot now have catalog entries and mixer-map `bases[]` arrays.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 16
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 16
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-tungusic-languages-seed.json`

- **Notes / next steps:**
  - Tungusic is now fully represented in the mixer (catalog + map) as a language-level snapshot of the classification page, with globally unique Tungusic-anchored `bases[]` arrays centered on base 380 and appropriate East Asian neighbors. Future work here is mostly qualitative (seed tuning, `min/max/d` calibration, and race coverage checks) rather than structural wiring.

### 8.30 Turkic languages – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-turkic-languages-seed.json`
- **Title:** `Wikipedia: List of Turkic languages – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/Turkic_languages>
- **Scope:** Seed subset of Turkic languages drawn from the broader family list (Turkish, Azerbaijani, Kazakh, Uzbek, Kyrgyz, Turkmen, Tatar, Bashkir, Uyghur, Chuvash).
- **Primary families / regions touched:** Turkic branch across Anatolia, Central Asia, and the Volga–Ural region, complementing the West Asia, Russia, and Asia-wide seeds in §8.8, §8.15–§8.17.

- **Status tier:** **Fully wired** – all 10 seed items now have catalog entries and dedicated Turkic bases in the mixer map.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 7
  - `clustered bases:` 3

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-turkic-languages-seed.json`

- **Notes / next steps:**
  - Turkic seeds are now fully represented in the mixer (catalog + map) with dedicated single-base Turkic entries for Turkish, Azerbaijani, Kazakh, Uzbek, Kyrgyz, Turkmen, Tatar, Bashkir, Uyghur, and Chuvash. Future work is mostly qualitative (seed lists, `min/max/d` tuning, and race coverage checks) rather than structural wiring.

### 8.31 Uralic languages – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-uralic-languages-seed.json`
- **Title:** `Wikipedia: List of Uralic languages – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/Uralic_languages>
- **Scope:** Seed subset of Uralic languages drawn from the broader family list (Finnish, Estonian, Karelian, Northern Sami, Erzya, Moksha, Komi, Udmurt, Mari, Hungarian).
- **Primary families / regions touched:** Uralic branches across Northern and Eastern Europe (Finnic, Sami, Mordvinic, Permic, Mari, Ugric), complementing the Europe and Russia seeds in §8.7 and §8.17 and the Uralic notes in §2.x.

- **Status tier:** **Fully wired** – all 10 seed items now have catalog entries and mixer-map `bases[]` arrays; the only shared base-set is the historically sanctioned base‑9 Finnic/Volgaic cluster.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 3
  - `clustered bases:` 4

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-uralic-languages-seed.json`

- **Notes / next steps:**
  - Add or refine a mixer-map entry for Karelian so it no longer appears as `missing map`, and add `iso` fields (with matching catalog entries) for Komi and Mari so they resolve cleanly instead of remaining `unmatched`.
  - Treat the base‑9 Finnic/Volgaic cluster (Finnish, Estonian, Erzya, Moksha, etc.) as a **documented historical exception** per §2.x and the Uralic notes, while keeping other shared-base clusters flagged here on the usual uniqueness‑debt list.

### 8.32 Dictionary word-count languages – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-by-dictionary-word-count-seed.json`
- **Title:** `Wikipedia: List of languages by number of words according to authoritative dictionaries – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_words_according_to_dictionaries>
- **Scope:** Seed subset of languages from the dictionary word-count list, focusing on major standards with large authoritative dictionaries across multiple families (English, German, Russian, French, Spanish, Italian, Chinese, Japanese, Arabic, Turkish).
- **Primary families / regions touched:** Global macro-families (Indo-European, Sinitic, Japonic, Afroasiatic, Turkic), providing a typological lens on lexical inventory size rather than direct coverage drivers.

- **Status tier:** **Fully wired** – all 10 seed items now have catalog entries and mixer-map `bases[]` arrays.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 10
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-by-dictionary-word-count-seed.json`

- **Notes / next steps:**
  - Dictionary word-count seeds are now fully represented in the mixer (catalog + map). Future work here is mostly qualitative (ensuring base choices and length/duplication settings feel right for each language) rather than structural wiring.

### 8.36 English-based pidgins – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-list-english-based-pidgins-seed.json`
- **Title:** `Wikipedia: List of English-based pidgins – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_English-based_pidgins>
- **Scope:** Seed subset of English-based pidgins drawn from the corresponding Wikipedia list (Tok Pisin, Bislama, Nigerian Pidgin, Krio, Hawaiian Pidgin, Singlish, Jamaican Patois, Cook Islands Māori Pidgin).
- **Primary families / regions touched:** English-lexifier contact varieties across the Pacific, Atlantic, and Africa (Tok Pisin, Bislama, Krio, Jamaican Patois, Nigerian Pidgin, etc.), complementing the broader creole/mixed/pidgin seed in §8.13.

- **Status tier:** **Fully wired** – all 8 seed items now have catalog entries and mixer-map `bases[]` arrays.
  - English-based pidgin seeds are now fully represented in the mixer (catalog + map) with distinct English-plus-contact `bases[]` mixes for each variety (Pacific, West African, Caribbean, and Singapore). Future work here is mostly qualitative (reviewing base choices and `min/max/d` tuning, and race coverage) rather than structural wiring.

### 8.33 Phoneme-count languages – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-languages-by-phoneme-count-seed.json`
- **Title:** `Wikipedia: List of languages by number of phonemes – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_languages_by_number_of_phonemes>
- **Scope:** Seed subset of languages from the phoneme-count list, sampling extremes and mid-range systems (Rotokas, Pirahã, Hawaiian, Japanese, Spanish, English, German, Russian, Mandarin Chinese, Taa).
- **Primary families / regions touched:** Global cross-family sample (Papuan, Austronesian, Japonic, Indo-European, Afroasiatic, etc.), intended primarily as a typological reference for future phonology-aware tuning rather than a direct coverage driver.

- **Status tier:** **Fully wired** – all 10 seed items now have catalog entries and mixer-map `bases[]` arrays.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 10
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-by-phoneme-count-seed.json`

- **Notes / next steps:**
  - Phoneme-count seeds are now fully represented in the mixer (catalog + map) with globally unique `bases[]` arrays for each language. Future work here is mostly qualitative (reviewing base choices and `min/max/d` tuning, and race coverage) rather than structural wiring.
  - Add `iso` fields (with matching catalog entries) for Rotokas and Pirahã so they no longer appear as `unmatched`, then re-run coverage to confirm that all items are `fully wired` with globally unique `bases[]`.

### 8.34 Mutually intelligible languages – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-mutually-intelligible-languages-seed.json`
- **Title:** `Wikipedia: List of mutually intelligible languages – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_mutually_intelligible_languages>
- **Scope:** Seed subset of mutually intelligible standards drawn from the broader list (Swedish, Norwegian, Danish, Czech, Slovak, Serbian, Croatian, Hindi, Urdu, Portuguese), used as a qualitative check on where bases or mixes might reasonably be shared or closely related.
- **Primary families / regions touched:** Germanic and Slavic branches of Indo-European plus Hindustani and Lusophone standards, overlapping with European and South Asian coverage elsewhere in §2.x and §8.

- **Status tier:** **Fully wired** – all 10 seed items now have catalog entries and mixer-map `bases[]` arrays.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 10
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-mutually-intelligible-languages-seed.json`

- **Notes / next steps:**
  - Treat the shared base cluster among Swedish (`swe`), Norwegian (`norwegian`), and Danish (`danish`) as a deliberately documented case of near‑mutual intelligibility, and use this list as a guardrail when deciding whether to keep or split shared bases among closely related standards in other families.

### 8.35 Official languages by institution – seed subset

- **JSON file:** `tools/mixer-meta/wikipedia-list-official-languages-by-institution-seed.json`
- **Title:** `Wikipedia: List of official languages by institution – seed subset`
- **Source:** <https://en.wikipedia.org/wiki/List_of_official_languages_by_institution>
- **Scope:** Seed subset of institution-level official languages drawn from the article (UN, EU, AU, etc.), focusing on globally central standards (English, French, Spanish, Arabic, Russian, Chinese, German, Portuguese, Italian, Japanese).
- **Primary families / regions touched:** Global macro-families with strong institutional presence (Indo-European, Sinitic, Afroasiatic, etc.), overlapping with the country/territory seed in §8.22 and the speaker-count seeds in §8.2–§8.3 and §8.20.

- **Status tier:** **Fully wired** – all 10 seed items now have catalog entries and mixer-map `bases[]` arrays.
- **Last run:** 2025-12-10

- **Snapshot from last run (all list items):**
  - `fully wired:` 10
  - `missing catalog:` 0
  - `missing map:` 0
  - `missing both:` 0
  - `unmatched:` 0
  - `ambiguous:` 0
  - `unique bases:` 10
  - `clustered bases:` 0

- **How to re-run coverage:**
  - `node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-list-official-languages-by-institution-seed.json`

- **Notes / next steps:**
  - Official-languages-by-institution seeds are now fully represented in the mixer (catalog + map). Future work here is mostly qualitative (ensuring base choices and `min/max/d` tuning feel right, and checking race coverage) rather than structural wiring.
