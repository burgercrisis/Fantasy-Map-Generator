---
description: Tracking shared UI/helpers refactors and duplicated logic cleanup
---

# Shared UI & Helpers Refactors – Devplan

This devplan tracks potential refactors for repeated logic in the UI and helpers, so we can pick them up later without re‑reconnaissancing the codebase.

## 1. Dialog / Alert / Confirm helpers

- **Current pattern**
  - Many modules build dialogs manually with `alertMessage.innerHTML = ...` and `$("#alert").dialog({ ... })`.
  - Some newer code uses a `confirmationDialog({...})` helper, but usage is inconsistent.

- **Refactor idea**
  - Introduce or consolidate a small dialog helper API, e.g. in a shared UI module:
    - `openAlertDialog({title, html, width, buttons, position})`
    - `openConfirmDialog({title, messageHtml, confirmLabel, cancelLabel, onConfirm})`
  - Gradually migrate high‑traffic cases (load/save errors, destructive actions, etc.) to these helpers.

- **Pros**
  - Centralizes jQuery UI dialog wiring and defaults.
  - Makes global visual/behaviour changes (positions, widths, etc.) easy.
  - Reduces duplicated inline HTML+dialog boilerplate across editors.

- **Cons**
  - Touches many UI files; needs careful incremental rollout to avoid regressions.
  - Helper API must stay flexible enough for the more complex custom dialogs.

- **Potential phases**
  1. Add helpers and start using them only in new/experimental code.
  2. Migrate the most obviously duplicated alert/confirm flows (e.g. generic error messages, simple yes/no prompts).
  3. Gradually fold in more complex editors once covered by tests/manual QA.

## 2. Population change dialogs (states vs provinces)

- **Current pattern**
  - `modules/dynamic/editors/states-editor.js` – `changePopulation(stateId)`.
  - `modules/ui/provinces-editor.js` – `changePopulation(province)`.
  - Both build very similar dialogs:
    - Inputs for rural and urban population.
    - Live updated total and percentage.
    - Apply handler that rescales `pack.cells.pop` and burg populations, then refreshes editor and redraws population layer.

- **Refactor idea**
  - Extract a generic population dialog helper, roughly:
    - `openPopulationDialog({title, initialRural, initialUrban, canEditUrban, formatNumber, applyRuralChange, applyUrbanChange})`.
  - Each editor passes its own `apply*` functions to update the correct pack structures.

- **Pros**
  - Removes two fairly large, almost identical functions.
  - Central place to tweak population UX (validation, copy, layout).

- **Cons**
  - Slight abstraction overhead for future debugging.
  - Needs careful design of the helper API to avoid "leaky" responsibilities.

- **Potential phases**
  1. Implement helper and wire it up in one editor (e.g. provinces) behind a feature flag or local guard.
  2. Once stable, migrate the other editor to the same helper.

## 3. Zoom‑to‑burg helpers (capital zoom)

- **Current pattern**
  - `states-editor.js` – `stateCapitalZoomIn(state)`.
  - `provinces-editor.js` – `capitalZoomIn(p)`.
  - Both:
    - Resolve a burg id.
    - Locate the corresponding `burgLabels` entry.
    - Read `x`/`y` and call `zoomTo(x, y, 8, 2000)`.

- **Refactor idea**
  - Add a shared helper:
    - `zoomToBurg(burgId, zoom = 8, duration = 2000)`.
  - Callers only have to resolve the burg id and delegate the rest.

- **Pros**
  - Low‑risk, small and well‑defined.
  - Single place to adjust zoom level or animation behaviour.

- **Cons**
  - Limited payoff vs. larger dialog/population refactors, but very cheap to do.

- **Potential phases**
  1. Implement helper.
  2. Switch existing capital‑zoom callsites to use it.

## 4. Fetching local JSON with `?v=${VERSION}`

- **Current pattern**
  - Repeated code that does:
    - `fetch("./styles/${preset}.json?v=${VERSION}")` → `.json()` → custom error.
    - `fetch("./config/language-mixes.json?v=${VERSION}")` → `.json()` → sort/cache.
  - Similar patterns likely exist for other config/style JSONs.

- **Refactor idea**
  - Introduce a small loader utility, e.g.:
    - `fetchJsonWithVersion(relativePath)` – appends `?v=${VERSION}`, checks `res.ok`, returns parsed JSON or throws a consistent error.
  - Optionally layer a tiny caching helper on top when appropriate.

- **Pros**
  - Centralizes `VERSION` query handling and error reporting.
  - One place to add logging, retries, or user‑visible tips.

- **Cons**
  - Changes low‑level IO paths; needs sanity checks.
  - Less visible benefit than the dialog/population refactors.

- **Potential phases**
  1. Add helper and migrate a single, simple callsite (e.g. one style preset loader).
  2. Gradually convert other JSON fetches when convenient.

## 5. Blob → Data URL helpers

- **Current pattern**
  - `utils/commonUtils.js` – `getBase64(url, callback)` uses `XMLHttpRequest` + `FileReader.readAsDataURL` (callback style).
  - `modules/fonts.js` – `readBlobAsDataURL(blob)` wraps `FileReader.readAsDataURL` in a Promise, used by `loadFontsAsDataURI`.

- **Refactor idea**
  - Move a Promise‑based `readBlobAsDataURL` into `commonUtils.js` as the core primitive.
  - Optionally re‑implement `getBase64` on top of it (or modernize callsites directly).

- **Pros**
  - Single place for the blob → data URL logic.
  - Easier modernization (async/await) of IO helpers.

- **Cons**
  - Requires checking existing `getBase64` callsites before changing semantics.
  - This code path is not hot; benefits are mostly cleanliness/consistency.

- **Potential phases**
  1. Add `readBlobAsDataURL` to `commonUtils.js` and use it in `fonts.js`.
  2. Gradually update other image/font loading code to use the shared helper.

## 6. Long‑term: shared table/editor scaffolding (states, provinces, etc.)

- **Observation**
  - Editor modules (states, provinces, burgs, etc.) share high‑level patterns:
    - Build HTML rows from `pack.*` data.
    - Maintain footer summaries and percentage/absolute toggles.
    - Attach hover/highlight behaviours tied into SVG layers.

- **Potential future direction**
  - If/when editor UIs are overhauled, consider a shared "editor table" scaffold that encapsulates:
    - Sorting, highlighting, percentage/absolute modes.
    - Basic wiring between DOM table rows and `pack.*` entities.

- **Status**
  - Large and invasive; not a short‑term target.
  - Kept here as a reminder if we eventually do a broader UX refresh.
