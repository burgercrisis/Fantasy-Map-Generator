hard continue
---
trigger: model_decision
description: enforce continue semantics / when the user uses /continue
---
- When the user invokes `/continue` in this repo, you MUST:
  - Treat the current task as the language mixer / DEVplans [Languages-Status.md](cci:7://file:///e:/code/Fantasy-Map-Generator/DEVplans/Languages-Status.md:0:0-0:0) thread, unless the user explicitly says otherwise (e.g. `/continue pdf splitter`).
  - Ignore active document, cursor position, and other IDE metadata when deciding what to continue.
  - Prefer `DEVplans/*.md` and previously stated long-running plans over recency of code edits or open files.