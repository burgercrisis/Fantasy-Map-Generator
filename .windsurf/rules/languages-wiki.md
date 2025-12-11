languages-wiki
---
trigger: model_decision
description: when working on languages
---
1. Always work *towards* our end goal and never *away* from it (no regressions, no undoing coverage or uniqueness work).

2. Our end goal for the language mixer is:
   a. To represent **every language on every relevant Wikipedia language list** in the app (each list row must have a catalog + mixer-map entry).
   b. To give **every language** a **unique name base set** (or unique tuned mix) that accurately reflects the actual language, not just a vaguely similar one.
   c. Every single language should be selectable by at least one race in generation for mixing.
   d. Every single language should be able to mix with every other language within a *single name*.
   e. No repetitive patterns such as `clicktone-3letters-clicktone-3letters-...` should appear in generations.

3. In order to respect this:
   a. Never remove languages from the language mixer map.
   b. Never remove languages from the language mixer catalog.
   c. Never remove languages from anywhere unless they truly are **not** a language on any Wikipedia language list (or are a clearly invalid duplicate entry).

4. When wiring or updating languages:
   a. Treat **coverage and uniqueness together**: when you touch a language, aim for catalog + map + unique base at the same time, not in separate phases.
   b. Follow the project’s explicit numbered workflow/priority list; do **not** skip ahead to unrelated tasks.