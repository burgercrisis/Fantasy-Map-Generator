# Name Integration System

Status: **Active**
Updated: 2025-12-22

## Overview
A system to allow multiple AI agents to work in parallel on updating the real-world namebases in `modules/namebases-real.js` without conflicts.

## Components
- `modules/name-fixes/`: Directory for incoming fixes.
- `modules/name-fixes/tracking.json`: Registry for claiming and tracking namebase updates.
- `tools/integrate-names.js`: Sole worker script to apply changes to the database.

## Workflow
1. Agents claim an index in `tracking.json`.
2. Agents drop a JSON fix in `modules/name-fixes/`.
3. `node tools/integrate-names.js` is run to merge all pending fixes.

## Next Steps
- [ ] Agents can now begin claiming batches from `tracking.json`.
- [ ] Periodic runs of the integrator script.
