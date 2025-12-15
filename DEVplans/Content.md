# Content – Arcana Unearthed Races
 
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_
 
_Developer-facing notes on all sapient peoples and quasi-races mentioned in Monte Cook’s Arcana Unearthed core rulebook (text extracted under `pdf_splitter/pdfs/Supplements/Arcana Unearthed/textpdf/Arcana_Unearthed`), focusing on which ones we could plausibly model as Fantasy-Map-Generator races._
 
## Table of contents
 
- [0. Scope and sources](#0-scope-and-sources)
- [1. Primary player-character races](#1-primary-player-character-races)
- [2. Transformational / sub-race nuances](#2-transformational--sub-race-nuances)
- [3. Monstrous or antagonist peoples mentioned](#3-monstrous-or-antagonist-peoples-mentioned)
- [4. Summary of viable AU race additions](#4-summary-of-viable-au-race-additions)
- [5. Open decisions for future implementation](#5-open-decisions-for-future-implementation)
- [6. Recommended first implementation slice](#6-recommended-first-implementation-slice)
- [7. Implementation status in this fork](#7-implementation-status-in-this-fork)
 
---
 
## 0. Scope and sources

- **[scope]**
  - Only uses the **core rulebook text chunks** in `.../Arcana_Unearthed/Arcana_Unearthed_p001–p258.txt`.
  - Other AU supplements have empty `textpdf` folders right now, so they are not considered.
  - Goal is **content inventory + feasibility** for future race entries, not implementation.

- **[what counts as a candidate]**
  - Named peoples that are: 
    - **Player-character races** (primary tier).
    - **Named sapient antagonists or peoples** used in examples (secondary tier).
  - Purely mechanical templates or classes (e.g. champions, greenbonds) are **not races** for our generator.

- **[existing race system context]**
  - See `Races-Languages-Rules.md` for the current implementation: `pack.races`, `fantasyRaceBases`, race sets (`classic`, `dark`, `beastfolk`, `underdark`, etc.) and mixer palettes.
  - Here we just flag **where each AU race would slot** into that framework (new race vs reuse vs alias).

---

## 1. Primary player-character races

AU explicitly calls out “the 10 player character races” in Chapter Two: **Humans, Faen (loresong/quickling/spryte), Giants, Litorians, Mojh, Sibeccai, Verrik, Runechildren**.

### 1.1 Humans (Diamond Throne humans)

- **AU role**
  - Baseline majority species of the setting; formerly enslaved by dramojh, now ruled/protected by giants.
  - Religiously and culturally diverse; explicitly **non-exotic** on the fantasy scale.
- **FMG status**
  - We already have a **Human** race wired via `fantasyRaceBases`.
- **Candidate action**
  - **No new race needed.** Treat Diamond Throne humans as **flavor for human cultures**, not a distinct race.
  - Optional: add an AU-specific **culture pack** later (giant-ruled human kingdoms), but that is outside this race report.

### 1.2 Faen umbrella (loresong, quickling, spryte)

- **AU role**
  - Tiny / small feylike folk; the text explicitly uses **Faen** as a catch-all term for at least **three kinds**:
    - **Loresong faen** – slightly taller, magically attuned, arcane-favoring.
    - **Quickling faen** – very fast, nimble, physical, “bravest and noblest” but frivolous.
    - **Sprytes** – metamorphosed faen with wings; Tiny, flying, very fragile.
  - Socially: playful, pleasure-seeking, security-conscious, deeply ritualistic about their sprawling pantheon of “faen gods”.
- **FMG mapping ideas**
  - Thematically between **fey** and **smallfolk** (halflings / pixies).
  - Morphology: Small or Tiny humanoids, pointed ears, sometimes winged; fits race sets like **fey**, **beastfolk-light**, or a dedicated **fae** set.
- **Candidate actions**
  - **Option A – Single Faen race (recommended)**
    - Add one non-human race **`Faen`**, with description noting the three subtypes.
    - Advantages: simple to wire, easy to use as a world-scale demographic label.
    - Subtype differentiation can be left to **character-level systems** (Individuals/Characters), not `pack.races`.
  - **Option B – Three distinct races** (`Loresong Faen`, `Quickling Faen`, `Spryte`)
    - Pros: more granularity if we ever want highly faen-heavy worlds.
    - Cons: likely overkill for map-level demographics; sprytes in AU are metamorphosed, not a founding population.

### 1.3 Giants (Hu-Charad)

- **AU role**
  - “Hu-Charad” giants: 7–12 ft tall, ritual-obsessed **caretakers** and rulers of the Diamond Throne.
  - Two modes via ritual: **Chi-Julud** (warlike Wardance) and **Si-Karan** (Caretaker, calm administrators).
  - Built great cities, freed humans and faen from dramojh, now rule as stewards rather than tyrants (ideally).
- **FMG status**
  - We already have a **Giant** race in `fantasyRaceBases`.
- **Candidate actions**
  - **Reuse existing `Giant`** for AU-themed worlds.
  - If we later differentiate giant flavors, **Hu-Charad** could be a **named sub-variant** of Giant (lore-only), not a new race id.

### 1.4 Litorians

- **AU role**
  - **Leonine nomads**: bestial, honor-bound hunters; masters of open grasslands.
  - They patrol and tacitly “own” their savannah regions; strangers do not cross unnoticed.
  - Culture emphasizes personal power and honor more than urban civilization.
- **FMG mapping ideas**
  - Clearly a **beastfolk / catfolk** archetype.
  - Biome: plains / savannah / steppe.
- **Candidate actions**
  - **New race: `Litorian` (recommended)**
    - Put under **beastfolk** or **primal** race sets.
    - Language palettes could bias toward **African savannah** families once we wire them (but that’s for language devplans, not here).
  - Alternatively, treat as a **named variant of a generic lionfolk/catfolk race** if we end up adding a more general feline race first.

### 1.5 Mojh

- **AU role**
  - Former humans who voluntarily undergo a ritual **transformation into draconic, cold-blooded beings**.
  - Intellect magically enhanced; Constitution reduced; scaly hides, tails, breath weapons at higher racial levels.
  - Socially: obsessive about magic and runes; feared or distrusted by many humans due to resemblance to extinct dramojh.
- **FMG mapping ideas**
  - Sits between **Draconic** and **Humanoid**: magically altered dragonkin created from humans.
  - Works well as a **distinct “dragonkin” demographic** rather than generic dragons.
- **Candidate actions**
  - **New race: `Mojh` (recommended)**
    - Treated as a **small, magically focused draconic minority** in AU-flavored worlds.
    - Keep separate from any generic **`Draconic`** race we already have (that one can represent dragons, dragonborn, etc.).
  - Runechild template (below) already gives us “transformation” precedent; Mojh fits as a **founding stock**, not just a template.

### 1.6 Sibeccai

- **AU role**
  - **Jackal/hound-headed humanoids**, magically uplifted from beasts by giants into a servitor people.
  - Urban, regimented, ritual-heavy, strongly loyal to giants; see themselves as “chosen” and favored.
  - Sometimes harsh, hierarchical, and selfish; tensions with litorians and humans.
- **FMG mapping ideas**
  - Another **beastfolk** race, this time **canid/jackal** themed.
  - The text explicitly mentions them as city-dwelling and integrated into giant realms.
- **Candidate actions**
  - **New race: `Sibeccai` (recommended)**
    - Fits into **beastfolk** / **urban servitor** niche.
    - Distinct from any existing **Gnoll** / hyena folk, even though the silhouette overlaps.

### 1.7 Verrik

- **AU role**
  - Red-skinned, white-or-blue-black-haired near-humans with **innate psionic abilities** (telepathy, telekinesis, sensory control).
  - Introspective, contemplative, often aloof; value contextual, big-picture thinking.
  - Dwell in hot, dry regions not fully conquered by dramojh; build long, low cities; monks of witchcraft and akashic disciplines.
- **FMG mapping ideas**
  - Morphology: **humanoid** with subtle visual cues (skin/hair color) – not bestial.
  - Mechanically: **psionic / witchcraft** leaning; good fit for **planar** or **psychic** race sets.
- **Candidate actions**
  - **New race: `Verrik` (recommended)**
    - Tag as a **near-human psionic race** that tends to arid climates.
    - Palette and placement can follow whatever we do for “psionic / red-world” themes.

### 1.8 Runechildren

- **AU role**
  - Not a birth race; a **template applied to any living creature** with sufficient HD and altruistic sacrifice.
  - Gain a rune mark and a suite of inherent powers; explicitly *not* a separate ancestry.
- **FMG mapping ideas**
  - At map scale, Runechildren are **extremely rare overlays** on top of existing populations.
  - Better modeled as **individual-level traits** (Characters/Individuals) or as special NPCs, not a filled-in demographic race.
- **Candidate actions**
  - **Do not add a `Runechild` race** to `pack.races`.
  - Keep the concept in mind for later **character-system traits** (e.g. a flag in Individuals), if we wire AU rules there.

---

## 2. Transformational / sub-race nuances

These are AU “race-like” elements that affect individuals but probably **do not deserve full race slots**.

- **Faen metamorphosis → Sprytes**
  - Mechanic where loresong/quickling faen can cocoon and emerge as sprytes at higher levels.
  - Map-level implication: sprytes likely **track faen population**, not an independent founding race.
  - Our `Faen` race entry can mention this as a **lore note**; we do not need a separate `Spryte` race id.

- **Giant racial levels and growth**
  - AU giants grow from Medium to Large with rituals; some remain “smallish” giants.
  - Map-level: treat all as a single **Giant** race; per-individual size is a **character-system concern**.

- **Runechildren**
  - Already covered above: individual overlay, not an ancestry.

---

## 3. Monstrous or antagonist peoples mentioned

AU’s core book uses a few **named non-PC peoples** in examples. They could become **rare races or monster tags** if we want deeper AU integration.

### 3.1 Dramojh

- **AU role**
  - Ancient, cruel, draconic overlords who **enslaved humans and faen**; described as demon/dragon hybrids.
  - Defeated and hunted to extinction by giants long before the current era.
- **FMG mapping ideas**
  - Thematically overlap with **draconic demons**, high-magic tyrants, or an **“extinct empire”** tag used in histories.
  - If we ever support **ancient races in the deep past**, Dramojh are prime candidates.
- **Candidate actions**
  - Short term: treat **Dramojh** as **lore only**, perhaps as a **defeated empire** in AU-specific history templates.
  - Long term: optional **special race** for alternate timelines (Dramojh-not-extinct scenarios), likely under **dark/planar** sets.

### 3.2 Ratmen

- **AU context**
  - Appears in an example about a champion of life fighting “**ratmen in the sewers seeking to spread a plague**”.
  - Implies sapient, organized, disease-bearing sewer dwellers.
- **FMG mapping ideas**
  - Classic **ratfolk / skaven-style beastfolk**.
  - Niche: **urban underclass / sewer dwellers**, suitable for **underdark** or **dark** race sets.
- **Candidate actions**
  - **New race: `Ratmen` (optional)**
    - Only if we want **AU-flavored antagonists** beyond core PC races.
    - Could also be generalized into a **system-wide Ratfolk/Skaven** race usable outside AU.

### 3.3 Chorram

- **AU context**
  - Same example passage mentions a “**warlike chorram intending to burn down a forest** to root out faen”.
  - No detailed stats here; clearly an enemy people, not just a single monster.
- **FMG mapping ideas**
  - Flexible antagonist slot: could be **militaristic humanoids** (orc-adjacent), or a more exotic monstrous race.
- **Candidate actions**
  - Treat **Chorram** as a **named AU antagonist race** only if we commit to AU-specific bestiaries.
  - For now, we can model similar roles with existing **Orc / Hobgoblin / generic warlike race** entries.

### 3.4 Shadow trolls

- **AU context**
  - Cited as an example of a potential **race to champion**, alongside dragons.
  - Implies a **troll offshoot with strong shadow affiliation**.
- **FMG mapping ideas**
  - Good fit for **underdark** or **shadow-plane** race sets.
  - Could be modeled as either:
    - A distinct **`Shadow Troll`** race, or
    - A **subtype of an existing Troll/Ogre race**, if we add those globally.
- **Candidate actions**
  - Leave as **future monster-race option**; not required for initial AU race pass.

### 3.5 Dragons and undead (generic)

- **AU context**
  - Dragons and undead are referenced but not introduced as AU-specific ancestries.
- **FMG status**
  - We already have **Draconic** and **Undead** themed race sets / options.
- **Candidate actions**
  - No new race entries needed specifically for AU here.

---

## 4. Summary of viable AU race additions

Grouping by how likely we are to actually add them as distinct `pack.races` entries.

### 4.1 Strong candidates (PC-focused)

- **Faen**  
  - Umbrella race for loresong/quickling/spryte faen.  
  - Unique enough to warrant their own race; good fit for **fey** and **smallfolk** flavored worlds.

- **Litorian**  
  - Leonine nomadic hunters; classic beastfolk niche.  
  - Distinct silhouette and culture compared to existing races.

- **Mojh**  
  - Human-to-dragonkin converts; highly magical, visually distinct.

- **Sibeccai**  
  - Jackal/hound servitor folk; strong urban and giant-linked flavor.

- **Verrik**  
  - Red-skinned psionic near-humans; good anchor for **psionic / desert** themes.

### 4.2 Reuse or flavor-only

- **Humans**  
  - Covered by existing `Human` race; AU-specific notes can be handled via cultures and history, not a new race id.

- **Giants**  
  - Covered by existing `Giant` race; AU Hu-Charad giants become a **descriptive subtype**.

- **Runechildren**  
  - Template overlay across races; best modeled in **character systems**, not `pack.races`.

### 4.3 Optional antagonist / monster races

- **Dramojh**  
  - Extinct draconic tyrants; great for **ancient-empire** lore, optional for playable or current-era demographics.

- **Ratmen**  
  - Sewer-dwelling plague spreaders; classic **ratfolk** niche, could be generalized beyond AU.

- **Chorram**  
  - Warlike antagonists; flexible mapping to existing or new “evil martial” races.

- **Shadow Trolls**  
  - Shadow-linked trolls; viable as an Underdark/dark-world variant.

---

## 5. Open decisions for future implementation

### 5.1 Granularity of Faen representation

- **Option A – Single `Faen` race (recommendation)**
  - **Pros**
    - Simple demographic model (one race id, three subtypes in lore only).
    - Keeps race sets tidy; no proliferation of tiny races.
  - **Cons**
    - Loses per-subtype toggles (e.g. a world with only sprytes).

- **Option B – Split into `Loresong Faen`, `Quickling Faen`, `Spryte` races**
  - **Pros**
    - Maximal fidelity to AU; allows different expansionism/biomes per subtype.
  - **Cons**
    - More race ids for marginal practical gain; sprytes aren’t a founding race canonically.

### 5.2 Where to put AU-specific beastfolk

- **Option A – Dedicated AU race set** (e.g. `racesSet = "diamondThrone"`) **(recommendation)**
  - **Pros**
    - Keeps AU-flavored beastfolk (Litorian, Sibeccai, Ratmen) bundled; avoids polluting generic presets.
    - Makes it trivial to “turn on an AU world” via a single setting.
  - **Cons**
    - Slightly more UI surface (another preset), more documentation.

- **Option B – Blend into existing sets** (`beastfolk`, `dark`, `underdark`)
  - **Pros**
    - Zero new UI; they just appear as extra options in familiar sets.
  - **Cons**
    - Blurs the line between AU content and our native setting; harder to keep licensing and lore “modules” separate.

### 5.3 Handling Dramojh

- **Option A – Lore-only extinct race (recommendation)**
  - **Pros**
    - Respects AU canon that giants exterminated them.
    - Lets us reference Dramojh in **history generation** without needing actual present-day populations.
  - **Cons**
    - No current-era Dramojh states or cultures without bending canon.

- **Option B – Optional “what-if” race**
  - **Pros**
    - Allows alternate timelines (e.g. Dramojh still rule, giants lost).
  - **Cons**
    - Requires explicit scenario flagging to avoid contradicting default AU lore.

### 5.4 IP and licensing surface (for future GitHub-facing work)

- **Observation**
  - AU race names (`Faen`, `Litorian`, `Mojh`, `Sibeccai`, `Verrik`, `Dramojh`, etc.) are part of a commercial product.
- **Implication**
  - For **personal use**, wiring these races is fine.
  - For any **publicly distributed presets or lore text**, we may want to:
    - Keep AU-specific naming in a **user-local module** or
    - Use **generic equivalents** (e.g. “Leonine Nomads” instead of “Litorians”) and let the user rename in their own fork.

---

## 6. Recommended first implementation slice

If/when we decide to actually wire AU races, a minimal but useful first pass would be:

- **Add new races**: `Faen`, `Litorian`, `Mojh`, `Sibeccai`, `Verrik`.
- **Reuse existing**: `Human`, `Giant`, `Draconic`, `Undead`.
- **Keep in lore only for now**: `Runechild`, `Dramojh`, `Ratmen`, `Chorram`, `Shadow Trolls`.
- Tie all AU content behind either:
  - An **AU race set preset**, or
  - A small configuration flag under dev settings, so users not interested in AU can ignore it entirely.

---

## 7. Implementation status in this fork

_This section documents how much of the above is actually present as data in this
Fantasy-Map-Generator fork, and in what form, after extracting AU into a
softmod._

- **Historical note – previous wiring experiment**
  - Earlier in this fork, AU races were **fully wired into core** (`modules/races.js`)
    with:
    - Three Faen subraces (`Loresong Faen`, `Quickling Faen`, `Spryte`).
    - Additional PC races (`Litorian`, `Mojh`, `Sibeccai`, `Verrik`).
    - Antagonist races (`Dramojh`, `Ratmen`, `Chorram`, `Shadow Troll`).
    - Namebase mappings, raceLanguageProfiles, race set presets, and
      expansionism tweaks.
  - That wiring has now been **removed from core** and preserved only as
    softmod data.

- **Current state – AU as softmod payload (Choice 2)**
  - All concrete AU race data now lives in
    `mods/arcana-unearthed/races-au.js` as a **standalone bundle**, exporting:
    - `auRaces` – the full list of 11 AU races (PC + antagonists).
    - `auFantasyRaceBases` – fantasy namebase mappings for each AU race.
    - `auRaceLanguageProfiles` – mixer palettes for each AU race.
    - `auRaceSetContributions` – an AU-only set `arcanaUnearthed` plus blended
      contributions into `dark`, `primal`, `planar`, `fey`, `beastfolk`,
      `underdark`.
    - `auRaceExpansionismBase` – expansionism tweaks for Dramojh, Ratmen,
      Chorram, and Shadow Troll.
    - `auModMetadata` – mod-level id/label/tags/license metadata.
    - `auCultureSeeds` – AU-themed culture blueprints keyed to AU races.
    - `auStateSeeds` – example AU polities and realms.
    - `auHistorySeeds` – high-level AU history events.
  - This file is **not imported anywhere in core** yet; it is a candidate
    payload for the planned softmod loader (see `Softmods-Plan.md`).

- **Core app behavior**
  - `modules/races.js` and the main UI now contain **no AU-specific races or
    presets**; all AU integration is currently dormant.
  - The `mods/` directory is listed in `.gitignore`, so AU data is treated as
    **local-only content**, not part of public builds.
