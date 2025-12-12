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
