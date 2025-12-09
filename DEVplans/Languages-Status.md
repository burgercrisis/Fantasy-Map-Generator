# Language System Status – Markov & Mixer

_Last updated: WIP pass with blended Markov and mixer tooling_

This document captures where the language system work currently stands so this project can be picked up later without re‑reverse‑engineering everything.

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
- No changes applied so far.

### 2.6 Slavic / East-European cluster

Representative mapping status (via `profile-language-mixes`):

- `rus` (Russian): family *East Slavic*, category *Slavic* → base **5 (Slavic/Ruthenian)**. This is the intended generic Slavic base and is reasonable.
- `pol` (Polish): family *Lechitic* → base now **5 (Slavic/Ruthenian)**; it previously also had a stray mapping to base 19 (Inuit).
- `bul` (Bulgarian): family *Eastern South Slavic* → base now **5 (Slavic/Ruthenian)**; it previously also had a stray mapping to base 23 (Mesopotamian).
- `srp` (Serbian): family *Western South Slavic* → base now **5 (Slavic/Ruthenian)**; it previously also had a stray mapping to base 24 (Iranian).

Takeaway:

- Russian, Polish, Bulgarian, and Serbian are now all anchored on the shared Slavic base `5`.
- This is an intentional **quick stopgap**; they still need a dedicated pass to:
  - introduce at least one West Slavic / Lechitic base and one South Slavic base, and
  - update `language-mixer-map.json` so Slavic ISOs no longer all share a single base.

### 2.7 East Asia (Sinitic / Japonic / Koreanic & neighbors)

Representative bases / mappings (via `profile-language-mixes`):

- **Chinese / Mandarin**:
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

---

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
  - Beyond the core Ruthenian / Hungarian / Baltic pieces already encoded, we haven’t deeply checked each base’s `min/max/d` versus seeds or reviewed mixer mappings.
- **South Asian (Indo-Aryan, Dravidian, related)**
  - Need a pass over Hindi/Urdu, Bengali, Marathi, Gujarati, Punjabi, Tamil, Telugu, Kannada, Malayalam, etc., and their creoles.
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
