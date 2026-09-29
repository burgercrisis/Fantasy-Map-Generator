# Subagent Verification Pipeline — Asia namebases

## Goal
Speed up per-name verification of `modules/namebases-asia.js` by fanning out entries to
research subagents. Each subagent RESEARCHES (real web verification, per verification-protocol.md)
one language entry and emits a JSON file. The main agent then applies the JSON to the file
entry-by-entry (no blind bulk replace).

## Constraints (must respect verification-protocol.md)
- EVERY name individually web-verified (exists as real place; speakers of THIS language there;
  name form authentic — not colonial replacement unless noted).
- Remove synthetic placeholders (`<Lang>k/t/...`, `A*ford/side/land`, `<Lang>town`, etc.),
  administrative units, geographic features, country/province names, foreign/regional-estimation
  names not connected to the language.
- Meet thresholds: major >20M → ≥80; medium 1M–20M → ≥50; small <1M → ≥30; micro <1000 → WAITING if <30.
  Absolute minimum 25.
- Cover terms / families / proto-languages → status WAITING, no names.
- Per-name source URL required (recorded in JSON).

## JSON schema (one file per entry)
File: `docs/verification/research/json/<EntryName>.json`
```json
{
  "name": "EntryName",
  "i": 109,
  "status": "COMPLETE" | "WAITING",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "min": 4,
  "max": 12,
  "d": "kstp",
  "m": 0,
  "b": [
    { "n": "Name", "src": "https://...", "conn": "why this name connects to the language" }
  ],
  "removed": [
    { "n": "OldName", "reason": "synthetic|admin-unit|geographic|foreign|duplicate|wrong-language|phonotactic|not-found" }
  ],
  "sources": ["https://...", "..."],
  "log": "Free-text research notes / phonology / mixer-map check."
}
```
- `b` = final verified list (no duplicates). Order does not matter.
- `min`/`max`/`d`/`m` = corrected field values (must match the names).
- If status WAITING: `b` may be short (≤25) with what could be found; explain in `log`.

## Applier
`tools/verify_apply.js <jsonFileOrDir>`
- Reads JSON(s); for each, finds the entry by `"name"` (and verifies `i` matches).
- Replaces only that entry's `"b"` field, and updates `min/max/d` if provided.
- Writes the file; reports applied entries.
- NEVER applies a JSON whose `status` is missing or whose `b` contains duplicates.
- After applying a batch, run `node tools/mixer-core/check-language-mixer-guardrails.js`.

## Workflow
1. Main agent picks next N entries from file (skip already-done; start after i=112).
2. Launch N research subagents (each: one entry, outputs its JSON to research/json/).
3. Main agent runs `verify_apply.js` over the produced JSON files.
4. Run guardrails. Repeat until caught up / handoff.
