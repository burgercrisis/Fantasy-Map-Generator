---
description: Status tracking for helper-tool documentation coverage
---

# Helper Tools Documentation

## Status (2025-12-12)

- Updated `tools/HELPER-TOOLS.md` to document previously undocumented helper scripts, including:
  - `tools/mixer-core/compare-language-generators.js`
  - `tools/mixer-core/compare-mixer-nextgen-to-app.js`
  - `tools/mixer-core/report-wikipedia-list-mixer-bases.js`
  - `tools/mixer-races/report-wikipedia-list-race-coverage.js`
  - `tools/mixer-diagnostics/check-language-mixer-map-duplicate-isos.js`
  - `tools/mixer-diagnostics/dedupe-language-mixer-map-duplicate-isos.js`
  - `tools/mixer-diagnostics/report-language-mixer-iso-diff-vs-head.js`
  - `tools/mixer-diagnostics/merge-language-mixer-from-head.js`
  - `tools/mixer-meta/check-official-languages-unique-bases.js`
  - `tools/mixer-meta/generate-wikipedia-languages-of-africa-full.js`
  - `tools/softmods/*` (softmod loaders + sandbox test runners)
  - Root helpers: `fix-bases.js`, `run_python_server.*`, `run_php_server.bat`

- Updated workflow documentation to align terminology and behavior:
  - Clarified that Wikipedia list `full` / `fully wired` is a **coverage** status (catalog + mixer-map) and does not imply base-uniqueness or race reachability.
  - Updated `.windsurf/workflows/wikipedia1.md` and several `wikipedia-*.md` workflow wrappers to reflect this.
  - Updated `DEVplans/Languages-Status.md` §8 header to explicitly separate coverage snapshots from the stricter "fully represented" goal.

- Added a reusable multi-agent workflow:
  - `.windsurf/workflows/wikipedia-exhaustive-multiagent.md`

## Status (2025-12-13)

- Updated workflow documentation to align with `DEVplans/Language-Mixer-Rules.md`:
  - `wikipedia-exhaustive-multiagent.md`: explicitly requires clearing `NO_UNIQ_BASE` (unique base anchor) in addition to base-set uniqueness.
  - `wikipedia1.md`: added required safety checks (`check-language-mixer-map-duplicate-isos.js`, `check-language-mixer-map-inconsistencies.js`).
  - `decluster-language-bases.md`: tightened identical `bases[]` sharing exceptions to alias-of-same-language or `skip: true` classification rows only.
  - Regional `wikipedia-*.md` wrappers: added explicit append-only reminder.
  - `no-unique-base-debt-multiagent.md`: added base-cluster collision check + clarified suite regenerates bundles.
  - `no-unique-base2.md`: expanded into a reusable verification + handoff checklist.
  - `language-uniqueness.md`: expanded into a full uniqueness workflow (append-only, required checks, suite regen).

## Status (2025-12-14)

- Started local static server via `py -m http.server 3000` (same as `run_python_server.bat`) to verify UI changes.

## Status (2025-12-15)

- Added / standardized `## Table of contents` blocks for the longest Markdown docs (primarily under `DEVplans/` and `tools/HELPER-TOOLS.md`) to improve navigation.

## Status (2025-12-21)

- Moved one-off agent/worker outputs from repo root into `tmp/` (gitignored) and moved root helper scripts into `tools/` subfolders (`tools/updates`, `tools/batch`, `tools/analysis`) to reduce root clutter.
