# Game Plan – This Fork (Burger Crisis)
_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

This is the **single “what are we doing next?”** document for this repo.

- It is meant to be a high-level roadmap + operational checklist.
- Deep-dive rules and status live in other devplans; this file links to them.

### Section index

- [0. Quick links](#0-quick-links)
- [1. North stars (non-negotiable rules)](#1-north-stars-non-negotiable-rules)
- [2. Current focus (active workstreams)](#2-current-focus-active-workstreams)
- [3. Language mixer: workstreams + workflow](#3-language-mixer-workstreams--workflow)
- [4. Races + languages integration](#4-races--languages-integration)
- [5. Next major features (after current focus)](#5-next-major-features-after-current-focus)
- [6. Operating conventions](#6-operating-conventions)
- [7. Current status snapshot](#7-current-status-snapshot)
- [8. Next actions (when you sit down to work)](#8-next-actions-when-you-sit-down-to-work)

---

## 0. Quick links

- **Orientation / fork summary:** [Changes vs Azgaar master](Changes-vs-Azgaar-master.md)
- **Authoritative mixer rules:** [Language-Mixer-Rules.md](Language-Mixer-Rules.md)
- **Mixer compliance backlog:** [Language-Mixer-Compliance.md](Language-Mixer-Compliance.md)
- **Language system status (huge, detailed):** [Languages-Status.md](Languages-Status.md)
- **Races + languages rules:** [Races-Languages-Rules.md](Races-Languages-Rules.md)
- **Helper tools index:** `tools/HELPER-TOOLS.md`

---

## 1. North stars (non-negotiable rules)

These are not preferences; they are correctness rules.

- **Append-only registries**
  - Never delete existing language ISOs once present in:
    - `config/language-mixes.json`
    - `config/language-mixer-map.json`
  - Missing languages are treated as data loss and must be restored from history.

- **Strict uniqueness goal**
  - Long-term goal: **no identical `bases[]` set collisions** for distinct non-family mixer languages.

- **Globally-unique base anchor per language**
  - Every non-family mixer language should have **at least one base index** that no other non-family ISO references.

- **Family macros are allowed but must be mapped**
  - Catalog entries with `tags: ["family"]` are organizational.
  - They are expected to be skipped in UI/failure checks, but they still require mappings.

If anything in tooling or workflow conflicts with these, the tooling should be fixed (not the rules).

---

## 2. Current focus (active workstreams)

This fork’s current focus is:

- **Language mixer correctness + uniqueness**
  - Coverage, mapping validity, and uniqueness burn-down.
  - Make the mixer stable and maintainable via workflows and guardrails.

- **Races/languages wiring**
  - Use the mixer as the language substrate for races and culture naming.

---

## 3. Language mixer: workstreams + workflow

### 3.1 Primary loop (the “do work safely” sequence)

1. Make mapping/catalog changes (append-only).
2. Run the suite:

```bash
pnpm exec node tools/mixer-core/run-language-mixer-suite.js
```

3. Verify seed-uniqueness failures are improving:

```bash
pnpm exec node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=500
```

4. Verify you did not introduce base-set collisions:

```bash
pnpm exec node tools/mixer-diagnostics/report-language-mixer-base-clusters.js --min-size=2
```

### 3.2 NO_UNIQ_BASE burn-down (multi-agent safe)

**Goal:** clear `NO_UNIQ_BASE` (no globally-unique base index) for catalog languages.

- **Claim log:** `tools/mixer-diagnostics/_no_uniq_base_claims.json`
- **Multi-agent workflow:**
  - `.windsurf/workflows/no-unique-base-debt-multiagent.md`
  - `.windsurf/workflows/no-unique-base2.md` (verification + handoff checklist)

Expected claim notes:

- ISO→base mapping actually applied
- Reserved base ranges not used
- Verification commands run and outcome
- Any remaining seed-uniqueness debt (strict<1 or norm<10)

### 3.3 Coverage + failure burn-down

- Coverage: `pnpm exec node tools/mixer-core/check-language-mixer-coverage.js`
- Failures: `pnpm exec node tools/mixer-core/check-language-mixer-failures.js`

If the suite auto-fix rewrites a manual mapping back to a default, preserve the intended mapping using:

- `explicitIsoBasesMap` overrides in `tools/mixer-core/fix-language-mixer-mappings.js`

---

## 4. Races + languages integration

Authoritative doc:

- [Races-Languages-Rules.md](Races-Languages-Rules.md)

Primary goals:

- Use the mixer language layer as the substrate for:
  - culture naming
  - race naming
  - race expansionism + palette logic
- Maintain deterministic, debuggable mapping:
  - culture → race → language palette → name generation

---

## 5. Next major features (after current focus)

This is the “big roadmap” ordering for this fork:

- **Next major feature:** [Underdark](Underdark.md)
- **Then:** [Individuals](Individuals.md)
- **Then:** [Characters](Characters.md)
- **Then:** [Evolving Simulation](Evolving-Simulation.md)
- **Ongoing:** [Evolving Simulation choices / knobs](Evolving-Simulation-Choices.md)
- **Also:** [Softmods plan](Softmods-Plan.md)

---

## 6. Operating conventions

- **Use pnpm** whenever possible.
- **Do not hand-edit derived bundles**:
  - `config/language-mixes-all.js`
  - `config/language-mixer-map.js`
  - These are regenerated by the suite.

- **When you say “idc which next”**
  - Proceed without asking: pick the next logical batch.
  - Current directive: **finish Romance backlog first, then move to Uralic**.

---

## 7. Current status snapshot

### 7.1 NO_UNIQ_BASE claims snapshot (from `_no_uniq_base_claims.json`)

**Completed:**

- worker1: Formosan dedicated bases `559–563`
- worker1: reserved bases batch `539–558`
- worker1: reserved bases batch 2 `541–557`
- worker2: Romance/Italy dialects `567–571`
- worker2: Iberian/Romance dialect slice `572`, `582–585`
- worker3: Sámi `575–581`
- worker4: Chadic + Cameroonian Pidgin `586–589`, `597–601`
- worker5: Africa bu* `590–596`
- worker6: Ryukyuan/Japanese-contact `602–606`
- worker7: Oïl dialects `607–615`
- worker8: Arabic dialects `616–619`
- worker9: Asia/Sino-Tibetan `620–624`
- worker9b: South America `625–629`
- worker13: Ryukyuan `661–664`

**In progress (needs verify + close or continue):**

- worker6b: `macro-yaeyama`, `miyakoan`, `southern-amami`, `okinoerabu`, `tokunoshima` (bases `630–634`)
- worker10: Romance slice (bases `635–642`)
- worker11: Arabic slice (bases `643–650`)
- worker14: Caucasus slice (bases `668–672`) marked `in_progress` and explicitly pending verification

Source of truth: `tools/mixer-diagnostics/_no_uniq_base_claims.json`.

### 7.2 Detailed status

For the long-form history, per-list snapshots, and large progress notes, use:

- [Languages-Status.md](Languages-Status.md)

---

## 8. Next actions (when you sit down to work)

- **If you’re continuing NO_UNIQ_BASE burn-down:**
  - Pick the next `in_progress` claim and finish verification (suite + seed report + base-cluster report).
  - Mark it complete (or stalled) with ISO→base details.

- **If you’re continuing uniqueness/collision burn-down:**
  - Run `report-language-mixer-base-clusters.js --min-size=2`.
  - Take the worst/most disruptive cluster and split it via dedicated bases.

- **If you’re doing races/languages work:**
  - Start from [Races-Languages-Rules.md](Races-Languages-Rules.md) and trace codepaths in `modules/races.js` + `modules/names-mixer.js`.
