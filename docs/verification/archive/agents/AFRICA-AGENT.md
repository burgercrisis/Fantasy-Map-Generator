# Africa Agent — Language Namebase Verification

> **This file is a pointer. Read `docs/verification/verification-protocol.md` for the full protocol.**
> **Read `docs/verification/ENTRY-PROMPT.md` to begin working.**

---

## Your Assignment

Verify ALL 790 language entries in `modules/namebases-africa.js`.

## Source File

`modules/namebases-africa.js`

## Checkpoint

`docs/verification/checkpoints/africa-checkpoint.json`

## Verification Logs

Create per-entry logs at `docs/verification/research/by-language/<name>.md`.

## Region Context

Read `docs/verification/region/AFRICA.md` for continent-specific guidance.

## Protocol

Follow `docs/verification/verification-protocol.md` EXACTLY.
Do not skip steps. Do not improvise. Do not stop between entries.

Start from the checkpoint position. Work through entries in file order.
Update checkpoint every 10 entries. Run `pnpm mixer:guardrails` after every edit.

## Language Context

- Cameroon Grassfields: Extremely fragmented. Search for specific district/commune Wikipedia pages to find village names.
- Chadic languages (Nigeria, Chad, Cameroon): Often have <1000 speakers. Search for the specific village name + language name.
- Swahili/Bantu: Better documented. Use Wikipedia lists of cities/towns.
- Arabic dialects: Names should be from the specific region (Morocco Egypt vs. Gulf).

## Key Reminders

- EVERY name must be individually verified — no regional estimation
- Log the source URL for EVERY name you add
- Remove administrative units, geographic features, country names
- If <30 verified names found after 3+ searches for a micro-language, mark WAITING
