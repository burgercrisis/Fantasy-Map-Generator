# Language Mixer Rules – Compliance Backlog

_Back to devplan overview: [Changes vs Azgaar overview](Changes-vs-Azgaar-master.md)_

This devplan tracks work needed to keep the repo (docs, tooling, and runtime/UI) aligned with the authoritative rule set in `DEVplans/Language-Mixer-Rules.md`.

## Table of contents

- [Status snapshot (2025-12-13)](#status-snapshot-2025-12-13)
- [Routine checks](#routine-checks)
- [Workstreams](#workstreams)
- [Next audit targets](#next-audit-targets)

## Status snapshot (2025-12-13)

- 2025-12-14: Verified last ~16 hours of mixer work (see git commits `87858113`..`932a2e32`): Romance dedicated-base expansion + pinning safeguards, workflow guardrails (no git / no paraphrasing, BOM/CRLF handling), and adoption of mixer delta patch-queue (`tools/mixer-deltas/*.json` + `mixer:apply-deltas`) to reduce multi-writer conflicts.

- 2025-12-16: Fixed `mixer:guardrails` duplicate `i:` collisions (5106–5110) between `modules/namebases-creole.js` and `modules/namebases-real.js`, and restored missing setBases aux base defs (5103–5105) in `modules/namebases-creole.js`. Verification: `pnpm run mixer:guardrails` => `[guardrails] OK. map=3475 catalog=3475`.

 - 2025-12-16: Follow-up verification: `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check` => exit 0; `pnpm run mixer:check-deltas` => exit 0.

- 2025-12-14: Multi-agent coordination posture (GLOBAL): hub-first coordination via MCP Coordination Hub workstreams + hub locks; hub locks are the only single-writer enforcement mechanism. Repo-local claim logs remain coordination metadata (batching + reserved ranges + notes).

- 2025-12-16: Hub workstreams cleanup (languages): marked duplicate/superseded language workstreams as completed in hub to reduce coordination noise. Examples: 464ae733-dada-494f-aee4-6a028da25fee, 3a177bc8-4556-4e7a-9474-5edfb8c6731b, 633b892d-2453-4791-9603-44968164c593, 0c4a2458-2ff2-4d30-8b26-ea230ab17b1a, b73a9633-bb0e-406b-9518-c1508b34a5d6, b2d389cb-eed1-4baf-b524-2472bee456bb, 79275889-10da-4d76-919f-0d2a63ead904, c5646672-53cf-461e-986a-a4ed324ffb10.

- 2025-12-16: Wikipedia: Languages of Europe – base-set collisions cleared (verified). Evidence (run with `--no-devplan`):
  - `pnpm exec -- node tools/mixer-core/report-wikipedia-list-base-uniqueness.js tools/mixer-meta/wikipedia-languages-of-europe.json --no-devplan` => `clustered bases: 0`
  - `pnpm exec -- node tools/mixer-core/report-wikipedia-list-coverage.js tools/mixer-meta/wikipedia-languages-of-europe.json --no-devplan` => `fully wired: 168 (100.0%)`, `Nonunique Bases: 98`

- 2025-12-16: Decision: coordination/meta notes for language mixer work live in DEVplans/Language-Mixer-Compliance.md (not DEVplans/Languages-Status.md).

- 2025-12-16: Decision: keep completed hub workstreams indefinitely; workers should default to listing only hub workstreams with status=active (and optionally paused) when looking for work.

- 2025-12-15: Updated `.windsurf/workflows/no-unique-base-coordination.md` to reference MCP Coordination Hub workstream + lock tools (`mcp5_workstream_*`, `mcp5_lock_*`) instead of legacy MCP Memory tooling.

- 2025-12-16: Propagated “Hub locks are the only single-writer enforcement mechanism” guidance across all `.windsurf/workflows/wikipedia*.md` workflows (including `wikipedia-exhaustive-multiagent.md`), so multi-agent writers are consistently instructed to lock before edits.

- 2025-12-16: Documentation: recorded the broader MCP Coordination Hub tool surface (workstreams/locks/search/audit/perf) and constraints; added a global pointer in `.github/copilot-instructions.md`.

- 2025-12-15: Added `--dashboard` (read-only) mode to `tools/mixer-diagnostics/no-uniq-base-claim.js` to list `in_progress` claims and compute the next available reserved `i:` range (coordination-first; no writes).

- 2025-12-15: Added `--dashboard` (read-only) mode to `tools/mixer-diagnostics/no-uniq-base-claim.js` to list `in_progress` claims and compute the next available reserved `i:` range (coordination-first; no writes).

- 2025-12-15: Codified the canonical `NO_UNIQ_BASE` coordination protocol into `.windsurf/workflows/no-unique-base-coordination.md`, added a read-only claim-template helper `tools/mixer-diagnostics/print-no-uniq-base-claim-template.js`, and hardened `tools/mixer-diagnostics/no-uniq-base-claim.js` create mode (auto-insert notes template if `--notes` is omitted; require `--blockSize >= #ISOs`).

- 2025-12-15: Canonical coordination doc now includes an explicit lock-release rule: do not leave inactive batches `in_progress`; set `status=stalled` with a short `BLOCKER:`/handoff note to release ISO locks.

- 2025-12-15: Team policy decision: stale claim threshold is 24h. Canonical coordination docs now state that `in_progress` claims older than 24h and inactive should be moved to `stalled` (preserve history; release locks).

- 2025-12-15: Added a read-only global claims dashboard helper `tools/mixer-diagnostics/claims-dashboard.js` to aggregate `in_progress` claim locks across `NO_UNIQ_BASE`, decluster, and wiki multi-agent claim logs. Wired into `.windsurf/workflows/no-unique-base-coordination.md` as the canonical pre-flight step.

- 2025-12-15: `tools/mixer-diagnostics/claims-dashboard.js` now flags `STALE>24h` `in_progress` claims (age from `updatedAt` with `startedAt` fallback). Used to triage and set 9 stale WIKI claims to `status=stalled` (released locks); only the active Africa WIKI claim remained `in_progress`.

- 2025-12-15: Added a wiki claims helper `tools/mixer-diagnostics/wiki-claim.js` (writer + lock) to create/update `tools/mixer-diagnostics/_wiki_multiagent_claims.json` without manual JSON edits. `.gitignore` now ignores `tools/mixer-diagnostics/_wiki_multiagent_claims.lock`.

- 2025-12-15: Unblocked uniqueness diagnostics by fixing a transient JS syntax error in `modules/namebases-real.js` (was crashing `report-language-mixer-seed-uniqueness`). Verified via `node --check modules/namebases-real.js` and `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures --limit=300`.

- 2025-12-15: Verified `pnpm exec -- node tools/mixer-core/apply-mixer-deltas.js --check --no-lock` is clean, and confirmed `modules/namebases-real.js` contains dedicated base definitions for indices `2369–2373`.

- 2025-12-15: Fixed `mixer:guardrails` failure by removing duplicate `i:2900–2904` base entries and a stray markdown fence from `modules/namebases-real.js`; verified `pnpm run mixer:guardrails` and `pnpm run mixer:check-deltas` are passing.

- 2025-12-15: Added decluster coordination artifacts for shared `bases[]` collision work:
  - claim log: `tools/mixer-diagnostics/_decluster_claims.json` (UTF-8 no BOM)
  - helper: `tools/mixer-diagnostics/decluster-claim.js` (create/update under lock; optional reserved `i:` range)
  - verification: `pnpm run mixer:guardrails` now checks `_decluster_claims.json` for BOM + JSON parse, and `.gitignore` ignores `tools/mixer-diagnostics/_decluster_claims.lock`

- 2025-12-14: Multi-agent safety: `pnpm run mixer:apply-deltas` / `pnpm run mixer:check-deltas` now serialize via an atomic lock file (`tools/mixer-core/_apply-mixer-deltas.lock`, gitignored) to reduce multi-writer conflicts on generated mixer artifacts.

- 2025-12-15: Team process decision: use a single integrator lane for high-churn language mixer files and regenerated artifacts (`modules/namebases-*.js`, `config/language-mixer-map.json`, `tools/mixer-deltas/_compiled-dedicated-pins.json`).
  - Non-integrator work should be delivered as delta-only changes / proposals + claim notes; the integrator runs `pnpm run mixer:apply-deltas` and the verification gates. See `.windsurf/workflows/single-integrator-lane.md`.

- 2025-12-15: Documentation: canonical single-integrator lane workflow created and referenced from the relevant workflows and docs (`.windsurf/workflows/single-integrator-lane.md`).

- 2025-12-15: Team process decision: `.windsurf/rules/languages-wiki.md` now encodes the single-integrator lane rule adjacent to `pnpm run mixer:apply-deltas`.

- 2025-12-15: Added a read-only heuristic diagnostic for linguistic plausibility checking: `tools/mixer-diagnostics/audit-language-mixer-linguistics.js`.
  - Current behavior: flags likely outliers by comparing an ISO’s `family` against “family-anchored” shared base indices, plus some lexifier/missing-metadata checks.
  - Initial high-confidence findings (examples to triage/fix via deltas): `canadian-french` currently includes base index `254` (Kannada) in `bases[]`; `bozal-spanish` includes base index `151` (Sesotho) in `bases[]`.
  - Systemic anomaly identified: ~34 catalog entries with `family: "Australian Aboriginal"` currently include shared base `312` ("Harari-Argobba") in `bases[]`, even though `tools/mixer-core/fix-language-mixer-mappings.js` explicitly maps these ISOs (and token `australian-aboriginal`) to base `313` ("Australian Aboriginal").
    - Next step (pending approval): consider a single delta batch to swap `312 -> 313` for the affected ISOs.
  - 2025-12-15: Linguistic accuracy policy decision: family-pure by default.
  - 2025-12-15: Applied delta batch `tools/mixer-deltas/2025-12-15-linguistic-family-pure-batch1.json` (`setBases`) for high-confidence out-of-family base corrections.
    - Verification: `pnpm run mixer:apply-deltas` (OK) and `pnpm run mixer:check-deltas` (OK).
  - 2025-12-15: Verification rerun: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-linguistic-plausibility.js --limit=300 --out-tsv=tools/mixer-diagnostics/tmp/linguistic-plausibility.tsv --out-shortlist-tsv=tools/mixer-diagnostics/tmp/linguistic-plausibility-shortlist.tsv` (OK); offender spot-check: `canadian-french -> [2,650]`, `bozal-spanish -> [4]`, `nogai -> [295]`.
  - Next step (pending approval / coordination): expand the batch in small increments (high-confidence only), then re-run `pnpm run mixer:apply-deltas` + `pnpm run mixer:check-deltas`.

- 2025-12-14: Added read-only linguistic plausibility triage tooling: `tools/mixer-diagnostics/report-language-mixer-linguistic-plausibility.js` (heuristic report over `iso -> bases[]` using dominant family/category/region per base). Generated review outputs under `tools/mixer-diagnostics/tmp/` (e.g. `linguistic-plausibility.tsv`, `linguistic-plausibility.json`).

  - 2025-12-15: Added `--out_shortlist_tsv=...` to `report-language-mixer-linguistic-plausibility.js` to emit a filtered per-ISO shortlist TSV (replaces ad-hoc post-processing).

  - 2025-12-15: Created queued delta-only proposal file `tools/mixer-deltas/_2025-12-15-linguistic-fixes-proposal.json` (`setBases`: `canadian-french -> [2, 650]`, `nogai -> [295]`). Not applied yet.

- 2025-12-14: Added a read-only heuristic diagnostic to flag likely linguistically inconsistent `iso -> bases[]` mappings: `tools/mixer-diagnostics/report-language-mixer-linguistic-consistency.js`.
  - Typical run: `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-linguistic-consistency.js --only-failures --skip-region --skip-tags=pidgin,creole,mixed --limit=40`
  - Current output summary (with `--skip-region`, ignoring `region=Misc`, and skipping `pidgin/creole/mixed` tagged entries): flags 84 catalog ISOs (heuristic mismatches)
  - High-confidence pass (more strict): `--min-share=0.9 --min-uses=20` currently flags 0 ISOs
  - Examples observed in output: `canadian-french` includes base `254 (Kannada)`; `adnyamathanha` includes base `132 (Hausa)`; `piraha` includes base `388 (Kwaza-Xocó Amazonian)`

- 2025-12-14: Repaired `tools/mixer-core/diff-language-families.js` to load the generated catalog from `globalThis.languageMixerCatalog` (current `config/language-mixes-all.js` export), unblocking `tools/mixer-core/run-language-mixer-health.js`.

- 2025-12-14: Disabled Sequential Thinking (MCP server) due to instability; updated agent guidance to use an explicit PLAN → NEXT_ACTION contract (execute NEXT_ACTION in the same turn; `/continue` resumes the most recent unexecuted NEXT_ACTION).


- 2025-12-14: Windsurf MCP config: pinned `@modelcontextprotocol/server-memory@0.6.3` and set npm env to `silent` / no update-notifier / no progress (stdout-safe) to prevent Memory MCP stdio JSON parse failures; requires MCP server restart to take effect.

- Family macros (`tags: ["family"]`) are organizational entries:
  - they are expected to be skipped by the mixer UI and by “failure” checks
  - they are still required to have mappings (per `DEVplans/Language-Mixer-Rules.md`)
- Suite-critical tooling should remain compatible with this posture:
  - family-tagged catalog entries may be excluded from some failure/coverage tallies for UI parity, but mappings must still exist
- Safety tightening:
  - `tools/mixer-core/fix-language-mixer-mappings.js` will not create new map-only entries from `explicitIsoBasesMap` unless the ISO exists in the catalog
  - `tools/mixer-core/fix-language-mixer-mappings.js` will refuse to write `config/language-mixer-map.json` if any ISO pinned in `explicitIsoDedicatedBaseMap` would lose its pinned dedicated base, or if the pinned base index is missing from valid namebase indices
  - `pnpm run mixer:guardrails` will fail if it detects duplicate base indices (duplicate `i:` values) across `modules/namebases-*.js`
  - 2025-12-14: Restored `tools/mixer-core/report-language-mixer-name-counts.js` repo-root resolution (prevents ENOENT for `tools/config/*`).

- Seed-uniqueness thresholds (explicit goal; not a hard gate):
  - We are tracking a long-term goal that each non-family mixer language has at least one globally-unique base index, and that dedicated base contains ISO-unique seed tokens.
  - Target thresholds (tracked as debt, not enforced as a suite “hard gate”): strict unique seeds `>= 1` and normalized unique seeds `>= 10`.
  - Report current compliance with:
    - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`
  - Latest report snapshot (2025-12-13):
    - Target ISOs: 3366
    - Missing mapping: 0
    - No globally-unique base index: 3193
    - Strict unique seeds below threshold (among those with unique base): 6
    - Normalized unique seeds below threshold (among those with unique base): 93

- Routine checks wiring:
  - The seed-uniqueness report command is now listed in the routine/quick checks sections of `Language-Mixer-Rules.md`, `Languages-Status.md`, and `Races-Languages-Rules.md`.

- Multi-agent workflow:
  - `.windsurf/workflows/no-unique-base-debt-multiagent.md`

- 2025-12-14: Updated `.windsurf/workflows/no-unique-base2.md` verification checklist to run `pnpm run mixer:guardrails` (catches duplicate `i:` collisions and other guardrails early).

- 2025-12-14: Multi-agent merge-conflict mitigation for `modules/namebases-*.js`: require per-worker reserved `i:` index ranges recorded in `tools/mixer-diagnostics/_no_uniq_base_claims.json` claim `notes` (workflow + rules doc enforcement).
  - Reservation scheme: reserve the next available contiguous block above current usage / already-reserved ranges:
    - `start = 1 + max(maxUsedI, maxReservedEndI)`
    - default `end = start + 49`
  - Documented in:
    - `.windsurf/workflows/no-unique-base-debt-multiagent.md`
    - `.windsurf/workflows/no-unique-base2.md`
    - `DEVplans/Language-Mixer-Rules.md`

- 2025-12-14: Introduced a mixer “patch queue” (delta files) to reduce multi-worker conflicts on canonical mixer artifacts:
  - Workers can add small deltas under `tools/mixer-deltas/*.json`
  - Apply deltas with `pnpm run mixer:apply-deltas` (writes `config/language-mixer-map.json` + regenerates `config/language-mixer-map.js` deterministically)
  - Single-integrator lane: in multi-agent contexts, only the integrator should run `pnpm run mixer:apply-deltas` to write/regenerate committed artifacts. See `.windsurf/workflows/single-integrator-lane.md`.
  - Dedicated-base pins are compiled into `tools/mixer-deltas/_compiled-dedicated-pins.json`, and loaded by `tools/mixer-core/fix-language-mixer-mappings.js`

- 2025-12-14: Added multi-agent hardening for writer scripts:
  - `tools/HELPER-TOOLS.md` now includes prominent “DO NOT RUN IN MULTI-AGENT” warnings for scripts that rewrite the catalog/map.
  - Added `--multi-agent-safe` (read-only) mode to the suite fixer and key catalog/map updaters so they can be used for diagnostics without writing files.

- 2025-12-14: Documented `tools/mixer-diagnostics/no-uniq-base-claim.js` in `tools/HELPER-TOOLS.md` as the preferred way to create `NO_UNIQ_BASE` claims (auto-reserves `i:` ranges, rejects ISO overlap with `in_progress` claims, and writes the claims log as UTF-8 without BOM). Workflows now reference it (`.windsurf/workflows/no-unique-base-debt-multiagent.md`, `.windsurf/workflows/no-unique-base2.md`), and the helper was hardened to prevent duplicate `workerId` `in_progress` claims and to initialize the claims file if missing.

- 2025-12-15: Hardened `tools/mixer-diagnostics/no-uniq-base-claim.js` for multi-agent safety:
  - Atomic lock file (`tools/mixer-diagnostics/_no_uniq_base_claims.lock`) to serialize claim-log writes
  - `--update` mode to safely update `status` / `notes` / `updatedAt` without manual JSON edits
  - PowerShell-safe ISO passing (`--isos=...` split across argv tokens; repeatable `--iso=...`)

- 2025-12-15: Added a read-only `NO_UNIQ_BASE` batch picker helper (`tools/mixer-diagnostics/list-no-uniq-base-candidates.js`) and wired it into `.windsurf/workflows/no-unique-base-debt-multiagent.md` to standardize multi-agent batch selection (with optional category/family/region filters and claim-based exclusion).

- Multi-agent NO_UNIQ_BASE progress snapshot (claims log, 2025-12-13):
  - Completed batches: 8 (worker1 x3, worker2 x2, worker3 x1, worker4 x1, worker5 x1)
  - In-progress batches: 1 (worker6)
  - Stalled batches: 1 (worker1; superseded by later completed claim)
  - Dedicated base indices added/wired in this pass include: 539–563, 567–596, 597–601

- 2025-12-13: Additional completed NO_UNIQ_BASE mini-batches added dedicated bases 602–769 (see `_no_uniq_base_claims.json`), including the Romance batch `workerId: 24` (acadian->765, aeolian->766, african-romance->767, alentejan->768, algherese->769).

- 2025-12-13: Romance NO_UNIQ_BASE batch `workerId: 25` completed (ancona->770, andalusi-romance->771, andalusian->772, ans-->773, aretino-chianaiolo->774).

- 2025-12-13: Romance NO_UNIQ_BASE batch `workerId: 26` completed (argentinian-spanish->775, arpitan->776, asturian->777, auvergnat->778, balearic->779).

- 2025-12-13: Romance NO_UNIQ_BASE batch `workerId: 27` completed (banat->780, barranquenho->781, benasquese->782, bercian->783, bergamasque->784).

- 2025-12-13: Romance NO_UNIQ_BASE batch `workerId: 28` completed (bolivian-spanish->785, bolognese->786, brayon->787, brazilian-portuguese->788, brianz-->789).

- 2025-12-13: Romance NO_UNIQ_BASE batch `workerId: 29` completed (brigasc->790, british-latin->791, bukovinian->792, canz-s->793, central-northern-lazian->794).

- 2025-12-13: Romance NO_UNIQ_BASE batch `workerId: 30` completed (cheso->795, chiac->796, chilean-spanish->797, chilote->798, chipilo->799).

- 2025-12-14: Repaired `tools/mixer-diagnostics/_no_uniq_base_claims.json` encoding (removed UTF-8 BOM) so Node `JSON.parse` succeeds; verified `workerId: 30` claim is `complete`.

- 2025-12-14: Romance NO_UNIQ_BASE batch `workerId: 31` completed (colombian-spanish->800, comasco-lecchese->801, corsican->802, cremish->803, cremun-s->804). Follow-up: appended ISO-unique seed tokens to bases 800 and 802; normalized seed-uniqueness debt cleared.

- 2025-12-14: Romance NO_UNIQ_BASE batch `workerId: 28` (recovered wiring) completed (bolivian-spanish->785, bolognese->786, brayon->787, brazilian-portuguese->788, brianz-->789).

- 2025-12-14: Romance NO_UNIQ_BASE batch `workerId: 32` completed (cri-ana->805, daco-romanian->806, dalmatian->807, eastern-aragonese->808, eastern-catalan->809). Note: suite mapping rewrite required preserving eastern-aragonese dedicated base via `explicitIsoDedicatedBaseMap`.

- 2025-12-14: Romance NO_UNIQ_BASE batch `workerId: 33` completed (ennese->822, eonavian->823, equatoguinean-spanish->824, estremenho->825, european-portuguese->826). Verified via `run-language-mixer-suite --no-wiki-devplan` and `report-language-mixer-seed-uniqueness --only-failures` that each has a globally-unique base index (normalized unique seeds below threshold remains tracked debt for ennese, estremenho, european-portuguese).

- 2025-12-14: Mayan mixer mapping fix (systemic; not part of NO_UNIQ_BASE claims log in this file version):
  - Added dedicated namebases in `modules/namebases-real.js`: Chuj (913) and Ch'orti' (914)
  - Wired `config/language-mixer-map.json`:
    - cac -> [913]
    - caa -> [914]
  - Pinned dedicated bases in `tools/mixer-core/fix-language-mixer-mappings.js` (`explicitIsoDedicatedBaseMap`) to prevent suite rewrites
  - Verification:
    - `pnpm exec node tools/mixer-core/check-language-mixer-failures.js` => 0 failures
    - `pnpm exec node tools/mixer-core/run-language-mixer-suite.js --multi-agent-safe --no-wiki-devplan` => clean (dry-run)

## Routine checks

- Seed-uniqueness goal compliance (explicit goal, not a suite “hard gate”):
  - `pnpm exec -- node tools/mixer-diagnostics/report-language-mixer-seed-uniqueness.js --only-failures`

## Workstreams

### A) Documentation alignment

- Ensure docs consistently describe:
  - append-only registries
  - family macros are organization-only but still mapped
  - uniqueness metrics definitions (`Nonunique Bases` vs base-set uniqueness)
  - seed-uniqueness thresholds are tracked goals (not a hard gate)

### B) Tooling alignment (writers + suite)

- For each script that writes:
  - `config/language-mixes.json`
  - `config/language-mixer-map.json`

confirm:

- it enforces append-only (refuse to write if any existing ISO would disappear)
- it does not generate mappings for family-tagged catalog entries by default
- it does not create duplicate ISO rows
- it does not introduce invalid base indices

### C) Runtime/UI alignment

- Confirm UI consistently hides family-tagged entries from mixing surfaces.
- Confirm runtime does not depend on deleting/renaming ISO keys.

### D) Multi-agent coordination (Hub + claims)

- Claim the scope in MCP Coordination Hub before edits (one writer per file/scope at a time): owner, goal, file/scope, constraints, status=in_progress, short plan.
- Acquire hub locks before touching any shared file/scope using `mcp5_lock_acquire` on a stable resource string like `file:<repo-relative-path>` or `scope:<subsystem>`.
- Hub locks are the only single-writer enforcement mechanism. Repo-local claim logs do not prevent concurrent writes by themselves.
- For `NO_UNIQ_BASE` / dedicated-base work, coordinate ISO batches via `tools/mixer-diagnostics/_no_uniq_base_claims.json` and the helper `tools/mixer-diagnostics/no-uniq-base-claim.js` (lock + UTF-8 no BOM; do not hand-edit claims JSON).
- For implementation + verification, follow the relevant `.windsurf/workflows/*` file verbatim (no git, no paraphrasing); record the exact commands run in the workstream handoff.

- Hub tool surface (MCP) quick reference (non-exhaustive):
  - Coordination: `mcp5_workstream_list`, `mcp5_workstream_get`, `mcp5_workstream_create`, `mcp5_workstream_update`, `mcp5_lock_acquire`, `mcp5_lock_release`, `mcp5_decision_admin`, `mcp5_time_now`, `mcp5_hub_admin` (tasks)
  - Overlap discovery: `mcp5_hub_exec` target=`ripgrep` tool=`search` / `advanced-search` (fallback: `code_search`, `grep_search`, `find_by_name`, `list_dir`, `read_file`, `read_notebook`)
  - Read-only queries: `mcp5_sqlite_ro_query`, `mcp5_hub_readme`
  - Security/analysis: `mcp5_sbom_cyclonedx_generate`, `mcp5_semgrep_exec` / `mcp5_semgrep_list_tools`, `mcp5_codeql_exec` / `mcp5_codeql_list_tools`
  - Browser automation: `mcp5_playwright_exec` / `mcp5_playwright_list_tools`, `mcp5_puppeteer_exec` / `mcp5_puppeteer_list_tools`
  - GitHub: `mcp5_github_read`, `mcp5_github_write` (write-enabled; treat as unsafe)
  - Docs/knowledge: `mcp5_deepwiki_*` (only if repo is indexed)
  - Perf: `mcp5_perf_status`, `mcp5_perf_http_load_test` (env + allowlist gated; treat as unsafe)
  - Git: `mcp5_git_read` exists, but repo workflows generally prohibit git commands unless the user explicitly asks.

## Next audit targets

- `tools/mixer-core/check-language-mixer-coverage.js`:
  - verify that “family-tagged catalog ISOs missing from map” output is correct/desired
- `tools/mixer-core/fix-language-mixer-mappings.js`:
  - audit `explicitIsoBaseMap` for any family macro keys (allowed, but should remain unreachable due to family-skip)
- `tools/mixer-core/run-language-mixer-suite.js`:
  - verify suite outputs remain stable and do not treat family macros as failures

