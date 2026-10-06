# Why biome does not lint `public/modules/*.js`

`biome.json` scopes biome to `src/**/*.ts` and `electron/**/*.ts`. That
exclusion is deliberate and should not be widened without reading this first.

## What happened

Adding `public/modules/**/*.js` to `files.includes` looked like a tidy-up: the
six continent-audit agents all independently reported that `biome check` on a
namebase file exits 1 with "no files were processed", and each correctly assumed
it was their own problem rather than the configuration's.

The pre-commit hook runs `biome check --write`. The moment that include landed,
biome reformatted **all seven namebase files from canonical JSON into
JS-literal style — unquoted keys — across 3,537 entries.**

## Why that was not just noisy

`tools/namebase-tools/verify-namebase-integrity.js` parses those files as JSON.
Unquoted keys are not JSON, so the gate lost all seven files and reported
**7 parse errors** — the entire gate went dark.

And it could not be undone by the normaliser:
`tools/namebase-tools/normalize-namebase-format.js` only accepts valid JSON, so
it refused the very files biome had broken. `git checkout -- <file>` restores
the *working tree from the index*, and the index had already been filled with
the damaged version by a `git add` made before the commit aborted. Only
`git checkout HEAD -- <file>` recovered it.

## The rule

`public/modules/*.js` is **generated data**, not source. Its format is owned by
`normalize-namebase-format.js`, and the gate parses it as JSON. A second
formatter with a `--write` mode must not be given a claim on it.

If a lint pass over those files is wanted, the correct place is a check inside
`normalize-namebase-format.js --check`, or a separate read-only tool that does
not run with `--write` in a hook.
