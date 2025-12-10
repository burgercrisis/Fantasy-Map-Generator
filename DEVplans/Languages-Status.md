# Language System Status – Markov & Mixer
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

_Last updated: WIP pass with blended Markov and mixer tooling_

This document captures where the language system work currently stands so this project can be picked up later without re‑reverse‑engineering everything. It assumes the core design goal that each language ultimately has its own linguistically and regionally appropriate base or tuned mix in the namebase/mixer layer; [Races & Languages – System Rules §1.3](Races-Languages-Rules.md#13-language-base-uniqueness-intent) describes how that goal is consumed on the race side.

### Section index

- [1. Infrastructure status](#1-infrastructure-status)
- [2. Families / bases already reviewed](#2-families--bases-already-reviewed)
- [3. Not-unique-enough clusters (current suspects)](#3-not-unique-enough-clusters-current-suspects)
- [4. Work not yet done / future passes](#4-work-not-yet-done--future-passes)
- [5. Planned next steps when resuming](#5-planned-next-steps-when-resuming)
- [6. Quick checklist for whoever picks this up](#6-quick-checklist-for-whoever-picks-this-up)
- [7. Planned tooling extensions (Markov, similarity, and UX helpers)](#7-planned-tooling-extensions-markov-similarity-and-ux-helpers)

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

For a full index of helper scripts and workflows, see [tools/HELPER-TOOLS.md](../tools/HELPER-TOOLS.md).

---

## 2. Families / bases already reviewed

This section summarizes families where we have done at least a **first pass**: checking seed lengths vs config, reviewing duplication rules, and eyeballing overall behavior.

### 2.1 Romance cluster (core Azgaar + extensions)

Representative bases:
- **Italian** (`i:3`), **Castilian/Spanish** (`i:4`), **Portuguese** (`i:13`), **French** (`i:2`), **Roman** (`i:8`), **Occitan** (`i:232`), **Sardinian** (`i:233`), **Neapolitan** (`i:306`), etc.

Status:
- Length ranges (`min/max`) broadly match seed distributions; most are already quite tight around their medians.
- Duplication patterns reflect Romance flavors reasonably (e.g. French allowing `nlrs` doubles, Italian `cltr`).
- Many Romance dialects and offshoots in `language-mixer-map` map back onto the same few bases (Spanish, Portuguese, French, Italian, Occitan, Sardinian, Neapolitan). This is **intended** to some extent, but reduces fine-grained uniqueness between closely-related dialects.

Takeaway:
- Core Romance macro-family is in **good shape** for fantasy-mapping use.
- If needed, we can later split e.g. **Latin vs modern Romance** more cleanly, or add a second Spanish/Portuguese base if they feel too samey across regions.

### 2.2 Uralic / Finnic cluster

Representative base:
- **Finnic** (`i:9`) – used for Finnish, Karelian, Veps, Sámi relatives, etc.

Status:
- Seed and config length bands align; names fall in expected 5–11 range.
- Duplication rule `d:"akiut"` is already tuned to preserve characteristic geminates.
- Mixer map shows base `9` reused across multiple Uralic branches and even some neighboring contact zones.

Takeaway:
- `i:9` currently acts as a **macro-Finnic / generic Uralic** base.
- We explicitly accepted this as a **macro-family anchor**, not a bug, but it reduces differentiation across Uralic sub-branches.
- Future enhancement: introduce **one or two additional Uralic bases** (e.g. East Uralic vs Finnic) if we want sharper internal contrast.

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

Takeaway:
- Semitic macro-family is **serviceable**; names feel distinct from Indo-European clusters.
- Arabic and Mesopotamian act as broad central anchors for many related ISOs in the mixer.

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

### 2.7 East Asia (Sinitic / Japonic / Koreanic & neighbors)

Representative bases / mappings (via `profile-language-mixes`):

- **Chinese / Mandarin**:
  - `iso: mandarin` → base **11 (Chinese)**.
  - `iso: mandarin` 
 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0  a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0 a0" → base **11 (Chinese)**.
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
- Dravidian currently leans on a small set of **macro-family bases** (Tamil 199, Telugu 200, Kannada 254, Malayalam 255) reused across many lects; this is acceptable as a first-pass but limits fine-grained uniqueness between Dravidian varieties.
- Initial tuning on **Tamil (199)** (raising `min` from `4` to `5`) ensures generated names better reflect the observed Tamil length distribution while maintaining the existing macro-hub behavior.
- Future passes should consider:
  - introducing additional Dravidian bases for major subgroups (e.g. Gondi-like cluster vs generic Telugu; select Malayalam-based minorities vs core Malayalam),
  - and tightening length and duplication settings per base once more targeted seeds are available.

### 2.10 Lexifier-based creoles (English / French / Portuguese)

Representative bases / mappings (via `profile-language-mixes`):

- **English-based creoles**:
  - **West African**: `nigerian-pidgin`, `pichinglis`, `west-african-pidgin-english` 																																																																																																																																																																																																																																																																																																																																										 																																																																																																																																																																																																																																								 																																																														 																																																														 																																																														 																																																								 	→ base **307 (West African English Creole)**.
  - **Caribbean**: `bahamian-creole`, `bajan-creole`, `belizean-creole`, `trinidadian-creole`, `tobagonian-creole`, `saint-kitts-creole`, `vincentian-creole`, `virgin-islands-creole`, `turks-and-caicos-creole`, `san-andres-providencia-creole`, `rama-cay-creole` → bases **259 (Jamaican Creole)** and **308 (Caribbean English Creole)**.
  - **Pacific**: `tok-pisin` → base **263 (Tok Pisin)**; `pijin`, `ngatikese-creole`, `pitcairn-norfolk`, `singlish`, `torres-strait-creole` → base **309 (Pacific English Creole)**.
  - **Suriname / Guianas**: `sranan-tongo`, `saramaccan`, `ndyuka` → base **291 (Sranan)**.

- **French-based creoles**:
  - **Caribbean / Americas**: `antillean-creole`, `dominican-creole-french`, `french-guianese-creole`, `grenadian-creole-french`, `karip-na-french-creole`, `louisiana-creole`, `saint-lucian-creole` → base **258 (Haitian Creole)**.
  - **Indian Ocean**: `agalega-creole`, `chagossian-creole`, `rodriguan-creole` → base **261 (Mauritian Creole)**; `bourbonnais-creole`, `r-union-creole`, `tayo-creole` → base **262 (Seychellois Creole)**.

- **Portuguese-based creoles**:
  - **Upper Guinea / Gulf of Guinea**: `guinea-bissau-creole`, `fogo-creole`, `santiago-creole`, `santo-ant-o-creole`, `s-o-nicolau-creole`, `s-o-vicente-creole`, `sotavento-creoles`, `forro-creole`, `principense-creole` → base **260 (Cape Verdean Creole)**.
  - **Caribbean**: `papiamento` → base **264 (Papiamento)**.

Takeaway:

- English-, French-, and Portuguese-based creoles no longer ride directly on lexifier bases **1 (English)**, **2 (French)**, or **13 (Portuguese)**.
- Instead they use **dedicated creole bases** (259, 291, 307–309, 258, 260–262, 264) with length bands and punctuation tuned to creole city / place-name seeds, giving much stronger regional flavor and reducing hub overuse.

### 2.11 Americas (indigenous & contact zones)

Representative bases / mappings (via `profile-language-mixes`):

- **Mesoamerican & Andean anchors**:
  - **Nahuatl**: `nah` / related Uto-Aztecan lects → base **14 (Nahuatl)**, seeds `min=6, max=14, mean≈9.1`, config `6–13` with p25–p75 ≈ `8–10`.
  - **Quechua**: `que`, `southern-quechua` → base **27 (Quechua)**, seeds `min=4, max=15, mean≈8.3`, config `6–12`, central `6–10` region well covered.
  - **Mapudungun**: `mapudungun` → base **178 (Mapudungun)**, seeds `min=5, max=10, mean≈7.1`, config `4–12` around p25–p75 ≈ `6–8`.
  - **Tikuna**: `tikuna` → base **189 (Tikuna)**, seeds `min=5, max=18, mean≈11.1`, config `4–12`, with long but acceptable tails (p25–p75 ≈ `9–13`).

- **North American macro-families**:
  - **Algic / Algonquian**: `cree`, `ojibwe`, `wiyot`, `yurok` → bases **186 (Cree)** and **187 (Ojibwe)** in various blends; seeds center around `8–12` with config `4–12` capturing the core.
  - **Na-Dene**: `navajo` → base **172 (Navajo)**; `tlingit` → base **220 (Tlingit)**; meta-entry `na-dene` now blends **172 + 220** instead of incorrectly using **19 (Inuit)**.
  - **Salishan**: `salish` → base **222 (Salish)**, seeds `min≈4, max≈14, mean≈8.0`, config `4–12` (p25–p75 ≈ `7–9`).

- **Uto-Aztecan macro-hub**:
  - **Huichol / Yaqui cluster**: `huichol` → base **190 (Huichol)**, `yaqui` → base **191 (Yaqui)**; related lects such as `ute`, `shoshoni`, `oodham`, `pima-bajo`, `southern-tepehuan`, `tarahumara` map onto **190/191** or blends with **14 (Nahuatl)**. These act as intentional macro-family anchors rather than generic European hubs.

- **Other indigenous bases**:
  - **Guarani / Xocó**: `guarani` → base **173 (Guarani)`; `xoc-` (Xocó) → base **173** as well, forming an Arawakan/Tupi-Guarani-flavored macro cluster.
  - **Cherokee**: `cherokee` → base **192 (Cherokee)**, seeds `min≈5, max≈15, mean≈9–10` with config `4–12`.
  - **Wayuu**: `wayuu` → base **177 (Wayuu)** (previous stray mapping to **27 (Quechua)** removed), seeds `min=6, max=18, mean≈10.1`, config `4–12`, flags `hyphen`.

Takeaway:

- Core American indigenous families now use **dedicated or clearly related macro-family bases** (14, 27, 172, 178, 186–187, 189, 190–191, 192, 222, 173, 177) instead of generic European hubs.
- The **Na-Dene** meta-entry has been remapped from Inuit **19** to a more appropriate **Navajo (172) + Tlingit (220)** blend, and **Wayuu** no longer collapses onto Quechua 27.
- Remaining macro hubs in the Americas (e.g. Huichol/Yaqui for Uto-Aztecan, Cree/Ojibwe for Algic/Algonquian) are **intentional macro-family anchors**, not clear mismatches, and can be split further only if we want finer-grained intra-family contrast.

### 2.12 Papuan & Pacific Austronesian (second-pass)

Representative bases / mappings (via `profile-language-mixes`):

- **Papuan macro-family and sub-bases**:
  - **Papuan macro**: base **360 (Papuan)** – a real-world Papuan anchor seeded with highlands towns (Tari, Mendi, Goroka, Kainantu, etc.) and used by meta-entries such as `papuan-family`, `trans-new-guinea`, and other Papuan macros alongside contact lexifiers.
  - **Engan cluster**: base **365 (Engan Papuan)** – seeded from Enga Province towns (Wabag, Wapenamanda, Laiagam, Kompiam, Porgera, etc.); `engan-languages` now maps to **[365, 195]** (Engan Papuan + Malay) instead of riding only on Malay 195.
  - **Dani / Baliem cluster**: base **366 (Dani Papuan)** – seeded from Baliem Valley / Dani-region towns (Wamena, Kurima, Bokondini, Karubaga, Tiom, Ninia, Yiwika, etc.); `dani`, `grand-valley-dani`, `hupla`, `nduga`, `nggem`, `silimo`, `walak`, `wano`, and `yali` now map to **[366, 263]** (Dani Papuan + Tok Pisin) instead of pure Tok Pisin 263.

- **Eastern Indonesian Austronesian**:
  - **Eastern Indonesian**: base **367 (Eastern Indonesian)** – seeded from Sulawesi and Nusa Tenggara towns (Makassar, Manado, Kendari, Maumere, Ende, Kupang, Waingapu, Labuan Bajo, etc.).
  - The following Austronesian macros, previously pure **194 (Indonesian)**, now blend **[367, 194]**: `tomini-tolitoli`, `south-sulawesi`, `central-south-sulawesi`, `saluan-banggai`, `kaili-wolio`, `makassar-branch`, `muna-buton`, `seko-badaic`, `bima`, `sumba-flores`, `flores-lembata`, and `selaru`. Neighboring macros such as `bungku-tolaki`, `northern-south-sulawesi`, `kei-tanimbar`, and `kowiai` remain on pure 194 for now.

- **Vanuatu / Solomons (Southern Melanesia)**:
  - **Melanesian Vanuatu**: base **368 (Melanesian Vanuatu)** – seeded from Vanuatu and nearby Melanesian towns (Port Vila, Luganville, Isangel, Lenakel, Auki, Honiara, Gizo, Munda, Tulagi, etc.).
  - Vanuatu- and Solomons-related macros `vanuatu`, `north-vanuatu`, `central-vanuatu`, `south-vanuatu`, `temotu`, and `southeast-solomonic` now use **[368, 197, 198]** (Melanesian Vanuatu + Samoan 197 + Fijian 198) instead of pure `[197, 198]`.

- **Micronesia & Central Pacific hubs**:
  - **Micronesian**: base **369 (Micronesian)** – seeded from Micronesian / Marshallese / Kiribati / Marianas / Palauan towns (Palikir, Kolonia, Majuro, Tarawa, Saipan, Tinian, Koror, Ngerulmud, etc.); the `micronesian` macro now blends **[369, 198]** instead of pure 198.
  - **Central Pacific**: base **370 (Central Pacific)** – seeded from Samoa, Tonga, and French Polynesia (Apia, Nuku'alofa, Papeete, Faaa, Uturoa, Taiohae, etc.); the `central-pacific` macro now uses **[370, 197, 198]** instead of just `[197, 198]`.

- **New Caledonia / Loyalty Islands**:
  - **New Caledonia**: base **371 (New Caledonia)** – seeded from New Caledonian and Loyalty Islands towns (Noumea, Dumbea, Kone, Koumac, Poindimie, Lifou, We, Mare, Tadine, Ouvea, Fayaoue, etc.).
  - The `loyalties-new-caledonia` macro now uses **[371, 197, 198]**, providing a region-specific Melanesian flavor layered with Samoan/Fijian lexifier influence.

Takeaway:

- Papuan languages no longer ride purely on **Malay 195** or **Tok Pisin 263**, nor on unrelated Slavic or click bases; instead they use a dedicated Papuan macro base **360** and sub-bases **365 (Engan)** and **366 (Dani)** blended with appropriate lexifiers.
- In particular, Papuan macro entries such as `central-south-new-guinea`, `asmat-kamoro`, `greater-awyu`, `bayono-awbono`, `asmat`, and `asmat-citak` have been moved off the Czech–Slovak base **315** onto **360 (Papuan)**; 315 is now reserved for Czech/Slovak only.
- Eastern Indonesian Austronesian macros have moved off generic **Indonesian 194** as a sole base and now share a regional **Eastern Indonesian 367** anchor blended with 194, improving intra-Pacific contrast.
- Vanuatu / Solomons, Micronesian, Central Pacific, and New Caledonian clusters now each have **regional Melanesian / Micronesian / Polynesian bases** (368–371) layered with Samoan/Fijian 197/198, reducing overuse of those hubs as universal oceanic stand-ins.
- These changes keep 194/195/197/198/263 as intentional **lexifier / macro hubs**, but shift much of the stylistic burden onto regional bases that better reflect the actual language families and geographies.

## 3. Not-unique-enough clusters (current suspects)

These are **not necessarily bugs**; many are intentional macro-lexifiers. But they are the main places where stylistic uniqueness is likely to be weak.

### 3.1 High-degree lexifiers in `language-mixer-map`

Based on `check-language-mixer-map-inconsistencies` runs, the following bases show up across many families/regions:

- **Malay (195)**
  - Used across a large swath of **Austronesian + Papuan contact zones** (Alor–Pantar, Greater Awyu, Asmat–Kamoro, etc.).
  - Acts as a general **Malay / trade-lexifier hub**.
- **Tok Pisin (263)**
  - Shared across numerous **Papuan** families; intentionally a contact lingua franca.
- **English (1)**
  - Reused for many **English-based pidgins and creoles** (Caribbean, Africa, Pacific).
- **French (2)** and **Portuguese (13)**
  - Similarly reused for French-/Portuguese-based creoles.
- **Tamil (199)**, **Telugu (200)**, **Bengali (201)**, **Assamese (257)**
  - Multiple Indo-Aryan / Dravidian clusters share these.
- **Other hubs** seen in the sweeps: **Swahili (28)**, **Thai (251)**, **Lao (252)**, **Maori (196)**, **Samoan (197)**, **Fijian (198)**, **Sranan (291)**, **Greenlandic (305)**, **Neapolitan (306)**, **Occitan (232)**, **Sardinian (233)**, **Northern Sami (274)**, **Ainu (275)**, **Buryat (276)**, **Kalmyk (296)**, **Zarma (277)**, **Udmurt (283)**, etc.

Current stance:
- Many of these are **intentionally broad** (lexifiers or macro-family anchors).
- They are likely to produce **similar-feeling names** across related ISOs and should be revisited if we want finer-grained differences between, say, regional dialects or closely related creoles.

### 3.2 Single-base macro-families

- **Uralic (base 9)**
  - Single Finnic/Uralic base covers Finnish, Karelian, Veps, multiple Sámi dialects, and more.
  - Accepted for now as a macro-family choice; uniqueness between Uralic sub-branches is limited.
- **Central Semitic (bases 18, 23, 42)**
  - Arabic / Mesopotamian / Levantine bases underpin many historical and modern Semitic ISOs.
  - Stylistic differences across dialects and historical layers may blur.
- **Romance dialect continuum**
  - Romance dialects (e.g. various regional Spanish, Portuguese, French, Italian varieties) mostly map back to one of a few central bases.
  - Good enough for macro flavor; not unique at fine ISO granularity.

---

## 4. Work not yet done / future passes

The following families / regions have **not yet received a full pass** for home-range, duplication, and mixer-map sanity. They almost certainly hide more “too generic” or “too shared” behavior.

- **Slavic & East European cluster**
  - Mapping and core bases have received a first pass (see **2.6**), but East Slavic splits, Sorbian, and border lects (Podlachian / West Polesian) still need refinement of `min/max/d` and/or dedicated bases.
- **South Asian (Indo-Aryan, Dravidian, related)**
  - Key Indo-Aryan and Dravidian standards now have documented bases and initial length checks (see **2.9**), but many Dravidian lects still sit on a handful of macro-family hubs (199/200/254/255) and Hindi/Bengali/Marathi/Punjabi and related creoles still need dedicated review.
- **Sub-Saharan Africa (Bantu, Atlantic–Congo, Cushitic, Chadic, etc.)**
  - Most bases exist but have not been systematically profiled for script, duplication, or length bands.
  - **East Asia (Sinitic, Japanese, Korean, Mongolic, and neighbors)**
  - Core Sinitic / Japonic / Koreanic standards (Mandarin, Japanese, Korean, Vietnamese, Cantonese) now have dedicated passes and cleaned mixer mappings, but **Mongolic and many smaller regional lects** have not yet been fully profiled for uniqueness, base choice, and length bands.
- **Americas beyond Nahuatl / Quechua / Aymara / Cherokee**
  - Many North and South American families still use “first-draft” bases.
- **Papuan & Austronesian beyond Malay / Tok Pisin / core oceanic Lexifiers**
  - Rich area for future passes; currently very reliant on macro hubs (Malay, Tok Pisin, English).

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

6. **Grow coverage via Wikipedia language lists**
   - After the current backlog of in-progress families and languages documented in this file is finished, continue adding missing languages from Wikipedia’s language lists into `language-mixes.json` / `language-mixer-map.json`.
   - Treat each new language with the same per-language rigor (seed curation, base choice, `min/max/d` tuning, and mixer-map QA); avoid bulk-adding large blocks of languages onto a single hub base without review.

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
