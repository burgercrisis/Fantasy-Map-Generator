# Delta queue — RETIRED

**The delta queue in this directory is obsolete. Do not apply it, and do not add
to it.**

The three `2025-12-21-*.json` files have been moved to `archive/` with a note.
`_compiled-dedicated-pins.json` stays, because
`tools/mixer-core/check-language-mixer-guardrails.js` reads it for JSON
parseability. It is empty (`{"version":1,"pins":{}}`) and should stay that way
until the dedicated-pin concept is either rebuilt or formally dropped.

## Why it was retired rather than repaired

`tools/mixer-core/apply-mixer-deltas.js` exits 1 on
`Delta references ISO(s) missing from config/language-mixes.json: kuril-dialects`,
so the obvious repair is to add that ISO. That would unblock a pipeline whose
entire contents are invalid. Measured against the current data:

    51  setBases rows across the three files
     0  of them match the mixer map - all 51 disagree
     1  has all of its base indices present
    44  have some base indices that do not exist
     6  have none

Every one of the 51 references a 14000-series "dedicated pin" index. That block
was a set of bases reserved for per-language dedicated namebases, and 47 of
those 51 indices no longer exist in any continent file.

Simulating the effect of applying them:

    rows whose name match would IMPROVE : 0
    rows whose name match would WORSEN  : 26

For example `pichinglis` currently resolves to "Pichinglis" and the delta wants
`[432, 14050]`; `lepcha` currently resolves to "Lepcha" and the delta wants
`[79, 14011]`, where 14011 does not exist. The queue predates the map repair, so
applying it would undo that work.

## What replaced it

`config/language-mixer-map.js` is now the single authority, and it is verified
by name against the language catalog:

    pnpm namebase:verify     every row, every check
    pnpm namebase:map-audit  every row against the catalog by name
    guardrails               append-only, and the two copies must be identical

If a base assignment genuinely needs changing, change the map through those
tools and let the gate catch the consequences. A side queue that the guardrails
do not read, whose contents predate the repair, and that cannot be applied
because one ISO is missing, is worse than no queue at all - it looks like a
supported way to make changes and is not one.

## The `modules/namebases-*.js` note in the old README

The previous version of this README said indices must exist in
`modules/namebases-*.js`. That path is gone. The only namebase tree is
`public/modules/`, which is what `src/index.html` loads; a second copy existed
until 2026-09-29 and has been deleted, with gate check E013 keeping it deleted.
