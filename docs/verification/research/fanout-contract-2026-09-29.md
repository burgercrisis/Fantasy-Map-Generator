# Fan-out contract, session 2026-09-29

Four subagents dispatched against the same working tree. They do not share
files. This file records the partition so the merge can be verified.

## Ownership

| agent | task id | owns | must not touch |
|---|---|---|---|
| MAP    | ses_f115cd400ffeQoh4fWVNs8EWED | `config/language-mixer-map.{json,js}`, `public/config/language-mixer-map.js` | anything else |
| NAMES  | ses_f115c73bfffet1EAjjEWXJInA8 | `public/modules/namebases-*.js` (7 files) | anything else |
| CODE   | ses_f115c10c3ffeTvI5imQT3nhSAC | `src/data/name-bases.ts`, `tools/namebase-tools/built-in-defaults.test.js` | anything else |
| RESEARCH | ses_f115b80f1ffefyRVea7t3jYcvG | `docs/verification/research/t5-duplicate-calls.md`, `t6-orphan-catalog-gaps.md` | all data files, read-only |

All four were told: no `git rm`, `commit`, `add`, `checkout`, `restore`, `reset`,
`stash`, `revert`, `mv`, `rebase`, `push`, `clean`. Read-only git only. I commit.

## Why the partition is by file, not by task

Every namebase edit in this repo is done by parse → modify → re-serialise the
whole file. Two agents doing that to the same file will clobber each other
regardless of which entries they touch. So all namebase work went to one agent,
all map work to another, even though the tasks interleave.

## Disjointness, proven before dispatch

Generated the work lists, then checked them against each other. Three conflicts
were found and removed from the lists rather than left for the agents to hit:

1. **104 duplicate groups looked mechanical but were not** — two members were
   both referenced by map rows, so neither could be deleted. Moved to the
   human-decision list.
2. **6 entries appeared in both the move list and the delete list.**
3. **1 ISO appeared in both the repoint list and the add-row list.**

Post-fix proof, all zero: delete/move overlap, delete/repoint-target overlap,
move/repoint-target overlap, and "does any kept duplicate go unreferenced".

## Waves

Wave 1 (parallel): MAP, NAMES, CODE, RESEARCH.

Wave 2 (after MAP): delete the 278 zero-seed duplicates that the map currently
points at. Blocked in wave 1 — the map has to be repointed first or deleting
them would break those rows. Another agent will fail in-flight checks against
them, which is expected and is why each agent was told to verify only its own
invariants and ignore repo-wide gate output.

## What each agent must not do

Each was told explicitly not to "fix things you notice elsewhere" and to report
them instead. The repo-wide gate (`verify-namebase-integrity.js`,
`check-mixer-health.js`) will report failures caused by the other agents'
in-flight edits; all four were told to ignore it rather than act on it.
